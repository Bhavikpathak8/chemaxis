import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { date, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { Banner, Button, Empty, FigureStrip, PageHeader, StatusMark } from '../../ui/bits.jsx';

const ROLES = ['SUPER_ADMIN', 'TRADER_STAFF', 'SELLER', 'BUYER'];

function StaffForm({ onDone }) {
  const toast = useToast();
  const form = useForm({
    initial: { email: '', password: '', phone: '', role: 'TRADER_STAFF' },
    draftOmit: ['password'],
    rules: {
      email: [v.required('an email'), v.email()],
      password: [v.required('a password'), v.minLen(8, 'The password')],
      phone: v.phone(),
    },
    onSubmit: async (x) => {
      await api.post('/users/staff', { email: x.email.trim(), password: x.password, role: x.role, ...(x.phone ? { phone: x.phone.trim() } : {}) });
      toast.success(`${statusLabel(x.role)} account created for ${x.email}`);
      onDone();
    },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Field label="Role" as="select" {...form.bind('role')} options={[{ value: 'TRADER_STAFF', label: 'Trader staff — runs the trade desk' }, { value: 'SUPER_ADMIN', label: 'Super admin — full control' }]} />
      {form.values.role === 'SUPER_ADMIN' ? <Banner tone="wait">A super admin can change margins, ban users and download the database. Give this role sparingly.</Banner> : null}
      <Field label="Work email" type="email" autoComplete="off" required {...form.bind('email')} />
      <Field label="Temporary password" type="password" autoComplete="new-password" required hint="At least 8 characters. Ask them to change it after signing in." {...form.bind('password')} />
      <Field label="Mobile number" inputMode="tel" {...form.bind('phone')} />
      <div className="flex justify-end border-t border-line pt-4"><Button type="submit" variant="primary" loading={form.busy}>Create account</Button></div>
    </form>
  );
}

export default function Users() {
  const { user: me } = useAuth();
  const confirm = useConfirm();
  const list = useFetch('/users');
  const [adding, setAdding] = useState(false);
  const ban = useAction((id) => api.patch(`/users/${id}/deactivate`), { success: 'User banned. They are signed out on their next request.' });
  const unban = useAction((id) => api.patch(`/users/${id}/activate`), { success: 'User reinstated' });
  const rows = list.data ?? [];
  const count = (r) => rows.filter((u) => u.role === r).length;

  const columns = [
    { key: 'email', label: 'User', value: (r) => r.email, render: (r) => <div><div className="font-medium">{r.email}{r.id === me.id ? <span className="ml-2 text-[12px] text-ink-3">(you)</span> : null}</div><div className="text-[12.5px] text-ink-3">{r.company_name ?? r.phone ?? ''}</div></div> },
    { key: 'role', label: 'Role', value: (r) => statusLabel(r.role) },
    { key: 'ver', label: 'Verification', value: (r) => (r.verification_status ? statusLabel(r.verification_status) : ''), render: (r) => (r.verification_status ? <StatusMark status={r.verification_status} label={statusLabel(r.verification_status)} /> : <span className="text-ink-3">—</span>) },
    { key: 'since', label: 'Joined', value: (r) => r.created_at, render: (r) => date(r.created_at) },
    { key: 'st', label: 'Account', value: (r) => (r.is_active ? 'Active' : 'Banned'), render: (r) => <StatusMark tone={r.is_active ? 'ok' : 'bad'} label={r.is_active ? 'Active' : 'Banned'} /> },
    {
      key: 'act', label: '', sortable: false, csv: false, render: (r) => (r.id === me.id ? null : (
        <span className="flex justify-end">
          {r.is_active ? (
            <Button size="sm" variant="ghost" className="text-danger" onClick={async () => {
              if (await confirm({ title: `Ban ${r.email}?`, message: 'They lose access immediately. Their orders and records stay. You can reinstate them later.', confirmLabel: 'Ban user', danger: true })) { const o = await ban.run(r.id); if (o.ok) list.refresh(); }
            }}>Ban</Button>
          ) : <Button size="sm" onClick={async () => { const o = await unban.run(r.id); if (o.ok) list.refresh(); }}>Reinstate</Button>}
        </span>
      )),
    },
  ];

  return (
    <>
      <PageHeader title="Users and staff" subtitle="Everyone with an account. Ban misbehaving users, or add trader staff to help run the desk." actions={<Button variant="primary" icon={Plus} onClick={() => setAdding(true)}>Add staff</Button>} />
      <FigureStrip items={[{ label: 'Super admins', value: count('SUPER_ADMIN') }, { label: 'Trader staff', value: count('TRADER_STAFF') }, { label: 'Sellers', value: count('SELLER') }, { label: 'Buyers', value: count('BUYER') }, { label: 'Banned', value: rows.filter((u) => !u.is_active).length, tone: rows.some((u) => !u.is_active) ? 'bad' : undefined }]} />
      <DataTable
        columns={columns} rows={list.data} loading={list.loading} error={list.error} onRetry={list.reload} exportName="users" searchPlaceholder="Search by email or company" defaultSort={{ key: 'since', dir: 'desc' }}
        filters={[
          { label: 'Role', options: ROLES.map((r) => ({ value: r, label: statusLabel(r) })), test: (r, val) => r.role === val },
          { label: 'Account', options: [{ value: 'active', label: 'Active' }, { value: 'banned', label: 'Banned' }], test: (r, val) => (val === 'active') === r.is_active },
        ]}
        empty={<Empty title="No users" />}
      />
      <SlidePanel open={adding} onClose={() => setAdding(false)} width={460} title="Add staff account" subtitle="Staff sign in at the same page as everyone else.">
        {adding ? <StaffForm onDone={() => { setAdding(false); list.refresh(); }} /> : null}
      </SlidePanel>
    </>
  );
}
