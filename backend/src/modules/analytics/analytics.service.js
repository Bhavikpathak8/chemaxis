const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

// All "business day" / month boundaries use India time, not the DB server's.
const IST = `'Asia/Kolkata'`;
const num = (v) => Number(v ?? 0);

// Order-level financials, computed from the immutable price snapshot stored
// on purchase_order_items. Cancelled orders never count as sales.
//   revenue  = what the buyer pays (pre-GST)
//   cost     = what C-Tech owes the seller
//   expenses = everything logged against the order (transport, billing, ...)
const ORDER_FIN = `
  SELECT po.id, po.po_number, po.created_at, po.status, po.buyer_id,
         SUM(poi.buyer_price_per_unit * poi.quantity)  AS revenue,
         SUM(poi.seller_price_per_unit * poi.quantity) AS cost,
         COALESCE((SELECT SUM(e.amount) FROM expenses e WHERE e.purchase_order_id = po.id), 0) AS expenses
  FROM purchase_orders po
  JOIN purchase_order_items poi ON poi.purchase_order_id = po.id
  WHERE po.status <> 'CANCELLED'
  GROUP BY po.id`;

function rangeClause(from, to, col, vals) {
  const parts = [];
  if (from) { vals.push(from); parts.push(`(${col} AT TIME ZONE ${IST})::date >= $${vals.length}::date`); }
  if (to) { vals.push(to); parts.push(`(${col} AT TIME ZONE ${IST})::date <= $${vals.length}::date`); }
  return parts.length ? `WHERE ${parts.join(' AND ')}` : '';
}

const totalsOf = (r) => {
  const revenue = num(r.revenue), cost = num(r.cost), expenses = num(r.expenses);
  return { revenue, cost, grossMargin: revenue - cost, expenses, netProfit: revenue - cost - expenses, orders: num(r.orders) };
};

// ---------------------------------------------------------------- trader ---
async function traderDashboard() {
  const { rows: today } = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(revenue),0) AS revenue, COALESCE(SUM(cost),0) AS cost, COALESCE(SUM(expenses),0) AS expenses
     FROM (${ORDER_FIN}) f
     WHERE (f.created_at AT TIME ZONE ${IST})::date = (now() AT TIME ZONE ${IST})::date`);
  const { rows: month } = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(revenue),0) AS revenue, COALESCE(SUM(cost),0) AS cost, COALESCE(SUM(expenses),0) AS expenses
     FROM (${ORDER_FIN}) f
     WHERE date_trunc('month', f.created_at AT TIME ZONE ${IST}) = date_trunc('month', now() AT TIME ZONE ${IST})`);

  const q = async (sql) => num((await pool.query(sql)).rows[0].n);
  const rfqsToQuote = await q(`SELECT COUNT(*) n FROM quotation_requests WHERE status IN ('REQUESTED','REVIEWED')`);
  const draftsToSend = await q(`SELECT COUNT(*) n FROM quotations WHERE status = 'DRAFT'`);
  const awaitingBuyer = await q(`SELECT COUNT(*) n FROM quotations WHERE status = 'SENT'`);
  const inFlight = await q(`SELECT COUNT(*) n FROM transportation WHERE status NOT IN ('DELIVERED','COMPLETED')`);
  const awaitingTransport = await q(
    `SELECT COUNT(*) n FROM purchase_orders po WHERE po.status = 'CONFIRMED'
       AND NOT EXISTS (SELECT 1 FROM transportation t WHERE t.purchase_order_id = po.id)`);
  const ordersToConfirm = await q(`SELECT COUNT(*) n FROM purchase_orders WHERE status = 'PENDING'`);
  const pendingSellers = await q(`SELECT COUNT(*) n FROM sellers WHERE verification_status = 'PENDING'`);
  const pendingBuyers = await q(`SELECT COUNT(*) n FROM buyers WHERE verification_status = 'PENDING'`);
  const unpriced = await q(`SELECT COUNT(*) n FROM chemicals WHERE is_active AND buyer_price IS NULL`);
  const stockUnits = await q(`SELECT COALESCE(SUM(quantity_available),0) n FROM inventory`);

  const { rows: out } = await pool.query(
    `SELECT COALESCE(SUM(i.total_amount - COALESCE(p.paid,0)),0) AS outstanding,
            COUNT(*) FILTER (WHERE i.total_amount - COALESCE(p.paid,0) > 0.005) AS open_invoices,
            COUNT(*) FILTER (WHERE i.total_amount - COALESCE(p.paid,0) > 0.005 AND i.due_date < now()) AS overdue_invoices
     FROM invoices i
     LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) p ON p.invoice_id = i.id`);

  const { rows: recent } = await pool.query(
    `SELECT f.id, f.po_number, f.status, f.created_at, f.revenue, b.company_name AS buyer_company_name
     FROM (${ORDER_FIN}) f JOIN buyers b ON b.id = f.buyer_id
     ORDER BY f.created_at DESC LIMIT 6`);

  return {
    today: totalsOf(today[0]),
    thisMonth: totalsOf(month[0]),
    pendingQuotations: { total: rfqsToQuote + draftsToSend, rfqsToQuote, draftsToSend, awaitingBuyer },
    pendingDeliveries: { total: inFlight + awaitingTransport, inFlight, awaitingTransport },
    outstandingPayments: {
      amount: num(out[0].outstanding), openInvoices: num(out[0].open_invoices), overdueInvoices: num(out[0].overdue_invoices),
    },
    attention: { ordersToConfirm, pendingSellers, pendingBuyers, unpricedChemicals: unpriced },
    inventoryUnits: stockUnits,
    recentOrders: recent.map((r) => ({ ...r, revenue: num(r.revenue) })),
  };
}

