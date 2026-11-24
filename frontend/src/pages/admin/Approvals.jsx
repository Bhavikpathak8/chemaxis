import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Empty, PageHeader, StatusMark, Tabs } from '../../ui/bits.jsx';
import PartyPanel from './PartyPanel.jsx';

export function partyColumns(kind) {
  return [
    { key: 'company', label: 'Company', value: (r) => `${r.company_name} ${r.email}`, render: (r) => <div><div className="font-medium">{r.company_name}</div><div className="text-[12.5px] text-ink-3">{r.email}</div></div> },
    { key: 'gst', label: 'GSTIN', value: (r) => r.gst_number, render: (r) => <span className="fig text-[13px]">{r.gst_number}</span> },
    { key: 'gv', label: 'GST', value: (r) => (r.gst_verified ? 'Verified' : 'Not verified'), render: (r) => <StatusMark tone={r.gst_verified ? 'ok' : 'wait'} label={r.gst_verified ? 'Verified' : 'Not verified'} /> },
    { key: 'city', label: 'City', value: (r) => [r.city, r.state].filter(Boolean).join(', ') },
    kind === 'seller'
      ? { key: 'n', label: 'Chemicals', align: 'right', value: (r) => Number(r.chemical_count ?? 0), render: (r) => <span className="fig">{r.chemical_count ?? 0}</span> }
      : { key: 'n', label: 'Orders', align: 'right', value: (r) => Number(r.order_count ?? 0), render: (r) => <span className="fig">{r.order_count ?? 0}</span> },
    { key: 'since', label: 'Registered', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'st', label: 'Status', value: (r) => r.verification_status, render: (r) => <StatusMark status={r.verification_status} label={statusLabel(r.verification_status)} /> },
  ];
}

export default function Approvals() {
  const [tab, setTab] = useState('seller');
  const [sel, setSel] = useState(null);
  const sellers = useFetch('/users/sellers');
  const buyers = useFetch('/users/buyers');
  const cur = tab === 'seller' ? sellers : buyers;
  const pend = (r) => (r.data ?? []).filter((x) => x.verification_status === 'PENDING').length;
  const selected = (cur.data ?? []).find((p) => p.id === sel);

  const changed = (close) => { sellers.refresh(); buyers.refresh(); if (close) setSel(null); };

  return (
    <>
      <PageHeader title="Approvals" subtitle="New sellers and buyers cannot trade until you approve them. Pending accounts are listed first." />
      <Tabs value={tab} onChange={(t) => { setTab(t); setSel(null); }} tabs={[{ value: 'seller', label: 'Sellers', count: pend(sellers) }, { value: 'buyer', label: 'Buyers', count: pend(buyers) }]} />
      <DataTable
        key={tab} columns={partyColumns(tab)} rows={cur.data} loading={cur.loading} error={cur.error} onRetry={cur.reload}
        exportName={`${tab}s`} onRowClick={(r) => setSel(r.id)} searchPlaceholder={`Search ${tab}s`}
        defaultSort={{ key: 'st', dir: 'desc' }}
        filters={[{ label: 'Status', options: ['PENDING', 'APPROVED', 'REJECTED'].map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.verification_status === val }]}
        empty={<Empty title={`No ${tab}s yet`} hint="They appear here as soon as they register." />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={560} title={selected?.company_name} subtitle={selected ? `${tab === 'seller' ? 'Seller' : 'Buyer'} registration` : ''}>
        {selected ? <PartyPanel key={`${tab}${selected.id}`} kind={tab} party={selected} onChanged={changed} /> : null}
      </SlidePanel>
    </>
  );
}
