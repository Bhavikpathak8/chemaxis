const PDFDocument = require('pdfkit');
const { company, rupeesInWords } = require('../../../common/company');

const INR = (v) => `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' }) : '-');
const qty = (i) => `${Number(i.quantity)} ${String(i.unit).toLowerCase()}`;

function build(title, subtitle, draw) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c)); doc.on('end', () => resolve(Buffer.concat(chunks))); doc.on('error', reject);
    const co = company();
    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text(co.name.toUpperCase(), 50, 50);
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    let y = 74;
    if (co.address) { doc.text(co.address, 50, y, { width: 240 }); y += doc.heightOfString(co.address, { width: 240 }) + 2; }
    if (co.gstin) { doc.text(`GSTIN: ${co.gstin}`, 50, y); y += 13; }
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(title, 300, 50, { width: 245, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    subtitle.forEach((s, i) => doc.text(s, 300, 74 + i * 13, { width: 245, align: 'right' }));
    const ruleY = Math.max(y, 74 + subtitle.length * 13) + 8;
    doc.moveTo(50, ruleY).lineTo(545, ruleY).strokeColor('#DCE1DE').stroke();
    draw(doc, ruleY + 14, co);
    doc.font('Helvetica').fontSize(8).fillColor('#4B5459').text('System-generated document from the C-Tech platform.', 50, 780, { width: 495, align: 'center' });
    doc.end();
  });
}

function party(doc, label, x, y, p) {
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(label, x, y);
  doc.font('Helvetica').fontSize(9).fillColor('#15191C').text(p.name, x, y + 15, { width: 230 });
  doc.fillColor('#4B5459');
  let yy = y + 28;
  if (p.gstin) { doc.text(`GSTIN: ${p.gstin}`, x, yy); yy += 13; }
  if (p.address) { doc.text(p.address, x, yy, { width: 230 }); yy += doc.heightOfString(p.address, { width: 230 }) + 2; }
  if (p.place) { doc.text(p.place, x, yy, { width: 230 }); yy += 13; }
  return yy;
}

const buyerParty = (o) => ({ name: o.buyer.company_name, gstin: o.buyer.gst_number, address: o.buyer.address, place: [o.buyer.city, o.buyer.state, o.buyer.pincode].filter(Boolean).join(', ') });
const traderParty = (co) => ({ name: co.name, gstin: co.gstin, address: co.address, place: co.state });

function itemsTable(doc, y, o, withPrice) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor('#15191C');
  doc.text('#', 50, y); doc.text('Chemical', 70, y); doc.text('Quantity', withPrice ? 270 : 330, y);
  if (withPrice) { doc.text('Price/unit', 350, y); doc.text('Amount', 440, y, { width: 105, align: 'right' }); }
  doc.moveTo(50, y + 15).lineTo(545, y + 15).strokeColor('#DCE1DE').stroke();
  y += 25; doc.font('Helvetica').fillColor('#15191C');
  o.items.forEach((i, n) => {
    if (y > 700) { doc.addPage(); y = 50; }
    doc.text(String(n + 1), 50, y); doc.text(i.chemical_name, 70, y, { width: 190 }); doc.text(qty(i), withPrice ? 270 : 330, y);
    if (withPrice) { doc.text(INR(i.buyer_price_per_unit), 350, y); doc.text(INR(i.subtotal), 440, y, { width: 105, align: 'right' }); }
    y += 20;
  });
  doc.moveTo(50, y + 2).lineTo(545, y + 2).strokeColor('#DCE1DE').stroke();
  return y + 14;
}

// Purchase order. Buyer-safe by construction: it prints the buyer's price and
// never the seller's price or identity. `internal` (staff copy) adds the supplier.
function purchaseOrderPdf(o, { internal }) {
  return build('PURCHASE ORDER', [`PO #: ${o.po_number}`, `Date: ${fmtDate(o.created_at)}`, `Status: ${o.status}`], (doc, y, co) => {
    const a = party(doc, 'Buyer (ordering party)', 50, y, buyerParty(o));
    const b = party(doc, 'Supplier / trader', 310, y, traderParty(co));
    y = Math.max(a, b) + 14;
    doc.font('Helvetica').fontSize(9).fillColor('#4B5459');
    doc.text(`Deliver to: ${o.delivery_address}`, 50, y, { width: 495 }); y += doc.heightOfString(`Deliver to: ${o.delivery_address}`, { width: 495 }) + 3;
    doc.text(`Payment terms: ${o.payment_terms || '-'}    Expected dispatch: ${fmtDate(o.expected_dispatch_date)}`, 50, y); y += 24;
    y = itemsTable(doc, y, o, true);
    const total = Number(o.total_amount);
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#059669').text('Order value (before GST)', 300, y).text(INR(total), 440, y, { width: 105, align: 'right' });
    y += 20;
    doc.font('Helvetica').fontSize(9).fillColor('#4B5459').text(`${rupeesInWords(total)} (GST is added on the tax invoice).`, 50, y, { width: 495 }); y += 30;
    if (internal && o.supplier) {
      doc.fillColor('#000000').font('Helvetica-Bold').text('Internal: goods sourced from', 50, y);
      doc.font('Helvetica').fillColor('#4B5459').text(`${o.supplier.company_name}${o.supplier.gst_number ? `  ·  GSTIN ${o.supplier.gst_number}` : ''}`, 50, y + 14);
    }
  });
}

