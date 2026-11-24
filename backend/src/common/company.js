// Who "ChemAxis" is on printed documents. Set these in .env — a GST invoice must
// carry the trader's own GSTIN, so nothing is invented when they are missing.
const company = () => ({
  name: process.env.COMPANY_NAME || 'ChemAxis',
  tagline: 'Industrial chemical trading',
  gstin: process.env.COMPANY_GSTIN || '',
  address: process.env.COMPANY_ADDRESS || '',
  state: process.env.COMPANY_STATE || 'Gujarat',
  phone: process.env.COMPANY_PHONE || '',
  email: process.env.COMPANY_EMAIL || '',
  bank: process.env.COMPANY_BANK || '', // e.g. "HDFC Bank · A/c 1234567890 · IFSC HDFC0000123"
});

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const below100 = (n) => (n < 20 ? ONES[n] : `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${ONES[n % 10]}` : ''}`);
const below1000 = (n) => (n >= 100 ? `${ONES[Math.floor(n / 100)]} hundred${n % 100 ? ` ${below100(n % 100)}` : ''}` : below100(n));

// 631300.5 -> "Rupees six lakh thirty-one thousand three hundred and fifty paise only"
function rupeesInWords(amount) {
  const total = Math.round(Number(amount) * 100);
  let rupees = Math.floor(total / 100);
  const paise = total % 100;
  if (rupees === 0 && paise === 0) return 'Rupees zero only';
  const parts = [];
  const crore = Math.floor(rupees / 1e7); rupees %= 1e7;
  const lakh = Math.floor(rupees / 1e5); rupees %= 1e5;
  const thousand = Math.floor(rupees / 1e3); rupees %= 1e3;
  if (crore) parts.push(`${below1000(crore)} crore`);
  if (lakh) parts.push(`${below100(lakh)} lakh`);
  if (thousand) parts.push(`${below100(thousand)} thousand`);
  if (rupees) parts.push(below1000(rupees));
  let words = `Rupees ${parts.join(' ')}`.trim();
  if (parts.length === 0) words = 'Rupees zero';
  if (paise) words += ` and ${below100(paise)} paise`;
  return `${words} only`.replace(/^./, (c) => c.toUpperCase());
}

module.exports = { company, rupeesInWords };
