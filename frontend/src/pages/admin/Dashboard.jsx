import { Link, useNavigate } from 'react-router-dom';
import { useFetch } from '../../lib/useFetch.js';
import { useAuth } from '../../lib/auth.jsx';
import { ago, inr, num, statusLabel } from '../../lib/format.js';
import { Async, FigureStrip, PageHeader, Panel, StatusMark } from '../../ui/bits.jsx';
import { Statement } from '../../ui/Statement.jsx';

const monthName = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date());

export default function Dashboard() {
  const { user } = useAuth();
  const state = useFetch('/analytics/trader/dashboard');
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Trade desk" subtitle={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}. Here is where the business stands${user.role === 'TRADER_STAFF' ? '' : ' today'}.`} />
      <Async state={state}>
        {(d) => {
          const todo = [
            { n: d.attention.pendingSellers + d.attention.pendingBuyers, text: 'registrations to approve', to: '/admin/approvals' },
            { n: d.pendingQuotations.rfqsToQuote, text: 'requests need a quote', to: '/admin/quotations' },
            { n: d.pendingQuotations.draftsToSend, text: 'draft quotations to send', to: '/admin/quotations' },
            { n: d.attention.unpricedChemicals, text: 'chemicals need pricing', to: '/admin/chemicals' },
            { n: d.attention.ordersToConfirm, text: 'orders to confirm', to: '/admin/orders' },
            { n: d.pendingDeliveries.awaitingTransport, text: 'orders need transport', to: '/admin/transportation' },
            { n: d.outstandingPayments.overdueInvoices, text: 'invoices overdue', to: '/admin/invoices' },
          ].filter((x) => x.n > 0);
          const m = d.thisMonth;
          return (
            <>
              <FigureStrip items={[
                { label: 'Net profit today', value: inr(d.today.netProfit), tone: d.today.netProfit < 0 ? 'bad' : d.today.netProfit > 0 ? 'ok' : undefined, hint: `${d.today.orders} order${d.today.orders === 1 ? '' : 's'} today` },
                { label: 'Sales today', value: inr(d.today.revenue) },
                { label: 'Outstanding from buyers', value: inr(d.outstandingPayments.amount), tone: d.outstandingPayments.overdueInvoices ? 'bad' : undefined, hint: `${d.outstandingPayments.openInvoices} open invoice${d.outstandingPayments.openInvoices === 1 ? '' : 's'}` },
                { label: 'Shipments in motion', value: d.pendingDeliveries.inFlight, hint: `${d.pendingDeliveries.awaitingTransport} awaiting transport` },
                { label: 'Stock on hand', value: num(d.inventoryUnits), hint: 'units across chemicals' },
              ]} />

              <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
                <Panel title={`${monthName}`} subtitle={`${m.orders} order${m.orders === 1 ? '' : 's'} this month`}>
                  <Statement caption="Profit this month" rows={[
                    { label: 'Sales to buyers', amount: m.revenue },
                    { label: 'Paid to sellers', amount: m.cost, kind: 'less' },
                    { label: 'Gross margin', amount: m.grossMargin, kind: 'sub' },
                    { label: 'Expenses', amount: m.expenses, kind: 'less' },
                    { label: 'Net profit', amount: m.netProfit, kind: 'grand' },
                  ]} />
                </Panel>
                <Panel title="Needs you" subtitle={todo.length ? 'Oldest work first' : undefined}>
                  {todo.length === 0 ? <p className="py-6 text-center text-[14px] text-ink-3">Nothing is waiting on you.</p> : (
                    <ul className="divide-y divide-line">
                      {todo.map((t) => (
                        <li key={t.text}>
                          <Link to={t.to} className="flex items-center gap-3 px-1 py-2.5 text-[14px] hover:bg-paper">
                            <span className="fig min-w-8 rounded-sm bg-amber-wash px-2 py-0.5 text-center font-semibold text-amber">{t.n}</span>{t.text}<span className="ml-auto text-ink-3">→</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>

              <Panel className="mt-5" title="Recent orders" flush actions={<Link to="/admin/orders" className="text-[13px] text-brand hover:underline">All orders</Link>}>
                {d.recentOrders.length === 0 ? <p className="px-4 py-8 text-center text-[14px] text-ink-3">No orders yet.</p> : (
                  <div className="overflow-x-auto"><table className="tbl">
                    <thead><tr><th>Order</th><th>Buyer</th><th className="text-right">Value</th><th>Status</th><th>When</th></tr></thead>
                    <tbody>
                      {d.recentOrders.map((o) => (
                        <tr key={o.id} className="is-click" tabIndex={0} onClick={() => navigate('/admin/orders')} onKeyDown={(e) => e.key === 'Enter' && navigate('/admin/orders')}>
                          <td className="fig font-medium">{o.po_number}</td><td>{o.buyer_company_name}</td><td className="fig text-right">{inr(o.revenue)}</td>
                          <td><StatusMark status={o.status} label={statusLabel(o.status)} /></td><td className="text-ink-3">{ago(o.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                )}
              </Panel>
            </>
          );
        }}
      </Async>
    </>
  );
}
