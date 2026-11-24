const { pool } = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');

// Sellers must not see what C-Tech sells for or its markup. They only learn
// whether the listing is live (approved + priced by the trader).
function sellerView(row) {
  if (!row) return row;
  const { buyer_price, margin_type, margin_value, ...rest } = row;
  return { ...rest, is_listed: buyer_price !== null && buyer_price !== undefined && row.is_active !== false };
}

async function getSellerByUserId(userId) {
  const { rows } = await pool.query('SELECT * FROM sellers WHERE user_id = $1', [userId]);
  if (rows.length === 0) throw new NotFoundError('Seller profile not found for this account');
  return rows[0];
}

// Every seller-facing write goes through this first — an unapproved seller
// can never list a chemical, matching "Seller cannot publish without approval."
async function getApprovedSeller(userId) {
  const seller = await getSellerByUserId(userId);
  if (seller.verification_status !== 'APPROVED') {
    throw new ForbiddenError(
      'Your seller account is pending admin verification. You cannot list chemicals yet.',
    );
  }
  return seller;
}

async function getOwnedChemical(chemicalId, sellerId) {
  const { rows } = await pool.query(
    `SELECT c.*, i.quantity_available, i.quantity_reserved
     FROM chemicals c LEFT JOIN inventory i ON i.chemical_id = c.id
     WHERE c.id = $1`,
    [chemicalId],
  );
  const chemical = rows[0];
  if (!chemical) throw new NotFoundError('Chemical not found');
  if (chemical.seller_id !== sellerId) throw new ForbiddenError('You do not own this chemical listing');
  return chemical;
}

async function create(userId, dto) {
  const seller = await getApprovedSeller(userId);

  return withTransaction(async (client) => {
    const chemResult = await client.query(
      `INSERT INTO chemicals
         (seller_id, name, category, cas_number, purity, unit, seller_price, warehouse_location, description,
          grade, hazard_class, un_number, packing_group, packaging_type, moq)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
       RETURNING *`,
      [
        seller.id,
        dto.name,
        dto.category || 'Industrial Chemical',
        dto.casNumber ?? null,
        dto.purity,
        dto.unit,
        dto.sellerPrice,
        dto.warehouseLocation,
        dto.description ?? null,
        dto.grade ?? null,
        dto.hazardClass ?? null,
        dto.unNumber ?? null,
        dto.packingGroup ?? null,
        dto.packagingType ?? null,
        dto.moq ?? 1,
      ],
    );
    const chemical = chemResult.rows[0];

    await client.query(
      `INSERT INTO inventory (chemical_id, quantity_available) VALUES ($1, $2)`,
      [chemical.id, dto.availableQuantity],
    );

    return sellerView({ ...chemical, quantity_available: dto.availableQuantity, quantity_reserved: 0 });
  });
}

async function findMine(userId) {
  const seller = await getSellerByUserId(userId); // readable even if not yet approved
  const { rows } = await pool.query(
    `SELECT c.*, i.quantity_available, i.quantity_reserved
     FROM chemicals c LEFT JOIN inventory i ON i.chemical_id = c.id
     WHERE c.seller_id = $1
     ORDER BY c.created_at DESC`,
    [seller.id],
  );
  return rows.map(sellerView);
}

async function findOneOwned(userId, chemicalId) {
  const seller = await getSellerByUserId(userId);
  return sellerView(await getOwnedChemical(chemicalId, seller.id));
}

