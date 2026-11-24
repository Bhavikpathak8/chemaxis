import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useForm, v } from '../../lib/form.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date, inr, isoDate, qty, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { DraftBar, Field } from '../../ui/Field.jsx';
import { Banner, Button, Empty, Facts, PageHeader, Panel, StatusMark } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';
import RfqPanel from './RfqPanel.jsx';

const latest = (r) => r.quotations?.[0]; // server returns newest first

function AcceptForm({ rfq, quote, onDone }) {
  const { profile } = useAuth();
  const accept = useAction((body) => api.post(`/quotation-requests/mine/${rfq.id}/accept`, body), { success: (po) => `Purchase order ${po.po_number} created` });
  const form = useForm({
    initial: { deliveryAddress: profile ? `${profile.address}, ${profile.city}, ${profile.state} ${profile.pincode}` : '', expectedDispatchDate: '', paymentTerms: 'Net 30' },
    draftKey: `accept-${rfq.id}`,
    rules: { deliveryAddress: v.required('a delivery address'), expectedDispatchDate: v.futureDate('Dispatch date') },
    onSubmit: async (vals) => {
      const r = await accept.run({ deliveryAddress: vals.deliveryAddress, expectedDispatchDate: vals.expectedDispatchDate || undefined, paymentTerms: vals.paymentTerms || undefined });
      if (r.ok) onDone(r.data);
      return r.ok;
    },
  });
  const total = Number(quote.quoted_price_per_unit) * Number(quote.quantity);
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <DraftBar draft={form.draft} />
      <p className="text-[13.5px] text-ink-2">Accepting creates a purchase order for <strong className="fig font-medium text-ink">{inr(total)}</strong> plus GST. It can't be edited afterwards, but you can cancel it until C-Tech confirms it.</p>
      <Field as="textarea" rows={2} label="Delivery address" required {...form.bind('deliveryAddress')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected dispatch date" type="date" min={isoDate(new Date())} hint="Optional" {...form.bind('expectedDispatchDate')} />
        <Field as="select" label="Payment terms" {...form.bind('paymentTerms')} options={[
          { value: 'Advance', label: 'Advance' }, { value: 'Net 15', label: 'Net 15 days' }, { value: 'Net 30', label: 'Net 30 days' }, { value: 'Net 45', label: 'Net 45 days' },
        ]} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" loading={form.busy}>Accept and place order</Button>
        <Button onClick={form.draft.save} disabled={!form.dirty}>Save draft</Button>
      </div>
    </form>
  );
}

