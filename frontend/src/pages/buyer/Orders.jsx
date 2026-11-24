import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { Button, Empty, Facts, PageHeader, Panel, Skeleton, StatusMark } from '../../ui/bits.jsx';
import { DocLink, ItemsTable, PathLink, ShipmentRail } from '../../ui/domain.jsx';

export function OrderDetail({ id, onChanged, onClose }) {
  const confirm = useConfirm();
  const po = useFetch(`/purchase-orders/mine/${id}`);
  const ship = useFetch(`/transportation/mine/order/${id}`);
  const inv = useFetch(`/invoices/mine/order/${id}`);
  const cancel = useAction(() => api.patch(`/purchase-orders/mine/${id}/cancel`), { success: 'Order cancelled' });

  if (!po.data) return <Skeleton />;
  const o = po.data;
  const subtotal = Number(o.total_amount);
  return (
    <div className="space-y-5">
      <Facts items={[
        ['Placed', date(o.created_at)], ['Expected dispatch', o.expected_dispatch_date ? date(o.expected_dispatch_date) : 'Not set'],
        ['Payment terms', o.payment_terms], ['Delivered', o.delivered_at ? date(o.delivered_at) : '—'],
        ['Delivery address', o.delivery_address],
      ]} />
      <ItemsTable items={o.items} />
      <table className="ml-auto text-[14px]"><tbody>
        <tr><td className="py-0.5 pr-6 text-ink-2">Amount</td><td className="fig py-0.5 text-right">{inr(subtotal)}</td></tr>
        <tr><td className="py-0.5 pr-6 text-ink-2">GST</td><td className="fig py-0.5 text-right">{Number(o.gst_amount) ? inr(o.gst_amount) : 'Added on invoice'}</td></tr>
      </tbody></table>

      <Panel title="Shipment">
        {ship.data ? <ShipmentRail shipment={ship.data} /> : <p className="text-[13.5px] text-ink-2">{ship.loading ? 'Checking…' : o.status === 'PENDING' ? 'C-Tech has not confirmed this order yet.' : o.status === 'CANCELLED' ? 'This order was cancelled.' : 'Transport has not been arranged yet. You will be notified when the shipment starts.'}</p>}
      </Panel>

      {o.status !== 'CANCELLED' ? (
        <Panel title="Documents">
          <ul className="space-y-2 text-[14px]">
            <li><PathLink path={`/purchase-orders/${id}/documents/po`}>Purchase order (PDF)</PathLink></li>
            <li><PathLink path={`/purchase-orders/${id}/documents/challan`} disabledReason={ship.data ? undefined : 'once transport is arranged'}>Delivery challan (PDF)</PathLink></li>
          </ul>
        </Panel>
      ) : null}

      <Panel title="Invoice">
        {inv.data ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><p className="fig text-[15px]">{inv.data.invoice_number}</p><p className="text-[13px] text-ink-2">{inr(inv.data.total_amount)} incl. GST · due {date(inv.data.due_date)}</p></div>
            <DocLink url={inv.data.pdf_url}>Download GST invoice</DocLink>
          </div>
        ) : <p className="text-[13.5px] text-ink-2">{inv.loading ? 'Checking…' : 'The invoice is issued by C-Tech once your order is on its way or delivered.'}</p>}
      </Panel>

      {o.status === 'PENDING' ? (
        <div className="border-t border-line pt-4">
          <Button variant="danger" loading={cancel.busy} onClick={async () => {
            if (await confirm({ title: `Cancel ${o.po_number}?`, message: 'The reserved stock is released. This can\'t be undone, but you can place a new request.', confirmLabel: 'Cancel order', danger: true })) {
              const r = await cancel.run(); if (r.ok) { onChanged(); onClose(); }
            }
          }}>Cancel this order</Button>
        </div>
      ) : null}
    </div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const list = useFetch('/purchase-orders/mine');
  const [sel, setSel] = useState(null);
  const selected = (list.data ?? []).find((o) => o.id === sel);

  const columns = [
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
    { key: 'date', label: 'Placed', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'items', label: 'Chemicals', value: (r) => r.items.map((i) => i.chemical_name).join(', '), render: (r) => r.items.map((i) => i.chemical_name).join(', ') },
    { key: 'total', label: 'Amount', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
    { key: 'status', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageHeader title="Orders" subtitle="Purchase orders created from the quotations you accepted." />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload}
        exportName="orders" defaultSort={{ key: 'date', dir: 'desc' }} onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search orders"
        filters={[{ label: 'Status', options: ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.status === val }]}
        empty={<Empty title="No orders yet" hint="Accept a quotation to place your first order." action={<Button onClick={() => navigate('/buyer/rfqs')}>View quotations</Button>} />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={620} title={selected?.po_number} subtitle={selected ? <StatusMark status={selected.status} label={statusLabel(selected.status)} /> : null}>
        {selected ? <OrderDetail key={selected.id} id={selected.id} onChanged={list.refresh} onClose={() => setSel(null)} /> : null}
      </SlidePanel>
    </>
  );
}
