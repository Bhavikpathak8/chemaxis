import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr, num, unitLabel } from '../../lib/format.js';
import { Async, Button, Facts, Panel, StatusMark, Empty } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';
import RfqPanel from './RfqPanel.jsx';

export default function ChemicalDetail() {
  const { id } = useParams();
  const { profile } = useAuth();
  const item = useFetch(`/chemicals/catalog/${id}`);
  const catalog = useFetch('/chemicals/catalog');
  const orders = useFetch('/purchase-orders/mine');
  const [open, setOpen] = useState(false);

  // This buyer's own purchases of this chemical.
  const history = useMemo(() => (orders.data ?? [])
    .filter((po) => po.status !== 'CANCELLED')
    .flatMap((po) => po.items.filter((it) => it.chemical_id === id).map((it) => ({ ...it, po })))
    .sort((a, b) => new Date(b.po.created_at) - new Date(a.po.created_at)), [orders.data, id]);

  const approved = profile?.verification_status === 'APPROVED';

  return (
    <>
      <Link to="/buyer/chemicals" className="mb-3 inline-flex items-center gap-1.5 text-[13.5px] text-ink-2 hover:text-ink"><ArrowLeft size={15} /> All chemicals</Link>
      <Async state={item}>
        {(c) => (
          <>
            <div className="mb-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-[6px] border border-line bg-surface p-5">
                <p className="text-[13px] text-ink-3">{c.category}</p>
                <h1 className="mt-1 text-[30px] leading-[1.1] tracking-tight">{c.name}</h1>
                <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[14px]">
                  <div><dt className="text-[12.5px] text-ink-3">Purity</dt><dd className="fig">{c.purity}</dd></div>
                  <div><dt className="text-[12.5px] text-ink-3">CAS number</dt><dd className="fig">{c.cas_number || '—'}</dd></div>
                  <div><dt className="text-[12.5px] text-ink-3">Sold per</dt><dd>{unitLabel(c.unit) === 't' ? 'tonne' : unitLabel(c.unit)}</dd></div>
                </dl>
                {c.description ? <p className="mt-4 max-w-[62ch] text-[14px] leading-relaxed text-ink-2">{c.description}</p> : null}
                <p className="mt-4 flex items-center gap-1.5 text-[13.5px] text-ink-2"><MapPin size={14} aria-hidden /> Ships from {c.warehouse_location}</p>
              </section>

              <aside className="rounded-[6px] border border-line bg-surface p-5">
                <p className="text-[12.5px] text-ink-3">Your price, before GST</p>
                <p className="fig mt-1 text-[30px] font-medium leading-none">{inr(c.buyer_price)}<span className="text-[15px] font-normal text-ink-3">/{unitLabel(c.unit)}</span></p>
                <p className="mt-3 text-[13.5px] text-ink-2"><span className="fig">{num(c.quantity_available)} {unitLabel(c.unit)}</span> available now</p>
                <Button variant="primary" className="mt-4 w-full" disabled={!approved} onClick={() => setOpen(true)}>Request a quotation</Button>
                {!approved ? <p className="mt-2 text-[12.5px] text-ink-3">Available once your account is approved.</p> : <p className="mt-2 text-[12.5px] text-ink-3">The final price is confirmed in your quotation.</p>}
              </aside>
            </div>

            <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
              <Panel title="Documents" subtitle="Quality and safety paperwork for this chemical.">
                <ul className="divide-y divide-line">
                  <li className="flex items-center justify-between py-2.5"><span>Certificate of analysis (COA)</span><DocLink url={c.coa_url}>Open</DocLink></li>
                  <li className="flex items-center justify-between py-2.5"><span>Safety data sheet (MSDS)</span><DocLink url={c.msds_url}>Open</DocLink></li>
                </ul>
              </Panel>
              <Panel title="Seller">
                <Facts items={[['Company', c.seller_company_name], ['Location', [c.seller_city, c.seller_state].filter(Boolean).join(', ')], ['Warehouse', c.warehouse_location], ['Listed', date(c.created_at)]]} />
              </Panel>
              <Panel title="Your purchase history" subtitle="Orders you've placed for this chemical." className="lg:col-span-2" flush>
                {history.length === 0 ? <Empty title="You haven't ordered this yet" hint="Request a quotation to place your first order." /> : (
                  <div className="overflow-x-auto"><table className="tbl">
                    <thead><tr><th>Order</th><th>Date</th><th>Status</th><th className="text-right">Quantity</th><th className="text-right">Price</th><th className="text-right">Amount</th></tr></thead>
                    <tbody>{history.map((h) => (
                      <tr key={h.id}><td className="fig">{h.po.po_number}</td><td>{date(h.po.created_at)}</td><td><StatusMark status={h.po.status} /></td>
                        <td className="fig text-right">{num(h.quantity)} {unitLabel(h.unit)}</td><td className="fig text-right">{inr(h.buyer_price_per_unit)}</td><td className="fig text-right">{inr(h.subtotal)}</td></tr>
                    ))}</tbody>
                  </table></div>
                )}
              </Panel>
            </div>
            <RfqPanel open={open} onClose={() => setOpen(false)} catalog={catalog.data} initialChemicalId={id} />
          </>
        )}
      </Async>
    </>
  );
}
