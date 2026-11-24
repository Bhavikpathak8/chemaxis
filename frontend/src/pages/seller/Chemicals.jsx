import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useForm, v } from '../../lib/form.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date, inr, num, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { DraftBar, Field, FileInput } from '../../ui/Field.jsx';
import { Banner, Button, Empty, PageHeader, StatusMark, Tabs } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';

const CATEGORIES = ['Industrial Chemical', 'Solvent', 'Acid', 'Base', 'Intermediate', 'Polymer', 'Pigment', 'Other'];
const UNITS = [{ value: 'KG', label: 'Kilogram (kg)' }, { value: 'TON', label: 'Tonne (t)' }, { value: 'LITRE', label: 'Litre (L)' }];

export const listingState = (c) => (!c.is_active ? 'INACTIVE' : c.is_listed ? 'LIVE' : 'PENDING');
const listingLabel = { LIVE: 'Live', PENDING: 'Awaiting approval', INACTIVE: 'Deactivated' };

function ChemicalForm({ chemical, onSaved, onClose }) {
  const editing = !!chemical;
  const [coa, setCoa] = useState(null);
  const [msds, setMsds] = useState(null);
  const save = useAction(async (vals) => {
    const body = {
      name: vals.name.trim(), category: vals.category, casNumber: vals.casNumber.trim() || undefined, purity: vals.purity.trim(), unit: vals.unit,
      sellerPrice: Number(vals.sellerPrice), warehouseLocation: vals.warehouseLocation.trim(), description: vals.description.trim() || undefined,
    };
    if (editing) return api.patch(`/chemicals/mine/${chemical.id}`, body);
    const created = await api.post('/chemicals', { ...body, availableQuantity: Number(vals.availableQuantity) });
    // Documents go up right after the chemical exists; a failed upload doesn't undo the listing.
    const failures = [];
    if (coa) await api.upload(`/chemicals/mine/${created.id}/documents?type=COA`, coa).catch((e) => failures.push(`COA: ${e.message}`));
    if (msds) await api.upload(`/chemicals/mine/${created.id}/documents?type=MSDS`, msds).catch((e) => failures.push(`MSDS: ${e.message}`));
    if (failures.length) throw new Error(`Chemical saved, but a document failed to upload (${failures.join('; ')}). Add it from the chemical's Documents tab.`);
    return created;
  }, { success: editing ? 'Chemical updated' : 'Chemical submitted for approval' });

  const form = useForm({
    initial: {
      name: chemical?.name ?? '', category: chemical?.category ?? CATEGORIES[0], casNumber: chemical?.cas_number ?? '', purity: chemical?.purity ?? '',
      unit: chemical?.unit ?? 'KG', sellerPrice: chemical?.seller_price ?? '', warehouseLocation: chemical?.warehouse_location ?? '', description: chemical?.description ?? '',
      availableQuantity: '',
    },
    draftKey: editing ? null : 'seller-chemical',
    rules: {
      name: v.required('the chemical name'), casNumber: v.cas(), purity: v.required('the purity'),
      sellerPrice: v.positive('your price per unit'), warehouseLocation: v.required('the warehouse location'),
      ...(editing ? {} : { availableQuantity: v.positive('the available quantity') }),
    },
    onSubmit: async (vals) => { const r = await save.run(vals); if (r.ok) { onSaved(r.data); if (!editing) onClose(); } else if (!editing && /Chemical saved/.test(r.error?.message ?? '')) { onSaved(); onClose(); } return r.ok; },
  });

  const priceChanged = editing && ['sellerPrice', 'purity', 'unit', 'casNumber'].some((k) => {
    const orig = { sellerPrice: chemical.seller_price, purity: chemical.purity, unit: chemical.unit, casNumber: chemical.cas_number ?? '' }[k];
    return String(form.values[k]) !== String(orig);
  });

  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      {!editing ? <DraftBar draft={form.draft} /> : null}
      {editing && chemical.is_listed && priceChanged ? <Banner tone="wait" title="This sends the listing back for approval.">Changing the price, purity, unit or CAS number takes it off the buyer catalog until C-Tech approves it again.</Banner> : null}
      <Field label="Chemical name" required {...form.bind('name')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field as="select" label="Category" {...form.bind('category')} options={CATEGORIES.map((c) => ({ value: c, label: c }))} />
        <Field label="CAS number" hint="Optional, for example 108-95-2" className="[&_input]:font-mono" {...form.bind('casNumber')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Purity" required hint="For example 99.5% or Industrial grade" {...form.bind('purity')} />
        <Field as="select" label="Sold per" {...form.bind('unit')} options={UNITS} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your price per unit" required inputMode="decimal" prefix="₹" className="[&_input]:font-mono" hint="What C-Tech pays you. Buyers never see this." {...form.bind('sellerPrice')} />
        {!editing ? <Field label="Quantity available" required inputMode="decimal" suffix={unitLabel(form.values.unit)} className="[&_input]:font-mono" {...form.bind('availableQuantity')} /> : null}
      </div>
      <Field label="Warehouse location" required hint="City or area where the stock is held, for example Bharuch" {...form.bind('warehouseLocation')} />
      <Field as="textarea" label="Description" hint="Optional. Grade, packaging, anything a buyer should know." {...form.bind('description')} />
      {!editing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput label="Certificate of analysis (COA)" file={coa} onChange={setCoa} hint="PDF or image, up to 20 MB" />
          <FileInput label="Safety data sheet (MSDS)" file={msds} onChange={setMsds} hint="PDF or image, up to 20 MB" />
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button type="submit" variant="primary" loading={form.busy} disabled={editing && !form.dirty}>{editing ? 'Save changes' : 'Submit for approval'}</Button>
        {!editing ? <Button onClick={form.draft.save} disabled={!form.dirty}>Save draft</Button> : null}
        <Button onClick={onClose}>Cancel</Button>
      </div>
    </form>
  );
}

function DocUpload({ chemical, type, label, url, onDone }) {
  const [file, setFile] = useState(null);
  const up = useAction(() => api.upload(`/chemicals/mine/${chemical.id}/documents?type=${type}`, file), { success: `${label} uploaded` });
  return (
    <div className="rounded-[6px] border border-line p-3.5">
      <div className="mb-2 flex items-center justify-between"><span className="text-[14px] font-medium">{label}</span>{url ? <DocLink url={url}>View current</DocLink> : <span className="text-[13px] text-ink-3">Not uploaded</span>}</div>
      <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
        <FileInput file={file} onChange={setFile} />
        <Button variant="primary" disabled={!file} loading={up.busy} onClick={async () => { const r = await up.run(); if (r.ok) { setFile(null); onDone(); } }}>{url ? 'Replace' : 'Upload'}</Button>
      </div>
    </div>
  );
}

function ChemicalPanel({ id, onChanged, onClose }) {
  const confirm = useConfirm();
  const [tab, setTab] = useState('details');
  const item = useFetch(`/chemicals/mine/${id}`);
  const deactivate = useAction(() => api.patch(`/chemicals/mine/${id}/deactivate`), { success: 'Chemical deactivated' });
  const c = item.data;
  if (!c) return null;
  return (
    <>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'details', label: 'Details' }, { value: 'documents', label: 'Documents' }]} />
      {tab === 'details' ? (
        <div className="space-y-5">
          <ChemicalForm key={c.updated_at} chemical={c} onSaved={() => { item.refresh(); onChanged(); }} onClose={onClose} />
          {c.is_active ? (
            <div className="border-t border-line pt-4">
              <Button variant="danger" loading={deactivate.busy} onClick={async () => {
                if (await confirm({ title: `Deactivate ${c.name}?`, message: 'Buyers will no longer see it. Existing orders are not affected. Contact C-Tech to bring it back.', confirmLabel: 'Deactivate', danger: true })) {
                  const r = await deactivate.run(); if (r.ok) { onChanged(); onClose(); }
                }
              }}>Deactivate listing</Button>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <DocUpload chemical={c} type="COA" label="Certificate of analysis (COA)" url={c.coa_url} onDone={() => { item.refresh(); onChanged(); }} />
          <DocUpload chemical={c} type="MSDS" label="Safety data sheet (MSDS)" url={c.msds_url} onDone={() => { item.refresh(); onChanged(); }} />
        </div>
      )}
    </>
  );
}

export default function Chemicals() {
  const { profile } = useAuth();
  const list = useFetch('/chemicals/mine');
  const [panel, setPanel] = useState(null); // 'new' | chemical id
  const approved = profile?.verification_status === 'APPROVED';
  const selected = (list.data ?? []).find((c) => c.id === panel);
  useEffect(() => { if (panel && panel !== 'new' && list.data && !selected) setPanel(null); }, [panel, list.data, selected]);

  const columns = [
    { key: 'name', label: 'Chemical', render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-[12.5px] text-ink-3">{r.category}{r.cas_number ? <> · CAS <span className="fig">{r.cas_number}</span></> : null}</div></div> },
    { key: 'purity', label: 'Purity' },
    { key: 'price', label: 'Your price', align: 'right', value: (r) => Number(r.seller_price), render: (r) => <span className="fig">{inr(r.seller_price)}<span className="text-ink-3">/{unitLabel(r.unit)}</span></span> },
    { key: 'stock', label: 'In stock', align: 'right', value: (r) => Number(r.quantity_available), render: (r) => <span className="fig">{num(r.quantity_available)} {unitLabel(r.unit)}</span> },
    { key: 'docs', label: 'Documents', value: (r) => `${r.coa_url ? 'COA' : ''} ${r.msds_url ? 'MSDS' : ''}`.trim(), render: (r) => <span className="text-[13px] text-ink-2">{[r.coa_url ? 'COA' : null, r.msds_url ? 'MSDS' : null].filter(Boolean).join(' · ') || <span className="text-amber">Missing</span>}</span> },
    { key: 'status', label: 'Status', value: (r) => listingLabel[listingState(r)], render: (r) => <StatusMark status={listingState(r)} label={listingLabel[listingState(r)]} /> },
    { key: 'updated', label: 'Updated', value: (r) => r.updated_at, render: (r) => <span className="text-ink-3">{date(r.updated_at)}</span> },
  ];

  return (
    <>
      <PageHeader title="My chemicals" subtitle="List what you sell. C-Tech checks each listing, prices it and publishes it."
        actions={<Button variant="primary" icon={Plus} disabled={!approved} title={approved ? undefined : 'Available once your account is approved'} onClick={() => setPanel('new')}>Add chemical</Button>} />
      {!approved && profile ? <Banner tone="wait">You can add chemicals after C-Tech approves your account.</Banner> : null}
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="my-chemicals"
        defaultSort={{ key: 'updated', dir: 'desc' }} onRowClick={(r) => setPanel(r.id)} searchPlaceholder="Search my chemicals"
        filters={[{ label: 'Status', options: Object.entries(listingLabel).map(([value, label]) => ({ value, label })), test: (r, val) => listingState(r) === val }]}
        empty={<Empty title="You haven't listed anything yet" hint="Add a chemical with its price, stock and COA/MSDS documents. It goes live once C-Tech approves it." action={approved ? <Button variant="primary" icon={Plus} onClick={() => setPanel('new')}>Add chemical</Button> : null} />}
      />
      <SlidePanel open={panel === 'new'} onClose={() => setPanel(null)} title="Add a chemical" subtitle="It will be reviewed by C-Tech before buyers can see it.">
        {panel === 'new' ? <ChemicalForm onSaved={() => list.refresh()} onClose={() => setPanel(null)} /> : null}
      </SlidePanel>
      <SlidePanel open={!!selected} onClose={() => setPanel(null)} title={selected?.name} subtitle={selected ? <StatusMark status={listingState(selected)} label={listingLabel[listingState(selected)]} /> : null}>
        {selected ? <ChemicalPanel key={selected.id} id={selected.id} onChanged={() => list.refresh()} onClose={() => setPanel(null)} /> : null}
      </SlidePanel>
    </>
  );
}
