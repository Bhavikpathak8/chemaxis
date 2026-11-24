import { inr, perUnit, unitLabel, num } from '../lib/format.js';

// The spread is the business: what C-Tech pays the seller, what the buyer
// pays, and the slice in between. Shown wherever the trader prices a deal.
export function Spread({ seller, buyer, unit, quantity }) {
  const s = Number(seller);
  const b = Number(buyer);
  if (!(s > 0) || !(b > 0)) return null;
  const margin = b - s;
  const pct = (margin / s) * 100;
  const bad = margin <= 0;
  const sellerShare = Math.min(100, Math.max(0, (Math.min(s, b) / Math.max(s, b)) * 100));
  const marginShare = Math.max(6, 100 - sellerShare);

  return (
    <div role="group" aria-label={`Seller ${inr(s)}, buyer ${inr(b)}, margin ${inr(margin)}`}>
      <div className="mb-1.5 flex items-end justify-between gap-3">
        <div>
          <div className="text-[12px] text-ink-3">Seller price</div>
          <div className="fig text-[15px] text-slate">{perUnit(s, unit)}</div>
        </div>
        <div className="text-center">
          <div className={`fig text-[13px] font-semibold ${bad ? 'text-danger' : 'text-brand'}`}>
            {bad ? '' : '+'}{inr(margin)} <span className="font-normal text-ink-3">({pct.toFixed(1)}%)</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[12px] text-ink-3">Buyer price</div>
          <div className="fig text-[15px] text-ink">{perUnit(b, unit)}</div>
        </div>
      </div>
      <div className="flex h-2.5 w-full overflow-hidden rounded-[2px]" aria-hidden>
        <div className="bg-slate" style={{ width: `${bad ? 100 : 100 - marginShare}%` }} />
        {!bad && <div className="bg-brand" style={{ width: `${marginShare}%` }} />}
        {bad && <div className="bg-danger" style={{ width: 0 }} />}
      </div>
      {quantity ? (
        <p className="mt-1.5 text-[12.5px] text-ink-2">
          On <span className="fig">{num(quantity)} {unitLabel(unit)}</span> that is{' '}
          <span className={`fig font-medium ${bad ? 'text-danger' : 'text-brand'}`}>{inr(margin * Number(quantity))}</span> gross margin.
        </p>
      ) : null}
    </div>
  );
}
