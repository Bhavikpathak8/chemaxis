import { useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { date, inr, isoDate, qty, statusLabel, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { DocLink } from '../../ui/domain.jsx';
import { Spread } from '../../ui/Spread.jsx';
import { Banner, Button, Empty, Facts, PageHeader, Panel, StatusMark, Tabs } from '../../ui/bits.jsx';

const RFQ_LABEL = { REQUESTED: 'Needs a quote', REVIEWED: 'Draft saved', QUOTED: 'Sent to buyer', ACCEPTED: 'Accepted', REJECTED: 'Rejected', EXPIRED: 'Expired' };
const RFQ_TONE = { REQUESTED: 'wait', REVIEWED: 'wait', QUOTED: 'info', ACCEPTED: 'ok', REJECTED: 'bad', EXPIRED: 'bad' };
const rfqMark = (r) => <StatusMark tone={RFQ_TONE[r.status]} label={RFQ_LABEL[r.status] ?? statusLabel(r.status)} />;

const TABS = [
  { value: 'todo', label: 'To quote', test: (r) => r.status === 'REQUESTED' },
  { value: 'draft', label: 'Drafts', test: (r) => r.status === 'REVIEWED' },
  { value: 'sent', label: 'Awaiting buyer', test: (r) => r.status === 'QUOTED' },
  { value: 'closed', label: 'Closed', test: (r) => ['ACCEPTED', 'REJECTED', 'EXPIRED'].includes(r.status) },
  { value: 'all', label: 'All', test: () => true },
];

const plusDays = (n) => isoDate(new Date(Date.now() + n * 864e5));

function QuotePanel({ rfq, onDone }) {
  const toast = useToast();
  const draft = (rfq.quotations ?? []).find((q) => q.status === 'DRAFT');
  const lastSent = (rfq.quotations ?? []).find((q) => q.status === 'SENT');
  const seller = Number(rfq.seller_price);
  const stock = Number(rfq.quantity_available);
  const open = !['ACCEPTED', 'REJECTED'].includes(rfq.status);
  const seed = draft ?? lastSent;

  const form = useForm({
    initial: {
      price: seed ? String(Number(seed.quoted_price_per_unit)) : rfq.listed_buyer_price ? String(Number(rfq.listed_buyer_price)) : '',
      quantity: seed ? String(Number(seed.quantity)) : String(Number(rfq.requested_quantity)),
      validUntil: seed ? isoDate(seed.valid_until) : plusDays(7),
    },
    rules: {
      price: [v.positive('a price'), (x) => (Number(x) <= seller ? `Must be above the seller price of ${inr(seller)}` : null)],
      quantity: [v.positive('a quantity'), (x) => (Number(x) > stock ? `Only ${Number(stock)} ${unitLabel(rfq.unit)} in stock` : null)],
      validUntil: [v.required('a validity date'), v.futureDate('Validity date')],
    },
    onSubmit: async () => false, // replaced by explicit buttons below
  });

  const dto = () => ({ quotedPricePerUnit: Number(form.values.price), quantity: Number(form.values.quantity), validUntil: form.values.validUntil });
  const save = useAction(async () => (draft ? api.patch(`/quotation-requests/admin/quotations/${draft.id}`, dto()) : api.post(`/quotation-requests/admin/${rfq.id}/quotations`, dto())));
  const send = useAction((id) => api.post(`/quotation-requests/admin/quotations/${id}/send`), { success: 'Quotation sent to the buyer' });

  const ok = () => Object.keys(form.validate()).length === 0;
  const saveDraft = async () => { if (!ok()) return; const o = await save.run(); if (o.ok) { toast.success('Draft saved'); onDone(false); } };
  const saveSend = async () => {
    if (!ok()) return;
    const o = await save.run(); if (!o.ok) return;
    const s = await send.run(o.data.id); if (s.ok) onDone(true);
  };

  const price = Number(form.values.price);
  const quantity = Number(form.values.quantity);

  return (
    <div className="space-y-5">
      <Facts items={[
        ['Buyer', rfq.buyer_company_name], ['Requested', qty(rfq.requested_quantity, rfq.unit), true],
        ['Received', date(rfq.created_at)], ['In stock', qty(stock, rfq.unit), true],
        ['Seller price (private)', inr(seller), true], ['Listed buyer price', rfq.listed_buyer_price ? inr(rfq.listed_buyer_price) : 'Not priced', true],
      ]} />
      {Number(rfq.requested_quantity) > stock ? <Banner tone="wait">The buyer asked for more than is in stock. You can quote up to {qty(stock, rfq.unit)}.</Banner> : null}

      {(rfq.quotations ?? []).length ? (
        <Panel title="Quotations on this request" flush>
          <ul className="divide-y divide-line">
            {rfq.quotations.map((q) => (
              <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-[13.5px]">
                <span><span className="fig">{inr(q.quoted_price_per_unit)}</span> × <span className="fig">{qty(q.quantity, rfq.unit)}</span> <span className="text-ink-3">· valid till {date(q.valid_until)}</span></span>
                <span className="flex items-center gap-3"><StatusMark status={q.status} label={statusLabel(q.status)} />{q.pdf_url ? <DocLink url={q.pdf_url} icon={false}>PDF</DocLink> : null}</span>
              </li>
            ))}
          </ul>
        </Panel>
      ) : null}

      {open ? (
        <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
          <h3 className="text-[14.5px]">{draft ? 'Edit draft' : lastSent ? 'Send a revised quotation' : 'Prepare the quotation'}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price per unit to buyer" type="number" inputMode="decimal" step="0.01" min="0" prefix="₹" required {...form.bind('price')} />
            <Field label={`Quantity (${unitLabel(rfq.unit)})`} type="number" inputMode="decimal" step="0.01" min="0" required {...form.bind('quantity')} />
            <Field label="Valid until" type="date" min={plusDays(0)} required {...form.bind('validUntil')} className="sm:col-span-2" />
          </div>
          {price > 0 ? <div className="rounded-[6px] border border-line p-4"><Spread seller={seller} buyer={price} unit={rfq.unit} quantity={quantity > 0 ? quantity : undefined} /></div> : null}
          <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
            <Button loading={save.busy && !send.busy} onClick={saveDraft}>Save draft</Button>
            <Button variant="primary" loading={send.busy} onClick={saveSend}>Save and send to buyer</Button>
          </div>
          {draft ? <p className="text-right text-[12.5px] text-ink-3">The buyer sees nothing until you send. Margin is calculated by the server from the seller price.</p> : null}
        </form>
      ) : <p className="text-[13.5px] text-ink-2">This request is {RFQ_LABEL[rfq.status].toLowerCase()}, so it can't be quoted again.</p>}
    </div>
  );
}

export default function Quotations() {
  const list = useFetch('/quotation-requests/admin/all');
  const [tab, setTab] = useState('todo');
  const [sel, setSel] = useState(null);
  const rows = list.data ?? [];
  const cur = TABS.find((t) => t.value === tab);
  const shown = useMemo(() => rows.filter(cur.test), [rows, cur]);
  const selected = rows.find((r) => r.id === sel);

  const columns = [
    { key: 'date', label: 'Received', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
    { key: 'chem', label: 'Chemical', value: (r) => r.chemical_name },
    { key: 'qty', label: 'Requested', align: 'right', value: (r) => Number(r.requested_quantity), render: (r) => <span className="fig">{qty(r.requested_quantity, r.unit)}</span> },
    { key: 'stock', label: 'In stock', align: 'right', value: (r) => Number(r.quantity_available), render: (r) => <span className={`fig ${Number(r.quantity_available) < Number(r.requested_quantity) ? 'text-amber' : ''}`}>{qty(r.quantity_available, r.unit)}</span> },
    { key: 'sp', label: 'Seller price', align: 'right', value: (r) => Number(r.seller_price), render: (r) => <span className="fig text-slate">{inr(r.seller_price)}</span> },
    { key: 'st', label: 'Status', value: (r) => RFQ_LABEL[r.status], render: rfqMark },
  ];

  return (
    <>
      <PageHeader title="Quotations" subtitle="Buyer requests for quotation. Price each one above the seller price, save a draft, and send it when ready." />
      <Tabs value={tab} onChange={setTab} tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: t.value === 'todo' || t.value === 'draft' ? rows.filter(t.test).length : 0 }))} />
      <DataTable
        key={tab} columns={columns} rows={list.data ? shown : null} loading={list.loading} error={list.error} onRetry={list.reload}
        exportName="quotation-requests" defaultSort={{ key: 'date', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search buyers or chemicals"
        empty={<Empty title="Nothing in this list" hint={tab === 'todo' ? 'New requests from buyers show up here.' : 'Switch tabs to see other requests.'} />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={600} title={selected ? `${selected.chemical_name} for ${selected.buyer_company_name}` : ''} subtitle={selected ? rfqMark(selected) : null}>
        {selected ? <QuotePanel key={selected.id + selected.status + (selected.quotations ?? []).length} rfq={selected} onDone={(close) => { list.refresh(); if (close) setSel(null); }} /> : null}
      </SlidePanel>
    </>
  );
}
