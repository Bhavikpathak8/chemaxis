const PDFDocument = require('pdfkit');

const INR = (value) =>
  `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;
// pdfkit's built-in fonts don't include the ₹ glyph, so we spell out "Rs."
// rather than risk it rendering as a missing-character box.

// Returns a Buffer containing the rendered quotation PDF.
function generateQuotationPdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).font('Helvetica-Bold').text('C-TECH', 50, 50);
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    doc.text('Industrial Chemical Trading', 50, 74);

    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text('QUOTATION', 350, 50, {
      width: 195,
      align: 'right',
    });
    doc.fontSize(9).font('Helvetica').fillColor('#4B5459');
    doc.text(`Ref: ${data.quotationId.slice(0, 8).toUpperCase()}`, 350, 74, { width: 195, align: 'right' });
    doc.text(`Issued: ${data.issuedAt.toLocaleDateString('en-IN')}`, 350, 87, {
      width: 195,
      align: 'right',
    });
    doc.text(`Valid until: ${data.validUntil.toLocaleDateString('en-IN')}`, 350, 100, {
      width: 195,
      align: 'right',
    });

    doc.moveTo(50, 130).lineTo(545, 130).strokeColor('#DCE1DE').stroke();

    doc.fillColor('#000000').fontSize(10).font('Helvetica-Bold').text('Quoted To', 50, 145);
    doc.font('Helvetica').fontSize(9).fillColor('#15191C');
    doc.text(data.buyer.companyName, 50, 160);
    doc.fillColor('#4B5459');
    doc.text(`GSTIN: ${data.buyer.gstNumber}`, 50, 174);
    doc.text(`${data.buyer.city}, ${data.buyer.state}`, 50, 187);

    const tableTop = 225;
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#15191C');
    doc.text('Chemical', 50, tableTop);
    doc.text('Quantity', 260, tableTop);
    doc.text('Price/unit', 340, tableTop);
    doc.text('Subtotal', 440, tableTop, { width: 100, align: 'right' });
    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).strokeColor('#DCE1DE').stroke();

    const y = tableTop + 25;
    const subtotal = data.quantity * data.quotedPricePerUnit;
    doc.font('Helvetica').fillColor('#15191C');
    doc.text(data.chemicalName, 50, y, { width: 200 });
    doc.text(`${data.quantity} ${data.unit.toLowerCase()}`, 260, y);
    doc.text(INR(data.quotedPricePerUnit), 340, y);
    doc.text(INR(subtotal), 440, y, { width: 100, align: 'right' });

    doc.moveTo(50, y + 20).lineTo(545, y + 20).strokeColor('#DCE1DE').stroke();

    doc.font('Helvetica-Bold').fontSize(11).fillColor('#059669');
    doc.text('Total (excl. GST)', 340, y + 35);
    doc.text(INR(subtotal), 440, y + 35, { width: 100, align: 'right' });

    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor('#4B5459')
      .text(
        'This quotation is valid until the date shown above. Accepting it converts it into a Purchase Order.',
        50,
        750,
        { width: 495, align: 'center' },
      );

    doc.end();
  });
}

module.exports = { generateQuotationPdfBuffer };
