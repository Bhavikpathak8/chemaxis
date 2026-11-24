const { pool } = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { NotFoundError, BadRequestError } = require('../../utils/errors');
const profitEngine = require('../../common/profit-engine');

// "Billing Charges", "Loading", "Packaging", etc. — Transportation expenses
// are logged automatically when transport is assigned (see
// transportation.service.js); this endpoint covers everything else.
async function create(dto) {
  const { rows: poRows } = await pool.query('SELECT id FROM purchase_orders WHERE id = $1', [
    dto.purchaseOrderId,
  ]);
  if (poRows.length === 0) throw new NotFoundError('Purchase order not found');

  const { rows: catRows } = await pool.query('SELECT id FROM expense_categories WHERE name = $1', [
    dto.categoryName,
  ]);
  if (catRows.length === 0) {
    throw new BadRequestError(
      `Unknown expense category "${dto.categoryName}" — check GET /expense-categories for valid names`,
    );
  }

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO expenses (purchase_order_id, category_id, amount, description)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [dto.purchaseOrderId, catRows[0].id, dto.amount, dto.description ?? null],
    );

    // If this order was already delivered (a Transaction snapshot exists),
    // keep net profit accurate as new charges come in — part of the same
    // transaction as the expense write itself.
    await profitEngine.recalculateIfExists(dto.purchaseOrderId, client);

    return rows[0];
  });
}

async function findForOrder(poId) {
  const { rows } = await pool.query(
    `SELECT e.*, ec.name AS category_name
     FROM expenses e JOIN expense_categories ec ON ec.id = e.category_id
     WHERE e.purchase_order_id = $1
     ORDER BY e.created_at DESC`,
    [poId],
  );
  return rows;
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT e.*, ec.name AS category_name, po.po_number
     FROM expenses e JOIN expense_categories ec ON ec.id = e.category_id JOIN purchase_orders po ON po.id = e.purchase_order_id
     ORDER BY e.created_at DESC LIMIT 1000`);
  return rows;
}

async function findCategories() {
  const { rows } = await pool.query(
    `SELECT * FROM expense_categories WHERE is_active = TRUE ORDER BY name ASC`,
  );
  return rows;
}

module.exports = { findAll, create, findForOrder, findCategories };
