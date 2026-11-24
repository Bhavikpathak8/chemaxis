const { pool } = require('../../db/pool');
const { NotFoundError } = require('../../utils/errors');

async function create(dto) {
  const { rows } = await pool.query(
    `INSERT INTO drivers (name, phone, license_number, vendor_id) VALUES ($1, $2, $3, $4) RETURNING *`,
    [dto.name, dto.phone ?? null, dto.licenseNumber ?? null, dto.vendorId ?? null],
  );
  return rows[0];
}

async function findAll() {
  const { rows } = await pool.query(
    `SELECT d.*, v.name AS vendor_name FROM drivers d LEFT JOIN transport_vendors v ON v.id = d.vendor_id ORDER BY d.name ASC`,
  );
  return rows;
}

async function update(id, dto) {
  const fieldMap = {
    name: 'name',
    phone: 'phone',
    licenseNumber: 'license_number',
    vendorId: 'vendor_id',
    isActive: 'is_active',
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
  if (sets.length === 0) {
    const { rows } = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
    if (rows.length === 0) throw new NotFoundError('Driver not found');
    return rows[0];
  }
  values.push(id);

  const { rows } = await pool.query(`UPDATE drivers SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`, values);
  if (rows.length === 0) throw new NotFoundError('Driver not found');
  return rows[0];
}

module.exports = { create, findAll, update };