export default function Rfqs() {
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirm();
  const list = useFetch('/quotation-requests/mine');
  const catalog = useFetch('/chemicals/catalog');
  const [sel, setSel] = useState(null);
  const [rfqOpen, setRfqOpen] = useState(false);
  const [targetChemId, setTargetChemId] = useState('');

  // Handle incoming chemical selection from public catalog or home page
  useEffect(() => {
    if (location.state?.chemicalName && catalog.data?.length) {
      const match = catalog.data.find((c) =>
        c.name.toLowerCase().includes(location.state.chemicalName.toLowerCase()) ||
        location.state.chemicalName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setTargetChemId(match.id);
        setRfqOpen(true);
      }
    }
  }, [location.state, catalog.data]);

  const selected = (list.data ?? []).find((r) => r.id === sel);
  useEffect(() => { if (sel && list.data && !selected) setSel(null); }, [sel, list.data, selected]);

  const reject = useAction((id) => api.patch(`/quotation-requests/mine/${id}/reject`), { success: 'Quotation declined' });

  const columns = [
    { key: 'created', label: 'Requested', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'chemical', label: 'Chemical', value: (r) => r.chemical_name, render: (r) => <span className="font-medium">{r.chemical_name}</span> },
    { key: 'qty', label: 'Quantity', align: 'right', value: (r) => Number(r.requested_quantity), render: (r) => <span className="fig">{qty(r.requested_quantity, r.unit)}</span> },
    { key: 'quote', label: 'Quoted price', align: 'right', value: (r) => Number(latest(r)?.quoted_price_per_unit ?? 0), render: (r) => (latest(r) && latest(r).status !== 'DRAFT' ? <span className="fig">{inr(latest(r).quoted_price_per_unit)}</span> : <span className="text-ink-3">Waiting</span>) },
    { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Quotations"
        subtitle="Your requests, C-Tech's replies, and the orders they became."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              setTargetChemId('');
              setRfqOpen(true);
            }}
          >
            Request Quotation
          </Button>
        }
      />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload}
        exportName="quotations" defaultSort={{ key: 'created', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search quotations"
        filters={[{ label: 'Status', options: ['REQUESTED', 'REVIEWED', 'QUOTED', 'ACCEPTED', 'REJECTED'].map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.status === val }]}
        empty={<Empty title="No quotation requests yet" hint="Browse chemicals and request a quotation. C-Tech replies with a price and a PDF." action={<Button variant="primary" onClick={() => navigate('/buyer/chemicals')}>Browse chemicals</Button>} />}
      />

      <SlidePanel open={!!selected} onClose={() => setSel(null)} title={selected?.chemical_name} subtitle={selected ? <StatusMark status={selected.status} label={statusLabel(selected.status)} /> : null}>
        {selected ? (() => {
          const q = latest(selected);
          const live = q && q.status !== 'DRAFT' ? q : null;
          const expired = live && new Date(live.valid_until) < new Date();
          const canAct = live && live.status === 'SENT' && !expired && selected.status === 'QUOTED';
          return (
            <div className="space-y-5">
              <Facts items={[['Requested', date(selected.created_at)], ['Quantity', qty(selected.requested_quantity, selected.unit), true]]} />
              {!live ? <Banner tone="wait">C-Tech is preparing your quotation. You'll get a notification when it's ready.</Banner> : (
                <Panel title="Quotation" actions={<DocLink url={live.pdf_url}>Download PDF</DocLink>}>
                  <Facts items={[
                    ['Price per unit', inr(live.quoted_price_per_unit), true], ['Quantity quoted', qty(live.quantity, selected.unit), true],
                    ['Amount before GST', inr(Number(live.quoted_price_per_unit) * Number(live.quantity)), true], ['Valid until', <span key="v" className={expired ? 'text-danger' : ''}>{date(live.valid_until)}{expired ? ' (expired)' : ''}</span>],
                  ]} />
                  {live.status === 'ACCEPTED' ? <Banner tone="ok">You accepted this quotation and a purchase order was created.</Banner> : null}
                  {expired && live.status === 'SENT' ? <p className="mt-3 text-[13.5px] text-ink-2">This quotation has expired. Request a new one from the chemical page.</p> : null}
                </Panel>
              )}
              {canAct ? (
                <Panel title="Accept this quotation">
                  <AcceptForm rfq={selected} quote={live} onDone={() => { setSel(null); navigate('/buyer/orders'); }} />
                  <div className="mt-4 border-t border-line pt-4">
                    <Button variant="danger" loading={reject.busy} onClick={async () => {
                      if (await confirm({ title: 'Decline this quotation?', message: 'The request will be closed. You can always request a new quotation.', confirmLabel: 'Decline quotation', danger: true })) {
                        const r = await reject.run(selected.id); if (r.ok) { list.refresh(); setSel(null); }
                      }
                    }}>Decline quotation</Button>
                  </div>
                </Panel>
              ) : null}
            </div>
          );
        })() : null}
      </SlidePanel>

      <RfqPanel
        open={rfqOpen}
        onClose={() => setRfqOpen(false)}
        catalog={catalog.data}
        initialChemicalId={targetChemId}
        onDone={() => {
          list.reload();
        }}
      />
    </>
  );
}
