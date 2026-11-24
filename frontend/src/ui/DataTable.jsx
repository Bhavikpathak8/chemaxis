import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Search, X } from 'lucide-react';
import { store } from '../lib/store.js';
import { downloadCsv } from '../lib/format.js';
import { Button, Empty, Skeleton, ErrorState } from './bits.jsx';

const SIZES = [10, 25, 50];

// Enterprise table: search, filters, column sorting, pagination, CSV export.
// columns: { key, label, render?(row), value?(row) (sort/search/csv), align, csv:false, className }
// filters: { label, options:[{value,label}], test(row, value) }
export function DataTable({
  columns, rows, loading, error, onRetry, rowKey = (r) => r.id, onRowClick, search = true, filters = [],
  exportName, empty, defaultSort, toolbar, searchPlaceholder = 'Search', dense,
}) {
  const [q, setQ] = useState('');
  const [fv, setFv] = useState({});
  const [sort, setSort] = useState(defaultSort ?? null); // { key, dir }
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(() => store.get('pagesize', 10));

  const val = (col, row) => (col.value ? col.value(row) : row[col.key]);
  const sv = (col, row) => (col.sortValue ? col.sortValue(row) : val(col, row));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (rows ?? []).filter((r) => {
      for (const [i, f] of filters.entries()) {
        const chosen = fv[i];
        if (chosen && chosen !== 'all' && !f.test(r, chosen)) return false;
      }
      if (!needle) return true;
      return columns.some((c) => String(val(c, r) ?? '').toLowerCase().includes(needle));
    });
  }, [rows, q, fv, filters, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const x = sv(col, a), y = sv(col, b);
      if (x === y) return 0;
      if (x === null || x === undefined || x === '') return 1;
      if (y === null || y === undefined || y === '') return -1;
      const nx = Number(x), ny = Number(y);
      if (!Number.isNaN(nx) && !Number.isNaN(ny) && String(x).trim() !== '' && String(y).trim() !== '') return (nx - ny) * dir;
      return String(x).localeCompare(String(y), 'en-IN', { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  const pages = Math.max(1, Math.ceil(sorted.length / size));
  useEffect(() => { if (page > pages - 1) setPage(0); }, [pages, page]);
  useEffect(() => { setPage(0); }, [q, fv, size]);

  const slice = sorted.slice(page * size, page * size + size);
  const total = rows?.length ?? 0;
  const narrowed = q || Object.values(fv).some((x) => x && x !== 'all');

  const toggleSort = (c) => {
    if (c.sortable === false) return;
    setSort((s) => (s?.key === c.key ? (s.dir === 'asc' ? { key: c.key, dir: 'desc' } : null) : { key: c.key, dir: 'asc' }));
  };

  const exportCsv = () => downloadCsv(
    exportName,
    columns.filter((c) => c.csv !== false && c.label),
    sorted.map((r) => r),
  ) ;
  // downloadCsv wants {label, value(row)}
  const exportRows = () => downloadCsv(
    exportName,
    columns.filter((c) => c.csv !== false && c.label).map((c) => ({ label: c.label, value: (r) => (c.csvValue ? c.csvValue(r) : val(c, r)) })),
    sorted,
  );
  void exportCsv;

  return (
    <div className="rounded-[6px] border border-line bg-surface">
      {(search || filters.length || exportName || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
          {search ? (
            <div className="relative min-w-[180px] flex-1 sm:max-w-xs">
              <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
              <input
                className="input h-8 pl-8 pr-8 text-[13px]"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q ? <button onClick={() => setQ('')} aria-label="Clear search" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-3 hover:bg-paper"><X size={13} /></button> : null}
            </div>
          ) : null}
          {filters.map((f, i) => (
            <select
              key={f.label}
              aria-label={f.label}
              className="input h-8 w-auto py-0 text-[13px]"
              value={fv[i] ?? 'all'}
              onChange={(e) => setFv((s) => ({ ...s, [i]: e.target.value }))}
            >
              <option value="all">{f.label}: all</option>
              {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {toolbar}
            {exportName ? <Button size="sm" icon={Download} onClick={exportRows} disabled={!sorted.length}>Export CSV</Button> : null}
          </div>
        </div>
      )}

      {loading && !rows ? <Skeleton rows={6} /> : error && !rows ? <ErrorState message={error} onRetry={onRetry} /> : total === 0 ? (
        empty ?? <Empty title="Nothing here yet" />
      ) : sorted.length === 0 ? (
        <Empty
          title="No matches"
          hint="Nothing fits the current search and filters."
          action={<Button onClick={() => { setQ(''); setFv({}); }}>Clear search and filters</Button>}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                {columns.map((c) => {
                  const active = sort?.key === c.key;
                  return (
                    <th
                      key={c.key}
                      scope="col"
                      aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}
                      className={c.align === 'right' ? 'text-right' : ''}
                    >
                      {c.sortable === false || !c.label ? c.label : (
                        <button onClick={() => toggleSort(c)} className={`inline-flex items-center gap-1 font-medium hover:text-ink ${active ? 'text-ink' : ''}`}>
                          {c.label}
                          {active ? (sort.dir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />) : null}
                        </button>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {slice.map((r) => (
                <tr
                  key={rowKey(r)}
                  className={onRowClick ? 'is-click' : ''}
                  tabIndex={onRowClick ? 0 : undefined}
                  onClick={onRowClick ? () => onRowClick(r) : undefined}
                  onKeyDown={onRowClick ? (e) => { if (e.key === 'Enter') onRowClick(r); } : undefined}
                >
                  {columns.map((c) => (
                    <td key={c.key} className={`${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''} ${dense ? '!py-1.5' : ''}`}>
                      {c.render ? c.render(r) : (val(c, r) ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sorted.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-3 py-2 text-[12.5px] text-ink-2">
          <span>
            {page * size + 1}–{Math.min(sorted.length, page * size + size)} of {sorted.length}
            {narrowed ? ` (filtered from ${total})` : ''}
          </span>
          <span className="flex items-center gap-3">
            <label className="flex items-center gap-1.5">
              Rows
              <select
                className="input h-7 w-auto py-0 text-[12.5px]"
                value={size}
                onChange={(e) => { const n = Number(e.target.value); setSize(n); store.set('pagesize', n); }}
              >
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <span className="flex items-center gap-1">
              <button className="btn btn-quiet btn-sm !px-1.5" disabled={page === 0} onClick={() => setPage(page - 1)} aria-label="Previous page"><ChevronLeft size={15} /></button>
              <span className="fig min-w-12 text-center">{page + 1} / {pages}</span>
              <button className="btn btn-quiet btn-sm !px-1.5" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} aria-label="Next page"><ChevronRight size={15} /></button>
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
