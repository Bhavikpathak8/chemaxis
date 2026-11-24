import { FileText } from 'lucide-react';
import { openFile } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';

// Files are private; this fetches with the session token and opens the result.
export function DocLink({ url, label, missing = 'Not uploaded' }) {
  const toast = useToast();
  if (!url) return <span className="text-ink-3">{missing}</span>;
  return (
    <button type="button" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline"
      onClick={async () => { try { await openFile(url); } catch (e) { toast.error(e.message); } }}>
      <FileText size={14} aria-hidden /> {label}
    </button>
  );
}
