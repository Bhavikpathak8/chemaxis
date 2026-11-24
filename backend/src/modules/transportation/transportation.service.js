const { pool } = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../utils/errors');
const profitEngine = require('../../common/profit-engine');
const { notifyUser } = require('../../common/notify');

const STATUS_ORDER = ['PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];

// Step 5 of the workflow: "Admin assigns transportation" (after order confirmed).
async function assign(poId, dto) {
  const { rows: poRows } = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [poId]);
  if (poRows.length === 0) throw new NotFoundError('Purchase order not found');
  if (poRows[0].status !== 'CONFIRMED') {
    throw new BadRequestError(
      `Order must be CONFIRMED before transport can be assigned (currently ${poRows[0].status})`,
    );
  }

  const { rows: existing } = await pool.query('SELECT id FROM transportation WHERE purchase_order_id = $1', [poId]);
  if (existing.length > 0) {
    throw new BadRequestError('Transportation has already been assigned to this order');
  }

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO transportation
         (purchase_order_id, vendor_id, pickup_location, delivery_location, distance_km, vehicle_type, cost, status, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', now())
       RETURNING *`,
      [poId, dto.vendorId ?? null, dto.pickupLocation, dto.deliveryLocation, dto.distanceKm ?? null, dto.vehicleType, dto.cost],
    );

    // Transport cost is logged as a Billing/Expense line automatically —
    // feeds the Phase 7 profit calculation without the trader re-entering it.
    const { rows: catRows } = await client.query(
      `SELECT id FROM expense_categories WHERE name = 'Transportation'`,
    );
    if (catRows.length > 0) {
      await client.query(
        `INSERT INTO expenses (purchase_order_id, category_id, amount, description)
         VALUES ($1, $2, $3, $4)`,
        [poId, catRows[0].id, dto.cost, `Transport: ${dto.pickupLocation} -> ${dto.deliveryLocation} (${dto.vehicleType})`],
      );
    }

    return rows[0];
  });
}

async function updateStatus(transportId, dto) {
  const { rows } = await pool.query('SELECT * FROM transportation WHERE id = $1', [transportId]);
  const transport = rows[0];
  if (!transport) throw new NotFoundError('Transportation record not found');

  const currentIndex = STATUS_ORDER.indexOf(transport.status);
  const nextIndex = STATUS_ORDER.indexOf(dto.status);
  if (nextIndex !== currentIndex + 1) {
    throw new BadRequestError(
      `Status must advance one step at a time: ${transport.status} -> ${STATUS_ORDER[currentIndex + 1] ?? '(already at final status)'}, not ${dto.status}`,
    );
  }

  // "Driver assigned" — required to move into PICKUP_SCHEDULED specifically.
  if (dto.status === 'PICKUP_SCHEDULED' && !dto.driverId) {
    throw new BadRequestError('driverId is required when scheduling pickup');
  }

  const timestampColumn =
    dto.status === 'PICKED_UP' ? 'picked_up_at' : dto.status === 'DELIVERED' ? 'delivered_at' : dto.status === 'COMPLETED' ? 'completed_at' : null;

  const result = await withTransaction(async (client) => {
    const sets = ['status = $2'];
    const values = [transportId, dto.status];
    let i = 3;
    if (dto.driverId) {
      sets.push(`driver_id = $${i}`);
      values.push(dto.driverId);
      i++;
    }
    if (dto.vendorId) {
      sets.push(`vendor_id = $${i}`);
      values.push(dto.vendorId);
      i++;
    }
    if (timestampColumn) {
      sets.push(`${timestampColumn} = now()`);
    }

    const { rows: updated } = await client.query(
      `UPDATE transportation SET ${sets.join(', ')} WHERE id = $1 RETURNING *`,
      values,
    );

    // Keep the parent Purchase Order's status roughly in sync with shipment
    // progress — "Transit started" / "Delivery completed" from the spec.
    if (dto.status === 'PICKED_UP' || dto.status === 'IN_TRANSIT') {
      await client.query(`UPDATE purchase_orders SET status = 'IN_TRANSIT' WHERE id = $1`, [
        transport.purchase_order_id,
      ]);
    }
    if (dto.status === 'DELIVERED') {
      await client.query(
        `UPDATE purchase_orders SET status = 'DELIVERED', delivered_at = now() WHERE id = $1`,
        [transport.purchase_order_id],
      );
    }
    // Step 7 of the workflow: "Delivery completed... Net profit updated" —
    // first profit calculation happens the moment delivery is confirmed,
    // using this same transaction's client so it commits/rolls back together
    // with the status change rather than as an independent write.
    if (dto.status === 'DELIVERED') {
      await profitEngine.calculateAndUpsert(transport.purchase_order_id, client);
    }
    if (dto.status === 'COMPLETED') {
      await client.query(`UPDATE purchase_orders SET status = 'COMPLETED' WHERE id = $1`, [
        transport.purchase_order_id,
      ]);
    }

    return updated[0];
  });

  // Shipment Started -> Buyer
  if (dto.status === 'IN_TRANSIT') {
    const { rows } = await pool.query(
      `SELECT b.user_id, po.po_number FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id WHERE po.id = $1`,
      [transport.purchase_order_id],
    );
    if (rows[0]) {
      await notifyUser(rows[0].user_id, 'SHIPMENT_STARTED', 'Shipment started',
        `Your order ${rows[0].po_number} is now in transit.`);
    }
  }
  return result;
}

// "Delivery completed -> POD uploaded -> Shipment closed" — POD only makes
// sense once delivery has actually happened.
async function attachPod(transportId, fileUrl) {
  const { rows } = await pool.query('SELECT * FROM transportation WHERE id = $1', [transportId]);
  if (rows.length === 0) throw new NotFoundError('Transportation record not found');
  if (!['DELIVERED', 'COMPLETED'].includes(rows[0].status)) {
    throw new ForbiddenError('Proof of delivery can only be uploaded after the shipment is DELIVERED');
  }

  const { rows: updated } = await pool.query(
    `UPDATE transportation SET pod_url = $2 WHERE id = $1 RETURNING *`,
    [transportId, fileUrl],
  );
  return updated[0];
}

async function findForOrder(poId) {
  const { rows } = await pool.query(
    `SELECT t.*, v.name AS vendor_name, d.name AS driver_name, d.phone AS driver_phone
     FROM transportation t
     LEFT JOIN transport_vendors v ON v.id = t.vendor_id
     LEFT JOIN drivers d ON d.id = t.driver_id
     WHERE t.purchase_order_id = $1`,
    [poId],
  );
  if (rows.length === 0) throw new NotFoundError('No transportation record for this order yet');
  return rows[0];
}

// What a buyer may see of a shipment. Transport cost and the vendor are
// C-Tech's expense side (cost is part of its margin) and are never shown.
function buyerView(row) {
  const { cost, vendor_id, vendor_name, driver_id, ...safe } = row;
  return safe;
}

// Buyer-facing shipment tracking — ownership-checked via the PO.
async function findForOrderAsBuyer(userId, poId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows: poRows } = await pool.query('SELECT buyer_id FROM purchase_orders WHERE id = $1', [poId]);
  if (poRows.length === 0) throw new NotFoundError('Purchase order not found');
  if (poRows[0].buyer_id !== buyerRows[0].id) throw new ForbiddenError('You do not own this order');

  return buyerView(await findForOrder(poId));
}

async function findAllForBuyer(userId) {
  const { rows } = await pool.query(
    `SELECT t.*, po.po_number, d.name AS driver_name, d.phone AS driver_phone
     FROM transportation t
     JOIN purchase_orders po ON po.id = t.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id AND b.user_id = $1
     LEFT JOIN drivers d ON d.id = t.driver_id
     ORDER BY t.scheduled_at DESC`,
    [userId],
  );
  return rows.map(buyerView);
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT t.*, po.po_number, v.name AS vendor_name, d.name AS driver_name
     FROM transportation t
     JOIN purchase_orders po ON po.id = t.purchase_order_id
     LEFT JOIN transport_vendors v ON v.id = t.vendor_id
     LEFT JOIN drivers d ON d.id = t.driver_id
     ORDER BY t.scheduled_at DESC`,
  );
  return rows;
}

module.exports = { assign, updateStatus, attachPod, findForOrder, findForOrderAsBuyer, findAllForBuyer, findAll };
