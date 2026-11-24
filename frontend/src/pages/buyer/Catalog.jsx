import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { inr, num, unitLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { Banner, Button, Empty, PageHeader } from '../../ui/bits.jsx';
import RfqPanel from './RfqPanel.jsx';

export default function Catalog() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [f, setF] = useState({ search: '', category: '', unit: '', minPrice: '', maxPrice: '' });
  const [debounced, setDebounced] = useState(f);
  const [rfq, setRfq] = useState({ open: false, chemicalId: '' });

  useEffect(() => { const t = setTimeout(() => setDebounced(f), 300); return () => clearTimeout(t); }, [f]);

  const qs = new URLSearchParams(Object.entries(debounced).filter(([, v]) => v !== '')).toString();
  const all = useFetch('/chemicals/catalog');
  const list = useFetch(`/chemicals/catalog${qs ? `?${qs}` : ''}`);

  const categories = useMemo(() => [...new Set((all.data ?? []).map((c) => c.category))].sort(), [all.data]);
  const approved = profile?.verification_status === 'APPROVED';
  const filtered = Object.values(f).some(Boolean);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const columns = [
    { key: 'name', label: 'Chemical', render: (r) => (
      <div><div className="font-medium">{r.name}</div><div className="text-[12.5px] text-ink-3">{r.category}{r.cas_number ? <> · CAS <span className="fig">{r.cas_number}</span></> : null}</div></div>
    ) },
    { key: 'purity', label: 'Purity' },
    { key: 'location', label: 'Ships from', value: (r) => `${r.warehouse_location}`, render: (r) => <span>{r.warehouse_location}</span> },
    { key: 'stock', label: 'In stock', align: 'right', value: (r) => Number(r.quantity_available), render: (r) => <span className="fig">{num(r.quantity_available)} {unitLabel(r.unit)}</span> },
    { key: 'price', label: 'Price', align: 'right', value: (r) => Number(r.buyer_price), render: (r) => <span className="fig font-medium">{inr(r.buyer_price)}<span className="font-normal text-ink-3">/{unitLabel(r.unit)}</span></span> },
    { key: 'act', label: '', sortable: false, csv: false, render: (r) => (
      <Button size="sm" variant="primary" disabled={!approved} title={approved ? undefined : 'Available once your account is approved'} onClick={(e) => { e.stopPropagation(); setRfq({ open: true, chemicalId: r.id }); }}>Request quote</Button>
    ) },
  ];

  return (
    <>
      <PageHeader title="Browse chemicals" subtitle="Chemicals C-Tech has checked and priced. The price shown is per unit before GST." />
      {!approved && profile ? <Banner tone="wait">You can browse now. Requesting a quotation unlocks after C-Tech approves your account.</Banner> : null}

      <div className="mb-3 grid gap-2 rounded-[6px] border border-line bg-surface p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden />
          <input className="input pl-8" placeholder="Search by name or CAS number" aria-label="Search chemicals" value={f.search} onChange={set('search')} />
        </div>
        <select className="input" aria-label="Category" value={f.category} onChange={set('category')}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" aria-label="Unit" value={f.unit} onChange={set('unit')}>
          <option value="">Any unit</option><option value="KG">Per kg</option><option value="TON">Per tonne</option><option value="LITRE">Per litre</option>
        </select>
        <input className="input fig" inputMode="decimal" placeholder="Min price ₹" aria-label="Minimum price" value={f.minPrice} onChange={set('minPrice')} />
        <input className="input fig" inputMode="decimal" placeholder="Max price ₹" aria-label="Maximum price" value={f.maxPrice} onChange={set('maxPrice')} />
      </div>

      <DataTable
        columns={columns}
        rows={list.data}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        search={false}
        exportName="chemicals"
        onRowClick={(r) => navigate(`/buyer/chemicals/${r.id}`)}
        empty={filtered
          ? <Empty title="No chemicals match" hint="Try a wider price range or clear a filter." action={<Button onClick={() => setF({ search: '', category: '', unit: '', minPrice: '', maxPrice: '' })}>Clear filters</Button>} />
          : <Empty title="No chemicals are listed yet" hint="Chemicals appear here after sellers list them and C-Tech approves and prices them." />}
      />

      <RfqPanel open={rfq.open} onClose={() => setRfq({ open: false, chemicalId: '' })} catalog={all.data} initialChemicalId={rfq.chemicalId} onDone={() => navigate('/buyer/rfqs')} />
    </>
  );
}
