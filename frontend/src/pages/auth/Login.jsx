import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Lock,
  Smartphone,
  Mail,
  CheckCircle2,
} from 'lucide-react';
import { ROLE_HOME, useAuth } from '../../lib/auth.jsx';
import { api } from '../../lib/api.js';
import AuthLayout from './AuthLayout.jsx';
import {
  ForgotPasswordModal,
  OtpInput,
} from '../../components/auth/SecurityWidgets.jsx';

const DEMO_ACCOUNTS = [
  { label: 'Super Admin', email: 'admin@ctech.com', password: 'Admin@12345', badge: 'Trader Desk (2FA Enforced)' },
  { label: 'Chemical Seller', email: 'seller@ctech.com', password: 'Seller@12345', badge: 'Bharuch Synthesis Plant' },
  { label: 'Industrial Buyer', email: 'buyer@ctech.com', password: 'Buyer@12345', badge: 'Surat Pharma Plant' },
];

export default function Login() {
  const { user, login, complete2Fa } = useAuth();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // 2FA Challenge State
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [totpCode, setTotpCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Modals
  const [forgotOpen, setForgotOpen] = useState(false);

  if (user) return <Navigate to={location.state?.from ?? ROLE_HOME[user.role]} replace />;

  const handleSelectDemo = (d) => {
    setIdentifier(d.email);
    setPassword(d.password);
    setError(null);
    setTwoFactorData(null);
  };

  const handleDirectLogin = async (e) => {
    if (e) e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please provide your registered email/mobile and password.');
      return;
    }

    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await login(identifier.trim(), password);

      // Check if 2FA challenge is required by server
      if (res && res.requires2FA) {
        setTwoFactorData(res);
        setTotpCode('');
        setBackupCode('');
        setUseBackupCode(false);
        setResendCooldown(60);
      }
    } catch (err) {
      setError(err.message || 'Invalid email, mobile number or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2Fa = async (e) => {
    if (e) e.preventDefault();
    if (!twoFactorData) return;

    if (!useBackupCode && totpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }
    if (useBackupCode && !backupCode.trim()) {
      setError('Please enter a valid backup recovery code.');
      return;
    }

    setError(null);
    setTwoFactorLoading(true);

    try {
      await complete2Fa({
        tempToken: twoFactorData.tempToken,
        code: useBackupCode ? undefined : totpCode.trim(),
        backupCode: useBackupCode ? backupCode.trim() : undefined,
      });
    } catch (err) {
      setError(err.message || 'Two-factor verification failed. Please try again.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !twoFactorData?.email) return;
    try {
      await api.sendOtp(twoFactorData.email, 'LOGIN_2FA');
      setResendCooldown(60);
      setSuccessMsg(`A new verification code has been sent to ${twoFactorData.email}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout
      title={twoFactorData ? 'Identity Verification' : 'Sign In to Trade Desk'}
      subtitle={
        twoFactorData
          ? 'Confirm your identity before accessing trade ledgers and confidential chemical pricing.'
          : 'Access your verified chemical supplier or buyer account.'
      }
    >
      {/* Success Notification */}
      {successMsg && (
        <div className="mb-5 rounded-xl border border-emerald-200 bg-[#e4f2ec] p-3 text-xs text-[#0b7a55] flex items-start gap-2 shadow-xs">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#0b7a55]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-start gap-2 shadow-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* ---------------- 2FA Challenge View ---------------- */}
      {twoFactorData ? (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="rounded-xl border border-[#0b7a55]/25 bg-[#e4f2ec] p-4 text-xs text-[#0b7a55]">
            <div className="font-bold text-[#08603f] flex items-center gap-1.5 mb-1 text-[13px]">
              <ShieldCheck size={18} />
              <span>Two-Factor Authentication Enforced</span>
            </div>
            <p className="text-[#4a5666] leading-relaxed">
              {twoFactorData.twoFactorEnabled
                ? 'Enter the 6-digit code from your Authenticator app (Google Authenticator, Authy, or Microsoft Authenticator).'
                : `A 6-digit verification code was sent to ${twoFactorData.email}.`}
            </p>
          </div>

          <form onSubmit={handleVerify2Fa} className="space-y-4">
            {!useBackupCode ? (
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-[#0f172a]">6-Digit Security Code</span>
                  {twoFactorData.email && (
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className="font-bold text-[#0b7a55] hover:underline text-[11px] disabled:text-[#94a3b8]"
                    >
                      {resendCooldown > 0 ? `Resend Email code (${resendCooldown}s)` : 'Send Email OTP'}
                    </button>
                  )}
                </div>

                <OtpInput
                  value={totpCode}
                  onChange={setTotpCode}
                  length={6}
                  disabled={twoFactorLoading}
                />

                <div className="mt-3 flex items-center justify-between rounded-lg bg-[#f8faf9] p-2 text-xs border border-[#e2e8e5]">
                  <span className="text-[11px] font-semibold text-[#65717f]">
                    Demo Sandbox Code: <strong className="font-mono text-[#0b7a55]">123456</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => setTotpCode('123456')}
                    className="rounded bg-[#0b7a55] px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-[#08603f]"
                  >
                    Fill Code
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
                  Backup Recovery Code (e.g. 4F2A-8E1B)
                </label>
                <input
                  type="text"
                  autoFocus
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
                  placeholder="XXXX-XXXX"
                  className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white px-3 font-mono text-sm tracking-wider uppercase text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
                />
                <span className="text-[11px] text-[#65717f] block mt-1">
                  Enter one of the 8 recovery backup codes issued during 2FA setup.
                </span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setUseBackupCode(!useBackupCode)}
                className="text-xs font-semibold text-[#0b7a55] hover:underline"
              >
                {useBackupCode ? 'Use Authenticator Code instead' : 'Use a Backup Recovery Code'}
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTwoFactorData(null);
                  setError(null);
                }}
                className="h-11 px-4 rounded-xl border border-[#d0ded7] text-xs font-semibold text-[#4a5666] hover:bg-[#f8faf9]"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={twoFactorLoading || (!useBackupCode && totpCode.length < 6) || (useBackupCode && !backupCode.trim())}
                className="flex-1 h-11 rounded-xl bg-[#0b7a55] text-white text-xs font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
              >
                {twoFactorLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <>
                    <span>Verify & Enter Workspace</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ---------------- Standard Credentials Form ---------------- */
        <form onSubmit={handleDirectLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0f172a] mb-1.5">
              Email Address or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-[#65717f]">
                {identifier.includes('@') ? <Mail size={16} /> : <Smartphone size={16} />}
              </div>
              <input
                type="text"
                required
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="name@company.com or 10-digit mobile"
                className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white pl-10 pr-3 text-xs text-[#0f172a] shadow-xs focus:border-[#0b7a55] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#0f172a]">Account Password</label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs font-semibold text-[#0b7a55] hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-[#65717f]">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-11 w-full rounded-xl border border-[#d0ded7] bg-white pl-10 pr-10 text-xs text-[#0f172a] shadow-xs focus:border-[#0b7a55] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#94a3b8] hover:text-[#0f172a]"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#4a5666]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#d0ded7] text-[#0b7a55] focus:ring-[#0b7a55]"
              />
              <span>Remember this workstation</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-[#0b7a55] text-white text-xs font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <>
                <span>Sign In to Trade Desk</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      )}

      {/* ---------------- Registration Link Splitter ---------------- */}
      <div className="mt-6 border-t border-[#edf2ef] pt-5">
        <p className="text-center text-xs text-[#65717f] mb-3">
          New to C-Tech? Choose your account type to register:
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            to="/register"
            className="flex flex-col items-center justify-center rounded-xl border border-[#d0ded7] bg-[#f8faf9] p-2.5 text-center transition-all hover:border-[#0b7a55] hover:bg-white hover:shadow-xs group"
          >
            <span className="text-[12px] font-bold text-[#0f172a] group-hover:text-[#0b7a55]">
              Buyer Registration
            </span>
            <span className="text-[10.5px] text-[#65717f]">Procure chemical lots</span>
          </Link>

          <Link
            to="/register/seller"
            className="flex flex-col items-center justify-center rounded-xl border border-[#d0ded7] bg-[#f8faf9] p-2.5 text-center transition-all hover:border-[#0b7a55] hover:bg-white hover:shadow-xs group"
          >
            <span className="text-[12px] font-bold text-[#0f172a] group-hover:text-[#0b7a55]">
              Seller Onboarding
            </span>
            <span className="text-[10.5px] text-[#65717f]">List products & quote</span>
          </Link>
        </div>
      </div>

      {/* ---------------- 1-Click Sandbox Credentials ---------------- */}
      <div className="mt-6 rounded-2xl border border-[#e2e8e5] bg-[#f8faf9] p-4 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#0f172a] mb-2 text-[12px]">
          <Sparkles size={14} className="text-[#0b7a55]" />
          <span>Demo Role Switcher</span>
        </div>
        <p className="text-[11px] text-[#65717f] mb-3 leading-relaxed">
          Click any role to load test credentials. All roles execute against the live PostgreSQL database.
        </p>
        <div className="grid grid-cols-1 gap-1.5">
          {DEMO_ACCOUNTS.map((d) => (
            <button
              key={d.label}
              type="button"
              onClick={() => handleSelectDemo(d)}
              className="flex items-center justify-between rounded-lg border border-[#e2e8e5] bg-white px-3 py-2 text-left hover:border-[#0b7a55] hover:bg-[#f0fdf4] transition-all"
            >
              <div>
                <span className="font-bold text-[#0f172a] block text-[11.5px]">{d.label}</span>
                <span className="font-mono text-[10px] text-[#65717f]">{d.email}</span>
              </div>
              <span className="rounded bg-[#e4f2ec] px-2 py-0.5 font-mono text-[9.5px] font-bold text-[#0b7a55]">
                {d.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ---------------- Forgot Password Modal ---------------- */}
      <ForgotPasswordModal
        isOpen={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={identifier.includes('@') ? identifier : ''}
        onPasswordResetSuccess={(email) => {
          setForgotOpen(false);
          setSuccessMsg('Your password has been successfully reset. Please sign in with your new password.');
          setIdentifier(email);
        }}
      />
    </AuthLayout>
  );
}