async function update(userId, chemicalId, dto) {
  const seller = await getSellerByUserId(userId);
  const current = await getOwnedChemical(chemicalId, seller.id);

  const fieldMap = {
    name: 'name',
    category: 'category',
    casNumber: 'cas_number',
    purity: 'purity',
    unit: 'unit',
    sellerPrice: 'seller_price',
    warehouseLocation: 'warehouse_location',
    description: 'description',
    grade: 'grade',
    hazardClass: 'hazard_class',
    unNumber: 'un_number',
    packingGroup: 'packing_group',
    packagingType: 'packaging_type',
    moq: 'moq',
  };

  const sets = [];
  const values = [];
  let i = 1;
  for (const [key, column] of Object.entries(fieldMap)) {
    if (dto[key] !== undefined) {
      sets.push(`${column} = $${i}`);
      values.push(dto[key]);
      i++;
    }
  }
  if (sets.length === 0) return sellerView(current);

  // Changing what was approved (price, purity, unit, CAS) pulls the listing
  // back to "awaiting approval" until the trader re-prices it — a seller
  // can't swap the product under an approved listing.
  const sensitive = { sellerPrice: 'seller_price', purity: 'purity', unit: 'unit', casNumber: 'cas_number' };
  const changed = Object.entries(sensitive).some(([k, col]) => dto[k] !== undefined && String(dto[k]) !== String(current[col] ?? ''));
  if (changed && current.buyer_price !== null) {
    sets.push('buyer_price = NULL', 'margin_type = NULL', 'margin_value = NULL');
  }

  sets.push(`updated_at = now()`);
  values.push(chemicalId);

  const { rows } = await pool.query(
    `UPDATE chemicals SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values,
  );
  return sellerView(rows[0]);
}

async function updateStock(userId, chemicalId, quantityAvailable) {
  const seller = await getSellerByUserId(userId);
  await getOwnedChemical(chemicalId, seller.id);

  const { rows } = await pool.query(
    `UPDATE inventory SET quantity_available = $2, updated_at = now()
     WHERE chemical_id = $1 RETURNING *`,
    [chemicalId, quantityAvailable],
  );
  return rows[0];
}

// Soft delete — past purchase_order_items may reference this chemical.
async function deactivate(userId, chemicalId) {
  const seller = await getSellerByUserId(userId);
  await getOwnedChemical(chemicalId, seller.id);

  const { rows } = await pool.query(
    `UPDATE chemicals SET is_active = FALSE, updated_at = now() WHERE id = $1 RETURNING *`,
    [chemicalId],
  );
  return sellerView(rows[0]);
}

// Attaches an uploaded COA or MSDS file URL to the chemical.
async function attachDocument(userId, chemicalId, type, fileUrl) {
  const seller = await getSellerByUserId(userId);
  await getOwnedChemical(chemicalId, seller.id);

  const column = type === 'COA' ? 'coa_url' : 'msds_url';
  const { rows } = await pool.query(
    `UPDATE chemicals SET ${column} = $2, updated_at = now() WHERE id = $1 RETURNING *`,
    [chemicalId, fileUrl],
  );
  return sellerView(rows[0]);
}

async function findAllForAdmin() {
  const { rows } = await pool.query(
    `SELECT c.*, i.quantity_available, i.quantity_reserved,
            s.company_name AS seller_company_name, s.verification_status AS seller_verification_status
     FROM chemicals c
     LEFT JOIN inventory i ON i.chemical_id = c.id
     JOIN sellers s ON s.id = c.seller_id
     ORDER BY c.created_at DESC`,
  );
  return rows;
}

// --- Pricing Engine ---------------------------------------------------
// BuyerPrice = SellerPrice + Margin (FIXED), SellerPrice * (1 + Margin%) (PERCENTAGE),
// or Margin itself (MANUAL — admin sets the buyer price directly).
function computeBuyerPrice(sellerPrice, marginType, marginValue) {
  if (marginType === 'FIXED') return sellerPrice + marginValue;
  if (marginType === 'PERCENTAGE') return sellerPrice * (1 + marginValue / 100);
  return marginValue; // MANUAL
}

async function setBuyerPrice(chemicalId, marginType, marginValue) {
  const { rows: chemRows } = await pool.query('SELECT seller_price FROM chemicals WHERE id = $1', [
    chemicalId,
  ]);
  if (chemRows.length === 0) throw new NotFoundError('Chemical not found');

  const sellerPrice = Number(chemRows[0].seller_price);
  const buyerPrice = Math.round(computeBuyerPrice(sellerPrice, marginType, marginValue) * 100) / 100;

  if (buyerPrice <= sellerPrice) {
    throw new BadRequestError(
      `Buyer price (₹${buyerPrice}) must be greater than the seller's price (₹${sellerPrice}) — the trader margin cannot be zero or negative`,
    );
  }

  const { rows } = await pool.query(
    `UPDATE chemicals
     SET buyer_price = $2, margin_type = $3, margin_value = $4, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [chemicalId, buyerPrice, marginType, marginValue],
  );
  return rows[0];
}

// --- Buyer-facing catalog ----------------------------------------------
// "Buyer sees only trader-approved products." A listing is buyer-visible
// only when active, priced, and its seller is APPROVED. seller_price is
// NEVER selected here — buyers must never see the seller's cost.
async function findCatalogForBuyers(filters) {
  const conditions = [
    `c.is_active = TRUE`,
    `c.buyer_price IS NOT NULL`,
    `s.verification_status = 'APPROVED'`,
  ];
  const values = [];
  let i = 1;

  if (filters.search) {
    conditions.push(`(c.name ILIKE $${i} OR c.cas_number ILIKE $${i})`);
    values.push(`%${filters.search}%`);
    i++;
  }
  if (filters.category) {
    conditions.push(`c.category = $${i}`);
    values.push(filters.category);
    i++;
  }
  if (filters.grade) {
    conditions.push(`c.grade = $${i}`);
    values.push(filters.grade);
    i++;
  }
  if (filters.hazardClass) {
    conditions.push(`c.hazard_class = $${i}`);
    values.push(filters.hazardClass);
    i++;
  }
  if (filters.unit) {
    conditions.push(`c.unit = $${i}`);
    values.push(filters.unit);
    i++;
  }
  if (filters.minPrice !== undefined) {
    conditions.push(`c.buyer_price >= $${i}`);
    values.push(filters.minPrice);
    i++;
  }
  if (filters.maxPrice !== undefined) {
    conditions.push(`c.buyer_price <= $${i}`);
    values.push(filters.maxPrice);
    i++;
  }

  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.category, c.cas_number, c.purity, c.unit, c.buyer_price,
            c.warehouse_location, c.description, c.coa_url, c.msds_url,
            i.quantity_available,
            s.company_name AS seller_company_name, s.city AS seller_city, s.state AS seller_state
     FROM chemicals c
     LEFT JOIN inventory i ON i.chemical_id = c.id
     JOIN sellers s ON s.id = c.seller_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY c.name ASC`,
    values,
  );
  return rows;
}

