import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  User,
  Mail,
  Smartphone,
  MapPin,
  Lock,
  Upload,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import AuthLayout from './AuthLayout.jsx';
import {
  PasswordStrengthMeter,
  OtpInput,
} from '../../components/auth/SecurityWidgets.jsx';

const GST_STATE_MAP = {
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '29': 'Karnataka',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '19': 'West Bengal',
  '06': 'Haryana',
  '09': 'Uttar Pradesh',
};

const SELLER_TYPES = [
  'Primary Synthesis Chemical Manufacturer',
  'Bulk Solvent Refinery & Distiller',
  'Chlor-Alkali & Acid Producer',
  'Bonded Terminal / Port Tank Farm Operator',
  'Authorized Primary Importer / Indentor',
  'Toll Synthesis & Reaction Facility',
];

export default function RegisterSeller() {
  const [step, setStep] = useState(1); // 1: Personal, 2: Company, 3: Documents, 4: Review & OTP, 5: Done
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    contactPerson: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessType: 'Primary Synthesis Chemical Manufacturer',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    address: '',
    city: 'Bharuch',
    state: 'Gujarat',
    pincode: '392015',
    website: '',
    agreeTerms: true,
  });

  // Uploaded Documents state
  const [documents, setDocuments] = useState([
    { type: 'GST_CERTIFICATE', label: 'GST Registration Certificate (Form REG-06) *', file: null, fileName: '', fileUrl: '' },
    { type: 'COMPANY_LICENSE', label: 'Certificate of Incorporation / Factory License *', file: null, fileName: '', fileUrl: '' },
    { type: 'PAN_CARD', label: 'Company PAN Card *', file: null, fileName: '', fileUrl: '' },
    { type: 'ADDRESS_PROOF', label: 'Plant Electricity Bill / GIDC Allotment Letter', file: null, fileName: '', fileUrl: '' },
  ]);
  const [uploadingIdx, setUploadingIdx] = useState(null);

  // Verification state
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('123456');
  const [countdown, setCountdown] = useState(300);

  const detectedState = useMemo(() => {
    const rawGst = (formData.gstNumber || '').trim();
    if (rawGst.length >= 2) {
      const code = rawGst.slice(0, 2);
      return GST_STATE_MAP[code] || null;
    }
    return null;
  }, [formData.gstNumber]);

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'gstNumber') {
        const upper = value.toUpperCase();
        updated.gstNumber = upper;
        if (upper.length >= 2 && GST_STATE_MAP[upper.slice(0, 2)]) {
          updated.state = GST_STATE_MAP[upper.slice(0, 2)];
        }
        if (upper.length >= 12 && !prev.panNumber) {
          updated.panNumber = upper.slice(2, 12);
        }
      }
      return updated;
    });
  };

  const handleFileUpload = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Document file size must be less than 10MB.');
      return;
    }

    try {
      setUploadingIdx(index);
      setError(null);
      const res = await api.uploadDoc(file);
      setDocuments((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          file,
          fileName: file.name,
          fileUrl: res.fileUrl,
        };
        return next;
      });
    } catch (err) {
      setError(err.message || 'Failed to upload document.');
    } finally {
      setUploadingIdx(null);
    }
  };

  // Step 1 -> Step 2
  const handleStep1Submit = (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!formData.contactPerson.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please provide all contact details.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setStep(2);
  };

  // Step 2 -> Step 3
  const handleStep2Submit = (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!formData.companyName.trim() || !formData.gstNumber.trim() || !formData.address.trim()) {
      setError('Please provide company name, valid GSTIN, and manufacturing plant address.');
      return;
    }
    if (formData.gstNumber.trim().length !== 15) {
      setError('GSTIN must be exactly 15 alphanumeric characters.');
      return;
    }
    setStep(3);
  };

  // Step 3 -> Step 4 (Request OTP)
  const handleStep3Submit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Check mandatory documents
    if (!documents[0].file && !documents[0].fileName) {
      setError('Please attach your GST Registration Certificate.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.sendOtp(formData.email.trim(), 'EMAIL_VERIFY');
      setDemoOtp(res?.debugOtp || '123456');
      setCountdown(300);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Unable to dispatch verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 -> Final Submit
  const handleFinalSubmit = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1. Verify OTP
      await api.verifyOtp(formData.email.trim(), otp.trim(), 'EMAIL_VERIFY');

      // 2. Register Seller
      await api.registerSeller({
        fullName: formData.contactPerson.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        businessType: formData.businessType,
        gstNumber: formData.gstNumber.trim().toUpperCase(),
        panNumber: formData.panNumber.trim().toUpperCase() || undefined,
        cinNumber: formData.cinNumber.trim().toUpperCase() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        website: formData.website.trim() || undefined,
        password: formData.password,
        documents: documents
          .filter((d) => d.fileUrl)
          .map((d) => ({ type: d.type, fileUrl: d.fileUrl, name: d.fileName })),
      });

      setStep(5);
    } catch (err) {
      setError(err.message || 'Onboarding submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 5 ? 'Application Submitted' : 'Chemical Supplier & Plant Onboarding'}
      subtitle={
        step === 5
          ? 'Your corporate dossier has been submitted to the compliance desk.'
          : 'List verified chemical allocations, receive structured RFQs, and settle transactions with escrow protection.'
      }
    >
      {/* 4-Step Progress Bar */}
      {step < 5 && (
        <div className="mb-6 flex items-center justify-between border-b border-[#e2e8e5] pb-4">
          {[
            { num: 1, label: 'Contact' },
            { num: 2, label: 'Company' },
            { num: 3, label: 'Certificates' },
            { num: 4, label: 'Verification' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                  step > s.num
                    ? 'bg-[#0b7a55] text-white'
                    : step === s.num
                    ? 'bg-[#0b7a55] text-white ring-4 ring-[#0b7a55]/20'
                    : 'bg-[#e2e8e5] text-[#65717f]'
                }`}
              >
                {step > s.num ? <Check size={12} strokeWidth={3} /> : s.num}
              </span>
              <span
                className={`text-[11.5px] font-semibold ${
                  step >= s.num ? 'text-[#0f172a]' : 'text-[#94a3b8]'
                } hidden sm:inline`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2 shadow-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Personal / Contact Information */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Authorized Representative / Contact Person *
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="e.g. Rajesh Patel (Head of Sales / Director)"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Corporate Email Address *
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="rajesh@apexsolvents.com"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Direct Mobile Phone *
              </label>
              <div className="relative">
                <Smartphone size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="9825098765"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Create Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Min 8 characters"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Repeat password"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <PasswordStrengthMeter password={formData.password} />

          <button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] shadow-md flex items-center justify-center gap-2 mt-4"
          >
            <span>Proceed to Company Information</span>
            <ArrowRight size={14} />
          </button>
        </form>
      )}

      {/* STEP 2: Company Information */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Legal Company Name *
            </label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="e.g. Apex Solvents & Petrochemicals Pvt Ltd"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Supplier Business Classification *
            </label>
            <select
              value={formData.businessType}
              onChange={(e) => handleChange('businessType', e.target.value)}
              className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
            >
              {SELLER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company GSTIN (15 Digits) *
              </label>
              <input
                type="text"
                required
                maxLength={15}
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="24AAACA0000A1Z5"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
              {detectedState && (
                <span className="text-[10.5px] font-semibold text-[#0b7a55] block mt-0.5">
                  Jurisdiction: {detectedState}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company PAN Number
              </label>
              <input
                type="text"
                maxLength={10}
                value={formData.panNumber}
                onChange={(e) => handleChange('panNumber', e.target.value)}
                placeholder="AAACA0000A"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                CIN / LLPIN (Where applicable)
              </label>
              <input
                type="text"
                value={formData.cinNumber}
                onChange={(e) => handleChange('cinNumber', e.target.value)}
                placeholder="U24110GJ2015PTC082910"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company Website (Optional)
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://apexsolvents.com"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Registered Plant / Warehouse Dispatch Address *
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Plot 18/B, Dahej PCPIR Petrochemical Complex"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Pincode *</label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-11 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666] hover:bg-[#f8faf9]"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] shadow-md flex items-center justify-center gap-2"
            >
              <span>Proceed to Document Uploads</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Business Verification Documents */}
      {step === 3 && (
        <form onSubmit={handleStep3Submit} className="space-y-4 text-xs">
          <div className="rounded-xl border border-[#0b7a55]/25 bg-[#e4f2ec] p-3 text-xs text-[#0b7a55]">
            <div className="font-bold text-[#08603f] flex items-center gap-1.5 mb-0.5">
              <ShieldCheck size={16} />
              <span>Institutional Verification Protocol</span>
            </div>
            <p className="text-[#4a5666]">
              All suppliers undergo strict compliance audit before chemical inventory is published to institutional buyers. Upload clean PDF / image certificates.
            </p>
          </div>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={doc.type}
                className="rounded-xl border border-[#d0ded7] p-3.5 bg-white shadow-xs transition-all hover:border-[#0b7a55]/50"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-[#0f172a]">{doc.label}</span>
                  {doc.fileName ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0b7a55]">
                      <CheckCircle2 size={13} /> Attached
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#94a3b8]">Required</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer flex items-center justify-between rounded-lg border border-dashed border-[#a7f3d0] bg-[#f8faf9] px-3 py-2 text-xs hover:bg-[#f0fdf4] transition-colors">
                    <span className="text-[#65717f] truncate">
                      {uploadingIdx === idx
                        ? 'Uploading document to server…'
                        : doc.fileName || 'Click to select PDF or image document (max 10MB)'}
                    </span>
                    {uploadingIdx === idx ? (
                      <RefreshCw size={14} className="text-[#0b7a55] shrink-0 ml-2 animate-spin" />
                    ) : (
                      <Upload size={14} className="text-[#0b7a55] shrink-0 ml-2" />
                    )}
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      disabled={uploadingIdx !== null}
                      onChange={(e) => handleFileUpload(idx, e)}
                      className="hidden"
                    />
                  </label>
                  {doc.fileName && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...documents];
                        next[idx] = { ...next[idx], file: null, fileName: '', fileUrl: '' };
                        setDocuments(next);
                      }}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="h-11 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666] hover:bg-[#f8faf9]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Proceed to Verification</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Email Verification Code & Submission */}
      {step === 4 && (
        <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in duration-200 text-xs">
          <div className="rounded-xl border border-[#0b7a55]/25 bg-[#e4f2ec] p-4 text-[#0b7a55]">
            <div className="font-bold text-[#08603f] flex items-center gap-1.5 mb-1 text-[13px]">
              <ShieldCheck size={18} />
              <span>Verify Corporate Contact</span>
            </div>
            <p className="text-[#4a5666] leading-relaxed">
              We sent a 6-digit confirmation security code to <strong className="text-[#0f172a]">{formData.email}</strong>. Enter the code to submit your supplier dossier.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0f172a]">6-Digit Security Code</span>
              <span className="font-mono text-[#65717f] text-[11px] flex items-center gap-1">
                <Clock size={12} /> {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />

            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#f8faf9] p-2 border border-[#e2e8e5]">
              <span className="text-[11px] font-semibold text-[#65717f]">
                Demo Verification Code: <strong className="font-mono text-[#0b7a55]">{demoOtp}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtp(demoOtp)}
                className="rounded bg-[#0b7a55] px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-[#08603f]"
              >
                Auto-Fill
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="h-11 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666] hover:bg-[#f8faf9]"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="flex-1 h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Submit Supplier Application</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 5: Submission Success & Compliance Status Notice */}
      {step === 5 && (
        <div className="py-6 text-center space-y-4 animate-in fade-in duration-300">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#e4f2ec] text-[#0b7a55] shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-extrabold text-[#0f172a]">
            Application Under Compliance Review
          </h3>
          <p className="text-xs text-[#4a5666] max-w-md mx-auto leading-relaxed">
            Your supplier profile for <strong>{formData.companyName}</strong> has been created.
            Your verification status is currently <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Pending Review</span>.
            Our compliance team audits submitted GSTIN and plant certificates within 24 business hours.
          </p>

          <div className="pt-3">
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#0b7a55] text-white text-xs font-bold hover:bg-[#08603f] shadow-md"
            >
              <span>Sign In to Supplier Workspace</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-[#edf2ef] pt-4 text-center text-xs text-[#65717f]">
        Looking to buy chemicals instead?{' '}
        <Link to="/register" className="font-bold text-[#0b7a55] hover:underline">
          Register as Buyer
        </Link>
      </div>
    </AuthLayout>
  );
}
