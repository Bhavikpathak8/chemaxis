// Mirrors the server's margin rules so the trader sees the result live.
// The server recomputes everything; this is only a preview.
export const MARGIN_TYPES = [
  { value: 'FIXED', label: 'Fixed amount per unit', hint: 'Added on top of the seller price' },
  { value: 'PERCENTAGE', label: 'Percentage of seller price', hint: 'Seller price × (1 + %)' },
  { value: 'MANUAL', label: 'Set the buyer price directly', hint: 'The number you enter is the buyer price' },
];

export function buyerPriceFor(type, seller, value) {
  const s = Number(seller);
  const x = Number(value);
  if (!(s > 0) || value === '' || value === null || Number.isNaN(x)) return null;
  const p = type === 'FIXED' ? s + x : type === 'PERCENTAGE' ? s * (1 + x / 100) : x;
  return Math.round(p * 100) / 100;
}

export const describePolicy = (p) =>
  p.margin_type === 'FIXED' ? `+₹${Number(p.margin_value)} per unit`
    : p.margin_type === 'PERCENTAGE' ? `+${Number(p.margin_value)}%`
      : `Buyer price ₹${Number(p.margin_value)}`;
