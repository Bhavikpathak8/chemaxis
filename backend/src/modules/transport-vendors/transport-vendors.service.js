const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

async function create(dto) {
  const { rows } = await pool.query(
    `INSERT INTO transport_vendors (name, contact_phone, contact_email) VALUES ($1, $2, $3) RETURNING *`,
    [dto.name, dto.contactPhone ?? null, dto.contactEmail ?? null],
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(`SELECT * FROM transport_vendors ORDER BY name ASC`);
  return rows;
}

async function update(id, dto) {
  const fieldMap = { name: 'name', contactPhone: 'contact_phone', contactEmail: 'contact_email', isActive: 'is_active' };
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
  if (sets.length === 0) {
    const { rows } = await pool.query('SELECT * FROM transport_vendors WHERE id = $1', [id]);
    if (rows.length === 0) throw new NotFoundError('Transport vendor not found');
    return rows[0];
  }
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE transport_vendors SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values,
  );
  if (rows.length === 0) throw new NotFoundError('Transport vendor not found');
  return rows[0];
}

module.exports = { create, findAll, update };
