const { pool } = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');

function generatePoNumber(sequence) {
  const year = new Date().getFullYear();
  return `PO-${year}-${String(sequence).padStart(5, '0')}`;
}

// Called from quotations.service.acceptByBuyer, inside its transaction —
// takes the transaction's `client` rather than the shared pool, so stock
// reservation and the PO/status writes all commit or roll back together.
async function createFromAcceptedQuotation(client, { buyerId, chemicalId, quotation, deliveryAddress, expectedDispatchDate, paymentTerms }) {
  // Lock the inventory row for the duration of this transaction so two
  // buyers accepting overlapping quotations for the same chemical can't
  // both succeed and oversell the stock.
  const invResult = await client.query(
    `SELECT * FROM inventory WHERE chemical_id = $1 FOR UPDATE`,
    [chemicalId],
  );
  const inventory = invResult.rows[0];
  if (!inventory) throw new BadRequestError('This chemical has no stock record');

  const available = Number(inventory.quantity_available);
  const requestedQty = Number(quotation.quantity);
  if (available < requestedQty) {
    throw new BadRequestError(
      `Only ${available} in stock, but the quotation is for ${requestedQty}`,
    );
  }

  const chemResult = await client.query('SELECT seller_price, unit FROM chemicals WHERE id = $1', [
    chemicalId,
  ]);
  const chemical = chemResult.rows[0];

  await client.query(
    `UPDATE inventory
     SET quantity_available = quantity_available - $2, quantity_reserved = quantity_reserved + $2, updated_at = now()
     WHERE chemical_id = $1`,
    [chemicalId, requestedQty],
  );

  const countResult = await client.query(
    `SELECT COUNT(*) FROM purchase_orders WHERE created_at >= date_trunc('year', now())`,
  );
  const poNumber = generatePoNumber(Number(countResult.rows[0].count) + 1);

  const sellerPricePerUnit = Number(chemical.seller_price);
  const buyerPricePerUnit = Number(quotation.quoted_price_per_unit);
  const subtotal = Math.round(buyerPricePerUnit * requestedQty * 100) / 100;

  const poResult = await client.query(
    `INSERT INTO purchase_orders
       (po_number, buyer_id, quotation_id, status, delivery_address, expected_dispatch_date, payment_terms, total_amount, gst_amount)
     VALUES ($1, $2, $3, 'PENDING', $4, $5, $6, $7, 0)
     RETURNING *`,
    [poNumber, buyerId, quotation.id, deliveryAddress, expectedDispatchDate ?? null, paymentTerms ?? null, subtotal],
  );
  const po = poResult.rows[0];

  await client.query(
    `INSERT INTO purchase_order_items
       (purchase_order_id, chemical_id, quantity, unit, seller_price_per_unit, buyer_price_per_unit, subtotal)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [po.id, chemicalId, requestedQty, chemical.unit, sellerPricePerUnit, buyerPricePerUnit, subtotal],
  );

  return po;
}

async function getOwnedPo(buyerId, poId) {
  const { rows } = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [poId]);
  const po = rows[0];
  if (!po) throw new NotFoundError('Purchase order not found');
  if (po.buyer_id !== buyerId) throw new ForbiddenError('You do not own this purchase order');
  return po;
}

async function getItemsForPo(poId) {
  const { rows } = await pool.query(
    `SELECT poi.*, c.name AS chemical_name
     FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id
     WHERE poi.purchase_order_id = $1`,
    [poId],
  );
  return rows;
}

// Buyer-facing item list — deliberately omits seller_price_per_unit. Per
// spec, "Seller Price: Visible only to Trader" — that holds even for the
// buyer's OWN order, not just other people's data.
async function getItemsForPoBuyerSafe(poId) {
  const { rows } = await pool.query(
    `SELECT poi.id, poi.purchase_order_id, poi.chemical_id, poi.quantity, poi.unit,
            poi.buyer_price_per_unit, poi.subtotal, c.name AS chemical_name
     FROM purchase_order_items poi JOIN chemicals c ON c.id = poi.chemical_id
     WHERE poi.purchase_order_id = $1`,
    [poId],
  );
  return rows;
}

// --- Buyer ---------------------------------------------------------------
async function findMineForBuyer(userId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows } = await pool.query(
    `SELECT * FROM purchase_orders WHERE buyer_id = $1 ORDER BY created_at DESC`,
    [buyerRows[0].id],
  );
  return Promise.all(rows.map(async (po) => ({ ...po, items: await getItemsForPoBuyerSafe(po.id) })));
}

async function findOneOwnedByBuyer(userId, poId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const po = await getOwnedPo(buyerRows[0].id, poId);
  return { ...po, items: await getItemsForPoBuyerSafe(po.id) };
}

async function releaseStockAndCancel(poId, items) {
  return withTransaction(async (client) => {
    for (const item of items) {
      await client.query(
        `UPDATE inventory
         SET quantity_available = quantity_available + $2, quantity_reserved = quantity_reserved - $2, updated_at = now()
         WHERE chemical_id = $1`,
        [item.chemical_id, item.quantity],
      );
    }
    const { rows } = await client.query(
      `UPDATE purchase_orders SET status = 'CANCELLED' WHERE id = $1 RETURNING *`,
      [poId],
    );
    return rows[0];
  });
}

async function cancelByBuyer(userId, poId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const po = await getOwnedPo(buyerRows[0].id, poId);
  if (po.status !== 'PENDING') {
    throw new ForbiddenError(`Order cannot be cancelled once it is ${po.status}. Contact C-Tech support.`);
  }

  const items = await getItemsForPo(poId);
  return releaseStockAndCancel(poId, items);
}

// --- Admin/Trader ----------------------------------------------------------
async function findAllForAdmin() {
  const { rows } = await pool.query(
    `SELECT po.*, b.company_name AS buyer_company_name
     FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id
     ORDER BY po.created_at DESC`,
  );
  return Promise.all(rows.map(async (po) => ({ ...po, items: await getItemsForPo(po.id) })));
}

async function findOneForAdmin(poId) {
  const { rows } = await pool.query(
    `SELECT po.*, b.company_name AS buyer_company_name, b.gst_number AS buyer_gst_number,
            b.address AS buyer_address, b.city AS buyer_city, b.state AS buyer_state
     FROM purchase_orders po JOIN buyers b ON b.id = po.buyer_id
     WHERE po.id = $1`,
    [poId],
  );
  if (rows.length === 0) throw new NotFoundError('Purchase order not found');
  return { ...rows[0], items: await getItemsForPo(poId) };
}

async function confirmByAdmin(poId) {
  const { rows } = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [poId]);
  if (rows.length === 0) throw new NotFoundError('Purchase order not found');
  if (rows[0].status !== 'PENDING') {
    throw new BadRequestError(`Only PENDING orders can be confirmed (this is ${rows[0].status})`);
  }

  const { rows: updated } = await pool.query(
    `UPDATE purchase_orders SET status = 'CONFIRMED', confirmed_at = now() WHERE id = $1 RETURNING *`,
    [poId],
  );
  return updated[0];
}

async function cancelByAdmin(poId) {
  const { rows } = await pool.query('SELECT * FROM purchase_orders WHERE id = $1', [poId]);
  if (rows.length === 0) throw new NotFoundError('Purchase order not found');
  const po = rows[0];
  if (po.status === 'DELIVERED' || po.status === 'IN_TRANSIT' || po.status === 'COMPLETED') {
    throw new BadRequestError(`Cannot cancel an order that is already ${po.status}`);
  }
  if (po.status === 'CANCELLED') throw new BadRequestError('Order is already cancelled');

  const items = await getItemsForPo(poId);
  return releaseStockAndCancel(poId, items);
}

module.exports = {
  generatePoNumber,
  createFromAcceptedQuotation,
  findMineForBuyer,
  findOneOwnedByBuyer,
  cancelByBuyer,
  findAllForAdmin,
  findOneForAdmin,
  confirmByAdmin,
  cancelByAdmin,
  getItemsForPo,
};
