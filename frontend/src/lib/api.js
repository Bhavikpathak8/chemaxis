import { store } from './store.js';

const BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';

export class ApiError extends Error {
  constructor(message, status = 0, offline = false) {
    super(message);
    this.status = status;
    this.offline = offline;
  }
}

// ---- session ---------------------------------------------------------------
let session = store.get('auth'); // { accessToken, refreshToken, user }
const authListeners = new Set();
const emitAuth = () => authListeners.forEach((fn) => fn(session));

export const getSession = () => session;
export const onAuthChange = (fn) => { authListeners.add(fn); return () => authListeners.delete(fn); };

export function setSession(next) {
  session = next;
  if (next) store.set('auth', next); else store.remove('auth');
  emitAuth();
}

// ---- connectivity ------------------------------------------------------------
// When the server can't be reached, GETs fall back to the last copy saved in
// localStorage and the UI shows an offline banner. Writes are never queued:
// money and stock changes must reach the server, or fail loudly.
const net = { offline: false };
const netListeners = new Set();
let pingTimer = null;
export const onNetChange = (fn) => { netListeners.add(fn); return () => netListeners.delete(fn); };
export const isOffline = () => net.offline;

function setOffline(value) {
  if (net.offline === value) return;
  net.offline = value;
  netListeners.forEach((fn) => fn(value));
  if (value && !pingTimer) {
    pingTimer = setInterval(async () => {
      try {
        const r = await fetch(`${BASE}/health`, { cache: 'no-store' });
        if (r.ok) { clearInterval(pingTimer); pingTimer = null; setOffline(false); }
      } catch { /* still offline */ }
    }, 10000);
  }
}

// ---- core request --------------------------------------------------------------
let refreshing = null;
async function refreshTokens() {
  if (!session?.refreshToken) throw new ApiError('Session expired', 401);
  if (!refreshing) {
    refreshing = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    })
      .then(async (r) => {
        if (!r.ok) throw new ApiError('Session expired', 401);
        const j = await r.json();
        setSession({ ...session, accessToken: j.accessToken, refreshToken: j.refreshToken ?? session.refreshToken });
      })
      .finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function send(path, { method = 'GET', body, form, auth = true, retry = true } = {}) {
  const headers = {};
  if (auth && session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    const fetchOptions = { method, headers };
    if (method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = form ?? (body !== undefined ? JSON.stringify(body) : undefined);
    }
    res = await fetch(`${BASE}${path}`, fetchOptions);
  } catch {
    setOffline(true);
    throw new ApiError("Can't reach the server. Check your connection and try again.", 0, true);
  }
  setOffline(false);

  if (res.status === 401 && auth && retry && session?.refreshToken && !path.startsWith('/auth/')) {
    try {
      await refreshTokens();
    } catch {
      setSession(null);
      throw new ApiError('Your session has expired. Sign in again.', 401);
    }
    return send(path, { method, body, form, auth, retry: false });
  }
  return res;
}