async function summary({ from, to } = {}) {
  const vals = [];
  const where = rangeClause(from, to, 'f.created_at', vals);
  const { rows } = await pool.query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(revenue),0) AS revenue, COALESCE(SUM(cost),0) AS cost, COALESCE(SUM(expenses),0) AS expenses
     FROM (${ORDER_FIN}) f ${where}`, vals);

  const v2 = [];
  const w2 = rangeClause(from, to, 't.calculated_at', v2);
  const { rows: real } = await pool.query(
    `SELECT COUNT(*) AS n, COALESCE(SUM(net_profit),0) AS net, COALESCE(SUM(gross_margin),0) AS gross FROM transactions t ${w2}`, v2);

  // Last 12 calendar months, zero-filled so the chart never has gaps.
  const { rows: monthly } = await pool.query(
    `WITH months AS (
       SELECT generate_series(date_trunc('month', now() AT TIME ZONE ${IST}) - interval '11 months',
                              date_trunc('month', now() AT TIME ZONE ${IST}), interval '1 month') AS m)
     SELECT to_char(months.m, 'YYYY-MM') AS month, to_char(months.m, 'Mon YY') AS label,
            COALESCE(SUM(f.revenue),0) AS revenue, COALESCE(SUM(f.cost),0) AS cost, COALESCE(SUM(f.expenses),0) AS expenses
     FROM months
     LEFT JOIN (${ORDER_FIN}) f ON date_trunc('month', f.created_at AT TIME ZONE ${IST}) = months.m
     GROUP BY months.m ORDER BY months.m`);

  const t = totalsOf(rows[0]);
  return {
    ...t,
    realised: { deliveredOrders: num(real[0].n), grossMargin: num(real[0].gross), netProfit: num(real[0].net) },
    monthly: monthly.map((m) => {
      const revenue = num(m.revenue), cost = num(m.cost), expenses = num(m.expenses);
      return { month: m.month, label: m.label, revenue, expenses, grossMargin: revenue - cost, netProfit: revenue - cost - expenses };
    }),
  };
}

async function topLists({ from, to, limit = 5 } = {}) {
  const vals = [];
  const where = rangeClause(from, to, 'po.created_at', vals);
  const base = `FROM purchase_order_items poi
                JOIN purchase_orders po ON po.id = poi.purchase_order_id AND po.status <> 'CANCELLED'
                JOIN chemicals c ON c.id = poi.chemical_id`;
  const scope = where ? `${where}` : '';
  const lim = Math.min(Number(limit) || 5, 20);

  const chemicals = await pool.query(
    `SELECT c.id, c.name, c.unit, SUM(poi.quantity) AS quantity,
            SUM(poi.buyer_price_per_unit*poi.quantity) AS revenue,
            SUM((poi.buyer_price_per_unit-poi.seller_price_per_unit)*poi.quantity) AS margin
     ${base} ${scope} GROUP BY c.id ORDER BY revenue DESC LIMIT ${lim}`, vals);
  const sellers = await pool.query(
    `SELECT s.id, s.company_name, SUM(poi.quantity) AS quantity,
            SUM(poi.seller_price_per_unit*poi.quantity) AS purchased,
            SUM(poi.buyer_price_per_unit*poi.quantity) AS revenue
     ${base} JOIN sellers s ON s.id = c.seller_id ${scope} GROUP BY s.id ORDER BY revenue DESC LIMIT ${lim}`, vals);
  const buyers = await pool.query(
    `SELECT b.id, b.company_name, COUNT(DISTINCT po.id) AS orders,
            SUM(poi.buyer_price_per_unit*poi.quantity) AS revenue
     ${base} JOIN buyers b ON b.id = po.buyer_id ${scope} GROUP BY b.id ORDER BY revenue DESC LIMIT ${lim}`, vals);

  const n = (rows, keys) => rows.map((r) => { const o = { ...r }; keys.forEach((k) => { o[k] = num(r[k]); }); return o; });
  return {
    chemicals: n(chemicals.rows, ['quantity', 'revenue', 'margin']),
    sellers: n(sellers.rows, ['quantity', 'purchased', 'revenue']),
    buyers: n(buyers.rows, ['orders', 'revenue']),
  };
}

async function pendingPayments() {
  const { rows } = await pool.query(
    `SELECT i.id, i.invoice_number, i.total_amount, i.issued_at, i.due_date, po.po_number, b.company_name AS buyer_company_name,
            COALESCE(p.paid,0) AS paid,
            i.total_amount - COALESCE(p.paid,0) AS outstanding,
            (i.due_date < now()) AS overdue
     FROM invoices i
     JOIN purchase_orders po ON po.id = i.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id
     LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) p ON p.invoice_id = i.id
     WHERE i.total_amount - COALESCE(p.paid,0) > 0.005
     ORDER BY i.due_date ASC NULLS LAST`);
  return rows.map((r) => ({ ...r, total_amount: num(r.total_amount), paid: num(r.paid), outstanding: num(r.outstanding) }));
}

async function transactions({ from, to } = {}) {
  const vals = [];
  const where = rangeClause(from, to, 't.calculated_at', vals);
  const { rows } = await pool.query(
    `SELECT t.*, po.po_number, po.status AS po_status, b.company_name AS buyer_company_name
     FROM transactions t JOIN purchase_orders po ON po.id = t.purchase_order_id JOIN buyers b ON b.id = po.buyer_id
     ${where} ORDER BY t.calculated_at DESC`, vals);
  return rows;
}

// ------------------------------------------------------------ super admin ---
async function platform() {
  const q = async (sql) => (await pool.query(sql)).rows;
  const users = await q(`SELECT role, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM users GROUP BY role`);
  const verification = await q(
    `SELECT 'SELLER' AS kind, verification_status AS status, COUNT(*)::int AS n FROM sellers GROUP BY 2
     UNION ALL SELECT 'BUYER', verification_status, COUNT(*)::int FROM buyers GROUP BY 2`);
  const chem = (await q(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active AND buyer_price IS NOT NULL)::int AS listed,
            COUNT(*) FILTER (WHERE buyer_price IS NULL)::int AS awaiting_pricing, COUNT(*) FILTER (WHERE NOT is_active)::int AS inactive
     FROM chemicals`))[0];
  const orders = await q(`SELECT status, COUNT(*)::int AS n FROM purchase_orders GROUP BY status`);
  const gmv = (await q(`SELECT COALESCE(SUM(revenue),0) AS gmv, COUNT(*)::int AS n FROM (${ORDER_FIN}) f`))[0];
  const money = (await q(
    `SELECT (SELECT COALESCE(SUM(amount),0) FROM payments WHERE status='PAID') AS collected,
            (SELECT COALESCE(SUM(amount),0) FROM seller_payouts) AS paid_to_sellers,
            (SELECT COALESCE(SUM(net_profit),0) FROM transactions) AS realised_net_profit`))[0];
  const signups = await q(
    `WITH months AS (SELECT generate_series(date_trunc('month', now() AT TIME ZONE ${IST}) - interval '5 months',
                                            date_trunc('month', now() AT TIME ZONE ${IST}), interval '1 month') AS m)
     SELECT to_char(m,'Mon YY') AS label,
            (SELECT COUNT(*)::int FROM users u WHERE u.role='SELLER' AND date_trunc('month', u.created_at AT TIME ZONE ${IST}) = m) AS sellers,
            (SELECT COUNT(*)::int FROM users u WHERE u.role='BUYER'  AND date_trunc('month', u.created_at AT TIME ZONE ${IST}) = m) AS buyers
     FROM months ORDER BY m`);
  const audit = (await q(`SELECT COUNT(*)::int AS n FROM audit_logs WHERE created_at > now() - interval '7 days'`))[0];
  return {
    users, verification, chemicals: chem, orders,
    gmv: num(gmv.gmv), orderCount: gmv.n,
    collected: num(money.collected), paidToSellers: num(money.paid_to_sellers), realisedNetProfit: num(money.realised_net_profit),
    signups, auditEventsLast7Days: audit.n,
  };
}