// Delivery challan: what moved, in what, driven by whom. No prices.
function deliveryChallanPdf(o, t) {
  return build('DELIVERY CHALLAN', [`Challan for PO #: ${o.po_number}`, `Date: ${fmtDate(t.picked_up_at || t.scheduled_at)}`], (doc, y, co) => {
    const a = party(doc, 'Consignor', 50, y, traderParty(co));
    const b = party(doc, 'Consignee', 310, y, buyerParty(o));
    y = Math.max(a, b) + 14;
    doc.font('Helvetica').fontSize(9).fillColor('#4B5459');
    [['Dispatched from', t.pickup_location], ['Delivered to', t.delivery_location], ['Vehicle type', t.vehicle_type],
      ['Driver', t.driver_name ? `${t.driver_name}${t.driver_phone ? ` (${t.driver_phone})` : ''}` : 'To be assigned'],
      ['Transporter', t.vendor_name || 'Own vehicle'], ['Distance', t.distance_km ? `${Number(t.distance_km)} km` : '-']].forEach(([k, val]) => {
      doc.fillColor('#15191C').text(`${k}: `, 50, y, { continued: true }).fillColor('#4B5459').text(String(val)); y += 14;
    });
    y = itemsTable(doc, y + 12, o, false);
    doc.fillColor('#4B5459').fontSize(9).text('Goods received in good condition:', 50, y + 30);
    doc.moveTo(50, y + 90).lineTo(220, y + 90).strokeColor('#15191C').stroke(); doc.text("Receiver's name and signature", 50, y + 95);
    doc.moveTo(380, y + 90).lineTo(545, y + 90).stroke(); doc.text('For ' + co.name, 380, y + 95, { width: 165, align: 'right' });
  });
}

// E-way bill data sheet. The bill itself is generated on the government's
// e-way bill portal; this sheet carries every value you need to enter there.
function ewayBillSheetPdf(o, t, invoice) {
  const total = invoice ? Number(invoice.total_amount) : Number(o.total_amount);
  return build('E-WAY BILL DETAILS', [`PO #: ${o.po_number}`, invoice ? `Invoice #: ${invoice.invoice_number}` : 'Invoice: not issued yet', `Date: ${fmtDate(new Date())}`], (doc, y, co) => {
    doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#B87B0C').text('Details for filing on the GST e-way bill portal (ewaybillgst.gov.in). This sheet is not an e-way bill. Enter the vehicle number there.', 50, y, { width: 495 });
    y += 34;
    const a = party(doc, 'Consignor (From)', 50, y, { ...traderParty(co), place: t.pickup_location });
    const b = party(doc, 'Consignee (To)', 310, y, { ...buyerParty(o), place: `${t.delivery_location}` });
    y = Math.max(a, b) + 14;
    doc.font('Helvetica').fontSize(9).fillColor('#4B5459');
    [['Supply type', 'Outward - supply'], ['Document type', 'Tax invoice'], ['Document no.', invoice ? invoice.invoice_number : '-'],
      ['Transport mode', 'Road'], ['Approximate distance', t.distance_km ? `${Number(t.distance_km)} km` : '-'],
      ['Vehicle type', t.vehicle_type], ['Transporter', t.vendor_name || 'Own vehicle'], ['Driver', t.driver_name || '-'],
      ['Total invoice value', INR(total)]].forEach(([k, val]) => {
      doc.fillColor('#15191C').text(`${k}: `, 50, y, { continued: true }).fillColor('#4B5459').text(String(val)); y += 14;
    });
    y = itemsTable(doc, y + 12, o, true);
    doc.fillColor('#4B5459').fontSize(8.5).text('HSN code is not stored on the platform. Add the correct HSN for each chemical on the portal.', 50, y + 4, { width: 495 });
  });
}

module.exports = { purchaseOrderPdf, deliveryChallanPdf, ewayBillSheetPdf };
