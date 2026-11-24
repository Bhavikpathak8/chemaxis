import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Laptop,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Copy,
  Check,
  Trash2,
  RefreshCw,
  LogOut,
  X,
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import {
  PasswordStrengthMeter,
  OtpInput,
} from '../../components/auth/SecurityWidgets.jsx';

export default function SecuritySettings() {
  const { user, reloadProfile } = useAuth();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(null);

  // 2FA state
  const [twoFaEnabled, setTwoFaEnabled] = useState(Boolean(user?.twoFactorEnabled));
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [setupData, setSetupData] = useState(null); // { secret, qrCodeUrl, uri }
  const [verifyCode, setVerifyCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState(null);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable 2FA state
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState(null);

  // Sessions state
  const [sessions, setSessions] = useState([]);
  const [sessionsMsg, setSessionsMsg] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      // offline fallback
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    if (e) e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('Passwords do not match.');
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPwdSuccess(res.message || 'Password changed successfully. Other active sessions were invalidated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadSessions();
    } catch (err) {
      setPwdError(err.message || 'Unable to update password. Check current password.');
    } finally {
      setPwdLoading(false);
    }
  };

  // Start 2FA Setup
  const handleStart2FaSetup = async () => {
    setTwoFaError(null);
    setTwoFaLoading(true);
    try {
      const data = await api.setup2Fa();
      setSetupData(data);
      setVerifyCode('');
      setBackupCodes([]);
      setSetupModalOpen(true);
    } catch (err) {
      setTwoFaError(err.message || 'Failed to initialize 2FA setup.');
    } finally {
      setTwoFaLoading(false);
    }
  };

  // Confirm 2FA Enable
  const handleConfirmEnable2Fa = async (e) => {
    if (e) e.preventDefault();
    if (verifyCode.length < 6) {
      setTwoFaError('Enter the complete 6-digit authenticator code.');
      return;
    }

    setTwoFaError(null);
    setTwoFaLoading(true);
    try {
      const res = await api.enable2Fa(setupData.secret, verifyCode.trim());
      setBackupCodes(res.backupCodes || []);
      setTwoFaEnabled(true);
      if (reloadProfile) reloadProfile();
    } catch (err) {
      setTwoFaError(err.message || 'Invalid verification code. Please check your authenticator app.');
    } finally {
      setTwoFaLoading(false);
    }
  };

  // Disable 2FA
  const handleDisable2Fa = async (e) => {
    if (e) e.preventDefault();
    setDisableError(null);
    setDisableLoading(true);
    try {
      await api.disable2Fa(disablePassword);
      setTwoFaEnabled(false);
      setDisableModalOpen(false);
      setDisablePassword('');
      if (reloadProfile) reloadProfile();
    } catch (err) {
      setDisableError(err.message || 'Incorrect password.');
    } finally {
      setDisableLoading(false);
    }
  };

  // Revoke session
  const handleRevokeSession = async (id) => {
    try {
      await api.revokeSession(id);
      setSessionsMsg('Workstation session revoked.');
      loadSessions();
    } catch (err) {
      setSessionsMsg(err.message);
    }
  };

  const handleRevokeAllOtherSessions = async () => {
    try {
      await api.revokeOtherSessions();
      setSessionsMsg('All other workstation sessions were logged out.');
      loadSessions();
    } catch (err) {
      setSessionsMsg(err.message);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 3000);
  };

  return (
    <div className="space-y-6 text-[#1b2433]">
      {/* ---------------- 1. Password Security Card ---------------- */}
      <div className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
            <KeyRound size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0f172a]">Account Password</h3>
            <p className="text-xs text-[#65717f]">
              Ensure your account uses an enterprise-grade password.
            </p>
          </div>
        </div>

        {pwdSuccess && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-[#e4f2ec] p-3 text-xs text-[#0b7a55] flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{pwdSuccess}</span>
          </div>
        )}

        {pwdError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{pwdError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="mt-4 space-y-4 max-w-lg text-xs">
          <div>
            <label className="block font-bold text-[#0f172a] mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">New Strong Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
            />
            <PasswordStrengthMeter password={newPassword} />
          </div>

          <div>
            <label className="block font-bold text-[#0f172a] mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="h-10 w-full rounded-xl border border-[#d0ded7] bg-white px-3 text-xs text-[#0f172a] focus:border-[#0b7a55] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={pwdLoading || !newPassword || newPassword !== confirmPassword}
            className="h-10 px-5 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 transition-all shadow-xs flex items-center gap-2"
          >
            {pwdLoading ? <RefreshCw size={14} className="animate-spin" /> : <span>Update Password</span>}
          </button>
        </form>
      </div>

      {/* ---------------- 2. Two-Factor Authentication Card ---------------- */}
      <div className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#0f172a]">Two-Factor Authentication (2FA)</h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                    twoFaEnabled
                      ? 'bg-[#e4f2ec] text-[#0b7a55] border border-[#0b7a55]/20'
                      : 'bg-slate-100 text-[#65717f]'
                  }`}
                >
                  {twoFaEnabled ? 'Enabled & Active' : 'Not Configured'}
                </span>
              </div>
              <p className="text-xs text-[#65717f] mt-0.5">
                Protect order confirmations and settlement authorizations with time-based OTP (RFC 6238).
              </p>
            </div>
          </div>

          <div>
            {twoFaEnabled ? (
              <button
                type="button"
                onClick={() => setDisableModalOpen(true)}
                className="h-9 px-4 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
              >
                Disable 2FA
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart2FaSetup}
                disabled={twoFaLoading}
                className="h-9 px-4 rounded-xl bg-[#0b7a55] text-white text-xs font-bold hover:bg-[#08603f] transition-all shadow-xs flex items-center gap-1.5"
              >
                {twoFaLoading ? <RefreshCw size={13} className="animate-spin" /> : <QrCode size={14} />}
                <span>Setup Authenticator App</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- 3. Active Sessions Card ---------------- */}
      <div className="rounded-2xl border border-[#e2e8e5] bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e4f2ec] text-[#0b7a55]">
              <Laptop size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0f172a]">Active Workstation Sessions</h3>
              <p className="text-xs text-[#65717f]">
                Manage devices currently authorized to access your trade records.
              </p>
            </div>
          </div>

          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleRevokeAllOtherSessions}
              className="h-8 px-3 rounded-lg border border-[#e2e8e5] text-xs font-bold text-[#4a5666] hover:bg-[#f8faf9] flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>Sign Out Other Devices</span>
            </button>
          )}
        </div>

        {sessionsMsg && (
          <div className="mb-3 rounded-lg bg-[#f8faf9] p-2 text-xs text-[#0b7a55] font-semibold border border-[#e2e8e5]">
            {sessionsMsg}
          </div>
        )}

        <div className="divide-y divide-[#edf2ef] border border-[#e2e8e5] rounded-xl overflow-hidden text-xs">
          {sessions.length > 0 ? (
            sessions.map((sess, idx) => (
              <div key={sess.id || idx} className="p-3.5 flex items-center justify-between hover:bg-[#f8faf9]">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <Laptop size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0f172a]">{sess.device_name || 'Terminal Session'}</span>
                      {idx === 0 && (
                        <span className="bg-[#e4f2ec] text-[#0b7a55] px-2 py-0.5 rounded text-[10px] font-bold">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-[#65717f] text-[11px] mt-0.5 font-mono">
                      IP: {sess.ip_address || '127.0.0.1'} • Last active:{' '}
                      {new Date(sess.last_active).toLocaleDateString()}{' '}
                      {new Date(sess.last_active).toLocaleTimeString()}
                    </div>
                  </div>
                </div>

                {idx !== 0 && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1.5 text-[#94a3b8] hover:text-red-600 rounded"
                    title="Revoke session"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-[#65717f] text-xs">
              Current browser workstation session active.
            </div>
          )}
        </div>
      </div>

      {/* ---------------- 2FA Setup Modal ---------------- */}
      {setupModalOpen && setupData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8e5] text-xs">
            <button
              onClick={() => setSetupModalOpen(false)}
              className="absolute right-4 top-4 text-[#65717f] hover:text-[#0f172a]"
            >
              <X size={18} />
            </button>

            {backupCodes.length === 0 ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55]">
                    <QrCode size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0f172a]">Configure Authenticator App</h3>
                    <p className="text-[11px] text-[#65717f]">Scan the QR code in Google Authenticator or Authy.</p>
                  </div>
                </div>

                {twoFaError && (
                  <div className="mb-3 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                    {twoFaError}
                  </div>
                )}

                {/* QR Code Display */}
                <div className="my-4 flex flex-col items-center justify-center rounded-xl border border-[#d0ded7] bg-[#f8faf9] p-4">
                  <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="h-44 w-44 rounded-lg shadow-xs" />
                  <div className="mt-3 text-center">
                    <span className="text-[11px] text-[#65717f] block mb-1">Or enter manual key:</span>
                    <span className="font-mono text-xs font-bold text-[#0f172a] bg-white px-2.5 py-1 rounded border border-[#d0ded7] select-all">
                      {setupData.secret}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleConfirmEnable2Fa} className="space-y-3">
                  <div>
                    <label className="block font-bold text-[#0f172a] mb-1.5">
                      Enter 6-Digit Code from App to Verify:
                    </label>
                    <OtpInput value={verifyCode} onChange={setVerifyCode} length={6} disabled={twoFaLoading} />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSetupModalOpen(false)}
                      className="h-10 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={twoFaLoading || verifyCode.length < 6}
                      className="flex-1 h-10 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f] disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
                    >
                      {twoFaLoading ? <RefreshCw size={14} className="animate-spin" /> : <span>Verify & Activate 2FA</span>}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              /* Backup Codes Display */
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55]">
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#0f172a]">Save Your Backup Codes</h3>
                    <p className="text-[11px] text-[#65717f]">Keep these 8 codes in a secure location.</p>
                  </div>
                </div>

                <p className="text-[11px] text-[#4a5666] leading-relaxed">
                  If you ever lose access to your authenticator device, each recovery code can be used once to access your account.
                </p>

                <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f8faf9] p-3 border border-[#d0ded7]">
                  {backupCodes.map((code, idx) => (
                    <div key={idx} className="font-mono text-xs font-bold text-[#0f172a] bg-white p-1.5 rounded border border-[#e2e8e5] text-center">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={copyBackupCodes}
                    className="flex-1 h-10 rounded-xl border border-[#0b7a55] text-[#0b7a55] font-bold hover:bg-[#f0fdf4] flex items-center justify-center gap-1.5"
                  >
                    {copiedCodes ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCodes ? 'Copied Codes!' : 'Copy All Codes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSetupModalOpen(false)}
                    className="flex-1 h-10 rounded-xl bg-[#0b7a55] text-white font-bold hover:bg-[#08603f]"
                  >
                    Done & Saved
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Disable 2FA Modal ---------------- */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-[#e2e8e5] text-xs">
            <h3 className="text-sm font-bold text-[#0f172a]">Disable Two-Factor Authentication</h3>
            <p className="text-xs text-[#65717f] mt-1 mb-4">
              Enter your current account password to confirm removing two-factor protection.
            </p>

            {disableError && (
              <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700 border border-red-200">
                {disableError}
              </div>
            )}

            <form onSubmit={handleDisable2Fa} className="space-y-4">
              <div>
                <label className="block font-bold text-[#0f172a] mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#d0ded7] px-3 text-xs"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="h-10 px-4 rounded-xl border border-[#d0ded7] font-semibold text-[#4a5666]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={disableLoading || !disablePassword}
                  className="flex-1 h-10 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  {disableLoading ? <RefreshCw size={14} className="animate-spin" /> : <span>Confirm Disable</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
