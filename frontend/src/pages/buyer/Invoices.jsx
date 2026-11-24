import { useFetch } from '../../lib/useFetch.js';
import { date, inr } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { Empty, FigureStrip, PageHeader, StatusMark } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';

export const invoiceState = (i) => (Number(i.outstanding) <= 0.005 ? 'PAID' : new Date(i.due_date) < new Date() ? 'OVERDUE' : 'PENDING');
export const invoiceLabel = { PAID: 'Paid', OVERDUE: 'Overdue', PENDING: 'Awaiting payment' };

export default function Invoices() {
  const list = useFetch('/invoices/mine');
  const rows = list.data ?? [];
  const billed = rows.reduce((s, r) => s + Number(r.total_amount), 0);
  const due = rows.reduce((s, r) => s + Number(r.outstanding), 0);

  const columns = [
    { key: 'no', label: 'Invoice', value: (r) => r.invoice_number, render: (r) => <span className="fig font-medium">{r.invoice_number}</span> },
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig">{r.po_number}</span> },
    { key: 'issued', label: 'Issued', value: (r) => r.issued_at, render: (r) => date(r.issued_at) },
    { key: 'due', label: 'Due', value: (r) => r.due_date, render: (r) => date(r.due_date) },
    { key: 'total', label: 'Total incl. GST', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
    { key: 'out', label: 'Outstanding', align: 'right', value: (r) => Number(r.outstanding), render: (r) => <span className="fig">{inr(r.outstanding)}</span> },
    { key: 'state', label: 'Status', value: (r) => invoiceLabel[invoiceState(r)], render: (r) => <StatusMark status={invoiceState(r)} label={invoiceLabel[invoiceState(r)]} /> },
    { key: 'pdf', label: '', sortable: false, csv: false, render: (r) => <DocLink url={r.pdf_url}>PDF</DocLink> },
  ];

  return (
    <>
      <PageHeader title="Invoices" subtitle="GST invoices for your orders. Payments are recorded by C-Tech when they reach the bank." />
      <FigureStrip items={[
        { label: 'Invoices', value: rows.length }, { label: 'Total billed', value: inr(billed) },
        { label: 'Outstanding', value: inr(due), tone: due > 0 ? 'wait' : undefined },
      ]} />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="invoices"
        defaultSort={{ key: 'issued', dir: 'desc' }} searchPlaceholder="Search invoices"
        filters={[{ label: 'Status', options: Object.entries(invoiceLabel).map(([value, label]) => ({ value, label })), test: (r, val) => invoiceState(r) === val }]}
        empty={<Empty title="No invoices yet" hint="An invoice is issued for each order. You'll find it here and in the order's details." />}
      />
    </>
  );
}
