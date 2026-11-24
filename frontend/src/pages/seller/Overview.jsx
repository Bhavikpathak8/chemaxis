import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../lib/auth.jsx';
import { useFetch } from '../../lib/useFetch.js';
import { inr, statusLabel } from '../../lib/format.js';
import { Async, Button, FigureStrip, PageHeader, Panel } from '../../ui/bits.jsx';
import { ChartFrame, Columns, MixBar, SERIES } from '../../ui/charts.jsx';
import ResubmitVerificationModal from './ResubmitVerificationModal.jsx';

const MIX_COLORS = { PENDING: '#B87B0C', CONFIRMED: '#4C6EB0', IN_TRANSIT: '#4C6EB0', DELIVERED: '#0B7A55', COMPLETED: '#0B7A55' };

export default function Overview() {
  const { profile, reloadProfile } = useAuth();
  const navigate = useNavigate();
  const ov = useFetch('/analytics/seller/overview');
  const chems = useFetch('/chemicals/mine');
  const [resubmitOpen, setResubmitOpen] = useState(false);

  const awaiting = (chems.data ?? []).filter((c) => c.is_active && !c.is_listed);
  const empty = (chems.data ?? []).filter((c) => c.is_active && Number(c.quantity_available) <= 0);

  const status = profile?.verification_status || 'PENDING';
  const isApproved = status === 'APPROVED';
  const isRejected = status === 'REJECTED';
  const isPending = status === 'PENDING' || status === 'UNDER_REVIEW';

  return (
    <>
      <PageHeader
        title={profile?.company_name ?? 'Overview'}
        subtitle="Your chemical listings, active quotations, and settlement ledger."
        actions={
          <div className="flex items-center gap-2">
            {isApproved ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e4f2ec] px-3 py-1 text-xs font-bold text-[#0b7a55] border border-[#0b7a55]/20">
                <CheckCircle2 size={14} />
                <span>Verified Supplier</span>
              </span>
            ) : isRejected ? (
              <button
                type="button"
                onClick={() => setResubmitOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <ShieldAlert size={14} />
                <span>Verification Rejected (Resubmit)</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                <Clock size={14} />
                <span>Verification Under Review</span>
              </span>
            )}
            <Button variant="primary" onClick={() => navigate('/seller/chemicals')}>
              Manage Chemicals
            </Button>
          </div>
        }
      />

      {/* Compliance Verification Banner */}
      {isRejected && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 shadow-xs flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="font-bold text-sm text-red-900 flex items-center gap-1.5">
              <ShieldAlert size={18} />
              <span>Supplier Verification Action Required</span>
            </div>
            <p className="text-red-700">
              Your application was reviewed by the compliance desk: <strong>{profile.rejection_reason || 'Incomplete documentation or unverified GST certificate'}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setResubmitOpen(true)}
            className="shrink-0 h-9 px-4 rounded-xl bg-red-700 text-white font-bold hover:bg-red-800 transition-all shadow-xs"
          >
            Update & Resubmit
          </button>
        </div>
      )}

      {isPending && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-700 shrink-0" />
            <div>
              <span className="font-bold block text-[13px]">Corporate Verification in Progress</span>
              <span className="text-amber-700 text-[11.5px]">
                Your GSTIN and manufacturing certificates are being audited. Products you add will be published to buyers once verified.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="shrink-0 text-xs font-bold text-amber-800 underline hover:text-amber-900"
          >
            Review Documents
          </button>
        </div>
      )}

      <Async state={ov}>
        {(d) => (
          <>
            <FigureStrip items={[
              { label: 'Live listings', value: d.chemicals.live, hint: `${d.chemicals.total} in total` },
              { label: 'Awaiting approval', value: d.chemicals.awaitingApproval, tone: d.chemicals.awaitingApproval ? 'wait' : undefined },
              { label: 'Earned on delivered orders', value: inr(d.earned) },
              { label: 'Still to be paid to you', value: inr(d.pendingPayout), tone: d.pendingPayout > 0 ? 'wait' : undefined, hint: `${inr(d.paidOut)} paid so far` },
            ]} />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <ChartFrame title="Monthly sales" subtitle="Order value at your price, last 6 months" table={{ columns: [{ label: 'Month', value: (r) => r.label }, { label: 'Sales', value: (r) => inr(r.sales) }], rows: d.monthlySales }}>
                <Columns data={d.monthlySales} series={[{ key: 'sales', label: 'Sales', color: SERIES.blue }]} />
              </ChartFrame>
              <div className="space-y-5">
                <Panel title="Orders by status">
                  <MixBar parts={d.orders.map((o) => ({ label: statusLabel(o.status), value: o.count, color: MIX_COLORS[o.status] ?? '#65717f' }))} />
                </Panel>
                <Panel title="Needs your attention">
                  {awaiting.length === 0 && empty.length === 0 ? <p className="py-4 text-center text-[13.5px] text-ink-3">Nothing needs attention.</p> : (
                    <ul className="space-y-2 text-[13.5px]">
                      {awaiting.map((c) => <li key={c.id}><strong className="font-medium">{c.name}</strong> is waiting for C-Tech to approve and price it.</li>)}
                      {empty.map((c) => <li key={c.id}><strong className="font-medium">{c.name}</strong> is out of stock. <Link to="/seller/inventory" className="font-medium text-brand hover:underline">Update stock</Link></li>)}
                    </ul>
                  )}
                </Panel>
              </div>
            </div>
          </>
        )}
      </Async>

      <ResubmitVerificationModal
        isOpen={resubmitOpen}
        onClose={() => setResubmitOpen(false)}
        profile={profile}
        onResubmitted={() => {
          if (reloadProfile) reloadProfile();
        }}
      />
    </>
  );
}
