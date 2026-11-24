import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, dateTime, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Banner, Empty, Facts, FigureStrip, PageHeader, Panel, StatusMark, Tabs } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';
import { PaymentForm } from './PaymentForm.jsx';
import OrderDesk from './OrderDesk.jsx';

export const invState = (i) => (Number(i.outstanding) <= 0.004 ? 'PAID' : Number(i.paid) > 0 ? 'PART' : new Date(i.due_date) < new Date() ? 'OVERDUE' : 'OPEN');
export const INV_LABEL = { PAID: 'Paid', PART: 'Part paid', OVERDUE: 'Overdue', OPEN: 'Open' };
const INV_TONE = { PAID: 'ok', PART: 'info', OVERDUE: 'bad', OPEN: 'wait' };
const overdueToo = (i) => invState(i) !== 'PAID' && new Date(i.due_date) < new Date();
const Mark = ({ i }) => <span className="inline-flex items-center gap-2"><StatusMark tone={INV_TONE[invState(i)]} label={INV_LABEL[invState(i)]} />{invState(i) === 'PART' && overdueToo(i) ? <StatusMark tone="bad" label="Overdue" /> : null}</span>;

function InvoicePanel({ invoice, onDone }) {
  const pays = useFetch(`/payments/invoice/${invoice.id}`);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Mark i={invoice} /><DocLink url={invoice.pdf_url}>GST invoice PDF</DocLink>
      </div>
      <Facts items={[['Order', invoice.po_number, true], ['Buyer', invoice.buyer_company_name], ['Issued', date(invoice.issued_at)], ['Due', date(invoice.due_date)],
        ['GST', inr(invoice.gst_amount), true], ['Invoice total', inr(invoice.total_amount), true], ['Received', inr(invoice.paid), true], ['Outstanding', inr(invoice.outstanding), true]]} />
      <Panel title="Payments received" flush>
        {(pays.data ?? []).length === 0 ? <p className="px-4 py-5 text-[13.5px] text-ink-3">{pays.loading ? 'Loading…' : 'Nothing received yet.'}</p> : (
          <ul className="divide-y divide-line text-[14px]">
            {pays.data.map((p) => <li key={p.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5"><span>{dateTime(p.paid_at)} · {statusLabel(p.method)}{p.reference_note ? <span className="ml-2 text-ink-3">{p.reference_note}</span> : null}</span><span className="fig">{inr(p.amount)}</span></li>)}
          </ul>
        )}
      </Panel>
      {Number(invoice.outstanding) > 0.004 ? <PaymentForm invoice={invoice} onDone={() => { pays.refresh(); onDone(); }} /> : <Banner tone="ok">Fully paid.</Banner>}
    </div>
  );
}

export default function Invoices() {
  const invs = useFetch('/invoices');
  const orders = useFetch('/purchase-orders/admin/all');
  const [tab, setTab] = useState('issued');
  const [sel, setSel] = useState(null);
  const [orderSel, setOrderSel] = useState(null);
  const rows = invs.data ?? [];
  const invoiced = new Set(rows.map((i) => i.purchase_order_id));
  const pending = (orders.data ?? []).filter((o) => o.status !== 'CANCELLED' && !invoiced.has(o.id));
  const selected = rows.find((i) => i.id === sel);
  const sum = (f) => rows.reduce((s, i) => s + Number(i[f]), 0);
  const overdue = rows.filter((i) => invState(i) !== 'PAID' && new Date(i.due_date) < new Date());

  const columns = [
    { key: 'no', label: 'Invoice', value: (r) => r.invoice_number, render: (r) => <span className="fig font-medium">{r.invoice_number}</span> },
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
    { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
    { key: 'issued', label: 'Issued', value: (r) => r.issued_at, render: (r) => date(r.issued_at) },
    { key: 'due', label: 'Due', value: (r) => r.due_date, render: (r) => date(r.due_date) },
    { key: 'tot', label: 'Total', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
    { key: 'out', label: 'Outstanding', align: 'right', value: (r) => Number(r.outstanding), render: (r) => <span className="fig">{inr(r.outstanding)}</span> },
    { key: 'st', label: 'Status', value: (r) => INV_LABEL[invState(r)], render: (r) => <Mark i={r} /> },
  ];

  return (
    <>
      <PageHeader title="Invoices" subtitle="GST invoices issued to buyers and what is still owed." />
      <FigureStrip items={[
        { label: 'Invoiced', value: inr(sum('total_amount')) }, { label: 'Received', value: inr(sum('paid')), tone: 'ok' },
        { label: 'Outstanding', value: inr(sum('outstanding')), tone: sum('outstanding') ? 'wait' : undefined },
        { label: 'Overdue', value: overdue.length, tone: overdue.length ? 'bad' : undefined, hint: overdue.length ? inr(overdue.reduce((s, i) => s + Number(i.outstanding), 0)) : undefined },
      ]} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'issued', label: 'Issued' }, { value: 'todo', label: 'Not yet invoiced', count: pending.length }]} />
      {tab === 'issued' ? (
        <DataTable columns={columns} rows={invs.data} loading={invs.loading} error={invs.error} onRetry={invs.reload} exportName="invoices"
          defaultSort={{ key: 'issued', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search invoices"
          filters={[{ label: 'Status', options: Object.entries(INV_LABEL).map(([value, label]) => ({ value, label })), test: (r, val) => invState(r) === val }]}
          empty={<Empty title="No invoices yet" hint="Generate one from an order." />} />
      ) : (
        <DataTable key="todo" rows={orders.data ? pending : null} loading={orders.loading} error={orders.error} onRetry={orders.reload} onRowClick={(r) => setOrderSel(r.id)}
          columns={[
            { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
            { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
            { key: 'amt', label: 'Order value', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
            { key: 'st', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
            { key: 'a', label: '', sortable: false, csv: false, render: () => <span className="text-brand">Open to invoice →</span> },
          ]}
          empty={<Empty title="Everything is invoiced" />} />
      )}
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={580} title={selected?.invoice_number} subtitle={selected?.buyer_company_name}>
        {selected ? <InvoicePanel key={selected.id + selected.paid} invoice={selected} onDone={invs.refresh} /> : null}
      </SlidePanel>
      <SlidePanel open={!!orderSel} onClose={() => setOrderSel(null)} width={700} title={(orders.data ?? []).find((o) => o.id === orderSel)?.po_number}>
        {orderSel ? <OrderDesk key={orderSel} id={orderSel} onChanged={() => { invs.refresh(); orders.refresh(); }} onClose={() => setOrderSel(null)} /> : null}
      </SlidePanel>
    </>
  );
}
