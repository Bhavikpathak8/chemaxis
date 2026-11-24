import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date, inr, num, qty, unitLabel, statusLabel } from '../../lib/format.js';
import { Async, Button, Facts, FigureStrip, Panel, StatusMark } from '../../ui/bits.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { Spread } from '../../ui/Spread.jsx';
import { DataTable } from '../../ui/DataTable.jsx';
import { DocLink } from '../../ui/domain.jsx';
import { ChartFrame, Columns, SERIES } from '../../ui/charts.jsx';
import PricePanel from './PricePanel.jsx';
import { ChemStateMark } from './Chemicals.jsx';

export default function ChemicalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const state = useFetch(`/analytics/chemicals/${id}`);
  const [pricing, setPricing] = useState(false);
  const del = useAction(() => api.del(`/chemicals/admin/${id}`), { success: 'Chemical deleted' });

  return (
    <>
      <Link to="/admin/chemicals" className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink-2 hover:text-ink"><ArrowLeft size={14} /> All chemicals</Link>
      <Async state={state}>
        {({ chemical: c, analytics: a, purchaseHistory }) => {
          const seller = Number(c.seller_price);
          const buyer = c.buyer_price == null ? null : Number(c.buyer_price);
          return (
            <>
              <header className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
                <div className="min-w-0">
                  <div className="mb-1.5"><ChemStateMark c={c} /></div>
                  <h1 className="text-[26px] leading-tight">{c.name}</h1>
                  <p className="mt-1 text-[13.5px] text-ink-2">{c.category}{c.cas_number ? <> · CAS <span className="fig">{c.cas_number}</span></> : null}{c.purity ? <> · Purity <span className="fig">{c.purity}</span></> : null}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" onClick={() => setPricing(true)}>{buyer == null ? 'Set price' : 'Edit price'}</Button>
                  {user.role === 'SUPER_ADMIN' ? (
                    <Button variant="danger" loading={del.busy} onClick={async () => {
                      if (await confirm({ title: `Delete ${c.name}?`, message: 'This permanently removes the chemical. It is refused if any order or quotation refers to it.', confirmLabel: 'Delete chemical', danger: true })) {
                        const o = await del.run(); if (o.ok) navigate('/admin/chemicals');
                      }
                    }}>Delete</Button>
                  ) : null}
                </div>
              </header>

              <FigureStrip items={[
                { label: 'Seller price', value: inr(seller) },
                { label: 'Buyer price', value: buyer == null ? 'Not set' : inr(buyer), tone: buyer == null ? 'wait' : undefined },
                { label: 'Margin / unit', value: buyer == null ? '—' : inr(buyer - seller), tone: 'ok' },
                { label: 'Available', value: qty(c.quantity_available, c.unit), hint: `${num(c.quantity_reserved)} ${unitLabel(c.unit)} reserved` },
                { label: 'Sold to date', value: qty(a.quantitySold, c.unit), hint: `${a.orders} order${a.orders === 1 ? '' : 's'}` },
              ]} />

              <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr] [&>*]:min-w-0">
                <div className="space-y-5">
                  <Panel title="Price card" subtitle="Only ChemAxis sees the seller side.">
                    {buyer == null ? <p className="text-[14px] text-ink-2">No buyer price yet, so buyers cannot see this chemical.</p> : <Spread seller={seller} buyer={buyer} unit={c.unit} quantity={Number(c.quantity_available) || undefined} />}
                    <p className="mt-3 text-[13px] text-ink-3">Method: {c.margin_type ? `${statusLabel(c.margin_type)} (${c.margin_type === 'MANUAL' ? inr(c.margin_value) : c.margin_type === 'FIXED' ? `${inr(c.margin_value)}/${unitLabel(c.unit)}` : `${num(c.margin_value)}%`})` : 'not set'}</p>
                  </Panel>

                  <ChartFrame title="Volume sold" subtitle="Quantity per month, last six months" table={{ columns: [{ label: 'Month', value: (m) => m.label }, { label: `Quantity (${unitLabel(c.unit)})`, value: (m) => num(m.quantity) }], rows: a.monthlyVolume }}>
                    <Columns data={a.monthlyVolume} series={[{ key: 'quantity', label: `Quantity (${unitLabel(c.unit)})`, color: SERIES.blue }]} fmt={num} money={false} />
                  </ChartFrame>

                  <div>
                    <h2 className="mb-2 text-[14.5px]">Purchase history</h2>
                    <DataTable
                      search={false} dense exportName={`${c.name}-purchases`} rows={purchaseHistory}
                      columns={[
                        { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
                        { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
                        { key: 'q', label: 'Qty', align: 'right', value: (r) => Number(r.quantity), render: (r) => <span className="fig">{qty(r.quantity, r.unit)}</span> },
                        { key: 'gm', label: 'Margin', align: 'right', value: (r) => Number(r.gross_margin), render: (r) => <span className="fig text-brand">{inr(r.gross_margin)}</span> },
                        { key: 's', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
                      ]}
                      empty={<p className="px-4 py-8 text-center text-[13.5px] text-ink-2">Not ordered yet.</p>}
                    />
                  </div>
                </div>

                <div className="space-y-5">
                  <Panel title="Inventory">
                    <Facts cols={1} items={[['Available to sell', qty(c.quantity_available, c.unit), true], ['Reserved on open orders', qty(c.quantity_reserved, c.unit), true], ['Warehouse', c.warehouse_location]]} />
                  </Panel>
                  <Panel title="Documents">
                    <Facts cols={1} items={[['Certificate of analysis', <DocLink url={c.coa_url}>Open COA</DocLink>], ['Safety data sheet', <DocLink url={c.msds_url}>Open MSDS</DocLink>]]} />
                  </Panel>
                  <Panel title="Seller">
                    <Facts cols={1} items={[
                      ['Company', c.seller_company_name], ['GSTIN', c.seller_gst_number ? <span>{c.seller_gst_number} · {c.seller_gst_verified ? 'verified' : <span className="text-amber">not verified</span>}</span> : null, true],
                      ['Location', [c.seller_city, c.seller_state].filter(Boolean).join(', ')],
                      ['Contact', <span className="inline-flex flex-wrap items-center gap-3">{c.seller_email}{c.seller_phone ? <a className="fig inline-flex items-center gap-1 text-brand" href={`tel:${c.seller_phone}`}><Phone size={12} />{c.seller_phone}</a> : null}</span>],
                    ]} />
                  </Panel>
                  {c.description ? <Panel title="Description"><p className="text-[14px] text-ink-2">{c.description}</p></Panel> : null}
                  <p className="text-[12.5px] text-ink-3">Added {date(c.created_at)} · updated {date(c.updated_at)}</p>
                </div>
              </div>

              <SlidePanel open={pricing} onClose={() => setPricing(false)} title={`Price ${c.name}`} subtitle={c.seller_company_name}>
                <PricePanel chemical={c} onDone={() => { setPricing(false); state.refresh(); }} />
              </SlidePanel>
            </>
          );
        }}
      </Async>
    </>
  );
}
