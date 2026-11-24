import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Building2 } from 'lucide-react';

// Right-hand detail panel (DESIGN_SYSTEM: "Right Slide Panel for details").
export function SlidePanel({ open, onClose, title, subtitle, children, footer, width = 580 }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60]">
      <div className="anim-scrim absolute inset-0 bg-[#0f172a]/60 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden />
      <aside
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Details'}
        style={{ width: `min(${width}px, 100vw)` }}
        className="anim-panel absolute right-0 top-0 flex h-full flex-col border-l border-[#dbe1de] bg-white shadow-[-16px_0_40px_rgba(0,0,0,0.14)] md:rounded-l-2xl outline-none overflow-hidden"
      >
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-[#e2e8e5] bg-white/95 px-6 py-4.5 backdrop-blur-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e4f2ec] text-[#0b7a55] shadow-xs">
              <Building2 size={20} />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-extrabold text-[#0f172a] tracking-tight">{title}</h2>
              {subtitle ? (
                <div className="mt-0.5 text-xs text-[#65717f] flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#0b7a55]" />
                  <span className="truncate">{subtitle}</span>
                </div>
              ) : null}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f1f4f2] text-[#4a5666] transition-all hover:bg-[#e2e8e5] hover:text-[#0f172a] hover:rotate-90 shrink-0 shadow-xs"
          >
            <X size={16} />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto panel-scrollbar px-6 py-5 space-y-6">
          {children}
        </div>

        {footer ? (
          <footer className="sticky bottom-0 z-20 flex flex-wrap items-center justify-end gap-2.5 border-t border-[#e2e8e5] bg-[#f8faf9]/95 px-6 py-3.5 backdrop-blur-md">
            {footer}
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
