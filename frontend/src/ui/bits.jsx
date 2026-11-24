import { Loader2 } from 'lucide-react';
import { statusLabel, toneOf } from '../lib/format.js';

export function Button({ variant = 'quiet', size, loading, icon: Icon, children, className = '', type = 'button', ...rest }) {
  const cls = ['btn', `btn-${variant}`, size === 'sm' ? 'btn-sm' : '', className].join(' ');
  return (
    <button type={type} className={cls} disabled={loading || rest.disabled} {...rest}>
      {loading ? <Loader2 size={15} className="animate-spin" aria-hidden /> : Icon ? <Icon size={15} aria-hidden /> : null}
      {children}
    </button>
  );
}

export function Spinner({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center gap-2 py-10 text-ink-3">
      <Loader2 size={16} className="animate-spin" aria-hidden /> <span>{label}…</span>
    </div>
  );
}

// Status as a small diamond + words, like a drum hazard label. Shape (filled
// vs hollow) carries meaning too, so it never relies on colour alone.
const MARKS = {
  ok: { fill: 'var(--color-brand)', hollow: false },
  info: { fill: 'var(--color-slate)', hollow: false },
  wait: { fill: 'var(--color-amber-mark)', hollow: true },
  bad: { fill: 'var(--color-danger)', hollow: false },
  idle: { fill: 'var(--color-ink-3)', hollow: true },
};
export function StatusMark({ status, label, tone }) {
  const m = MARKS[tone ?? toneOf(status)];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-ink">
      <i
        aria-hidden
        className="block size-[8px] shrink-0 rotate-45"
        style={m.hollow ? { border: `1.6px solid ${m.fill}` } : { background: m.fill }}
      />
      {label ?? statusLabel(status)}
    </span>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-tight text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 max-w-[62ch] text-[13.5px] text-ink-2">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

// A ruled row of headline figures — one sheet, not a grid of cards.
export function FigureStrip({ items }) {
  return (
    <dl className="mb-5 grid grid-cols-2 overflow-hidden rounded-[6px] border border-line bg-surface md:flex">
      {items.map((it, i) => (
        <div
          key={it.label}
          className={`min-w-0 flex-1 border-line px-4 py-3.5 ${i % 2 === 1 ? 'border-l' : ''} ${i >= 2 ? 'border-t' : ''} md:border-t-0 ${i > 0 ? 'md:border-l' : 'md:border-l-0'}`}
        >
          <dt className="truncate text-[12.5px] text-ink-2">{it.label}</dt>
          <dd className={`fig mt-1 break-words text-[17px] font-medium leading-tight sm:text-[21px] ${it.tone === 'ok' ? 'text-brand' : it.tone === 'bad' ? 'text-danger' : it.tone === 'wait' ? 'text-amber' : 'text-ink'}`}>
            {it.value}
          </dd>
          {it.hint ? <p className="mt-0.5 truncate text-[12px] text-ink-3">{it.hint}</p> : null}
        </div>
      ))}
    </dl>
  );
}

export function Panel({ title, subtitle, actions, children, flush, className = '' }) {
  return (
    <section className={`rounded-[6px] border border-line bg-surface ${className}`}>
      {title || actions ? (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <h2 className="text-[14.5px] text-ink">{title}</h2>
            {subtitle ? <p className="text-[12.5px] text-ink-3">{subtitle}</p> : null}
          </div>
          {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
        </header>
      ) : null}
      <div className={flush ? '' : 'p-4'}>{children}</div>
    </section>
  );
}

export function Facts({ items, cols = 2 }) {
  const shown = items.filter(Boolean);
  return (
    <dl className={`grid gap-x-6 gap-y-3 ${cols === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {shown.map(([label, value, mono]) => (
        <div key={label} className="min-w-0">
          <dt className="text-[12.5px] text-ink-3">{label}</dt>
          <dd className={`mt-0.5 break-words text-[14px] text-ink ${mono ? 'fig' : ''}`}>{value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-4 flex gap-5 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={`-mb-px whitespace-nowrap border-b-2 px-0.5 pb-2.5 pt-1 text-[13.5px] font-medium transition-colors ${value === t.value ? 'border-brand text-ink' : 'border-transparent text-ink-3 hover:text-ink'}`}
        >
          {t.label}
          {t.count ? <span className="fig ml-1.5 rounded-sm bg-amber-wash px-1.5 text-[11.5px] text-amber">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Banner({ tone = 'info', title, children, action }) {
  const tones = {
    info: 'border-slate-soft/50 bg-slate-wash text-slate-deep',
    wait: 'border-amber-mark/40 bg-amber-wash text-amber',
    bad: 'border-danger/30 bg-danger-wash text-danger',
    ok: 'border-brand/30 bg-brand-wash text-brand-deep',
  };
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={`mb-4 flex flex-wrap items-start justify-between gap-3 rounded-[6px] border px-3.5 py-2.5 text-[13.5px] ${tones[tone]}`}>
      <p className="min-w-0 flex-1">
        {title ? <strong className="font-semibold">{title} </strong> : null}
        {children}
      </p>
      {action}
    </div>
  );
}

export function Empty({ title, hint, action }) {
  return (
    <div className="px-4 py-12 text-center">
      <p className="text-[15px] font-medium text-ink">{title}</p>
      {hint ? <p className="mx-auto mt-1 max-w-[46ch] text-[13.5px] text-ink-2">{hint}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ rows = 5 }) {
  return (
    <div aria-busy className="space-y-2.5 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-5 animate-pulse rounded bg-paper" style={{ width: `${92 - ((i * 13) % 40)}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="px-4 py-10 text-center">
      <p className="font-medium text-danger">Couldn't load this</p>
      <p className="mx-auto mt-1 max-w-[50ch] text-[13.5px] text-ink-2">{message}</p>
      {onRetry ? <div className="mt-4 flex justify-center"><Button onClick={onRetry}>Try again</Button></div> : null}
    </div>
  );
}

// Wraps data states for a page region: loading → skeleton, error → retry.
export function Async({ state, children, rows }) {
  if (state.loading && !state.data) return <Skeleton rows={rows} />;
  if (state.error && !state.data) return <ErrorState message={state.error} onRetry={state.reload} />;
  if (state.data === null || state.data === undefined) return null;
  return children(state.data);
}
