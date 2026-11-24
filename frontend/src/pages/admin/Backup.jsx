import { api, downloadExport } from '../../lib/api.js';
import { useAction } from '../../lib/useFetch.js';
import { Banner, Button, PageHeader, Panel } from '../../ui/bits.jsx';

const SETS = [['orders', 'Orders'], ['transactions', 'Profit per order'], ['invoices', 'Invoices'], ['payments', 'Payments'], ['expenses', 'Expenses'], ['chemicals', 'Chemicals'], ['users', 'Users'], ['audit-logs', 'Audit logs']];

function Export({ ds, label }) { const a = useAction(() => downloadExport(ds)); return <Button size="sm" loading={a.busy} onClick={a.run}>{label}</Button>; }

export default function Backup() {
  const dump = useAction(async () => {
    const blob = await api.blob('/backup');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `chemaxis-backup-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.sql`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, { success: 'Backup downloaded' });
  return (
    <>
      <PageHeader title="Backup and exports" subtitle="Keep a copy of your data. Backups are logged in the audit trail." />
      <div className="space-y-5">
        <Panel title="Database backup" subtitle="A complete SQL dump of every table.">
          <p className="mb-3 max-w-[64ch] text-[14px] text-ink-2">Restore with <span className="fig">psql -d chemaxis -f backup.sql</span> on an empty database. Uploaded files (invoices, certificates) live in the server's uploads folder and need to be copied separately.</p>
          <Banner tone="wait">The file contains every customer's data. Store it somewhere private.</Banner>
          <Button variant="primary" loading={dump.busy} onClick={dump.run}>Download database backup</Button>
        </Panel>
        <Panel title="Data exports" subtitle="Spreadsheet-ready CSV files.">
          <div className="flex flex-wrap gap-2">{SETS.map(([ds, label]) => <Export key={ds} ds={ds} label={label} />)}</div>
        </Panel>
      </div>
    </>
  );
}
