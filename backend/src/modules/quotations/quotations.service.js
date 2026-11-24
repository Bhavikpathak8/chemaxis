const { pool } = require('../../db/pool');
const { withTransaction } = require('../../db/transaction');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../../utils/errors');
const { generateQuotationPdfBuffer } = require('./pdf/quotation-pdf');
const { saveGeneratedFile } = require('../../middleware/upload');
const poService = require('../purchase-orders/purchase-orders.service');
const { notifyUser, notifyRole } = require('../../common/notify');

async function getApprovedBuyer(userId) {
  const { rows } = await pool.query('SELECT * FROM buyers WHERE user_id = $1', [userId]);
  if (rows.length === 0) throw new NotFoundError('Buyer profile not found');
  if (rows[0].verification_status !== 'APPROVED') {
    throw new ForbiddenError('Your buyer account is pending admin verification. You cannot request quotes yet.');
  }
  return rows[0];
}

// --- Buyer -----------------------------------------------------------------
async function createRequest(userId, dto) {
  const buyer = await getApprovedBuyer(userId);

  // Only chemicals the trader has approved and priced (and whose seller is
  // approved) can be requested — the same rule as the buyer catalog.
  const { rows: chemRows } = await pool.query(
    `SELECT c.id, c.unit, c.is_active, c.buyer_price, s.verification_status
     FROM chemicals c JOIN sellers s ON s.id = c.seller_id WHERE c.id = $1`,
    [dto.chemicalId],
  );
  const chem = chemRows[0];
  if (!chem || !chem.is_active || chem.buyer_price === null || chem.verification_status !== 'APPROVED') {
    throw new NotFoundError('Chemical not found or no longer listed');
  }
  // Quantities are never converted between units, so a request must use the
  // unit the chemical is priced and stocked in.
  if (dto.unit !== chem.unit) {
    throw new BadRequestError(`This chemical is sold per ${chem.unit}. Enter the quantity in ${chem.unit}.`);
  }

  const { rows } = await pool.query(
    `INSERT INTO quotation_requests (buyer_id, chemical_id, requested_quantity, unit, status)
     VALUES ($1, $2, $3, $4, 'REQUESTED') RETURNING *`,
    [buyer.id, dto.chemicalId, dto.requestedQuantity, dto.unit],
  );
  await notifyRole(['SUPER_ADMIN', 'TRADER_STAFF'], 'RFQ_SUBMITTED', 'New RFQ received',
    `${buyer.company_name} requested ${dto.requestedQuantity} ${dto.unit} of a chemical.`);
  return rows[0];
}

// Buyers must never receive margin_per_unit: quoted price minus margin IS the
// seller's price, so exposing it would leak C-Tech's cost. Internal callers
// (accept flow, admin views) use the full row.
const BUYER_QUOTATION_COLUMNS = 'id, quotation_request_id, quoted_price_per_unit, quantity, valid_until, status, pdf_url, created_at';

async function getQuotationsForRequest(requestId, forBuyer = false) {
  const { rows } = await pool.query(
    // A DRAFT is the trader's working copy — buyers only ever see sent quotations.
    `SELECT ${forBuyer ? BUYER_QUOTATION_COLUMNS : '*'} FROM quotations WHERE quotation_request_id = $1 ${forBuyer ? "AND status <> 'DRAFT'" : ''} ORDER BY created_at DESC`,
    [requestId],
  );
  return rows;
}

async function findMine(userId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows } = await pool.query(
    `SELECT qr.*, c.name AS chemical_name, c.unit AS chemical_unit
     FROM quotation_requests qr JOIN chemicals c ON c.id = qr.chemical_id
     WHERE qr.buyer_id = $1 ORDER BY qr.created_at DESC`,
    [buyerRows[0].id],
  );
  return Promise.all(rows.map(async (r) => ({ ...r, quotations: await getQuotationsForRequest(r.id, true) })));
}

async function getOwnedRequest(userId, requestId) {
  const { rows: buyerRows } = await pool.query('SELECT id FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');

  const { rows } = await pool.query('SELECT * FROM quotation_requests WHERE id = $1', [requestId]);
  const request = rows[0];
  if (!request) throw new NotFoundError('Quotation request not found');
  if (request.buyer_id !== buyerRows[0].id) throw new ForbiddenError('You do not own this quotation request');
  return request;
}

async function findOneOwned(userId, requestId) {
  const request = await getOwnedRequest(userId, requestId);
  return { ...request, quotations: await getQuotationsForRequest(requestId, true) };
}

function latestOf(quotations) {
  return [...quotations].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
}

