const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');
const { logAction } = require('../../common/audit-log');

async function list() {
  const { rows } = await pool.query(
    `SELECT mp.*, c.name AS chemical_name
     FROM margin_policies mp LEFT JOIN chemicals c ON c.id = mp.chemical_id
     ORDER BY mp.created_at DESC`,
  );
  return rows;
}

// Resolves which active policy applies to a chemical: CHEMICAL > CATEGORY >
// GLOBAL (newest wins within a scope), and what buyer price it would produce.
// This only SUGGESTS — the trader still confirms the price explicitly.
async function suggestForChemical(chemicalId) {
  const { rows: c } = await pool.query('SELECT id, name, category, seller_price FROM chemicals WHERE id = $1', [chemicalId]);
  if (c.length === 0) throw new NotFoundError('Chemical not found');
  const chem = c[0];
  const { rows } = await pool.query(
    `SELECT * FROM margin_policies
     WHERE is_active AND (scope = 'GLOBAL' OR (scope = 'CATEGORY' AND category = $2) OR (scope = 'CHEMICAL' AND chemical_id = $1))
     ORDER BY CASE scope WHEN 'CHEMICAL' THEN 1 WHEN 'CATEGORY' THEN 2 ELSE 3 END, created_at DESC LIMIT 1`,
    [chemicalId, chem.category]);
  const policy = rows[0] ?? null;
  const seller = Number(chem.seller_price);
  let suggested = null;
  if (policy) {
    const v = Number(policy.margin_value);
    suggested = policy.margin_type === 'FIXED' ? seller + v : policy.margin_type === 'PERCENTAGE' ? seller * (1 + v / 100) : v;
    suggested = Math.round(suggested * 100) / 100;
  }
  return { sellerPrice: seller, policy, suggestedBuyerPrice: suggested };
}

async function create(userId, dto) {
  const { rows } = await pool.query(
    `INSERT INTO margin_policies (name, scope, category, chemical_id, margin_type, margin_value, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [dto.name, dto.scope, dto.scope === 'CATEGORY' ? dto.category : null, dto.scope === 'CHEMICAL' ? dto.chemicalId : null,
     dto.marginType, dto.marginValue, dto.isActive ?? true],
  );
  await logAction({ userId, action: 'CREATE_MARGIN_POLICY', entityType: 'MarginPolicy', entityId: rows[0].id, metadata: dto });
  return rows[0];
}

async function update(userId, id, dto) {
  const map = { name: 'name', scope: 'scope', category: 'category', chemicalId: 'chemical_id',
    marginType: 'margin_type', marginValue: 'margin_value', isActive: 'is_active' };
  const sets = [];
  const vals = [id];
  for (const [k, col] of Object.entries(map)) {
    if (dto[k] !== undefined) { vals.push(dto[k]); sets.push(`${col} = $${vals.length}`); }
  }
  if (sets.length === 0) {
    const { rows } = await pool.query('SELECT * FROM margin_policies WHERE id = $1', [id]);
    if (rows.length === 0) throw new NotFoundError('Margin policy not found');
    return rows[0];
  }
  const { rows } = await pool.query(`UPDATE margin_policies SET ${sets.join(', ')} WHERE id = $1 RETURNING *`, vals);
  if (rows.length === 0) throw new NotFoundError('Margin policy not found');
  await logAction({ userId, action: 'UPDATE_MARGIN_POLICY', entityType: 'MarginPolicy', entityId: id, metadata: dto });
  return rows[0];
}

module.exports = { suggestForChemical, list, create, update };
