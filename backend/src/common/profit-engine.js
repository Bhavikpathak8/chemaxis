const { pool } = require('../db/pool');

// The margin engine from the spec:
//   Gross Margin = Buyer Amount - Seller Amount
//   Net Profit = Gross Margin - Total Expenses
// "Profit updates automatically whenever expense changes" — so this is
// called both when a shipment is marked DELIVERED (first calculation) and
// whenever a new expense is added afterward (recalculation).
//
// Both functions accept an optional `db` (a transaction client) so a
// caller already inside a withTransaction(...) block can pass its client
// and keep this calculation part of the same atomic unit — otherwise, if
// something later in that transaction failed and rolled back, this would
// have already committed independently through the shared pool, leaving a
// profit snapshot for a status change that never actually happened.
async function recalculateIfExists(poId, db = pool) {
  const { rows } = await db.query('SELECT id FROM transactions WHERE purchase_order_id = $1', [poId]);
  if (rows.length === 0) return null; // nothing to recalc until delivery first computes it
  return calculateAndUpsert(poId, db);
}

async function calculateAndUpsert(poId, db = pool) {
  const { rows: itemRows } = await db.query(
    `SELECT seller_price_per_unit, buyer_price_per_unit, quantity FROM purchase_order_items WHERE purchase_order_id = $1`,
    [poId],
  );
  const { rows: expenseRows } = await db.query(
    `SELECT amount FROM expenses WHERE purchase_order_id = $1`,
    [poId],
  );

  const sellerAmount = itemRows.reduce((sum, i) => sum + Number(i.seller_price_per_unit) * Number(i.quantity), 0);
  const buyerAmount = itemRows.reduce((sum, i) => sum + Number(i.buyer_price_per_unit) * Number(i.quantity), 0);
  const grossMargin = buyerAmount - sellerAmount;
  const totalExpense = expenseRows.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = grossMargin - totalExpense;

  const { rows } = await db.query(
    `INSERT INTO transactions (purchase_order_id, seller_amount, buyer_amount, gross_margin, total_expense, net_profit)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (purchase_order_id) DO UPDATE SET
       seller_amount = $2, buyer_amount = $3, gross_margin = $4, total_expense = $5, net_profit = $6, calculated_at = now()
     RETURNING *`,
    [poId, sellerAmount, buyerAmount, grossMargin, totalExpense, netProfit],
  );
  return rows[0];
}

module.exports = { recalculateIfExists, calculateAndUpsert };