async function rejectByBuyer(userId, requestId) {
  await getOwnedRequest(userId, requestId);
  const quotations = await getQuotationsForRequest(requestId);
  const latest = latestOf(quotations);
  if (!latest || latest.status !== 'SENT') {
    throw new BadRequestError('No active quotation to reject for this request');
  }

  return withTransaction(async (client) => {
    await client.query(`UPDATE quotations SET status = 'REJECTED' WHERE id = $1`, [latest.id]);
    const { rows } = await client.query(
      `UPDATE quotation_requests SET status = 'REJECTED' WHERE id = $1 RETURNING *`,
      [requestId],
    );
    return rows[0];
  });
}

// Accepting turns a SENT quotation into a Purchase Order — the core
// "Accepted quotation becomes Purchase Order" rule from the spec. Stock
// reservation, the PO/PO-item rows, and both status flips all happen in
// one transaction so a failure anywhere rolls back everything.
async function acceptByBuyer(userId, requestId, dto) {
  const { rows: buyerRows } = await pool.query('SELECT * FROM buyers WHERE user_id = $1', [userId]);
  if (buyerRows.length === 0) throw new NotFoundError('Buyer profile not found');
  const buyer = buyerRows[0];

  const request = await getOwnedRequest(userId, requestId);
  const quotations = await getQuotationsForRequest(requestId);
  const latest = latestOf(quotations);
  if (!latest || latest.status !== 'SENT') {
    throw new BadRequestError('No active quotation to accept for this request');
  }
  if (new Date(latest.valid_until) < new Date()) {
    throw new ForbiddenError('This quotation has expired');
  }

  const po = await withTransaction(async (client) => {
    const po = await poService.createFromAcceptedQuotation(client, {
      buyerId: buyer.id,
      chemicalId: request.chemical_id,
      quotation: latest,
      deliveryAddress: dto.deliveryAddress,
      expectedDispatchDate: dto.expectedDispatchDate,
      paymentTerms: dto.paymentTerms,
    });

    await client.query(`UPDATE quotations SET status = 'ACCEPTED' WHERE id = $1`, [latest.id]);
    await client.query(`UPDATE quotation_requests SET status = 'ACCEPTED' WHERE id = $1`, [requestId]);

    return po;
  });

  // Quotation Accepted -> Trader + Seller (WORKFLOW.md notification table)
  const { rows: sellerUsers } = await pool.query(
    `SELECT DISTINCT s.user_id FROM purchase_order_items i
     JOIN chemicals c ON c.id = i.chemical_id JOIN sellers s ON s.id = c.seller_id
     WHERE i.purchase_order_id = $1`,
    [po.id],
  );
  await notifyRole(['SUPER_ADMIN', 'TRADER_STAFF'], 'QUOTATION_ACCEPTED', 'Quotation accepted',
    `${buyer.company_name} accepted the quotation. Purchase order ${po.po_number} created.`);
  for (const s of sellerUsers) {
    await notifyUser(s.user_id, 'QUOTATION_ACCEPTED', 'Order received',
      `A purchase order (${po.po_number}) was created for your chemical.`);
  }
  return po;
}

// --- Admin/Trader ------------------------------------------------------
async function findAllForAdmin() {
  const { rows } = await pool.query(
    `SELECT qr.*, b.company_name AS buyer_company_name,
            c.name AS chemical_name, c.unit AS chemical_unit, c.seller_price, c.buyer_price AS listed_buyer_price,
            COALESCE(i.quantity_available, 0) AS quantity_available
     FROM quotation_requests qr
     JOIN buyers b ON b.id = qr.buyer_id
     JOIN chemicals c ON c.id = qr.chemical_id
     LEFT JOIN inventory i ON i.chemical_id = c.id
     ORDER BY qr.created_at DESC`,
  );
  return Promise.all(rows.map(async (r) => ({ ...r, quotations: await getQuotationsForRequest(r.id) })));
}

// "Trader reviews... edits quantity/price" — creates a DRAFT the trader can
// still adjust before sending.
async function deriveMargin(chemicalId, quotedPrice, quantity) {
  const { rows } = await pool.query(
    `SELECT c.seller_price, COALESCE(i.quantity_available,0) AS stock
     FROM chemicals c LEFT JOIN inventory i ON i.chemical_id = c.id WHERE c.id = $1`, [chemicalId]);
  if (rows.length === 0) throw new NotFoundError('Chemical not found');
  const seller = Number(rows[0].seller_price);
  if (Number(quotedPrice) <= seller) {
    throw new BadRequestError(`Quoted price (₹${quotedPrice}) must be higher than the seller's price (₹${seller}) so C-Tech earns a margin`);
  }
  if (quantity !== undefined && Number(quantity) > Number(rows[0].stock)) {
    throw new BadRequestError(`Only ${Number(rows[0].stock)} units are in stock — reduce the quoted quantity`);
  }
  return Math.round((Number(quotedPrice) - seller) * 100) / 100;
}

