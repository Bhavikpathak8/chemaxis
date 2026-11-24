import { useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { dateTime, words } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Empty, Facts, PageHeader } from '../../ui/bits.jsx';

export default function AuditLogs() {
  const list = useFetch('/audit-logs');
  const [sel, setSel] = useState(null);
  const rows = list.data ?? [];
  const selected = rows.find((r) => r.id === sel);
  const uniq = (k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))].sort();
  return (
    <>
      <PageHeader title="Audit logs" subtitle="Who did what, newest first. Shows the latest 200 events. Download the full history under Backup." />
      <DataTable
        rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="audit-logs" onRowClick={(r) => setSel(r.id)} searchPlaceholder="Search actions, people or records"
        defaultSort={{ key: 'at', dir: 'desc' }}
        filters={[
          { label: 'Action', options: uniq('action').map((a) => ({ value: a, label: words(a) })), test: (r, val) => r.action === val },
          { label: 'Record type', options: uniq('entity_type').map((a) => ({ value: a, label: a })), test: (r, val) => r.entity_type === val },
          { label: 'User', options: uniq('user_email').map((a) => ({ value: a, label: a })), test: (r, val) => r.user_email === val },
        ]}
        columns={[
          { key: 'at', label: 'When', value: (r) => r.created_at, render: (r) => <span className="fig whitespace-nowrap">{dateTime(r.created_at)}</span> },
          { key: 'u', label: 'Who', value: (r) => r.user_email ?? 'System' },
          { key: 'a', label: 'Action', value: (r) => words(r.action) },
          { key: 'e', label: 'Record', value: (r) => r.entity_type, render: (r) => <span>{r.entity_type}{r.entity_id ? <span className="fig ml-2 text-[12px] text-ink-3">{String(r.entity_id).slice(0, 8)}</span> : null}</span> },
        ]}
        empty={<Empty title="No events yet" />}
      />
      <SlidePanel open={!!selected} onClose={() => setSel(null)} width={520} title={selected ? words(selected.action) : ''} subtitle={selected ? dateTime(selected.created_at) : ''}>
        {selected ? (
          <div className="space-y-4">
            <Facts items={[['Who', selected.user_email ?? 'System'], ['Record type', selected.entity_type], ['Record id', selected.entity_id, true]]} />
            <div>
              <h3 className="mb-1.5 text-[13px] text-ink-3">Details</h3>
              <pre className="fig max-h-96 overflow-auto rounded-[5px] border border-line bg-paper p-3 text-[12.5px] leading-relaxed">{selected.metadata ? JSON.stringify(selected.metadata, null, 2) : 'No extra details were recorded.'}</pre>
            </div>
          </div>
        ) : null}
      </SlidePanel>
    </>
  );
}
