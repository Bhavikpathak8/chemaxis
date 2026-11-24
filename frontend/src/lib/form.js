import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { store } from './store.js';
import { getSession } from './api.js';
import { useToast } from './toast.jsx';

// ---- validators: (value, allValues) => error message | null ----------------
export const v = {
  required: (label) => (x) => (x === undefined || x === null || String(x).trim() === '' ? `Enter ${label}` : null),
  email: () => (x) => (!x || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x) ? null : 'Enter a valid email address'),
  minLen: (n, label = 'This field') => (x) => (!x || String(x).length >= n ? null : `${label} needs at least ${n} characters`),
  positive: (label) => (x) => (x === '' || x === undefined ? `Enter ${label}` : Number(x) > 0 ? null : `${label} must be more than 0`),
  atLeast: (min, label) => (x) => (x === '' || x === undefined || Number(x) >= min ? null : `${label} can't be less than ${min}`),
  atMost: (max, label) => (x) => (x === '' || x === undefined || Number(x) <= max ? null : `${label} can't be more than ${max}`),
  // 15-character GSTIN: 2-digit state code, PAN (5 letters, 4 digits, letter), entity code, 'Z', check character.
  gstin: () => (x) => (!x || /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(x).toUpperCase()) ? null : 'GSTIN must be 15 characters, like 24AAAAA0000A1Z5'),
  pincode: () => (x) => (!x || /^[1-9]\d{5}$/.test(x) ? null : 'Pincode must be 6 digits'),
  phone: () => (x) => (!x || /^[6-9]\d{9}$/.test(String(x).replace(/\s/g, '')) ? null : 'Enter a 10-digit mobile number'),
  cas: () => (x) => (!x || /^\d{2,7}-\d{2}-\d$/.test(String(x).trim()) ? null : 'CAS numbers look like 108-95-2'),
  futureDate: (label) => (x) => (!x || new Date(x) >= new Date(new Date().toDateString()) ? null : `${label} can't be in the past`),
};

const run = (rules, field, value, all) => {
  const list = Array.isArray(rules[field]) ? rules[field] : rules[field] ? [rules[field]] : [];
  for (const rule of list) {
    const msg = rule(value, all);
    if (msg) return msg;
  }
  return null;
};

// useForm — validation as you go, Save Draft (kept in localStorage, per user),
// and a busy flag while submitting.
export function useForm({ initial, rules = {}, draftKey, draftOmit = [], onSubmit }) {
  const toast = useToast();
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null); // { at, values } pending restore
  const [savedAt, setSavedAt] = useState(null);
  const initialRef = useRef(initial);

  // Fields like passwords are never written to localStorage.
  const forDraft = (vals) => Object.fromEntries(Object.entries(vals).filter(([k]) => !draftOmit.includes(k)));

  const key = draftKey ? `draft:${getSession()?.user?.id ?? 'anon'}:${draftKey}` : null;

  // Offer to restore a draft left behind by an earlier visit.
  useEffect(() => {
    if (!key) return;
    const found = store.get(key);
    if (found?.values) setDraft(found);
  }, [key]);

  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initialRef.current), [values]);

  // Autosave a moment after typing stops.
  useEffect(() => {
    if (!key || !dirty || draft) return undefined;
    const t = setTimeout(() => {
      if (store.set(key, { at: Date.now(), values: forDraft(values) })) setSavedAt(Date.now());
    }, 900);
    return () => clearTimeout(t);
  }, [values, key, dirty, draft]);

  // Refs hold the latest values/touched so `set` never nests state updates.
  const valuesRef = useRef(initial);
  const touchedRef = useRef({});
  valuesRef.current = values;
  touchedRef.current = touched;

  const set = useCallback((name, value) => {
    const next = { ...valuesRef.current, [name]: value };
    valuesRef.current = next;
    setValues(next);
    if (touchedRef.current[name]) setErrors((e) => ({ ...e, [name]: run(rules, name, value, next) }));
  }, [rules]);

  const blur = useCallback((name) => {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: run(rules, name, values[name], values) }));
  }, [rules, values]);

  const validate = useCallback(() => {
    const next = {};
    for (const f of Object.keys(rules)) {
      const msg = run(rules, f, values[f], values);
      if (msg) next[f] = msg;
    }
    setErrors(next);
    setTouched(Object.fromEntries(Object.keys(rules).map((f) => [f, true])));
    return next;
  }, [rules, values]);

  const clearDraft = useCallback(() => {
    if (key) store.remove(key);
    setDraft(null);
    setSavedAt(null);
  }, [key]);

  const saveDraft = useCallback(() => {
    if (key && store.set(key, { at: Date.now(), values: forDraft(values) })) {
      setSavedAt(Date.now());
      toast.success('Draft saved on this device');
    }
  }, [key, values, toast]);

  const restoreDraft = useCallback(() => {
    if (draft) setValues({ ...initialRef.current, ...draft.values });
    setDraft(null);
  }, [draft]);

  const reset = useCallback((next) => {
    initialRef.current = next ?? initial;
    setValues(next ?? initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  const submit = useCallback(async (e) => {
    e?.preventDefault?.();
    const found = validate();
    const first = Object.keys(found)[0];
    if (first) {
      document.querySelector(`[name="${first}"]`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const out = await onSubmit(values);
      if (out !== false) clearDraft();
    } catch (err) {
      // Show the server's own reason (e.g. "Only 0 units are in stock").
      toast.error(err.message || 'That did not go through. Try again.');
    } finally {
      setBusy(false);
    }
  }, [validate, onSubmit, values, clearDraft]);

  // Props for a field: spread onto <Field/> + <Input/> pair via bind(name).
  const bind = (name) => ({
    name,
    value: values[name] ?? '',
    error: touched[name] ? errors[name] : null,
    onChange: (e) => set(name, e?.target ? e.target.value : e),
    onBlur: () => blur(name),
  });

  return {
    values, set, bind, errors, busy, submit, validate, reset, dirty,
    draft: { pending: draft, savedAt, available: !!key, save: saveDraft, restore: restoreDraft, discard: clearDraft },
  };
}
