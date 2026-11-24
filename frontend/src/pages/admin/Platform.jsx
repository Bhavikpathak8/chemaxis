import { useFetch } from '../../lib/useFetch.js';
import { inr, statusLabel } from '../../lib/format.js';
import { Async, FigureStrip, PageHeader, Panel } from '../../ui/bits.jsx';
import { ChartFrame, Columns, MixBar, SERIES } from '../../ui/charts.jsx';

const ORDER_COLORS = { PENDING: '#B87B0C', CONFIRMED: '#4C6EB0', IN_TRANSIT: '#4C6EB0', DELIVERED: '#0B7A55', COMPLETED: '#0B7A55', CANCELLED: '#B3372F' };

export default function Platform() {
  const state = useFetch('/analytics/platform');
  return (
    <>
      <PageHeader title="Platform analytics" subtitle="How the whole marketplace is doing: users, catalogue, orders and money." />
      <Async state={state}>
        {(p) => {
          const users = (role) => p.users.find((u) => u.role === role) ?? { total: 0, active: 0 };
          const ver = (kind, status) => p.verification.find((x) => x.kind === kind && x.status === status)?.n ?? 0;
          return (
            <>
              <FigureStrip items={[
                { label: 'Gross trade value', value: inr(p.gmv), hint: `${p.orderCount} orders` },
                { label: 'Collected from buyers', value: inr(p.collected) },
                { label: 'Paid to sellers', value: inr(p.paidToSellers) },
                { label: 'Realised net profit', value: inr(p.realisedNetProfit), tone: p.realisedNetProfit < 0 ? 'bad' : 'ok' },
              ]} />
              <div className="grid gap-5 lg:grid-cols-2 [&>*]:min-w-0">
                <Panel title="People">
                  <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>Role</th><th className="text-right">Accounts</th><th className="text-right">Active</th><th className="text-right">Awaiting approval</th></tr></thead>
                    <tbody>
                      {['SELLER', 'BUYER', 'TRADER_STAFF', 'SUPER_ADMIN'].map((r) => (
                        <tr key={r}><td>{statusLabel(r)}</td><td className="fig text-right">{users(r).total}</td><td className="fig text-right">{users(r).active}</td>
                          <td className="fig text-right">{r === 'SELLER' || r === 'BUYER' ? ver(r, 'PENDING') : '—'}</td></tr>
                      ))}
                    </tbody></table></div>
                </Panel>
                <Panel title="Catalogue">
                  <table className="tbl"><tbody>
                    <tr><td>Chemicals submitted</td><td className="fig text-right">{p.chemicals.total}</td></tr>
                    <tr><td>Listed for buyers</td><td className="fig text-right">{p.chemicals.listed}</td></tr>
                    <tr><td>Waiting for a price</td><td className="fig text-right">{p.chemicals.awaiting_pricing}</td></tr>
                    <tr><td>Inactive</td><td className="fig text-right">{p.chemicals.inactive}</td></tr>
                  </tbody></table>
                </Panel>
                <Panel title="Orders by status"><MixBar parts={p.orders.map((o) => ({ label: statusLabel(o.status), value: o.n, color: ORDER_COLORS[o.status] ?? '#65717f' }))} /></Panel>
                <Panel title="Security"><p className="text-[14px]"><span className="fig text-[20px]">{p.auditEventsLast7Days}</span> audit events in the last 7 days.</p></Panel>
              </div>
              <div className="mt-5">
                <ChartFrame title="New sign-ups" subtitle="Last six months" table={{ columns: [{ label: 'Month', value: (r) => r.label }, { label: 'Sellers', value: (r) => r.sellers }, { label: 'Buyers', value: (r) => r.buyers }], rows: p.signups }}>
                  <Columns money={false} fmt={(n) => String(n)} data={p.signups} series={[{ key: 'sellers', label: 'Sellers', color: SERIES.green }, { key: 'buyers', label: 'Buyers', color: SERIES.blue }]} />
                </ChartFrame>
              </div>
            </>
          );
        }}
      </Async>
    </>
  );
}
