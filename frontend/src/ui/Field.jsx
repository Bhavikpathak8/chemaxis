import { useId, useRef, useState } from 'react';
import { Paperclip, X, FileText } from 'lucide-react';

export function Field({ label, hint, error, required, as = 'input', options, prefix, suffix, className = '', children, ...rest }) {
  const id = useId();
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;
  const common = { id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, className: 'input', ...rest };

  let control;
  if (as === 'select') {
    control = (
      <select {...common}>
        {options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        {children}
      </select>
    );
  } else if (as === 'textarea') {
    control = <textarea rows={3} {...common} />;
  } else {
    control = <input {...common} className={`input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-12' : ''}`} />;
  }

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-ink">
          {label}{required ? <span className="text-danger" aria-hidden> *</span> : null}
        </label>
      ) : null}
      <div className="relative">
        {prefix ? <span className="fig pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">{prefix}</span> : null}
        {control}
        {suffix ? <span className="fig pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[12.5px] text-ink-3">{suffix}</span> : null}
      </div>
      {hint && !error ? <p id={`${id}-hint`} className="mt-1 text-[12.5px] text-ink-3">{hint}</p> : null}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1 text-[12.5px] font-medium text-danger">{error}</p> : null}
    </div>
  );
}

const MAX_MB = 20;
const OK_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp'];

// File picker with drop support. Validates type and size before anything is
// sent, mirroring the server's limits (PDF/PNG/JPEG/WEBP, 20 MB).
export function FileInput({ label, hint, file, onChange, required, accept = '.pdf,.png,.jpg,.jpeg,.webp' }) {
  const id = useId();
  const ref = useRef(null);
  const [error, setError] = useState(null);
  const [over, setOver] = useState(false);

  const take = (f) => {
    if (!f) return;
    if (!OK_TYPES.includes(f.type)) return setError('Use a PDF, PNG, JPEG or WEBP file.');
    if (f.size > MAX_MB * 1024 * 1024) return setError(`That file is over ${MAX_MB} MB.`);
    setError(null);
    onChange(f);
  };

  return (
    <div>
      {label ? <label htmlFor={id} className="mb-1 block text-[13px] font-medium text-ink">{label}{required ? <span className="text-danger" aria-hidden> *</span> : null}</label> : null}
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files?.[0]); }}
        className={`flex min-h-11 items-center gap-3 rounded-[5px] border px-3 py-2 ${over ? 'border-brand bg-brand-wash' : 'border-dashed border-line-strong bg-surface'} ${error ? 'border-danger' : ''}`}
      >
        {file ? (
          <>
            <FileText size={16} className="shrink-0 text-brand" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-[13.5px]">{file.name} <span className="fig text-ink-3">({(file.size / 1024).toFixed(0)} KB)</span></span>
            <button type="button" onClick={() => { onChange(null); if (ref.current) ref.current.value = ''; }} aria-label="Remove file" className="rounded p-1 text-ink-3 hover:bg-paper"><X size={15} /></button>
          </>
        ) : (
          <>
            <Paperclip size={16} className="shrink-0 text-ink-3" aria-hidden />
            <span className="flex-1 text-[13.5px] text-ink-2">Drop a file here or</span>
            <button type="button" className="btn btn-quiet btn-sm" onClick={() => ref.current?.click()}>Choose file</button>
          </>
        )}
        <input id={id} ref={ref} type="file" accept={accept} className="sr-only" onChange={(e) => take(e.target.files?.[0])} />
      </div>
      {error ? <p role="alert" className="mt-1 text-[12.5px] font-medium text-danger">{error}</p> : hint ? <p className="mt-1 text-[12.5px] text-ink-3">{hint}</p> : null}
    </div>
  );
}

// "Save draft" bar shown above a form that has draft support.
export function DraftBar({ draft }) {
  if (!draft.available) return null;
  if (draft.pending) {
    return (
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-amber-mark/40 bg-amber-wash px-3.5 py-2.5 text-[13.5px] text-amber">
        <span>You have an unfinished draft from {new Date(draft.pending.at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}.</span>
        <span className="flex gap-2">
          <button type="button" className="btn btn-quiet btn-sm" onClick={draft.restore}>Restore draft</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={draft.discard}>Discard</button>
        </span>
      </div>
    );
  }
  return null;
}
