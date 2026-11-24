import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './bits.jsx';

const ConfirmCtx = createContext(null);

// confirm({ title, message, confirmLabel, danger }) → Promise<boolean>
export function ConfirmProvider({ children }) {
  const [dlg, setDlg] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((opts) => new Promise((resolve) => {
    resolver.current = resolve;
    setDlg(opts);
  }), []);

  const close = (answer) => {
    resolver.current?.(answer);
    resolver.current = null;
    setDlg(null);
  };

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {dlg ? createPortal(
        <div className="fixed inset-0 z-[90] grid place-items-center p-4" onKeyDown={(e) => e.key === 'Escape' && close(false)}>
          <div className="anim-scrim absolute inset-0 bg-slate-deep/50" onClick={() => close(false)} aria-hidden />
          <div role="alertdialog" aria-modal="true" aria-labelledby="cf-title" className="anim-rise relative w-full max-w-md rounded-[8px] border border-line-strong bg-surface p-5">
            <h2 id="cf-title" className="text-[16px] text-ink">{dlg.title}</h2>
            {dlg.message ? <p className="mt-2 text-[14px] text-ink-2">{dlg.message}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => close(false)} autoFocus>Cancel</Button>
              <Button variant={dlg.danger ? 'danger' : 'primary'} onClick={() => close(true)}>{dlg.confirmLabel ?? 'Confirm'}</Button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </ConfirmCtx.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmCtx);
