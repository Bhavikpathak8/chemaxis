import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { inr, num, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { Button, Empty, FigureStrip, PageHeader, StatusMark } from '../../ui/bits.jsx';
import PricePanel from './PricePanel.jsx';

export const chemState = (c) =>
  !c.is_active ? 'INACTIVE' : c.seller_verification_status !== 'APPROVED' ? 'SELLER_PENDING' : c.buyer_price == null ? 'UNPRICED' : 'LIVE';
const STATE_LABEL = { INACTIVE: 'Inactive', SELLER_PENDING: 'Seller not approved', UNPRICED: 'Needs pricing', LIVE: 'Listed' };
const STATE_TONE = { INACTIVE: 'idle', SELLER_PENDING: 'wait', UNPRICED: 'wait', LIVE: 'ok' };
export const ChemStateMark = ({ c }) => <StatusMark tone={STATE_TONE[chemState(c)]} label={STATE_LABEL[chemState(c)]} />;

export default function Chemicals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const confirm = useConfirm();
  const list = useFetch('/chemicals/admin/all');
  const [pricing, setPricing] = useState(null);
  const del = useAction((id) => api.del(`/chemicals/admin/${id}`), { success: 'Chemical deleted' });
  const rows = list.data ?? [];
  const priced = pricing ? rows.find((c) => c.id === pricing) : null;

  const count = (s) => rows.filter((c) => chemState(c) === s).length;

  const columns = [
    { key: 'name', label: 'Chemical', value: (r) => r.name, render: (r) => <div><div className="font-medium">{r.name}</div><div className="text-[12.5px] text-ink-3">{r.category}{r.cas_number ? ` · CAS ${r.cas_number}` : ''}</div></div> },
    { key: 'seller', label: 'Seller', value: (r) => r.seller_company_name },
    { key: 'sp', label: 'Seller price', align: 'right', value: (r) => Number(r.seller_price), render: (r) => <span className="fig text-slate">{inr(r.seller_price)}</span> },
    { key: 'bp', label: 'Buyer price', align: 'right', value: (r) => (r.buyer_price == null ? '' : Number(r.buyer_price)), render: (r) => (r.buyer_price == null ? <span className="text-ink-3">Not set</span> : <span className="fig">{inr(r.buyer_price)}</span>) },
    { key: 'm', label: 'Margin / unit', align: 'right', value: (r) => (r.buyer_price == null ? '' : Number(r.buyer_price) - Number(r.seller_price)), render: (r) => (r.buyer_price == null ? '—' : <span className="fig text-brand">{inr(Number(r.buyer_price) - Number(r.seller_price))}</span>) },
    { key: 'stock', label: 'In stock', align: 'right', value: (r) => Number(r.quantity_available), render: (r) => <span className="fig">{num(r.quantity_available)} {unitLabel(r.unit)}</span> },
    { key: 'state', label: 'Status', value: (r) => STATE_LABEL[chemState(r)], sortValue: (r) => ['UNPRICED', 'SELLER_PENDING', 'LIVE', 'INACTIVE'].indexOf(chemState(r)), render: (r) => <ChemStateMark c={r} /> },
    {
      key: 'act', label: '', sortable: false, csv: false, render: (r) => (
        <span className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant={r.buyer_price == null ? 'primary' : 'quiet'} onClick={() => setPricing(r.id)}>{r.buyer_price == null ? 'Set price' : 'Edit price'}</Button>
          {user.role === 'SUPER_ADMIN' ? (
            <Button size="sm" variant="ghost" className="text-danger" onClick={async () => {
              if (await confirm({ title: `Delete ${r.name}?`, message: 'This permanently removes the chemical. It only works if no order or quotation refers to it. To just hide it, ask the seller to deactivate it.', confirmLabel: 'Delete chemical', danger: true })) {
                const o = await del.run(r.id); if (o.ok) list.refresh();
              }
            }}>Delete</Button>
          ) : null}
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Chemicals" subtitle="Everything sellers have submitted. Set your margin to make a chemical visible to buyers." />
      <FigureStrip items={[
        { label: 'Submitted', value: rows.length },
        { label: 'Needs pricing', value: count('UNPRICED'), tone: count('UNPRICED') ? 'wait' : undefined, hint: 'Hidden from buyers' },
        { label: 'Listed', value: count('LIVE'), tone: 'ok' },
        { label: 'Waiting on seller approval', value: count('SELLER_PENDING') },
      ]} />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="chemicals"
        defaultSort={{ key: 'state', dir: 'asc' }} onRowClick={(r) => navigate(`/admin/chemicals/${r.id}`)} searchPlaceholder="Search chemicals or sellers"
        filters={[
          { label: 'Status', options: Object.entries(STATE_LABEL).map(([value, label]) => ({ value, label })), test: (r, val) => chemState(r) === val },
          { label: 'Category', options: [...new Set(rows.map((r) => r.category))].map((c) => ({ value: c, label: c })), test: (r, val) => r.category === val },
        ]}
        empty={<Empty title="No chemicals submitted" hint="When an approved seller adds a chemical it shows up here for pricing." />}
      />
      <SlidePanel open={!!priced} onClose={() => setPricing(null)} title={priced ? `Price ${priced.name}` : ''} subtitle={priced?.seller_company_name}>
        {priced ? <PricePanel key={priced.id} chemical={priced} onDone={() => { setPricing(null); list.refresh(); }} /> : null}
      </SlidePanel>
    </>
  );
}