async function parse(res) {
  const ct = res.headers.get('content-type') || '';
  const data = ct.includes('json') ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    if (res.status === 401 && session) setSession(null);
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

const cacheKey = (path) => `cache:${session?.user?.id ?? 'anon'}:${path}`;

export const api = {
  async get(path) {
    return (await api.getMeta(path)).data;
  },
  // Returns { data, stale } — stale is the save time (ms) when the server was
  // unreachable and the last locally saved copy was used instead.
  async getMeta(path) {
    try {
      const data = await parse(await send(path));
      store.set(cacheKey(path), { at: Date.now(), data });
      return { data, stale: null };
    } catch (err) {
      if (err.offline) {
        const hit = store.get(cacheKey(path));
        if (hit) return { data: hit.data, stale: hit.at };
      }
      throw err;
    }
  },
  post: async (path, body) => parse(await send(path, { method: 'POST', body: body ?? {} })),
  patch: async (path, body) => parse(await send(path, { method: 'PATCH', body: body ?? {} })),
  del: async (path) => parse(await send(path, { method: 'DELETE' })),
  upload: async (path, file) => {
    const form = new FormData();
    form.append('file', file);
    return parse(await send(path, { method: 'POST', form }));
  },
  login: async (email, password) => parse(await send('/auth/login', { method: 'POST', body: { email, password }, auth: false })),
  login2Fa: async (body) => parse(await send('/auth/login/2fa', { method: 'POST', body, auth: false })),
  register: async (body) => parse(await send('/auth/register', { method: 'POST', body, auth: false })),
  registerBuyer: async (body) => parse(await send('/auth/register/buyer', { method: 'POST', body, auth: false })),
  registerSeller: async (body) => parse(await send('/auth/register/seller', { method: 'POST', body, auth: false })),
  resubmitSeller: async (body) => parse(await send('/sellers/me/resubmit', { method: 'POST', body })),
  forgotPassword: async (email) => parse(await send('/auth/forgot-password', { method: 'POST', body: { email }, auth: false })),
  resetPassword: async (email, otp, newPassword) => parse(await send('/auth/reset-password', { method: 'POST', body: { email, otp, newPassword }, auth: false })),
  sendOtp: async (identifier, purpose = 'EMAIL_VERIFY') => parse(await send('/auth/send-otp', { method: 'POST', body: { identifier, email: identifier, purpose }, auth: false })),
  verifyOtp: async (identifier, otp, purpose = 'EMAIL_VERIFY') => parse(await send('/auth/verify-otp', { method: 'POST', body: { identifier, email: identifier, otp, purpose }, auth: false })),
  changePassword: async (currentPassword, newPassword) => parse(await send('/auth/change-password', { method: 'POST', body: { currentPassword, newPassword } })),
  setup2Fa: async () => parse(await send('/auth/2fa/setup', { method: 'POST' })),
  enable2Fa: async (secret, code) => parse(await send('/auth/2fa/enable', { method: 'POST', body: { secret, code } })),
  disable2Fa: async (currentPassword) => parse(await send('/auth/2fa/disable', { method: 'POST', body: { currentPassword } })),
  getSessions: async () => parse(await send('/auth/sessions', { method: 'GET' })),
  revokeSession: async (id) => parse(await send(`/auth/sessions/${id}`, { method: 'DELETE' })),
  revokeOtherSessions: async () => parse(await send('/auth/sessions/revoke-others', { method: 'POST' })),
  uploadDoc: async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return parse(await send('/auth/upload-doc', { method: 'POST', form: fd, auth: false }));
  },

  async blob(path) {
    const res = await send(path);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new ApiError(data?.message || `Download failed (${res.status})`, res.status);
    }
    return res.blob();
  },
};

export function clearCaches() {
  store.clearPrefix('cache:');
}

// Stored file URLs look like http://host/uploads/<category>/<file>. Files are
// private, so they are fetched with the session token and shown from a blob.
export function filePath(url) {
  const m = /\/([a-z-]+)\/([^/?#]+)$/.exec(url || '');
  return m ? `/files/${m[1]}/${encodeURIComponent(decodeURIComponent(m[2]))}` : null;
}

export async function openFile(url) {
  const path = filePath(url);
  if (!path) throw new ApiError('This file is not available.');
  return openPath(path);
}

// Opens any authenticated API path that returns a PDF/image in a new tab.
export async function openPath(path) {
  const win = window.open('', '_blank'); // opened synchronously so popup blockers allow it
  try {
    const blob = await api.blob(path);
    const href = URL.createObjectURL(blob);
    if (win) win.location.href = href; else window.location.href = href;
    setTimeout(() => URL.revokeObjectURL(href), 60000);
  } catch (err) {
    win?.close();
    throw err;
  }
}

export async function downloadExport(dataset) {
  const blob = await api.blob(`/exports/${dataset}`);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chemaxis-${dataset}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export async function downloadBackup() {
  const blob = await api.blob('/backup');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `chemaxis-backup-${new Date().toISOString().slice(0, 10)}.sql`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
