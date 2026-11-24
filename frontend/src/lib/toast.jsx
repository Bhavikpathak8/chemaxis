import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const push = useCallback((kind, message) => {
    const id = nextId++;
    setItems((list) => [...list.slice(-3), { id, kind, message }]);
    timers.current.set(id, setTimeout(() => dismiss(id), kind === 'error' ? 8000 : 4000));
  }, [dismiss]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-[80] flex flex-col items-start gap-2 md:bottom-5 md:left-auto md:right-5 md:items-end">
        {items.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className="anim-rise pointer-events-auto flex max-w-md items-start gap-2.5 rounded-[6px] border border-line-strong bg-surface py-2.5 pl-3 pr-2 shadow-[0_6px_20px_-8px_rgba(28,39,64,0.35)]"
          >
            {t.kind === 'error'
              ? <AlertTriangle size={17} className="mt-0.5 shrink-0 text-danger" />
              : <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-brand" />}
            <p className="text-[13.5px] leading-snug text-ink">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="rounded p-1 text-ink-3 hover:bg-paper"><X size={14} /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
