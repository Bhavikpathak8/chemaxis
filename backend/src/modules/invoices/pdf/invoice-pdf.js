const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { company, rupeesInWords } = require('../../../common/company');

const INR = (value) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
const same = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();

async function generateInvoicePdfBuffer(data) {
  const co = company();
  // The QR is a scannable summary of the invoice (it is not a government
  // e-invoice IRN, which needs the GST Network's API).
  const qrPayload = JSON.stringify({
    invoiceNumber: data.invoiceNumber, supplierGstin: co.gstin || null, buyerGstin: data.buyer.gstNumber,
    issuedAt: data.issuedAt.toISOString(), totalAmount: data.grandTotal,
  });
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 120 });
  const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');

  // Intra-state supply splits GST into CGST + SGST; inter-state is IGST.
  const intra = same(co.state, data.buyer.state);
  const half = Math.round((data.gstAmount / 2) * 100) / 100;
  const taxLines = intra
    ? [[`CGST (${data.gstRatePercent / 2}%)`, half], [`SGST (${data.gstRatePercent / 2}%)`, Math.round((data.gstAmount - half) * 100) / 100]]
    : [[`IGST (${data.gstRatePercent}%)`, data.gstAmount]];

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#000000').text(co.name.toUpperCase(), 50, 50);
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    let hy = 74;
    doc.text(co.tagline, 50, hy); hy += 13;
    if (co.address) { doc.text(co.address, 50, hy, { width: 240 }); hy += doc.heightOfString(co.address, { width: 240 }) + 2; }
    if (co.gstin) { doc.text(`GSTIN: ${co.gstin}`, 50, hy); hy += 13; }
    if (co.phone || co.email) { doc.text([co.phone, co.email].filter(Boolean).join('  ·  '), 50, hy); hy += 13; }

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('TAX INVOICE', 300, 50, { width: 190, align: 'right' });
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    doc.text(`Invoice #: ${data.invoiceNumber}`, 300, 74, { width: 190, align: 'right' });
    doc.text(`PO #: ${data.poNumber}`, 300, 87, { width: 190, align: 'right' });
    doc.text(`Issued: ${data.issuedAt.toLocaleDateString('en-IN')}`, 300, 100, { width: 190, align: 'right' });
    if (data.dueDate) doc.text(`Due: ${data.dueDate.toLocaleDateString('en-IN')}`, 300, 113, { width: 190, align: 'right' });
    doc.image(qrImageBuffer, 495, 50, { width: 60, height: 60 });

    const ruleY = Math.max(hy, 135) + 8;
    doc.moveTo(50, ruleY).lineTo(545, ruleY).strokeColor('#DCE1DE').stroke();

    let y = ruleY + 14;
    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('Bill to', 50, y);
    doc.font('Helvetica').fontSize(9).fillColor('#15191C').text(data.buyer.companyName, 50, y + 15);
    doc.fillColor('#4B5459');
    doc.text(`GSTIN: ${data.buyer.gstNumber}`, 50, y + 28);
    doc.text(data.buyer.address, 50, y + 41, { width: 250 });
    const ay = y + 41 + doc.heightOfString(data.buyer.address, { width: 250 });
    doc.text(`${data.buyer.city}, ${data.buyer.state} - ${data.buyer.pincode}`, 50, ay);
    doc.text(`Place of supply: ${data.buyer.state}`, 320, y + 15);
    doc.text(intra ? 'Tax type: CGST + SGST (intra-state)' : 'Tax type: IGST (inter-state)', 320, y + 28);

    y = ay + 32;
    const head = () => {
      doc.font('Helvetica-Bold').fontSize(9).fillColor('#15191C');
      doc.text('Chemical', 50, y); doc.text('Quantity', 260, y); doc.text('Price/unit', 340, y);
      doc.text('Amount', 440, y, { width: 100, align: 'right' });
      doc.moveTo(50, y + 15).lineTo(545, y + 15).strokeColor('#DCE1DE').stroke();
      y += 25; doc.font('Helvetica').fillColor('#15191C');
    };
    head();
    for (const item of data.items) {
      if (y > 690) { doc.addPage(); y = 50; head(); }
      doc.text(item.chemicalName, 50, y, { width: 200 });
      doc.text(`${item.quantity} ${item.unit.toLowerCase()}`, 260, y);
      doc.text(INR(item.pricePerUnit), 340, y);
      doc.text(INR(item.subtotal), 440, y, { width: 100, align: 'right' });
      y += 20;
    }
    doc.moveTo(50, y + 5).lineTo(545, y + 5).strokeColor('#DCE1DE').stroke();
    y += 18;
    if (y > 600) { doc.addPage(); y = 50; }

    const row = (label, value, bold) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(bold ? 11 : 9).fillColor(bold ? '#059669' : '#4B5459').text(label, 340, y);
      doc.fillColor(bold ? '#059669' : '#15191C').text(INR(value), 440, y, { width: 100, align: 'right' });
      y += bold ? 20 : 16;
    };
    row('Taxable value', data.subtotal);
    taxLines.forEach(([l, v]) => row(l, v));
    doc.moveTo(340, y).lineTo(545, y).strokeColor('#DCE1DE').stroke(); y += 8;
    row('Total', data.grandTotal, true);

    doc.font('Helvetica').fontSize(9).fillColor('#15191C').text(`Amount in words: ${rupeesInWords(data.grandTotal)}`, 50, y + 4, { width: 495 });
    y += 4 + doc.heightOfString(`Amount in words: ${rupeesInWords(data.grandTotal)}`, { width: 495 }) + 18;

    // Tax summary
    doc.font('Helvetica-Bold').fontSize(9).text('Tax summary', 50, y); y += 14;
    doc.font('Helvetica').fillColor('#4B5459');
    doc.text(`Taxable value ${INR(data.subtotal)}   ·   ${taxLines.map(([l, v]) => `${l} ${INR(v)}`).join('   ·   ')}   ·   Total tax ${INR(data.gstAmount)}`, 50, y, { width: 495 });
    y += 30;
    if (co.bank) { doc.text(`Bank details: ${co.bank}`, 50, y, { width: 495 }); y += 22; }

    if (y > 650) { doc.addPage(); y = 50; }
    doc.moveTo(380, y + 40).lineTo(545, y + 40).strokeColor('#15191C').stroke();
    doc.fillColor('#15191C').fontSize(9).text(`For ${co.name}`, 380, y + 8, { width: 165, align: 'right' });
    doc.fillColor('#4B5459').text('Authorised signatory', 380, y + 45, { width: 165, align: 'right' });

    doc.font('Helvetica').fontSize(8).fillColor('#4B5459')
      .text('This is a system-generated invoice. No physical signature is required.', 50, 780, { width: 495, align: 'center' });
    doc.end();
  });
}

module.exports = { generateInvoicePdfBuffer };