async function createQuotationDraft(requestId, dto) {
  const { rows: reqRows } = await pool.query('SELECT * FROM quotation_requests WHERE id = $1', [
    requestId,
  ]);
  if (reqRows.length === 0) throw new NotFoundError('Quotation request not found');
  if (['ACCEPTED', 'REJECTED'].includes(reqRows[0].status)) {
    throw new BadRequestError(`This request is already ${reqRows[0].status.toLowerCase()} and cannot be quoted again`);
  }
  // The margin is always derived from the seller's actual price — never
  // trusted from the client — so the quote, the margin and the later profit
  // calculation can't disagree.
  const margin = await deriveMargin(reqRows[0].chemical_id, dto.quotedPricePerUnit, dto.quantity);

  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `INSERT INTO quotations (quotation_request_id, quoted_price_per_unit, quantity, margin_per_unit, valid_until, status)
       VALUES ($1, $2, $3, $4, $5, 'DRAFT') RETURNING *`,
      [requestId, dto.quotedPricePerUnit, dto.quantity, margin, dto.validUntil],
    );
    await client.query(`UPDATE quotation_requests SET status = 'REVIEWED' WHERE id = $1`, [requestId]);
    return rows[0];
  });
}

async function getDraftQuotation(quotationId) {
  const { rows } = await pool.query('SELECT * FROM quotations WHERE id = $1', [quotationId]);
  if (rows.length === 0) throw new NotFoundError('Quotation not found');
  if (rows[0].status !== 'DRAFT') {
    throw new BadRequestError('Only a DRAFT quotation can be edited — this one has already been sent');
  }
  return rows[0];
}

async function updateQuotationDraft(quotationId, dto) {
  await getDraftQuotation(quotationId);

  const fieldMap = {
    quotedPricePerUnit: 'quoted_price_per_unit',
    quantity: 'quantity',
    validUntil: 'valid_until',
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
  if (sets.length === 0) return getDraftQuotation(quotationId);

  if (dto.quotedPricePerUnit !== undefined || dto.quantity !== undefined) {
    const current = await getDraftQuotation(quotationId);
    const { rows: rr } = await pool.query('SELECT chemical_id FROM quotation_requests WHERE id = $1', [current.quotation_request_id]);
    const margin = await deriveMargin(rr[0].chemical_id, dto.quotedPricePerUnit ?? current.quoted_price_per_unit, dto.quantity ?? current.quantity);
    sets.push(`margin_per_unit = $${i}`);
    values.push(margin);
    i++;
  }
  values.push(quotationId);

  const { rows } = await pool.query(
    `UPDATE quotations SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`,
    values,
  );
  return rows[0];
}

// "Trader sends quotation PDF" — generates the PDF, saves it locally, and
// flips both the quotation and its parent request to their SENT/QUOTED states.
async function sendQuotation(quotationId) {
  const quotation = await getDraftQuotation(quotationId);

  const { rows: reqRows } = await pool.query(
    `SELECT qr.*, c.name AS chemical_name
     FROM quotation_requests qr JOIN chemicals c ON c.id = qr.chemical_id
     WHERE qr.id = $1`,
    [quotation.quotation_request_id],
  );
  const request = reqRows[0];

  const { rows: buyerRows } = await pool.query('SELECT * FROM buyers WHERE id = $1', [request.buyer_id]);
  const buyer = buyerRows[0];

  const pdfBuffer = await generateQuotationPdfBuffer({
    quotationId: quotation.id,
    issuedAt: new Date(),
    validUntil: new Date(quotation.valid_until),
    buyer: { companyName: buyer.company_name, gstNumber: buyer.gst_number, city: buyer.city, state: buyer.state },
    chemicalName: request.chemical_name,
    quantity: Number(quotation.quantity),
    unit: request.unit,
    quotedPricePerUnit: Number(quotation.quoted_price_per_unit),
  });
  const pdfUrl = saveGeneratedFile('quotations', `${quotation.id}.pdf`, pdfBuffer);

  const sent = await withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE quotations SET status = 'SENT', pdf_url = $2 WHERE id = $1 RETURNING *`,
      [quotationId, pdfUrl],
    );
    await client.query(`UPDATE quotation_requests SET status = 'QUOTED' WHERE id = $1`, [
      quotation.quotation_request_id,
    ]);
    return rows[0];
  });

  await notifyUser(buyer.user_id, 'QUOTATION_SENT', 'Quotation received',
    `A quotation for ${request.chemical_name} is ready for your review.`);
  return sent;
}

module.exports = {
  createRequest,
  findMine,
  findOneOwned,
  rejectByBuyer,
  acceptByBuyer,
  findAllForAdmin,
  createQuotationDraft,
  updateQuotationDraft,
  sendQuotation,
};
