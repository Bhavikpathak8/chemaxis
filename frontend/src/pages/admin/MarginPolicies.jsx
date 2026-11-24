import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { statusLabel } from '../../lib/format.js';
import { describePolicy, MARGIN_TYPES } from '../../lib/pricing.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { Banner, Button, Empty, PageHeader, StatusMark } from '../../ui/bits.jsx';

const SCOPES = [
  { value: 'GLOBAL', label: 'Every chemical' }, { value: 'CATEGORY', label: 'One category' }, { value: 'CHEMICAL', label: 'One chemical' },
];

function PolicyForm({ item, chemicals, onDone }) {
  const toast = useToast();
  const categories = [...new Set((chemicals ?? []).map((c) => c.category))].sort();
  const form = useForm({
    initial: {
      name: item?.name ?? '', scope: item?.scope ?? 'GLOBAL', category: item?.category ?? '', chemicalId: item?.chemical_id ?? '',
      marginType: item?.margin_type ?? 'PERCENTAGE', marginValue: item ? String(Number(item.margin_value)) : '', isActive: item ? item.is_active : true,
    },
    rules: {
      name: v.required('a policy name'),
      category: (x, all) => (all.scope === 'CATEGORY' && !x ? 'Choose a category' : null),
      chemicalId: (x, all) => (all.scope === 'CHEMICAL' && !x ? 'Choose a chemical' : null),
      marginValue: [v.positive('a value'), (x, all) => (all.marginType === 'PERCENTAGE' && Number(x) > 1000 ? 'That percentage looks too high' : null)],
    },
    onSubmit: async (x) => {
      const body = {
        name: x.name.trim(), scope: x.scope, marginType: x.marginType, marginValue: Number(x.marginValue), isActive: x.isActive,
        ...(x.scope === 'CATEGORY' ? { category: x.category } : {}), ...(x.scope === 'CHEMICAL' ? { chemicalId: x.chemicalId } : {}),
      };
      if (item) await api.patch(`/margin-policies/${item.id}`, body); else await api.post('/margin-policies', body);
      toast.success(item ? 'Policy updated' : 'Policy created'); onDone();
    },
  });
  const t = MARGIN_TYPES.find((m) => m.value === form.values.marginType);
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Banner>When you price a chemical, the most specific active policy is suggested: chemical first, then category, then the global one.</Banner>
      <Field label="Policy name" required placeholder="e.g. Solvents standard margin" {...form.bind('name')} />
      <Field label="Applies to" as="select" options={SCOPES} {...form.bind('scope')} />
      {form.values.scope === 'CATEGORY' ? <Field label="Category" as="select" required {...form.bind('category')}><option value="">Choose…</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</Field> : null}
      {form.values.scope === 'CHEMICAL' ? <Field label="Chemical" as="select" required {...form.bind('chemicalId')}><option value="">Choose…</option>{(chemicals ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} · {c.seller_company_name}</option>)}</Field> : null}
      <Field label="Margin type" as="select" options={MARGIN_TYPES.map((m) => ({ value: m.value, label: m.label }))} hint={t?.hint} {...form.bind('marginType')} />
      <Field label={form.values.marginType === 'PERCENTAGE' ? 'Percentage' : form.values.marginType === 'FIXED' ? 'Amount per unit' : 'Buyer price'} type="number" min="0" step="0.01" required prefix={form.values.marginType === 'PERCENTAGE' ? undefined : '₹'} suffix={form.values.marginType === 'PERCENTAGE' ? '%' : undefined} {...form.bind('marginValue')} />
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={form.values.isActive} onChange={(e) => form.set('isActive', e.target.checked)} /> Active</label>
      <div className="flex justify-end border-t border-line pt-4"><Button type="submit" variant="primary" loading={form.busy}>{item ? 'Save changes' : 'Create policy'}</Button></div>
    </form>
  );
}

export default function MarginPolicies() {
  const list = useFetch('/margin-policies');
  const chems = useFetch('/chemicals/admin/all');
  const [panel, setPanel] = useState(null);
  const item = panel && panel !== 'new' ? (list.data ?? []).find((p) => p.id === panel) : null;
  return (
    <>
      <PageHeader title="Margin policies" subtitle="Default margins that suggest a buyer price when you list a chemical. You can always override per chemical." actions={<Button variant="primary" icon={Plus} onClick={() => setPanel('new')}>New policy</Button>} />
      <DataTable
        rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="margin-policies" onRowClick={(r) => setPanel(r.id)}
        columns={[
          { key: 'name', label: 'Policy', value: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'scope', label: 'Applies to', value: (r) => (r.scope === 'CHEMICAL' ? r.chemical_name : r.scope === 'CATEGORY' ? r.category : 'Every chemical'), render: (r) => <span>{r.scope === 'CHEMICAL' ? r.chemical_name : r.scope === 'CATEGORY' ? r.category : 'Every chemical'} <span className="text-[12px] text-ink-3">({statusLabel(r.scope)})</span></span> },
          { key: 'm', label: 'Margin', value: (r) => describePolicy(r), render: (r) => <span className="fig">{describePolicy(r)}</span> },
          { key: 's', label: 'Status', value: (r) => (r.is_active ? 'Active' : 'Inactive'), render: (r) => <StatusMark tone={r.is_active ? 'ok' : 'idle'} label={r.is_active ? 'Active' : 'Inactive'} /> },
        ]}
        empty={<Empty title="No policies yet" hint="Without one, you set each chemical's margin by hand." action={<Button variant="primary" onClick={() => setPanel('new')}>Create the first policy</Button>} />}
      />
      <SlidePanel open={!!panel} onClose={() => setPanel(null)} width={500} title={item ? 'Edit policy' : 'New margin policy'}>
        {panel ? <PolicyForm key={panel} item={item} chemicals={chems.data} onDone={() => { setPanel(null); list.refresh(); }} /> : null}
      </SlidePanel>
    </>
  );
}
