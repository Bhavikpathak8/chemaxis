import { useState } from 'react';
import { useAuth } from '../../lib/auth.jsx';
import { api } from '../../lib/api.js';
import { useForm, v } from '../../lib/form.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date } from '../../lib/format.js';
import { Field, FileInput } from '../../ui/Field.jsx';
import { Async, Button, Facts, PageHeader, Panel, StatusMark, Tabs } from '../../ui/bits.jsx';
import { DocLink } from '../../ui/domain.jsx';
import SecuritySettings from './SecuritySettings.jsx';

function CompanyForm({ profile, base, onSaved }) {
  const save = useAction((vals) => api.patch(`${base}/me`, vals), { success: 'Company details saved' });
  const form = useForm({
    initial: {
      companyName: profile.company_name,
      contactPerson: profile.contact_person || '',
      businessType: profile.business_type || '',
      address: profile.address,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
      website: profile.website || '',
    },
    rules: {
      companyName: v.required('your company name'),
      address: v.required('your address'),
      city: v.required('your city'),
      state: v.required('your state'),
      pincode: [v.required('your pincode'), v.pincode()],
    },
    onSubmit: async (vals) => {
      const r = await save.run(vals);
      if (r.ok) onSaved();
      return r.ok;
    },
  });

  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Field label="Company legal name" required {...form.bind('companyName')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contact person" {...form.bind('contactPerson')} />
        <Field label="Business classification" {...form.bind('businessType')} />
      </div>
      <Field as="textarea" rows={2} label="Registered address" required {...form.bind('address')} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City" required {...form.bind('city')} />
        <Field label="State" required {...form.bind('state')} />
        <Field label="Pincode" required inputMode="numeric" maxLength={6} {...form.bind('pincode')} />
      </div>
      <Field label="Company website" {...form.bind('website')} placeholder="https://..." />
      <p className="text-[12.5px] text-ink-3">
        GST number and verified email cannot be changed here because C-Tech verified them. Contact C-Tech compliance to update either.
      </p>
      <Button type="submit" variant="primary" loading={form.busy} disabled={!form.dirty}>
        Save changes
      </Button>
    </form>
  );
}

const DOC_TYPES = [
  { value: 'GST_CERTIFICATE', label: 'GST certificate (Form REG-06)' },
  { value: 'COMPANY_LICENSE', label: 'Company licence / Incorporation' },
  { value: 'PAN_CARD', label: 'Company PAN card' },
  { value: 'ADDRESS_PROOF', label: 'Factory address proof / GIDC allotment' },
  { value: 'FACTORY_LICENSE', label: 'Factory License / Pollution Board Consent' },
  { value: 'OTHER', label: 'Other technical / compliance document' },
];

function Documents({ docs, onUploaded }) {
  const [type, setType] = useState('GST_CERTIFICATE');
  const [file, setFile] = useState(null);
  const upload = useAction(() => api.upload(`/sellers/me/documents?type=${type}`, file), { success: 'Document uploaded' });

  return (
    <Panel title="Company documents" subtitle="C-Tech reviews these before approving your account. Upload your GST certificate and company licence.">
      {docs.length ? (
        <ul className="mb-5 divide-y divide-line rounded-[5px] border border-line">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <span className="text-[14px]">{DOC_TYPES.find((t) => t.value === d.type)?.label ?? d.type}<span className="ml-2 text-[12.5px] text-ink-3">{date(d.uploaded_at)}</span></span>
              <DocLink url={d.file_url}>View</DocLink>
            </li>
          ))}
        </ul>
      ) : <p className="mb-5 text-[13.5px] text-ink-2">No documents uploaded yet.</p>}
      <div className="grid gap-3 sm:grid-cols-[200px_1fr_auto] sm:items-end">
        <Field as="select" label="Document type" value={type} onChange={(e) => setType(e.target.value)} options={DOC_TYPES} />
        <FileInput label="File" file={file} onChange={setFile} hint="PDF, PNG, JPEG or WEBP, up to 20 MB" />
        <Button variant="primary" disabled={!file} loading={upload.busy} onClick={async () => { const r = await upload.run(); if (r.ok) { setFile(null); onUploaded(); } }}>Upload</Button>
      </div>
    </Panel>
  );
}

export default function Profile() {
  const { user, reloadProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('company');
  const isSeller = user.role === 'SELLER';
  const base = isSeller ? '/sellers' : '/buyers';
  const state = useFetch(`${base}/me`);

  return (
    <>
      <PageHeader
        title="Account & Security"
        subtitle="Manage your registered company profile, compliance documents, and two-factor authentication."
      />

      <div className="mb-5">
        <Tabs
          value={activeTab}
          onChange={setActiveTab}
          tabs={[
            { value: 'company', label: 'Company Profile & Compliance' },
            { value: 'security', label: 'Account Security, 2FA & Sessions' },
          ]}
        />
      </div>

      {activeTab === 'security' ? (
        <SecuritySettings />
      ) : (
        <Async state={state}>
          {(p) => (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
              <div className="space-y-5">
                <Panel title="Verification & Compliance">
                  <Facts items={[
                    ['Status', <StatusMark key="s" status={p.verification_status} />],
                    ['GST number', p.gst_number || 'Not provided', true],
                    ['GST verified', p.gst_verified ? 'Yes, verified by C-Tech' : 'Not verified'],
                    ['Login email', p.email],
                    p.phone ? ['Mobile phone', p.phone] : null,
                    p.business_type ? ['Business type', p.business_type] : null,
                    p.rejection_reason ? ['Compliance notice', <span key="r" className="text-red-600 font-medium">{p.rejection_reason}</span>] : null,
                    p.verified_at ? ['Approved on', date(p.verified_at)] : null,
                    ['Registered', date(p.created_at)],
                  ]} />
                </Panel>
                {isSeller ? <Documents docs={p.documents ?? []} onUploaded={() => { state.refresh(); }} /> : null}
              </div>
              <Panel title="Company details">
                <CompanyForm profile={p} base={base} onSaved={() => { state.refresh(); reloadProfile(); }} />
              </Panel>
            </div>
          )}
        </Async>
      )}
    </>
  );
}
