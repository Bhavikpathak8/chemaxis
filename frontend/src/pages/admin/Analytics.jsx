import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { downloadExport } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useToast } from '../../lib/toast.jsx';
import { useAuth } from '../../lib/auth.jsx';
import { date, dateTime, inr, isoDate } from '../../lib/format.js';
import { Async, Banner, Button, Empty, FigureStrip, PageHeader, Panel } from '../../ui/bits.jsx';
import { DataTable } from '../../ui/DataTable.jsx';
import { ChartFrame, Columns, RankBars, SERIES, TrendLines } from '../../ui/charts.jsx';

const istToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const shift = (days) => isoDate(new Date(Date.now() - days * 864e5));
const PRESETS = [
  { id: 'all', label: 'All time', range: () => ({ from: '', to: '' }) },
  { id: '30', label: 'Last 30 days', range: () => ({ from: shift(30), to: istToday() }) },
  { id: '90', label: 'Last 90 days', range: () => ({ from: shift(90), to: istToday() }) },
  { id: 'ytd', label: 'This year', range: () => ({ from: `${istToday().slice(0, 4)}-01-01`, to: istToday() }) },
];
const EXPORTS = [['orders', 'Orders'], ['transactions', 'Profit by order'], ['invoices', 'Invoices'], ['payments', 'Payments'], ['expenses', 'Expenses'], ['chemicals', 'Chemicals']];

