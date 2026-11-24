import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Empty, PageHeader, Tabs } from '../../ui/bits.jsx';
import PartyPanel from './PartyPanel.jsx';
import { partyColumns } from './Approvals.jsx';

// Sellers and buyers, with order history and contact details.
export default function Directory() {
  const [tab, setTab] = useState('seller');
  const [sel, setSel] = useState(null);
  const sellers = useFetch('/users/sellers');
  const buyers = useFetch('/users/buyers');
  const cur = tab === 'seller' ? sellers : buyers;
  const selected = (cur.data ?? []).find((p) => p.id === sel);
  return (
    <>
      <PageHeader title="Sellers and buyers" subtitle="Every company on the platform. Open one to see documents and GST status." />
      <Tabs value={tab} onChange={(t) => { setTab(t); setSel(null); }} tabs={[{ value: 'seller', label: `Sellers${sellers.data ? ` (${sellers.data.length})` : ''}` }, { value: 'buyer', label: `Buyers${buyers.data ? ` (${buyers.data.length})` : ''}` }]} />
      <DataTable key={tab} columns={partyColumns(tab)} rows={cur.data} loading={cur.loading} error={cur.error} onRetry={cur.reload} exportName={`${tab}s`} onRowClick={(r) => setSel(r.id)} searchPlaceholder={`Search ${tab}s`}
        empty={<Empty title={`No ${tab}s yet`} />} />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} title={selected?.company_name} subtitle={tab === 'seller' ? 'Seller' : 'Buyer'}>
        {selected ? <PartyPanel key={`${tab}${selected.id}`} kind={tab} party={selected} onChanged={(c) => { sellers.refresh(); buyers.refresh(); if (c) setSel(null); }} /> : null}
      </SlidePanel>
    </>
  );
}
