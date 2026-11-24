import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Button, Empty, FigureStrip, PageHeader } from '../../ui/bits.jsx';
import { ExpenseRows } from './OrderDesk.jsx';

export default function Expenses() {
  const list = useFetch('/expenses');
  const cats = useFetch('/expenses/categories');
  const orders = useFetch('/purchase-orders/admin/all');
  const [open, setOpen] = useState(false);
  const [po, setPo] = useState('');
  const rows = list.data ?? [];
  const total = rows.reduce((s, e) => s + Number(e.amount), 0);
  const byCat = Object.entries(rows.reduce((m, e) => ({ ...m, [e.category_name]: (m[e.category_name] ?? 0) + Number(e.amount) }), {})).sort((a, b) => b[1] - a[1]);
  const usable = (orders.data ?? []).filter((o) => o.status !== 'CANCELLED');

  return (
    <>
      <PageHeader title="Expenses" subtitle="Costs of completing orders. Each one lowers that order's net profit straight away." actions={<Button variant="primary" icon={Plus} onClick={() => setOpen(true)}>Add expenses</Button>} />
      <FigureStrip items={[{ label: 'Total expenses', value: inr(total) }, { label: 'Entries', value: rows.length }, { label: 'Largest category', value: byCat[0]?.[0] ?? '—', hint: byCat[0] ? inr(byCat[0][1]) : undefined }]} />
      <DataTable rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="expenses" defaultSort={{ key: 'at', dir: 'desc' }} searchPlaceholder="Search expenses"
        filters={[{ label: 'Category', options: [...new Set(rows.map((r) => r.category_name))].map((c) => ({ value: c, label: c })), test: (r, val) => r.category_name === val }]}
        columns={[
          { key: 'at', label: 'Date', value: (r) => r.created_at, render: (r) => date(r.created_at) },
          { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
          { key: 'cat', label: 'Category', value: (r) => r.category_name },
          { key: 'd', label: 'Note', value: (r) => r.description ?? '' },
          { key: 'amt', label: 'Amount', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig">{inr(r.amount)}</span> },
        ]}
        empty={<Empty title="No expenses yet" action={<Button variant="primary" onClick={() => setOpen(true)}>Add expenses</Button>} />} />
      <SlidePanel open={open} onClose={() => setOpen(false)} width={680} title="Add expenses" subtitle="Add as many lines as you need for one order.">
        <div className="space-y-4">
          <div>
            <label htmlFor="exp-po" className="mb-1 block text-[13px] font-medium">Order <span className="text-danger" aria-hidden>*</span></label>
            <select id="exp-po" className="input" value={po} onChange={(e) => setPo(e.target.value)}>
              <option value="">Choose an order</option>
              {usable.map((o) => <option key={o.id} value={o.id}>{o.po_number} · {o.buyer_company_name}</option>)}
            </select>
          </div>
          {po ? <ExpenseRows key={po} poId={po} categories={cats.data} onSaved={() => list.refresh()} /> : <p className="text-[13.5px] text-ink-3">Choose an order to start adding lines.</p>}
        </div>
      </SlidePanel>
    </>
  );
}
