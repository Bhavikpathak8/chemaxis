import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { Button, Empty, PageHeader, StatusMark } from '../../ui/bits.jsx';

function CatForm({ item, onDone }) {
  const toast = useToast();
  const form = useForm({
    initial: { name: item?.name ?? '', isActive: item ? item.is_active : true },
    rules: { name: [v.required('a category name'), v.minLen(2, 'The name')] },
    onSubmit: async (x) => {
      const body = { name: x.name.trim(), isActive: x.isActive };
      if (item) await api.patch(`/expense-categories/${item.id}`, body); else await api.post('/expense-categories', body);
      toast.success(item ? 'Category updated' : 'Category added'); onDone();
    },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Field label="Category name" required {...form.bind('name')} />
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={form.values.isActive} onChange={(e) => form.set('isActive', e.target.checked)} /> Active (shown when logging expenses)</label>
      <p className="text-[12.5px] text-ink-3">Renaming keeps past expenses under the new name. Deactivate a category instead of deleting it.</p>
      <div className="flex justify-end border-t border-line pt-4"><Button type="submit" variant="primary" loading={form.busy}>{item ? 'Save changes' : 'Add category'}</Button></div>
    </form>
  );
}

export default function ExpenseCategories() {
  const list = useFetch('/expense-categories');
  const [panel, setPanel] = useState(null);
  const item = panel && panel !== 'new' ? (list.data ?? []).find((c) => c.id === panel) : null;
  return (
    <>
      <PageHeader title="Expense categories" subtitle="The headings staff pick from when they log what an order cost." actions={<Button variant="primary" icon={Plus} onClick={() => setPanel('new')}>Add category</Button>} />
      <DataTable rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="expense-categories" onRowClick={(r) => setPanel(r.id)} defaultSort={{ key: 'name', dir: 'asc' }}
        columns={[
          { key: 'name', label: 'Category', value: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 's', label: 'Status', value: (r) => (r.is_active ? 'Active' : 'Inactive'), render: (r) => <StatusMark tone={r.is_active ? 'ok' : 'idle'} label={r.is_active ? 'Active' : 'Inactive'} /> },
        ]}
        empty={<Empty title="No categories" />} />
      <SlidePanel open={!!panel} onClose={() => setPanel(null)} width={440} title={item ? 'Edit category' : 'Add category'}>
        {panel ? <CatForm key={panel} item={item} onDone={() => { setPanel(null); list.refresh(); }} /> : null}
      </SlidePanel>
    </>
  );
}
