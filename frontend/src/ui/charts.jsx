import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { inr, inrShort, num } from '../lib/format.js';

// Series colours — validated for lightness, chroma and colour-blind separation
// (slate-blue / emerald / amber). Fixed order, never cycled.
export const SERIES = { blue: '#4C6EB0', green: '#0B7A55', amber: '#B87B0C' };
const GRID = '#e6ebe9';
const AXIS = '#65717f';

const tick = { fontSize: 12, fill: AXIS };

function Tip({ active, payload, label, fmt, series }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[5px] border border-line-strong bg-surface px-3 py-2 text-[12.5px] shadow-[0_6px_18px_-8px_rgba(28,39,64,0.35)]">
      <div className="mb-1 font-medium text-ink">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5">
          <span className="flex items-center gap-1.5 text-ink-2">
            <i className="block size-2 rounded-full" style={{ background: p.color || p.fill }} />
            {series?.find((s) => s.key === p.dataKey)?.label ?? p.name}
          </span>
          <span className="fig text-ink">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Legend({ series }) {
  if (series.length < 2) return null;
  return (
    <ul className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <i className="block h-0.5 w-4 rounded" style={{ background: s.color }} />{s.label}
        </li>
      ))}
    </ul>
  );
}

// A chart is always paired with the numbers behind it.
export function ChartFrame({ title, subtitle, table, children }) {
  const [view, setView] = useState('chart');
  return (
    <section className="rounded-[6px] border border-line bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-[14.5px] text-ink">{title}</h2>
          {subtitle ? <p className="text-[12.5px] text-ink-3">{subtitle}</p> : null}
        </div>
        {table ? (
          <div role="group" aria-label="View" className="flex overflow-hidden rounded-[5px] border border-line-strong text-[12.5px]">
            {['chart', 'table'].map((v) => (
              <button key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`px-2.5 py-1 capitalize ${view === v ? 'bg-slate-wash font-medium text-ink' : 'text-ink-2 hover:bg-paper'}`}>{v}</button>
            ))}
          </div>
        ) : null}
      </header>
      <div className="p-4">
        {view === 'chart' || !table ? children : (
          <div className="max-h-72 overflow-auto">
            <table className="tbl">
              <thead><tr>{table.columns.map((c, i) => <th key={c.label} className={i ? 'text-right' : ''}>{c.label}</th>)}</tr></thead>
              <tbody>
                {table.rows.map((r, ri) => (
                  <tr key={ri}>{table.columns.map((c, i) => <td key={c.label} className={i ? 'fig text-right' : ''}>{c.value(r)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export function TrendLines({ data, xKey = 'label', series, height = 260, fmt = inr }) {
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={{ stroke: GRID }} interval="preserveStartEnd" />
          <YAxis tick={tick} tickLine={false} axisLine={false} width={56} tickFormatter={inrShort} domain={[(m) => Math.min(m, 0), (m) => Math.max(m, 1000)]} />
          <Tooltip cursor={{ stroke: AXIS, strokeWidth: 1 }} content={<Tip fmt={fmt} series={series} />} />
          {series.map((s) => (
            <Line key={s.key} dataKey={s.key} name={s.label} stroke={s.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              dot={false} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2, fill: s.color }} isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Columns({ data, xKey = 'label', series, height = 240, fmt = inr, money = true }) {
  return (
    <div>
      <Legend series={series} />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={GRID} />
          <XAxis dataKey={xKey} tick={tick} tickLine={false} axisLine={{ stroke: GRID }} />
          <YAxis tick={tick} tickLine={false} axisLine={false} width={money ? 56 : 44} tickFormatter={money ? inrShort : num} allowDecimals={false} domain={[0, (m) => Math.max(m, money ? 1000 : 4)]} />
          <Tooltip cursor={{ fill: 'rgba(46,61,92,0.06)' }} content={<Tip fmt={fmt} series={series} />} />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} maxBarSize={22} radius={[4, 4, 0, 0]} isAnimationActive={false} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Ranked horizontal bars (top chemicals / sellers / buyers). Value at the tip.
export function RankBars({ rows, nameKey, valueKey, fmt = inr, color = SERIES.blue, empty = 'No data in this period.' }) {
  if (!rows?.length) return <p className="py-8 text-center text-[13.5px] text-ink-3">{empty}</p>;
  const max = Math.max(...rows.map((r) => Number(r[valueKey])), 1);
  return (
    <ol className="space-y-2.5">
      {rows.map((r) => (
        <li key={r[nameKey]} className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 sm:grid-cols-[minmax(0,12rem)_1fr_auto]">
          <span className="truncate text-[13.5px] text-ink" title={r[nameKey]}>{r[nameKey]}</span>
          <span className="block h-2.5 rounded-r-[4px] rounded-l-none bg-paper" aria-hidden>
            <span className="block h-full rounded-r-[4px]" style={{ width: `${(Number(r[valueKey]) / max) * 100}%`, background: color }} />
          </span>
          <span className="fig min-w-20 text-right text-[13px] text-ink">{fmt(r[valueKey])}</span>
        </li>
      ))}
    </ol>
  );
}

// Status mix as a single stacked bar with a 2px surface gap between segments.
export function MixBar({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  if (!total) return <p className="text-[13.5px] text-ink-3">Nothing to show yet.</p>;
  return (
    <div>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-[3px]" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
        {parts.filter((p) => p.value > 0).map((p) => <div key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} title={`${p.label}: ${p.value}`} />)}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-2">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-1.5"><i className="block size-2 rounded-[2px]" style={{ background: p.color }} />{p.label} <span className="fig text-ink">{p.value}</span></li>
        ))}
      </ul>
    </div>
  );
}
export { Cell };