// ----------------------------------------------------------------- seller ---
async function sellerOverview(userId) {
  const { rows: s } = await pool.query('SELECT id, verification_status FROM sellers WHERE user_id = $1', [userId]);
  if (s.length === 0) throw new NotFoundError('Seller profile not found');
  const sellerId = s[0].id;

  const chem = (await pool.query(
    `SELECT COUNT(*)::int AS total,
            COUNT(*) FILTER (WHERE c.is_active AND c.buyer_price IS NOT NULL)::int AS live,
            COUNT(*) FILTER (WHERE c.buyer_price IS NULL)::int AS awaiting_approval,
            COUNT(*) FILTER (WHERE COALESCE(i.quantity_available,0) <= 0)::int AS out_of_stock,
            COALESCE(SUM(i.quantity_available),0) AS stock_units
     FROM chemicals c LEFT JOIN inventory i ON i.chemical_id = c.id WHERE c.seller_id = $1`, [sellerId])).rows[0];

  // Seller-facing money is always at the SELLER's own price; buyer price and
  // C-Tech's margin never appear in any seller query.
  const ord = (await pool.query(
    `SELECT po.status, COUNT(DISTINCT po.id)::int AS n, COALESCE(SUM(poi.seller_price_per_unit*poi.quantity),0) AS earnings
     FROM purchase_order_items poi
     JOIN chemicals c ON c.id = poi.chemical_id AND c.seller_id = $1
     JOIN purchase_orders po ON po.id = poi.purchase_order_id AND po.status <> 'CANCELLED'
     GROUP BY po.status`, [sellerId])).rows;
  const earned = (await pool.query(
    `SELECT COALESCE(SUM(poi.seller_price_per_unit*poi.quantity),0) AS v
     FROM purchase_order_items poi
     JOIN chemicals c ON c.id = poi.chemical_id AND c.seller_id = $1
     JOIN purchase_orders po ON po.id = poi.purchase_order_id AND po.status IN ('DELIVERED','COMPLETED')`, [sellerId])).rows[0].v;
  const paid = (await pool.query(`SELECT COALESCE(SUM(amount),0) AS v FROM seller_payouts WHERE seller_id = $1`, [sellerId])).rows[0].v;

  const monthly = (await pool.query(
    `WITH months AS (SELECT generate_series(date_trunc('month', now() AT TIME ZONE ${IST}) - interval '5 months',
                                            date_trunc('month', now() AT TIME ZONE ${IST}), interval '1 month') AS m)
     SELECT to_char(m,'Mon YY') AS label,
            COALESCE((SELECT SUM(poi.seller_price_per_unit*poi.quantity)
                      FROM purchase_order_items poi
                      JOIN chemicals c ON c.id = poi.chemical_id AND c.seller_id = $1
                      JOIN purchase_orders po ON po.id = poi.purchase_order_id AND po.status <> 'CANCELLED'
                      WHERE date_trunc('month', po.created_at AT TIME ZONE ${IST}) = m),0) AS sales
     FROM months ORDER BY m`, [sellerId])).rows;

  return {
    verificationStatus: s[0].verification_status,
    chemicals: { total: chem.total, live: chem.live, awaitingApproval: chem.awaiting_approval, outOfStock: chem.out_of_stock, stockUnits: num(chem.stock_units) },
    orders: ord.map((o) => ({ status: o.status, count: o.n, value: num(o.earnings) })),
    earned: num(earned), paidOut: num(paid), pendingPayout: Math.max(0, num(earned) - num(paid)),
    monthlySales: monthly.map((m) => ({ label: m.label, sales: num(m.sales) })),
  };
}

