require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool: defaultPool } = require('../src/db/pool');

const DEMO_ADMIN = { email: 'admin@ctech.com', password: 'Admin@12345' };
const DEMO_SELLER = { email: 'seller@ctech.com', password: 'Seller@12345' };
const DEMO_BUYER = { email: 'buyer@ctech.com', password: 'Buyer@12345' };

async function upsertUser(dbPool, email, password, role) {
  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await dbPool.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = now()
     RETURNING id`,
    [email, passwordHash, role],
  );
  return rows[0].id;
}

async function seedDemo(dbPool = defaultPool) {
  console.log('[ChemAxis Seed] Seeding demo data...\n');

  await upsertUser(dbPool, DEMO_ADMIN.email, DEMO_ADMIN.password, 'SUPER_ADMIN');

  const sellerUserId = await upsertUser(dbPool, DEMO_SELLER.email, DEMO_SELLER.password, 'SELLER');
  const sellerResult = await dbPool.query(
    `INSERT INTO sellers (user_id, company_name, gst_number, gst_verified, address, city, state, pincode, verification_status, verified_at)
     VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7, 'APPROVED', now())
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
     RETURNING id`,
    [
      sellerUserId,
      'Bharuch Chemicals Pvt Ltd',
      '24AAAAA0000A1Z5',
      'Plot 12, GIDC Industrial Estate',
      'Bharuch',
      'Gujarat',
      '392015',
    ],
  );
  const sellerId = sellerResult.rows[0].id;

  const buyerUserId = await upsertUser(dbPool, DEMO_BUYER.email, DEMO_BUYER.password, 'BUYER');
  await dbPool.query(
    `INSERT INTO buyers (user_id, company_name, gst_number, gst_verified, address, city, state, pincode, verification_status)
     VALUES ($1, $2, $3, TRUE, $4, $5, $6, $7, 'APPROVED')
     ON CONFLICT (user_id) DO UPDATE SET updated_at = now()`,
    [
      buyerUserId,
      'Surat Industries Pvt Ltd',
      '24BBBBB0000B1Z5',
      '45 Ring Road Industrial Area',
      'Surat',
      'Gujarat',
      '395002',
    ],
  );

  const existingChemical = await dbPool.query(
    `SELECT id FROM chemicals WHERE seller_id = $1 AND name = 'Phenol'`,
    [sellerId],
  );
  if (existingChemical.rows.length === 0) {
    const chemResult = await dbPool.query(
      `INSERT INTO chemicals
         (seller_id, name, category, cas_number, purity, unit, seller_price, buyer_price,
          margin_type, margin_value, warehouse_location, description)
       VALUES ($1, 'Phenol', 'Industrial Chemical', '108-95-2', '99.9%', 'KG', 100, 107,
               'FIXED', 7, 'Bharuch, Gujarat', 'Industrial grade phenol — demo listing.')
       RETURNING id`,
      [sellerId],
    );
    await dbPool.query(
      `INSERT INTO inventory (chemical_id, quantity_available) VALUES ($1, 5000)`,
      [chemResult.rows[0].id],
    );
  }

  console.log('[ChemAxis Seed] Demo accounts ready:');
  console.log(`  Super Admin  ->  ${DEMO_ADMIN.email}  /  ${DEMO_ADMIN.password}`);
  console.log(`  Seller       ->  ${DEMO_SELLER.email}  /  ${DEMO_SELLER.password}`);
  console.log(`  Buyer        ->  ${DEMO_BUYER.email}   /  ${DEMO_BUYER.password}`);
}

if (require.main === module) {
  seedDemo()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await defaultPool.end();
    });
}

module.exports = { seedDemo };
