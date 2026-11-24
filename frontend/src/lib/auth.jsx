import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearCaches, getSession, onAuthChange, setSession } from './api.js';

const AuthCtx = createContext(null);

export const ROLE_HOME = { SELLER: '/seller', BUYER: '/buyer', TRADER_STAFF: '/admin', SUPER_ADMIN: '/admin' };
export const isStaff = (role) => role === 'TRADER_STAFF' || role === 'SUPER_ADMIN';

export function AuthProvider({ children }) {
  const [session, setSess] = useState(getSession());
  const [profile, setProfile] = useState(null); // seller/buyer company record (carries verification status)
  const [ready, setReady] = useState(false);

  useEffect(() => onAuthChange(setSess), []);

  const loadProfile = useCallback(async (role) => {
    if (role === 'SELLER') return api.get('/sellers/me');
    if (role === 'BUYER') return api.get('/buyers/me');
    return null;
  }, []);

  // On first load, confirm the stored session is still valid (and that the
  // account hasn't been banned since). Offline, trust the stored session.
  useEffect(() => {
    let alive = true;
    (async () => {
      const s = getSession();
      if (!s) { setReady(true); return; }
      try {
        await api.get('/auth/me');
        const p = await loadProfile(s.user.role);
        if (alive) setProfile(p);
      } catch (err) {
        if (!err.offline && alive) setSession(null);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => { alive = false; };
  }, [loadProfile]);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    if (res.requires2FA) {
      return res; // Return 2FA requirement to caller
    }
    setSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
    setProfile(await loadProfile(res.user.role).catch(() => null));
    return res.user;
  }, [loadProfile]);

  const complete2Fa = useCallback(async ({ tempToken, code, backupCode }) => {
    const res = await api.login2Fa({ tempToken, code, backupCode });
    setSession({ accessToken: res.accessToken, refreshToken: res.refreshToken, user: res.user });
    setProfile(await loadProfile(res.user.role).catch(() => null));
    return res.user;
  }, [loadProfile]);

  const logout = useCallback(() => {
    clearCaches();
    setProfile(null);
    setSession(null);
  }, []);

  const reloadProfile = useCallback(async () => {
    const s = getSession();
    if (s) setProfile(await loadProfile(s.user.role).catch(() => null));
  }, [loadProfile]);

  const value = useMemo(() => ({
    user: session?.user ?? null, profile, ready, login, complete2Fa, logout, reloadProfile,
  }), [session, profile, ready, login, complete2Fa, logout, reloadProfile]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