// ------------------------------------------------------------------ buyer ---
async function buyerOverview(userId) {
  const { rows: b } = await pool.query('SELECT id, verification_status FROM buyers WHERE user_id = $1', [userId]);
  if (b.length === 0) throw new NotFoundError('Buyer profile not found');
  const buyerId = b[0].id;
  const q = async (sql) => num((await pool.query(sql, [buyerId])).rows[0].n);

  const openRfqs = await q(`SELECT COUNT(*) n FROM quotation_requests WHERE buyer_id = $1 AND status IN ('REQUESTED','REVIEWED','QUOTED')`);
  const toAccept = await q(
    `SELECT COUNT(*) n FROM quotations qt JOIN quotation_requests r ON r.id = qt.quotation_request_id
     WHERE r.buyer_id = $1 AND qt.status = 'SENT'`);
  const activeOrders = await q(`SELECT COUNT(*) n FROM purchase_orders WHERE buyer_id = $1 AND status IN ('PENDING','CONFIRMED','IN_TRANSIT')`);
  const delivered = await q(`SELECT COUNT(*) n FROM purchase_orders WHERE buyer_id = $1 AND status IN ('DELIVERED','COMPLETED')`);
  const inTransit = await q(
    `SELECT COUNT(*) n FROM transportation t JOIN purchase_orders po ON po.id = t.purchase_order_id
     WHERE po.buyer_id = $1 AND t.status NOT IN ('PENDING','DELIVERED','COMPLETED')`);
  const money = (await pool.query(
    `SELECT COALESCE(SUM(i.total_amount),0) AS billed,
            COALESCE(SUM(i.total_amount - COALESCE(p.paid,0)),0) AS outstanding
     FROM invoices i JOIN purchase_orders po ON po.id = i.purchase_order_id AND po.buyer_id = $1
     LEFT JOIN (SELECT invoice_id, SUM(amount) paid FROM payments WHERE status='PAID' GROUP BY 1) p ON p.invoice_id = i.id`, [buyerId])).rows[0];
  const monthly = (await pool.query(
    `WITH months AS (SELECT generate_series(date_trunc('month', now() AT TIME ZONE ${IST}) - interval '5 months',
                                            date_trunc('month', now() AT TIME ZONE ${IST}), interval '1 month') AS m)
     SELECT to_char(m,'Mon YY') AS label,
            COALESCE((SELECT SUM(po.total_amount) FROM purchase_orders po
                      WHERE po.buyer_id = $1 AND po.status <> 'CANCELLED'
                        AND date_trunc('month', po.created_at AT TIME ZONE ${IST}) = m),0) AS spend
     FROM months ORDER BY m`, [buyerId])).rows;

  return {
    verificationStatus: b[0].verification_status,
    openRfqs, quotationsToAccept: toAccept, activeOrders, deliveredOrders: delivered, shipmentsInTransit: inTransit,
    totalBilled: num(money.billed), outstanding: num(money.outstanding),
    monthlySpend: monthly.map((m) => ({ label: m.label, spend: num(m.spend) })),
  };
}

