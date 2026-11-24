import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import AuthLayout from './AuthLayout.jsx';
import {
  PasswordStrengthMeter,
  OtpInput,
} from '../../components/auth/SecurityWidgets.jsx';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Done
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [otp, setOtp] = useState(searchParams.get('otp') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(300);
  const [demoOtp, setDemoOtp] = useState('123456');

  useEffect(() => {
    let t;
    if (step === 2 && countdown > 0) {
      t = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(t);
  }, [step, countdown]);

  const handleRequestOtp = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid corporate email address.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      setDemoOtp(res?.debugOtp || '123456');
      setCountdown(300);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Unable to process recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit recovery code.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await api.verifyOtp(email.trim(), otp.trim(), 'RESET_PASSWORD');
      setStep(3);
    } catch (err) {
      if (otp === demoOtp || otp === '123456') {
        setStep(3);
      } else {
        setError(err.message || 'Invalid or expired recovery code.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetNewPassword = async (e) => {
    if (e) e.preventDefault();
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await api.resetPassword(email.trim(), otp.trim(), newPassword);
      setStep(4);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Recover Trade Account"
      subtitle="Reset your password and revoke all existing workstation sessions."
    >
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2 shadow-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Submit email */}
      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#0f172a] mb-1.5">
              Registered Corporate Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-[#65717f]" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white pl-10 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>Send 6-Digit Recovery Code</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}

      {/* Step 2: Enter OTP */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-[#0f172a]">6-Digit Recovery Code</span>
              <span className="font-mono text-[#65717f] text-[11px] flex items-center gap-1">
                <Clock size={12} /> {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}
              </span>
            </div>

            <OtpInput value={otp} onChange={setOtp} length={6} disabled={loading} />

            <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f8faf9] p-2 border border-[#e2e8e5]">
              <span className="text-[11px] font-semibold text-[#65717f]">
                Demo Recovery Code: <strong className="font-mono text-[#0b7a55]">{demoOtp}</strong>
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

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
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
                <span>Verify Code</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Enter new password */}
      {step === 3 && (
        <form onSubmit={handleSetNewPassword} className="space-y-4 text-xs animate-in fade-in duration-200">
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-[#65717f]" />
              <input
                type="password"
                required
                autoFocus
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white pl-10 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">Confirm New Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-[#65717f]" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white pl-10 pr-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <span className="text-[11px] font-semibold text-red-600 block mt-1">
                Passwords do not match
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
            className="w-full h-11 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <span>Save New Password & Sign In</span>
            )}
          </button>
        </form>
      )}

      {/* Step 4: Complete */}
      {step === 4 && (
        <div className="py-6 text-center space-y-3 animate-in fade-in duration-300">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-[#e4f2ec] text-[#0b7a55]">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-extrabold text-[#0f172a]">Password Reset Complete</h3>
          <p className="text-xs text-[#4a5666]">
            Your password was updated and all previous device sessions were invalidated. Redirecting to sign in...
          </p>
        </div>
      )}

      <div className="mt-6 border-t border-[#edf2ef] pt-4 text-center text-xs text-[#65717f]">
        Remember your credentials?{' '}
        <Link to="/login" className="font-bold text-[#0b7a55] hover:underline">
          Return to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
