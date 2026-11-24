import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { date, inr, statusLabel } from '../../lib/format.js';
import { Async, Button, Empty, FigureStrip, PageHeader, Panel, StatusMark } from '../../ui/bits.jsx';
import { ChartFrame, Columns, SERIES } from '../../ui/charts.jsx';

export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const ov = useFetch('/analytics/buyer/overview');
  const orders = useFetch('/purchase-orders/mine');
  const rfqs = useFetch('/quotation-requests/mine');
  const invoices = useFetch('/invoices/mine');

  const toAccept = (rfqs.data ?? []).filter((r) => r.status === 'QUOTED');
  const unpaid = (invoices.data ?? []).filter((i) => Number(i.outstanding) > 0.005);

  return (
    <>
      <PageHeader
        title={profile?.company_name ?? 'Dashboard'}
        subtitle="Your quotations, orders and invoices at a glance."
        actions={<Button variant="primary" onClick={() => navigate('/buyer/chemicals')}>Browse chemicals</Button>}
      />
      <Async state={ov}>
        {(d) => (
          <>
            <FigureStrip items={[
              { label: 'Quotations in progress', value: d.openRfqs },
              { label: 'Quotes ready to accept', value: d.quotationsToAccept, tone: d.quotationsToAccept ? 'wait' : undefined },
              { label: 'Active orders', value: d.activeOrders, hint: `${d.shipmentsInTransit} on the road` },
              { label: 'Outstanding', value: inr(d.outstanding), hint: `of ${inr(d.totalBilled)} billed`, tone: d.outstanding > 0 ? 'wait' : undefined },
            ]} />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <ChartFrame title="Monthly spend" subtitle="Order value before GST, last 6 months" table={{ columns: [{ label: 'Month', value: (r) => r.label }, { label: 'Spend', value: (r) => inr(r.spend) }], rows: d.monthlySpend }}>
                <Columns data={d.monthlySpend} series={[{ key: 'spend', label: 'Spend', color: SERIES.blue }]} />
              </ChartFrame>

              <Panel title="Needs your attention">
                {toAccept.length === 0 && unpaid.length === 0 ? <p className="py-6 text-center text-[13.5px] text-ink-3">Nothing is waiting on you.</p> : (
                  <ul className="divide-y divide-line">
                    {toAccept.map((r) => (
                      <li key={r.id} className="flex items-center justify-between gap-3 py-2.5"><span className="text-[14px]">Quotation ready for <strong className="font-medium">{r.chemical_name}</strong></span><Link to="/buyer/rfqs" className="text-[13px] font-medium text-brand hover:underline">Review</Link></li>
                    ))}
                    {unpaid.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 py-2.5"><span className="text-[14px]">Invoice <span className="fig">{i.invoice_number}</span> · <span className="fig">{inr(i.outstanding)}</span> due {date(i.due_date)}</span><Link to="/buyer/invoices" className="text-[13px] font-medium text-brand hover:underline">View</Link></li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>

            <Panel title="Recent orders" className="mt-5" flush actions={<Link to="/buyer/orders" className="text-[13px] font-medium text-brand hover:underline">All orders</Link>}>
              {(orders.data ?? []).length === 0 ? <Empty title="No orders yet" hint="Request a quotation to get started." /> : (
                <div className="overflow-x-auto"><table className="tbl">
                  <thead><tr><th>Order</th><th>Placed</th><th>Chemicals</th><th className="text-right">Amount</th><th>Status</th></tr></thead>
                  <tbody>{orders.data.slice(0, 5).map((o) => (
                    <tr key={o.id}><td className="fig font-medium">{o.po_number}</td><td>{date(o.created_at)}</td><td>{o.items.map((i) => i.chemical_name).join(', ')}</td><td className="fig text-right">{inr(o.total_amount)}</td><td><StatusMark status={o.status} label={statusLabel(o.status)} /></td></tr>
                  ))}</tbody>
                </table></div>
              )}
            </Panel>
          </>
        )}
      </Async>
    </>
  );
}
