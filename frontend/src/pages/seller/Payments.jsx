import { useMemo } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { Empty, FigureStrip, PageHeader } from '../../ui/bits.jsx';

export default function Payments() {
  const pay = useFetch('/sellers/me/payments');
  const orders = useFetch('/sellers/me/orders');
  const ov = useFetch('/analytics/seller/overview');
  const po = useMemo(() => Object.fromEntries((orders.data ?? []).map((o) => [o.id, o.po_number])), [orders.data]);

  const columns = [
    { key: 'when', label: 'Paid on', value: (r) => r.paid_at, render: (r) => date(r.paid_at) },
    { key: 'po', label: 'Order', value: (r) => po[r.purchase_order_id] ?? '', render: (r) => <span className="fig">{po[r.purchase_order_id] ?? '—'}</span> },
    { key: 'notes', label: 'Note', value: (r) => r.notes ?? '', render: (r) => r.notes || <span className="text-ink-3">—</span> },
    { key: 'amount', label: 'Amount', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig font-medium">{inr(r.amount)}</span> },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle="What C-Tech has paid you for delivered orders." />
      {ov.data ? <FigureStrip items={[
        { label: 'Earned on delivered orders', value: inr(ov.data.earned) },
        { label: 'Paid to you', value: inr(ov.data.paidOut), tone: 'ok' },
        { label: 'Still to be paid', value: inr(ov.data.pendingPayout), tone: ov.data.pendingPayout > 0 ? 'wait' : undefined },
      ]} /> : null}
      <DataTable
        columns={columns} rows={pay.data} loading={pay.loading} error={pay.error} onRetry={pay.reload} exportName="seller-payments"
        defaultSort={{ key: 'when', dir: 'desc' }} searchPlaceholder="Search payments"
        empty={<Empty title="No payments yet" hint="Payments appear here once C-Tech settles a delivered order with you." />}
      />
    </>
  );
}