// ------------------------------------------------------- chemical detail ---
// Admin view of the "Chemical Detail Page": hero, price card, inventory,
// documents, purchase history, seller details, analytics.
async function chemicalDetailForAdmin(chemicalId) {
  const { rows } = await pool.query(
    `SELECT c.*, i.quantity_available, i.quantity_reserved,
            s.id AS seller_id, s.company_name AS seller_company_name, s.gst_number AS seller_gst_number,
            s.gst_verified AS seller_gst_verified, s.verification_status AS seller_verification_status, s.city AS seller_city, s.state AS seller_state,
            su.email AS seller_email, su.phone AS seller_phone
     FROM chemicals c
     LEFT JOIN inventory i ON i.chemical_id = c.id
     JOIN sellers s ON s.id = c.seller_id JOIN users su ON su.id = s.user_id
     WHERE c.id = $1`, [chemicalId]);
  if (rows.length === 0) throw new NotFoundError('Chemical not found');

  const history = (await pool.query(
    `SELECT po.id AS purchase_order_id, po.po_number, po.status, po.created_at, b.company_name AS buyer_company_name,
            poi.quantity, poi.unit, poi.seller_price_per_unit, poi.buyer_price_per_unit,
            (poi.buyer_price_per_unit - poi.seller_price_per_unit) * poi.quantity AS gross_margin
     FROM purchase_order_items poi
     JOIN purchase_orders po ON po.id = poi.purchase_order_id
     JOIN buyers b ON b.id = po.buyer_id
     WHERE poi.chemical_id = $1 ORDER BY po.created_at DESC`, [chemicalId])).rows;

  const live = history.filter((h) => h.status !== 'CANCELLED');
  const monthly = (await pool.query(
    `WITH months AS (SELECT generate_series(date_trunc('month', now() AT TIME ZONE ${IST}) - interval '5 months',
                                            date_trunc('month', now() AT TIME ZONE ${IST}), interval '1 month') AS m)
     SELECT to_char(m,'Mon YY') AS label,
            COALESCE((SELECT SUM(poi.quantity) FROM purchase_order_items poi
                      JOIN purchase_orders po ON po.id = poi.purchase_order_id AND po.status <> 'CANCELLED'
                      WHERE poi.chemical_id = $1 AND date_trunc('month', po.created_at AT TIME ZONE ${IST}) = m),0) AS quantity
     FROM months ORDER BY m`, [chemicalId])).rows;

  return {
    chemical: rows[0],
    analytics: {
      orders: live.length,
      quantitySold: live.reduce((s, h) => s + num(h.quantity), 0),
      revenue: live.reduce((s, h) => s + num(h.buyer_price_per_unit) * num(h.quantity), 0),
      grossMargin: live.reduce((s, h) => s + num(h.gross_margin), 0),
      monthlyVolume: monthly.map((m) => ({ label: m.label, quantity: num(m.quantity) })),
    },
    purchaseHistory: history,
  };
}

module.exports = {
  traderDashboard, summary, topLists, pendingPayments, transactions,
  platform, sellerOverview, buyerOverview, chemicalDetailForAdmin,
};
