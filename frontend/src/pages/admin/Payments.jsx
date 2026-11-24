import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { dateTime, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { Empty, FigureStrip, PageHeader, StatusMark, Tabs } from '../../ui/bits.jsx';

// Money in (from buyers) and money out (to sellers). Payments are recorded
// from an order or an invoice, so this page is the ledger.
export default function Payments() {
  const [tab, setTab] = useState('in');
  const pays = useFetch('/payments');
  const outs = useFetch('/payments/payouts');
  const inSum = (pays.data ?? []).filter((p) => p.status === 'PAID').reduce((s, p) => s + Number(p.amount), 0);
  const outSum = (outs.data ?? []).reduce((s, p) => s + Number(p.amount), 0);

  return (
    <>
      <PageHeader title="Payments" subtitle="Ledger of money received from buyers and paid to sellers. Record new entries from an order or invoice." />
      <FigureStrip items={[
        { label: 'Received from buyers', value: inr(inSum), tone: 'ok' }, { label: 'Paid to sellers', value: inr(outSum) },
        { label: 'Net cash position', value: inr(inSum - outSum), tone: inSum - outSum < 0 ? 'bad' : undefined },
      ]} />
      <Tabs value={tab} onChange={setTab} tabs={[{ value: 'in', label: 'Received' }, { value: 'out', label: 'Seller payouts' }]} />
      {tab === 'in' ? (
        <DataTable rows={pays.data} loading={pays.loading} error={pays.error} onRetry={pays.reload} exportName="payments-received" defaultSort={{ key: 'at', dir: 'desc' }} searchPlaceholder="Search payments"
          filters={[{ label: 'Method', options: ['BANK_TRANSFER', 'UPI', 'CHEQUE', 'CASH', 'OTHER'].map((m) => ({ value: m, label: statusLabel(m) })), test: (r, val) => r.method === val }]}
          columns={[
            { key: 'at', label: 'Date', value: (r) => r.paid_at, render: (r) => dateTime(r.paid_at) },
            { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
            { key: 'inv', label: 'Invoice', value: (r) => r.invoice_number, render: (r) => <span className="fig">{r.invoice_number}</span> },
            { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
            { key: 'm', label: 'Method', value: (r) => statusLabel(r.method), },
            { key: 'ref', label: 'Reference', value: (r) => r.reference_note ?? '' },
            { key: 'amt', label: 'Amount', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig">{inr(r.amount)}</span> },
            { key: 'st', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
          ]}
          empty={<Empty title="No payments recorded" hint="Record one from an invoice." />} />
      ) : (
        <DataTable key="out" rows={outs.data} loading={outs.loading} error={outs.error} onRetry={outs.reload} exportName="seller-payouts" defaultSort={{ key: 'at', dir: 'desc' }} searchPlaceholder="Search payouts"
          columns={[
            { key: 'at', label: 'Date', value: (r) => r.paid_at, render: (r) => dateTime(r.paid_at) },
            { key: 'seller', label: 'Seller', value: (r) => r.seller_company_name },
            { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
            { key: 'n', label: 'Note', value: (r) => r.notes ?? '' },
            { key: 'amt', label: 'Amount', align: 'right', value: (r) => Number(r.amount), render: (r) => <span className="fig">{inr(r.amount)}</span> },
          ]}
          empty={<Empty title="No payouts yet" hint="Record a seller payout from the order." />} />
      )}
    </>
  );
}
