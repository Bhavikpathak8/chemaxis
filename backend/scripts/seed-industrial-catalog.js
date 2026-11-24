/**
 * C-Tech Chemical Trading Platform — Industrial Chemical Catalog Enrichment
 * Seeds high-demand Indian industrial chemical commodities with complete CAS,
 * HazMat classification, UN numbers, packaging, and regional manufacturing hubs.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });
const { pool } = require('../src/db/pool');

const INDUSTRIAL_COMMODITIES = [
  {
    name: 'Phenol',
    category: 'Bulk Petrochemicals',
    casNumber: '108-95-2',
    purity: '99.5%',
    grade: 'Pure / CP Grade 99.5%',
    hazardClass: 'Class 6.1 (Toxic / Corrosive)',
    unNumber: 'UN 2312',
    packingGroup: 'PG II',
    packagingType: 'Dedicated SS316 Road Tankers / MS Drums',
    moq: 10000,
    unit: 'KG',
    sellerPrice: 100.00,
    marginValue: 7.00,
    buyerPrice: 107.00,
    warehouseLocation: 'Dahej PCPIR Hub, Gujarat',
    availableQuantity: 45000,
    description: 'Industrial grade phenol for phenolic resins, bisphenol-A, polycarbonates, pharmaceuticals & agrochemicals.',
  },
  {
    name: 'Caustic Soda Lye',
    category: 'Chlor-Alkali',
    casNumber: '1310-73-2',
    purity: '48.5%',
    grade: 'Rayon Grade 48% - 50%',
    hazardClass: 'Class 8 (Corrosive Liquid)',
    unNumber: 'UN 1824',
    packingGroup: 'PG II',
    packagingType: 'Rubber-Lined / Epoxy-Coated Tankers',
    moq: 20000,
    unit: 'KG',
    sellerPrice: 35.00,
    marginValue: 3.50,
    buyerPrice: 38.50,
    warehouseLocation: 'Dahej & Hazira Belt, Gujarat',
    availableQuantity: 80000,
    description: 'Rayon grade caustic soda lye for textile scouring, alumina refining, soap synthesis, and effluent neutralization.',
  },
  {
    name: 'Methanol',
    category: 'Industrial Solvents',
    casNumber: '67-56-1',
    purity: '99.85%',
    grade: 'Pure Synthetic Grade 99.85%',
    hazardClass: 'Class 3 (Flammable Liquid)',
    unNumber: 'UN 1230',
    packingGroup: 'PG II',
    packagingType: 'MS Road Tankers / ISO Totes',
    moq: 15000,
    unit: 'KG',
    sellerPrice: 32.00,
    marginValue: 3.50,
    buyerPrice: 35.50,
    warehouseLocation: 'Kandla & Dahej Terminals, Gujarat',
    availableQuantity: 120000,
    description: 'High-purity methanol for formaldehyde synthesis, acetic acid, biodiesel esterification, and pharma extraction.',
  },
  {
    name: 'Acetone',
    category: 'Industrial Solvents',
    casNumber: '67-64-1',
    purity: '99.5%',
    grade: 'Pure Industrial Grade 99.5%',
    hazardClass: 'Class 3 (Flammable Liquid)',
    unNumber: 'UN 1090',
    packingGroup: 'PG II',
    packagingType: 'MS Road Tankers / Drums',
    moq: 10000,
    unit: 'KG',
    sellerPrice: 69.00,
    marginValue: 5.00,
    buyerPrice: 74.00,
    warehouseLocation: 'Dahej Petrochem Hub, Gujarat',
    availableQuantity: 60000,
    description: 'Pure industrial acetone for methyl methacrylate (MMA), bisphenol-A, solvent extraction, and paint formulations.',
  },
  {
    name: 'Isopropyl Alcohol (IPA)',
    category: 'Pharmaceutical Intermediates',
    casNumber: '67-63-0',
    purity: '99.8%',
    grade: 'Electronic / Pharma Grade 99.8%',
    hazardClass: 'Class 3 (Flammable Liquid)',
    unNumber: 'UN 1219',
    packingGroup: 'PG II',
    packagingType: 'ISO Totes / HM-HDPE Barrels',
    moq: 5000,
    unit: 'KG',
    sellerPrice: 96.00,
    marginValue: 7.00,
    buyerPrice: 103.00,
    warehouseLocation: 'Ankleshwar GIDC Hub, Gujarat',
    availableQuantity: 35000,
    description: 'High-purity IPA for pharmaceutical synthesis, electronic solvent cleaning, and medical disinfectant synthesis.',
  },
  {
    name: 'Di Potassium Phosphate Anhydrous',
    category: 'Agro Chemicals & Buffers',
    casNumber: '7758-11-4',
    purity: '98.5%',
    grade: 'Technical / Agro Grade',
    hazardClass: 'Non-Hazardous / Regulated Storage',
    unNumber: 'N/A',
    packingGroup: 'N/A',
    packagingType: '25 KG HDPE Bags with Liner',
    moq: 2000,
    unit: 'KG',
    sellerPrice: 148.00,
    marginValue: 10.00,
    buyerPrice: 158.00,
    warehouseLocation: 'Vapi Industrial Zone, Gujarat',
    availableQuantity: 25000,
    description: 'DKP buffering agent for specialty fertilizer formulation, food/pharma culture media, and fermentation processing.',
  },
  {
    name: 'Ethyl Acetate',
    category: 'Specialty Esters',
    casNumber: '141-78-6',
    purity: '99.8%',
    grade: 'Urethane Grade 99.8%',
    hazardClass: 'Class 3 (Flammable Liquid)',
    unNumber: 'UN 1173',
    packingGroup: 'PG II',
    packagingType: 'Dedicated Road Tankers / MS Barrels',
    moq: 10000,
    unit: 'KG',
    sellerPrice: 63.50,
    marginValue: 5.00,
    buyerPrice: 68.50,
    warehouseLocation: 'Ankleshwar GIDC Hub, Gujarat',
    availableQuantity: 50000,
    description: 'High-purity solvent for rotogravure packaging inks, flexible laminates, synthetic resins, and process extraction.',
  },
  {
    name: 'Acetic Acid Glacial',
    category: 'Acids & Alkalies',
    casNumber: '64-19-7',
    purity: '99.8%',
    grade: 'Technical Pure 99.8%',
    hazardClass: 'Class 8 (Corrosive Liquid)',
    unNumber: 'UN 2789',
    packingGroup: 'PG II',
    packagingType: 'SS Tankers / HM-HDPE Carboys',
    moq: 5000,
    unit: 'KG',
    sellerPrice: 38.00,
    marginValue: 3.50,
    buyerPrice: 41.50,
    warehouseLocation: 'Bharuch Hub, Gujarat',
    availableQuantity: 40000,
    description: 'Glacial acetic acid for PTA synthesis, vinyl acetate monomer (VAM), textile dyeing, and ester synthesis.',
  },
  {
    name: 'Toluene',
    category: 'Aromatic Hydrocarbons',
    casNumber: '108-88-3',
    purity: '99.7%',
    grade: 'Nitration / Pure Grade',
    hazardClass: 'Class 3 (Flammable Liquid)',
    unNumber: 'UN 1294',
    packingGroup: 'PG II',
    packagingType: 'Road Tankers / MS Barrels',
    moq: 10000,
    unit: 'KG',
    sellerPrice: 76.50,
    marginValue: 5.50,
    buyerPrice: 82.00,
    warehouseLocation: 'Dahej Petrochem Hub, Gujarat',
    availableQuantity: 70000,
    description: 'Pure nitration-grade toluene for toluene diisocyanate (TDI), benzoic acid, industrial coatings, and printing inks.',
  },
  {
    name: 'Hydrogen Peroxide 50%',
    category: 'Oxidizing Agents',
    casNumber: '7722-84-1',
    purity: '50.0%',
    grade: 'Industrial Bleaching Grade 50%',
    hazardClass: 'Class 5.1 (Oxidizer) / Class 8 (Corrosive)',
    unNumber: 'UN 2014',
    packingGroup: 'PG II',
    packagingType: 'Dedicated HM-HDPE Road Tankers / Carboys',
    moq: 10000,
    unit: 'KG',
    sellerPrice: 42.00,
    marginValue: 4.00,
    buyerPrice: 46.00,
    warehouseLocation: 'Dahej PCPIR Belt, Gujarat',
    availableQuantity: 90000,
    description: 'Concentrated hydrogen peroxide 50% for pulp and paper bleaching, textile bleaching, wastewater treatment, and chemical synthesis.',
  },
];

async function seedIndustrialCatalog() {
  console.log('================================================================');
  console.log('C-TECH CHEMICAL TRADE DESK — INDUSTRIAL CATALOG ENRICHMENT');
  console.log('================================================================\n');

  // Find a verified approved seller
  const sellerRes = await pool.query(
    `SELECT id, company_name FROM sellers WHERE verification_status = 'APPROVED' ORDER BY created_at ASC LIMIT 1`
  );
  if (sellerRes.rows.length === 0) {
    console.error('[Error] No approved seller found. Please run seed-demo.js first.');
    process.exit(1);
  }
  const sellerId = sellerRes.rows[0].id;
  console.log(`Associated Approved Manufacturer: ${sellerRes.rows[0].company_name} (${sellerId})\n`);

  let addedCount = 0;
  let updatedCount = 0;

  for (const chem of INDUSTRIAL_COMMODITIES) {
    // Check if chemical already exists by CAS number or name
    const existing = await pool.query(
      `SELECT id FROM chemicals WHERE cas_number = $1 OR name = $2 LIMIT 1`,
      [chem.casNumber, chem.name]
    );

    if (existing.rows.length > 0) {
      const chemId = existing.rows[0].id;
      await pool.query(
        `UPDATE chemicals
         SET category = $1, purity = $2, unit = $3, seller_price = $4, buyer_price = $5,
             margin_type = 'FIXED', margin_value = $6, warehouse_location = $7, description = $8,
             grade = $9, hazard_class = $10, un_number = $11, packing_group = $12, packaging_type = $13,
             moq = $14, is_active = TRUE, updated_at = now()
         WHERE id = $15`,
        [
          chem.category,
          chem.purity,
          chem.unit,
          chem.sellerPrice,
          chem.buyerPrice,
          chem.marginValue,
          chem.warehouseLocation,
          chem.description,
          chem.grade,
          chem.hazardClass,
          chem.unNumber,
          chem.packingGroup,
          chem.packagingType,
          chem.moq,
          chemId,
        ]
      );
      // Update inventory
      await pool.query(
        `INSERT INTO inventory (chemical_id, quantity_available)
         VALUES ($1, $2)
         ON CONFLICT (chemical_id) DO UPDATE SET quantity_available = EXCLUDED.quantity_available, updated_at = now()`,
        [chemId, chem.availableQuantity]
      );
      console.log(`  [UPDATED] ${chem.name.padEnd(35)} | CAS: ${chem.casNumber} | Rate: ₹${chem.buyerPrice}/KG`);
      updatedCount++;
    } else {
      const insertRes = await pool.query(
        `INSERT INTO chemicals
           (seller_id, name, category, cas_number, purity, unit, seller_price, buyer_price,
            margin_type, margin_value, warehouse_location, description, grade, hazard_class,
            un_number, packing_group, packaging_type, moq, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'FIXED', $9, $10, $11, $12, $13, $14, $15, $16, $17, TRUE)
         RETURNING id`,
        [
          sellerId,
          chem.name,
          chem.category,
          chem.casNumber,
          chem.purity,
          chem.unit,
          chem.sellerPrice,
          chem.buyerPrice,
          chem.marginValue,
          chem.warehouseLocation,
          chem.description,
          chem.grade,
          chem.hazardClass,
          chem.unNumber,
          chem.packingGroup,
          chem.packagingType,
          chem.moq,
        ]
      );
      const newId = insertRes.rows[0].id;
      await pool.query(
        `INSERT INTO inventory (chemical_id, quantity_available) VALUES ($1, $2)`,
        [newId, chem.availableQuantity]
      );
      console.log(`  [ADDED]   ${chem.name.padEnd(35)} | CAS: ${chem.casNumber} | Rate: ₹${chem.buyerPrice}/KG`);
      addedCount++;
    }
  }

  console.log('\n================================================================');
  console.log(`CATALOG ENRICHMENT COMPLETE: ${addedCount} Added, ${updatedCount} Updated`);
  console.log('All 10 institutional chemical commodities active with indexed pricing.');
  console.log('================================================================\n');

  await pool.end();
}

seedIndustrialCatalog().catch((err) => {
  console.error('[Enrichment Error]', err);
  process.exit(1);
});
