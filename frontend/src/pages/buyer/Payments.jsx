import { useMemo } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { dateTime, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { Empty, PageHeader, StatusMark } from '../../ui/bits.jsx';

export default function Payments() {
  const pay = useFetch('/buyers/me/payments');
  const inv = useFetch('/invoices/mine');
  const numbers = useMemo(() => Object.fromEntries((inv.data ?? []).map((i) => [i.id, i.invoice_number])), [inv.data]);

  const columns = [
    { key: 'when', label: 'Received', value: (r) => r.paid_at ?? r.created_at, render: (r) => dateTime(r.paid_at ?? r.created_at) },
    { key: 'inv', label: 'Invoice', value: (r) => numbers[r.invoice_id] ?? '', render: (r) => <span className="fig">{numbers[r.invoice_id] ?? '—'}</span> },
    { key: 'method', label: 'Method', value: (r) => statusLabel(r.method), render: (r) => statusLabel(r.method) },
    { key: 'ref', label: 'Reference', value: (r) => r.reference_note ?? '', render: (r) => <span className="fig">{r.reference_note || '—'}</span> },
    { key: 'amount', label: 'Amount', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig font-medium">{inr(r.amount)}</span> },
    { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} /> },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle="Payments C-Tech has recorded against your invoices." />
      <DataTable
        columns={columns} rows={pay.data} loading={pay.loading} error={pay.error} onRetry={pay.reload} exportName="payments"
        defaultSort={{ key: 'when', dir: 'desc' }} searchPlaceholder="Search payments"
        empty={<Empty title="No payments recorded yet" hint="When C-Tech records a payment against one of your invoices it shows up here." />}
      />
    </>
  );
}
