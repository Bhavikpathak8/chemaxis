import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr, num, statusLabel, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Banner, Empty, Facts, PageHeader, StatusMark } from '../../ui/bits.jsx';

export default function Orders() {
  const list = useFetch('/sellers/me/orders');
  const [sel, setSel] = useState(null);
  const selected = (list.data ?? []).find((o) => o.id === sel);

  const columns = [
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
    { key: 'date', label: 'Placed', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'items', label: 'Chemicals', value: (r) => r.items.map((i) => i.chemical_name).join(', '), render: (r) => r.items.map((i) => `${i.chemical_name} (${num(i.quantity)} ${unitLabel(i.unit)})`).join(', ') },
    { key: 'amount', label: 'Value to you', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig">{inr(r.amount)}</span> },
    { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Orders placed for your chemicals. Values are at your price." />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="seller-orders"
        defaultSort={{ key: 'date', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search orders"
        filters={[{ label: 'Status', options: ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.status === val }]}
        empty={<Empty title="No orders yet" hint="When a buyer orders one of your chemicals through C-Tech, it shows up here." />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} title={selected?.po_number} subtitle={selected ? <StatusMark status={selected.status} label={statusLabel(selected.status)} /> : null}>
        {selected ? (
          <div className="space-y-5">
            <Facts items={[['Placed', date(selected.created_at)], ['Delivered', selected.delivered_at ? date(selected.delivered_at) : '—']]} />
            <div className="overflow-x-auto rounded-[5px] border border-line"><table className="tbl">
              <thead><tr><th>Chemical</th><th className="text-right">Quantity</th><th className="text-right">Your price</th><th className="text-right">Amount</th></tr></thead>
              <tbody>{selected.items.map((i) => (
                <tr key={i.chemical_id}><td>{i.chemical_name}</td><td className="fig text-right">{num(i.quantity)} {unitLabel(i.unit)}</td><td className="fig text-right">{inr(i.price_per_unit)}</td><td className="fig text-right">{inr(i.subtotal)}</td></tr>
              ))}</tbody>
            </table></div>
            <p className="text-right text-[14px]">Total to be paid to you <strong className="fig ml-2 text-[16px] font-semibold">{inr(selected.amount)}</strong></p>
            <Banner tone="info">C-Tech arranges pickup and transport. Payments to you are recorded under Payments once C-Tech settles the order.</Banner>
          </div>
        ) : null}
      </SlidePanel>
    </>
  );
}