async function findOneForBuyer(chemicalId) {
  const { rows } = await pool.query(
    `SELECT c.id, c.name, c.category, c.cas_number, c.purity, c.unit, c.buyer_price,
            c.warehouse_location, c.description, c.coa_url, c.msds_url, c.created_at,
            i.quantity_available,
            s.company_name AS seller_company_name, s.city AS seller_city, s.state AS seller_state
     FROM chemicals c
     LEFT JOIN inventory i ON i.chemical_id = c.id
     JOIN sellers s ON s.id = c.seller_id
     WHERE c.id = $1 AND c.is_active = TRUE AND c.buyer_price IS NOT NULL
       AND s.verification_status = 'APPROVED'`,
    [chemicalId],
  );
  if (rows.length === 0) throw new NotFoundError('Chemical not found or not available for order');
  return rows[0];
}

// Super Admin "Delete chemicals". Hard delete only works when nothing
// references the chemical (no RFQs/orders); otherwise deactivate instead.
async function deleteChemical(chemicalId) {
  try {
    return await withTransaction(async (client) => {
      const { rows } = await client.query('SELECT id, name FROM chemicals WHERE id = $1', [chemicalId]);
      if (rows.length === 0) throw new NotFoundError('Chemical not found');
      await client.query('DELETE FROM inventory WHERE chemical_id = $1', [chemicalId]);
      await client.query('DELETE FROM chemicals WHERE id = $1', [chemicalId]);
      return rows[0];
    });
  } catch (err) {
    if (err.code === '23503') {
      throw new ForbiddenError('This chemical has quotations or orders linked to it and cannot be deleted. Deactivate it instead.');
    }
    throw err;
  }
}

module.exports = {
  deleteChemical,
  create,
  findMine,
  findOneOwned,
  update,
  updateStock,
  deactivate,
  attachDocument,
  findAllForAdmin,
  setBuyerPrice,
  findCatalogForBuyers,
  findOneForBuyer,
};
