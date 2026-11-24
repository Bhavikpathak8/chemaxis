// Thin, failure-proof wrapper over localStorage. Storage can be unavailable
// (private windows, blocked site data) or full, so every call is guarded and
// the app must work when this returns nothing.
const NS = 'chemaxis:';

export const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(NS + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(NS + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove(key) {
    try { localStorage.removeItem(NS + key); } catch { /* ignore */ }
  },
  clearPrefix(prefix) {
    try {
      const doomed = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(NS + prefix)) doomed.push(k);
      }
      doomed.forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
  },
};
