import { inr } from '../lib/format.js';

// An accounting statement: label left, figure right, a rule over each
// subtotal and a double rule under the bottom line. Used for the profit on
// an order so it reads like an entry in the books.
// rows: { label, amount, kind: 'line' | 'less' | 'sub' | 'grand', note }
export function Statement({ rows, caption }) {
  return (
    <table className="w-full border-collapse text-[14px]">
      {caption ? <caption className="sr-only">{caption}</caption> : null}
      <tbody>
        {rows.map((r, i) => {
          const sub = r.kind === 'sub';
          const grand = r.kind === 'grand';
          const less = r.kind === 'less';
          const neg = Number(r.amount) < 0;
          return (
            <tr key={`${r.label}-${i}`} className={sub || grand ? 'font-semibold' : ''}>
              <td className={`py-1.5 pr-4 ${less ? 'pl-4 text-ink-2' : ''} ${grand ? 'pt-3' : ''}`}>
                {r.label}
                {r.note ? <span className="block text-[12px] font-normal text-ink-3">{r.note}</span> : null}
              </td>
              <td
                className={`fig whitespace-nowrap py-1.5 text-right ${grand ? 'pt-3 text-[17px]' : ''} ${neg || (grand && Number(r.amount) < 0) ? 'text-danger' : grand ? 'text-brand' : ''}`}
                style={{
                  borderTop: sub || grand ? '1px solid var(--color-ink)' : undefined,
                  borderBottom: grand ? '3px double var(--color-ink)' : undefined,
                }}
              >
                {less ? `(${inr(Math.abs(r.amount))})` : inr(r.amount)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