export default function Analytics() {
  const toast = useToast();
  const { user } = useAuth();
  const [preset, setPreset] = useState('all');
  const [range, setRange] = useState({ from: '', to: '' });
  const bad = range.from && range.to && range.from > range.to;
  const qs = useMemo(() => (bad ? '' : `?${new URLSearchParams(Object.entries(range).filter(([, x]) => x)).toString()}`), [range, bad]);
  const summary = useFetch(`/analytics/summary${qs}`, { enabled: !bad });
  const top = useFetch(`/analytics/top${qs}`, { enabled: !bad });
  const tx = useFetch(`/analytics/transactions${qs}`, { enabled: !bad });
  const pend = useFetch('/analytics/pending-payments');

  const pick = (p) => { setPreset(p.id); setRange(p.range()); };
  const custom = (k, val) => { setPreset('custom'); setRange((r) => ({ ...r, [k]: val })); };
  const exp = async (k) => { try { await downloadExport(k); } catch (e) { toast.error(e.message); } };

  return (
    <>
      <PageHeader title="Analytics" subtitle="Sales, margin and profit over any period. Orders are counted in IST by the day they were placed; cancelled orders are left out." />
      <div className="mb-5 flex flex-wrap items-end gap-3 rounded-[6px] border border-line bg-surface p-3">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Period">
          {PRESETS.map((p) => <button key={p.id} aria-pressed={preset === p.id} onClick={() => pick(p)} className={`btn btn-sm ${preset === p.id ? 'btn-primary' : 'btn-quiet'}`}>{p.label}</button>)}
        </div>
        <label className="text-[12.5px] text-ink-2">From<input type="date" className="input mt-0.5 h-8 w-auto py-0 text-[13px]" value={range.from} max={range.to || undefined} onChange={(e) => custom('from', e.target.value)} /></label>
        <label className="text-[12.5px] text-ink-2">To<input type="date" className="input mt-0.5 h-8 w-auto py-0 text-[13px]" value={range.to} min={range.from || undefined} onChange={(e) => custom('to', e.target.value)} /></label>
      </div>
      {bad ? <Banner tone="bad">The start date is after the end date.</Banner> : null}

      <Async state={summary}>
        {(s) => (
          <>
            <FigureStrip items={[
              { label: 'Sales', value: inr(s.revenue), hint: `${s.orders} order${s.orders === 1 ? '' : 's'}` }, { label: 'Paid to sellers', value: inr(s.cost) },
              { label: 'Gross margin', value: inr(s.grossMargin), tone: 'ok', hint: s.revenue ? `${((s.grossMargin / s.revenue) * 100).toFixed(1)}% of sales` : undefined },
              { label: 'Expenses', value: inr(s.expenses) }, { label: 'Net profit', value: inr(s.netProfit), tone: s.netProfit < 0 ? 'bad' : 'ok' },
            ]} />
            <p className="-mt-3 mb-5 text-[12.5px] text-ink-3">Realised so far (delivered orders): {s.realised.deliveredOrders} order{s.realised.deliveredOrders === 1 ? '' : 's'}, net profit <span className="fig">{inr(s.realised.netProfit)}</span>.</p>
            <div className="grid gap-5 lg:grid-cols-2">
              <ChartFrame title="Sales and net profit" subtitle="Last 12 months" table={{ columns: [{ label: 'Month', value: (r) => r.label }, { label: 'Sales', value: (r) => inr(r.revenue) }, { label: 'Net profit', value: (r) => inr(r.netProfit) }], rows: s.monthly }}>
                <TrendLines data={s.monthly} series={[{ key: 'revenue', label: 'Sales', color: SERIES.blue }, { key: 'netProfit', label: 'Net profit', color: SERIES.green }]} />
              </ChartFrame>
              <ChartFrame title="Margin against expenses" subtitle="Last 12 months" table={{ columns: [{ label: 'Month', value: (r) => r.label }, { label: 'Gross margin', value: (r) => inr(r.grossMargin) }, { label: 'Expenses', value: (r) => inr(r.expenses) }], rows: s.monthly }}>
                <Columns data={s.monthly} series={[{ key: 'grossMargin', label: 'Gross margin', color: SERIES.green }, { key: 'expenses', label: 'Expenses', color: SERIES.amber }]} />
              </ChartFrame>
            </div>
          </>
        )}
      </Async>

      <Async state={top}>
        {(t) => (
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <Panel title="Top chemicals" subtitle="By gross margin"><RankBars rows={t.chemicals} nameKey="name" valueKey="margin" color={SERIES.green} /></Panel>
            <Panel title="Top sellers" subtitle="By value bought from them"><RankBars rows={t.sellers} nameKey="company_name" valueKey="purchased" /></Panel>
            <Panel title="Top buyers" subtitle="By sales"><RankBars rows={t.buyers} nameKey="company_name" valueKey="revenue" /></Panel>
          </div>
        )}
      </Async>

      <h2 className="mb-2 mt-7 text-[15px]">Pending payments</h2>
      <DataTable rows={pend.data} loading={pend.loading} error={pend.error} onRetry={pend.reload} exportName="pending-payments" searchPlaceholder="Search pending payments"
        defaultSort={{ key: 'due', dir: 'asc' }}
        columns={[
          { key: 'inv', label: 'Invoice', value: (r) => r.invoice_number, render: (r) => <span className="fig">{r.invoice_number}</span> },
          { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
          { key: 'due', label: 'Due', value: (r) => r.due_date, render: (r) => <span className={r.overdue ? 'font-medium text-danger' : ''}>{date(r.due_date)}{r.overdue ? ' · overdue' : ''}</span> },
          { key: 'tot', label: 'Invoice total', align: 'right', value: (r) => Number(r.total_amount), render: (r) => <span className="fig">{inr(r.total_amount)}</span> },
          { key: 'out', label: 'Outstanding', align: 'right', value: (r) => Number(r.outstanding), render: (r) => <span className="fig font-medium">{inr(r.outstanding)}</span> },
        ]}
        empty={<Empty title="No pending payments" hint="Every invoice is settled." />} />

      <h2 className="mb-2 mt-7 text-[15px]">Profit by order</h2>
      <DataTable rows={tx.data} loading={tx.loading} error={tx.error} onRetry={tx.reload} exportName="profit-by-order" searchPlaceholder="Search orders" defaultSort={{ key: 'at', dir: 'desc' }}
        columns={[
          { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
          { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
          { key: 'sa', label: 'Seller amount', align: 'right', value: (r) => Number(r.seller_amount), render: (r) => <span className="fig">{inr(r.seller_amount)}</span> },
          { key: 'ba', label: 'Buyer amount', align: 'right', value: (r) => Number(r.buyer_amount), render: (r) => <span className="fig">{inr(r.buyer_amount)}</span> },
          { key: 'gm', label: 'Gross margin', align: 'right', value: (r) => Number(r.gross_margin), render: (r) => <span className="fig">{inr(r.gross_margin)}</span> },
          { key: 'ex', label: 'Expenses', align: 'right', value: (r) => Number(r.total_expense), render: (r) => <span className="fig">{inr(r.total_expense)}</span> },
          { key: 'np', label: 'Net profit', align: 'right', value: (r) => Number(r.net_profit), render: (r) => <span className={`fig font-medium ${Number(r.net_profit) < 0 ? 'text-danger' : 'text-brand'}`}>{inr(r.net_profit)}</span> },
          { key: 'at', label: 'Calculated', value: (r) => r.calculated_at, render: (r) => dateTime(r.calculated_at) },
        ]}
        empty={<Empty title="No delivered orders in this period" hint="Profit is worked out when an order is delivered." />} />

      <h2 className="mb-2 mt-7 text-[15px]">Export data</h2>
      <div className="flex flex-wrap gap-2">
        {EXPORTS.map(([k, l]) => <Button key={k} size="sm" icon={Download} onClick={() => exp(k)}>{l} (CSV)</Button>)}
        {user.role === 'SUPER_ADMIN' ? <><Button size="sm" icon={Download} onClick={() => exp('users')}>Users (CSV)</Button><Button size="sm" icon={Download} onClick={() => exp('audit-logs')}>Audit logs (CSV)</Button></> : null}
      </div>
      <p className="mt-2 text-[12.5px] text-ink-3">Exports include everything, not only the period above.</p>
    </>
  );
}
