import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Empty, FigureStrip, PageHeader, StatusMark } from '../../ui/bits.jsx';
import OrderDesk from './OrderDesk.jsx';

const STATUSES = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export default function Orders() {
  const list = useFetch('/purchase-orders/admin/all');
  const [sel, setSel] = useState(null);
  const rows = list.data ?? [];
  const selected = rows.find((o) => o.id === sel);
  const n = (s) => rows.filter((o) => o.status === s).length;
  const margin = (o) => o.items.reduce((t, i) => t + (Number(i.buyer_price_per_unit) - Number(i.seller_price_per_unit)) * Number(i.quantity), 0);

  const columns = [
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
    { key: 'date', label: 'Placed', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
    { key: 'items', label: 'Chemicals', value: (r) => r.items.map((i) => i.chemical_name).join(', ') },
    { key: 'total', label: 'Order value', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
    { key: 'gm', label: 'Gross margin', align: 'right', value: margin, render: (r) => <span className="fig text-brand">{inr(margin(r))}</span> },
    { key: 'st', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Confirm orders, arrange transport, log expenses, invoice and settle. Open an order to work on it." />
      <FigureStrip items={[
        { label: 'To confirm', value: n('PENDING'), tone: n('PENDING') ? 'wait' : undefined },
        { label: 'Confirmed', value: n('CONFIRMED') },
        { label: 'On the road', value: n('IN_TRANSIT') },
        { label: 'Delivered', value: n('DELIVERED') + n('COMPLETED'), tone: 'ok' },
      ]} />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="orders"
        defaultSort={{ key: 'date', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search orders or buyers"
        filters={[{ label: 'Status', options: STATUSES.map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.status === val }]}
        empty={<Empty title="No orders yet" hint="Orders appear when a buyer accepts one of your quotations." />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={700} title={selected?.po_number} subtitle={selected ? <span className="flex items-center gap-3">{selected.buyer_company_name}<StatusMark status={selected.status} label={statusLabel(selected.status)} /></span> : null}>
        {selected ? <OrderDesk key={selected.id} id={selected.id} onChanged={list.refresh} onClose={() => setSel(null)} /> : null}
      </SlidePanel>
    </>
  );
}
