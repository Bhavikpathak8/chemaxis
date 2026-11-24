import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Building2,
  User,
  Mail,
  Smartphone,
  MapPin,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Clock,
  Check,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
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

const BUSINESS_TYPES = [
  'Pharmaceutical & API Synthesis',
  'Agrochemical & Fertilizer Formulation',
  'Specialty Chemicals & Intermediates',
  'Dyes, Inks & Pigment Manufacturing',
  'Paints, Polymers & Coatings',
  'Water & Effluent Neutralization',
  'Textile Processing & Auxiliary',
  'Institutional Chemical Trader / Distributor',
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    businessType: 'Pharmaceutical & API Synthesis',
    gstNumber: '',
    panNumber: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    password: '',
    confirmPassword: '',
    agreeTerms: true,
  });

  const [step, setStep] = useState(1); // 1: Form details, 2: Dual OTP Verification, 3: Success
  const [emailOtp, setEmailOtp] = useState('');
  const [demoEmailOtp, setDemoEmailOtp] = useState('123456');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Auto-detect state from GSTIN
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

  const handleStep1Submit = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    // Validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setError('Please provide your full contact name, business email, and mobile phone.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (!formData.agreeTerms) {
      setError('Please accept the Commercial Terms of Trade and Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      // Trigger Email OTP from backend
      const res = await api.sendOtp(formData.email.trim(), 'EMAIL_VERIFY');
      setDemoEmailOtp(res?.debugOtp || '123456');
      setCountdown(300);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async (e) => {
    if (e) e.preventDefault();
    if (emailOtp.length < 6) {
      setError('Please enter the 6-digit email verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Verify Email OTP with backend
      await api.verifyOtp(formData.email.trim(), emailOtp.trim(), 'EMAIL_VERIFY');

      // 2. Submit complete buyer registration
      await api.registerBuyer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        companyName: formData.companyName.trim(),
        businessType: formData.businessType,
        gstNumber: formData.gstNumber.trim().toUpperCase() || undefined,
        panNumber: formData.panNumber.trim().toUpperCase() || undefined,
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        password: formData.password,
      });

      setStep(3);

      // Auto login buyer after 2 seconds
      setTimeout(async () => {
        try {
          await login(formData.email.trim(), formData.password);
          navigate('/buyer');
        } catch {
          navigate('/login');
        }
      }, 2500);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={step === 2 ? 'Verify Corporate Contacts' : 'Industrial Buyer Registration'}
      subtitle={
        step === 2
          ? 'Enter the verification security codes to activate your buyer account.'
          : 'Connect your manufacturing plant to verified chemical synthesis mills and refinery terminals.'
      }
    >
      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-between border-b border-[#e2e8e5] pb-4">
        {[
          { num: 1, label: 'Plant & Contact' },
          { num: 2, label: 'Identity Verification' },
          { num: 3, label: 'Active Account' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
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
              className={`text-xs font-semibold ${
                step >= s.num ? 'text-[#0f172a]' : 'text-[#94a3b8]'
              } hidden sm:inline`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2 shadow-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Main Registration Form */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Authorized Buyer Name *
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Work Mobile Number *
              </label>
              <div className="relative">
                <Smartphone size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="e.g. 9825012345"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Official Business Email *
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. purchase@suratpharma.com"
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company / Plant Legal Name *
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-3 text-[#65717f]" />
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="e.g. Surat Pharma Synthetics Ltd"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Industrial Industry / Sector *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              >
                {BUSINESS_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company GSTIN (Optional)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="24AAAAA0000A1Z5"
                maxLength={15}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
              {detectedState && (
                <span className="text-[10.5px] font-semibold text-[#0b7a55] block mt-0.5">
                  State detected: {detectedState}
                </span>
              )}
            </div>

            <div>
              <label className="block font-bold text-[#0f172a] mb-1">
                Company PAN Details
              </label>
              <input
                type="text"
                value={formData.panNumber}
                onChange={(e) => handleChange('panNumber', e.target.value)}
                placeholder="ABCDE1234F"
                maxLength={10}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">
              Registered Factory / Office Address *
            </label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3 top-3 text-[#65717f]" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Plot No. 42, GIDC Industrial Estate, Sachin"
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
                value={formData.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                maxLength={6}
                className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-[#0f172a] mb-1">Password *</label>
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
                  placeholder="Re-enter password"
                  className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white pl-9 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <PasswordStrengthMeter password={formData.password} />

          <div className="pt-2">
            <label className="flex items-start gap-2 cursor-pointer text-[#4a5666]">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                className="mt-0.5 rounded border-[#d0ded7] text-[#0b7a55] focus:ring-[#0b7a55]"
              />
              <span className="leading-tight text-[11.5px]">
                I agree to the Commercial Terms of Trade, HazMat freight protocols, and Privacy Policy of C-Tech.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>Continue to Verification</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}

      {/* STEP 2: Dual OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyAndRegister} className="space-y-5 animate-in fade-in duration-200 text-xs">
          <div className="rounded-xl border border-[#0b7a55]/25 bg-[#e4f2ec] p-4 text-[#0b7a55]">
            <div className="font-bold text-[#08603f] flex items-center gap-1.5 mb-1 text-[13px]">
              <ShieldCheck size={18} />
              <span>Two-Way Corporate Contact Verification</span>
            </div>
            <p className="text-[#4a5666] leading-relaxed">
              We dispatched a 6-digit verification code to your email <strong className="text-[#0f172a]">{formData.email}</strong> and mobile SMS <strong className="text-[#0f172a]">{formData.phone}</strong>.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0f172a]">Email Verification Code (6 Digits)</span>
              <span className="font-mono text-[#65717f] text-[11px] flex items-center gap-1">
                <Clock size={12} /> {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <OtpInput value={emailOtp} onChange={setEmailOtp} length={6} disabled={loading} />

            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-[#f8faf9] p-2 border border-[#e2e8e5]">
              <span className="text-[11px] font-semibold text-[#65717f]">
                Demo Email Code: <strong className="font-mono text-[#0b7a55]">{demoEmailOtp}</strong>
              </span>
              <button
                type="button"
                onClick={() => setEmailOtp(demoEmailOtp)}
                className="rounded bg-[#0b7a55] px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-[#08603f]"
              >
                Auto-Fill
              </button>
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
              disabled={loading || emailOtp.length < 6}
              className="flex-1 h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <>
                  <span>Activate Buyer Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: Complete / Redirecting */}
      {step === 3 && (
        <div className="py-8 text-center space-y-4 animate-in fade-in duration-300">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-[#e4f2ec] text-[#0b7a55] shadow-xs">
            <CheckCircle2 size={36} />
          </div>
          <h3 className="text-xl font-extrabold text-[#0f172a]">
            Buyer Account Verified & Active
          </h3>
          <p className="text-xs text-[#4a5666] max-w-sm mx-auto leading-relaxed">
            Welcome to C-Tech. Your corporate account for <strong>{formData.companyName}</strong> has been registered on the trade ledger. Redirecting you to your Buyer Workspace...
          </p>
          <div className="flex justify-center pt-2">
            <RefreshCw size={18} className="animate-spin text-[#0b7a55]" />
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-[#edf2ef] pt-4 text-center text-xs text-[#65717f]">
        Already have a registered account?{' '}
        <Link to="/login" className="font-bold text-[#0b7a55] hover:underline">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
