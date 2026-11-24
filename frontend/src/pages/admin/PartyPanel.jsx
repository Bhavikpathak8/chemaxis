import { useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { date } from '../../lib/format.js';
import { Banner, Button, Facts, Panel, Skeleton } from '../../ui/bits.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { DocLink } from '../../ui/domain.jsx';

const DOC_LABEL = {
  GST_CERTIFICATE: 'GST certificate (REG-06)',
  COMPANY_LICENSE: 'Company licence / Incorporation',
  PAN_CARD: 'Company PAN card',
  ADDRESS_PROOF: 'Factory address proof / GIDC allotment',
  FACTORY_LICENSE: 'Factory license / PCB Consent',
  OTHER: 'Other document',
};

// One seller or buyer: details, documents, GST check, approve / reject with reason.
export default function PartyPanel({ kind, party, onChanged }) {
  const confirm = useConfirm();
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(
    'GST certificate or manufacturing facility documentation requires correction.',
  );

  const base = `/users/${kind}s/${party.id}`;
  const docs = useFetch(kind === 'seller' ? `${base}/documents` : null);
  const approve = useAction(() => api.patch(`${base}/approve`), { success: `${party.company_name} approved` });
  const reject = useAction((reason) => api.patch(`${base}/reject`, { reason }), { success: `${party.company_name} rejected` });
  const gst = useAction((verified) => api.patch(`${base}/gst-verify`, { verified }), { success: 'GST status updated' });

  const pending = party.verification_status === 'PENDING' || party.verification_status === 'UNDER_REVIEW';
  const gstDoc = (docs.data ?? []).find((d) => d.type === 'GST_CERTIFICATE');

  const handleConfirmReject = async () => {
    if (!rejectionReason.trim()) return;
    const o = await reject.run(rejectionReason.trim());
    if (o.ok) {
      setRejecting(false);
      onChanged(true);
    }
  };

  return (
    <div className="space-y-5 text-[#1b2433]">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <StatusMark status={party.verification_status} label={statusLabel(party.verification_status)} />
        {party.is_active === false ? <StatusMark tone="bad" label="Account suspended" /> : null}
        {party.resubmitted_at ? (
          <span className="text-[12px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Resubmitted {date(party.resubmitted_at)}
          </span>
        ) : null}
      </div>

      {party.rejection_reason && (
        <Banner tone="bad" title="Current Rejection Note:">
          {party.rejection_reason}
        </Banner>
      )}

      {pending && !party.gst_verified ? (
        <Banner tone="wait" title="GST not verified.">
          Check the GSTIN below{kind === 'seller' ? ' against the uploaded certificate' : ''} and mark it verified before approving. Unverified accounts see a banner in their portal.
        </Banner>
      ) : null}

      <Facts
        items={[
          ['Company legal name', party.company_name],
          party.contact_person ? ['Contact person', party.contact_person] : null,
          party.business_type ? ['Business classification', party.business_type] : null,
          ['Login email', party.email],
          ['Contact phone', party.phone || 'Not provided'],
          ['GSTIN', party.gst_number || 'Not provided', true],
          party.pan_number ? ['PAN Number', party.pan_number, true] : null,
          party.cin_number ? ['CIN / LLPIN', party.cin_number, true] : null,
          ['Address', [party.address, party.city, party.state, party.pincode].filter(Boolean).join(', ')],
          party.website ? ['Website', party.website] : null,
          ['Registered on', date(party.created_at)],
          kind === 'seller'
            ? ['Chemicals submitted', party.chemical_count ?? 0, true]
            : ['Orders placed', party.order_count ?? 0, true],
        ]}
      />

      <Panel
        title="GST verification"
        actions={
          <Button
            size="sm"
            variant={party.gst_verified ? 'quiet' : 'primary'}
            loading={gst.busy}
            onClick={async () => {
              const o = await gst.run(!party.gst_verified);
              if (o.ok) onChanged();
            }}
          >
            {party.gst_verified ? 'Mark not verified' : 'Mark GST verified'}
          </Button>
        }
      >
        <p className="text-[14px]">
          {party.gst_verified ? (
            <span className="text-brand font-bold">Verified</span>
          ) : (
            <span className="text-amber font-semibold">Not verified</span>
          )}{' '}
          · <span className="fig font-mono">{party.gst_number || 'N/A'}</span>
        </p>
        {kind === 'seller' ? (
          <p className="mt-1 text-[13px] text-ink-2">
            Certificate:{' '}
            {docs.loading ? (
              'checking…'
            ) : gstDoc ? (
              <DocLink url={gstDoc.file_url}>Open uploaded GST certificate</DocLink>
            ) : (
              'not uploaded yet'
            )}
          </p>
        ) : null}
      </Panel>

      {kind === 'seller' ? (
        <Panel title="Submitted Compliance Documents" flush>
          {docs.loading && !docs.data ? (
            <Skeleton rows={2} />
          ) : (docs.data ?? []).length === 0 ? (
            <p className="px-4 py-5 text-[13.5px] text-ink-3">The seller has not uploaded any documents.</p>
          ) : (
            <ul className="divide-y divide-[#edf2ef]">
              {docs.data.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f8faf9] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#0f172a] truncate">
                        {DOC_LABEL[d.type] ?? d.type}
                      </div>
                      <div className="text-[11px] text-[#65717f] flex items-center gap-1.5 mt-0.5 font-mono">
                        <span>Uploaded: {date(d.uploaded_at)}</span>
                        {d.doc_name && d.doc_name !== d.type && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[180px]">{d.doc_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <DocLink
                    url={d.file_url}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-[#e4f2ec] text-[#0b7a55] hover:bg-[#0b7a55] hover:text-white text-xs font-bold transition-all shadow-xs"
                  >
                    View document
                  </DocLink>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      ) : null}

      {/* Reject with Reason Drawer/Input */}
      {rejecting ? (
        <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 space-y-3">
          <div className="font-bold text-xs text-red-900">
            Specify Compliance Rejection Reason:
          </div>
          <textarea
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full rounded-lg border border-red-300 p-2 text-xs bg-white text-[#0f172a] focus:outline-none"
            placeholder="e.g. GST Certificate REG-06 is illegible. Please upload a clear color scan."
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="quiet" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={reject.busy}
              disabled={!rejectionReason.trim()}
              onClick={handleConfirmReject}
            >
              Confirm Rejection & Notify
            </Button>
          </div>
        </div>
      ) : pending ? (
        <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button
            variant="danger"
            onClick={() => setRejecting(true)}
          >
            Reject with Reason
          </Button>
          <Button
            variant="primary"
            loading={approve.busy}
            onClick={async () => {
              if (
                !party.gst_verified &&
                !(await confirm({
                  title: 'Approve without GST verification?',
                  message:
                    'The GSTIN has not been marked verified. You can still approve and verify it later.',
                  confirmLabel: 'Approve anyway',
                }))
              )
                return;
              const o = await approve.run();
              if (o.ok) onChanged(true);
            }}
          >
            Approve {kind}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end border-t border-line pt-4">
          {party.verification_status === 'REJECTED' ? (
            <Button
              variant="primary"
              loading={approve.busy}
              onClick={async () => {
                const o = await approve.run();
                if (o.ok) onChanged(true);
              }}
            >
              Approve after all
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
