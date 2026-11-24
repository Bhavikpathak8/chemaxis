import { useEffect, useState } from 'react';
import { api } from '../../lib/api.js';
import { useForm, v } from '../../lib/form.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date, num, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { Button, Empty, FigureStrip, PageHeader, StatusMark } from '../../ui/bits.jsx';

function StockForm({ chemical, onSaved, onClose }) {
  const save = useAction((q) => api.patch(`/chemicals/mine/${chemical.id}/inventory`, { quantityAvailable: q }), { success: 'Stock updated' });
  const form = useForm({
    initial: { quantity: String(Number(chemical.quantity_available)) },
    rules: { quantity: [v.required('the quantity'), v.atLeast(0, 'Stock')] },
    onSubmit: async ({ quantity }) => { const r = await save.run(Number(quantity)); if (r.ok) { onSaved(); onClose(); } return r.ok; },
  });
  const reserved = Number(chemical.quantity_reserved);
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <p className="text-[13.5px] text-ink-2">Set the quantity you can supply right now. <span className="fig">{num(reserved)} {unitLabel(chemical.unit)}</span> is reserved for open orders.</p>
      <Field label="Quantity available" inputMode="decimal" suffix={unitLabel(chemical.unit)} className="[&_input]:font-mono" autoFocus {...form.bind('quantity')} />
      <div className="flex gap-2"><Button type="submit" variant="primary" loading={form.busy} disabled={!form.dirty}>Update stock</Button><Button onClick={onClose}>Cancel</Button></div>
    </form>
  );
}

export default function Inventory() {
  const list = useFetch('/chemicals/mine');
  const [sel, setSel] = useState(null);
  const selected = (list.data ?? []).find((c) => c.id === sel);
  useEffect(() => { if (sel && list.data && !selected) setSel(null); }, [sel, list.data, selected]);

  const rows = (list.data ?? []).filter((c) => c.is_active);
  const level = (r) => (Number(r.quantity_available) <= 0 ? 'OUT' : Number(r.quantity_available) <= Number(r.quantity_reserved) ? 'LOW' : 'OK');
  const LV = { OUT: ['bad', 'Out of stock'], LOW: ['wait', 'Fully reserved'], OK: ['ok', 'Available'] };

  const columns = [
    { key: 'name', label: 'Chemical', render: (r) => <span className="font-medium">{r.name}</span> },
    { key: 'avail', label: 'Available', align: 'right', value: (r) => Number(r.quantity_available), render: (r) => <span className="fig">{num(r.quantity_available)} {unitLabel(r.unit)}</span> },
    { key: 'res', label: 'Reserved', align: 'right', value: (r) => Number(r.quantity_reserved), render: (r) => <span className="fig">{num(r.quantity_reserved)} {unitLabel(r.unit)}</span> },
    { key: 'state', label: 'Level', value: (r) => LV[level(r)][1], render: (r) => <StatusMark tone={LV[level(r)][0]} label={LV[level(r)][1]} /> },
    { key: 'updated', label: 'Updated', value: (r) => r.updated_at, render: (r) => <span className="text-ink-3">{date(r.updated_at)}</span> },
    { key: 'act', label: '', sortable: false, csv: false, render: (r) => <Button size="sm" onClick={(e) => { e.stopPropagation(); setSel(r.id); }}>Update stock</Button> },
  ];

  return (
    <>
      <PageHeader title="Inventory" subtitle="Keep stock accurate. Buyers can only request what's available." />
      <FigureStrip items={[
        { label: 'Active chemicals', value: rows.length },
        { label: 'Out of stock', value: rows.filter((r) => level(r) === 'OUT').length, tone: rows.some((r) => level(r) === 'OUT') ? 'bad' : undefined },
        { label: 'Reserved for orders', value: rows.filter((r) => Number(r.quantity_reserved) > 0).length, hint: 'chemicals with open orders' },
      ]} />
      <DataTable
        columns={columns} rows={rows} loading={list.loading} error={list.error} onRetry={list.reload} exportName="inventory"
        searchPlaceholder="Search inventory"
        filters={[{ label: 'Level', options: Object.entries(LV).map(([value, [, label]]) => ({ value, label })), test: (r, val) => level(r) === val }]}
        empty={<Empty title="No stock to manage" hint="Add a chemical first. Its stock appears here." />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={440} title={selected ? `Update stock · ${selected.name}` : ''}>
        {selected ? <StockForm key={selected.id} chemical={selected} onSaved={list.refresh} onClose={() => setSel(null)} /> : null}
      </SlidePanel>
    </>
  );
}
