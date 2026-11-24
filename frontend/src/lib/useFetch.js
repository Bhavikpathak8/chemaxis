import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { useToast } from './toast.jsx';

// Loads a GET endpoint. `stale` is set (to the save time) when the server was
// unreachable and the last copy kept in localStorage is being shown.
export function useFetch(path, { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: !!path && enabled, error: null, stale: null });
  const seq = useRef(0);

  const load = useCallback(async ({ quiet = false } = {}) => {
    if (!path || !enabled) return;
    const mine = ++seq.current;
    if (!quiet) setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { data, stale } = await api.getMeta(path);
      if (mine === seq.current) setState({ data, loading: false, error: null, stale });
    } catch (err) {
      if (mine === seq.current) setState((s) => ({ ...s, loading: false, error: err.message }));
    }
  }, [path, enabled]);

  useEffect(() => {
    setState({ data: null, loading: !!path && enabled, error: null, stale: null });
    load();
    return () => { seq.current++; };
  }, [load, path, enabled]);

  return { ...state, reload: load, refresh: () => load({ quiet: true }) };
}

// Wraps a write. Shows the success message on success and the server's own
// error message on failure (so the user sees why, not "something went wrong").
export function useAction(fn, { success } = {}) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const run = useCallback(async (...args) => {
    setBusy(true);
    try {
      const out = await fnRef.current(...args);
      if (success) toast.success(typeof success === 'function' ? success(out) : success);
      return { ok: true, data: out };
    } catch (err) {
      toast.error(err.message || 'Something went wrong.');
      return { ok: false, error: err };
    } finally {
      setBusy(false);
    }
  }, [success, toast]);

  return { run, busy };
}
