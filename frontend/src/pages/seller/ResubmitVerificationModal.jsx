import { useState } from 'react';
import {
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../../lib/api.js';

export default function ResubmitVerificationModal({ isOpen, onClose, profile, onResubmitted }) {
  const [formData, setFormData] = useState({
    companyName: profile?.company_name || '',
    contactPerson: profile?.contact_person || '',
    businessType: profile?.business_type || 'Primary Synthesis Chemical Manufacturer',
    gstNumber: profile?.gst_number || '',
    panNumber: profile?.pan_number || '',
    cinNumber: profile?.cin_number || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
    website: profile?.website || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (f, v) => setFormData((p) => ({ ...p, [f]: v }));

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.resubmitSeller(formData);
      setSuccess(true);
      if (onResubmitted) onResubmitted();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to resubmit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8e5] text-xs text-[#1b2433] max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#65717f] hover:text-[#0f172a]"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0f172a]">Update & Resubmit Verification</h3>
            <p className="text-[11px] text-[#65717f]">Correct your corporate details for compliance re-audit.</p>
          </div>
        </div>

        {profile?.rejection_reason && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <strong>Compliance Rejection Reason:</strong>
            <p className="mt-0.5 text-[11.5px]">{profile.rejection_reason}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 size={36} className="text-[#0b7a55] mx-auto" />
            <h4 className="text-sm font-bold text-[#0f172a]">Application Resubmitted</h4>
            <p className="text-xs text-[#65717f]">Your status is now Under Review. Compliance will re-audit your submission.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Company Legal Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Contact Person *</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">GSTIN *</label>
                <input
                  type="text"
                  required
                  value={formData.gstNumber}
                  onChange={(e) => handleChange('gstNumber', e.target.value.toUpperCase())}
                  className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs font-mono uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Registered Address *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="h-9 w-full rounded-xl border border-[#d0ded7] px-3 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-10 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <span>Resubmit for Review</span>}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
