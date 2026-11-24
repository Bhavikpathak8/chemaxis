import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { perUnit, qty, unitLabel } from '../lib/format.js';
import { SlidePanel } from '../ui/SlidePanel.jsx';
import { Button } from '../ui/bits.jsx';
import { Field } from '../ui/Field.jsx';

let rowId = 1;
const blank = (chemicalId = '') => ({ id: rowId++, chemicalId, quantity: '', error: null });

// Request a quotation for one or several chemicals at once — rows can be
// added and removed. One request is created per row.
export function RfqComposer({ open, onClose, catalog, initialId, onDone }) {
  const toast = useToast();
  const [rows, setRows] = useState([blank()]);
  const [busy, setBusy] = useState(false);
  const byId = useMemo(() => Object.fromEntries((catalog ?? []).map((c) => [c.id, c])), [catalog]);

  useEffect(() => { if (open) setRows([blank(initialId ?? '')]); }, [open, initialId]);

  const patch = (id, change) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...change, error: null } : r)));

  const validate = () => {
    let ok = true;
    const next = rows.map((r) => {
      const chem = byId[r.chemicalId];
      let error = null;
      if (!r.chemicalId) error = 'Choose a chemical';
      else if (!(Number(r.quantity) > 0)) error = 'Enter a quantity above 0';
      else if (Number(r.quantity) > Number(chem.quantity_available)) error = `Only ${qty(chem.quantity_available, chem.unit)} is available`;
      else if (rows.filter((x) => x.chemicalId === r.chemicalId).length > 1) error = 'This chemical is already in another row';
      if (error) ok = false;
      return { ...r, error };
    });
    setRows(next);
    return ok;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setBusy(true);
    const failed = [];
    let sent = 0;
    for (const r of rows) {
      try {
        await api.post('/quotation-requests', { chemicalId: r.chemicalId, requestedQuantity: Number(r.quantity), unit: byId[r.chemicalId].unit });
        sent += 1;
      } catch (err) {
        failed.push({ ...r, error: err.message });
      }
    }
    setBusy(false);
    if (sent) { toast.success(`${sent} quotation ${sent === 1 ? 'request' : 'requests'} sent to ChemAxis`); onDone?.(); }
    if (failed.length) setRows(failed); else onClose();
  };

  return (
    <SlidePanel open={open} onClose={onClose} title="Request a quotation" subtitle="ChemAxis replies with a priced quotation you can accept or reject."
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" loading={busy} onClick={submit}>Send {rows.length > 1 ? `${rows.length} requests` : 'request'}</Button></>}>
      <form onSubmit={submit} noValidate className="space-y-4">
        {rows.map((r, i) => {
          const chem = byId[r.chemicalId];
          return (
            <div key={r.id} className="rounded-[6px] border border-line p-3">
              <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                <Field label={rows.length > 1 ? `Chemical ${i + 1}` : 'Chemical'} as="select" value={r.chemicalId} onChange={(e) => patch(r.id, { chemicalId: e.target.value })}>
                  <option value="">Choose a chemical</option>
                  {(catalog ?? []).map((c) => <option key={c.id} value={c.id}>{c.name} ({c.purity})</option>)}
                </Field>
                <Field label="Quantity" type="number" min="0" step="any" inputMode="decimal" value={r.quantity} suffix={chem ? unitLabel(chem.unit) : undefined}
                  onChange={(e) => patch(r.id, { quantity: e.target.value })} />
              </div>
              {chem ? <p className="mt-2 text-[12.5px] text-ink-2">Listed at <span className="fig">{perUnit(chem.buyer_price, chem.unit)}</span>, <span className="fig">{qty(chem.quantity_available, chem.unit)}</span> available. The quotation may differ.</p> : null}
              {r.error ? <p role="alert" className="mt-1.5 text-[12.5px] font-medium text-danger">{r.error}</p> : null}
              {rows.length > 1 ? <div className="mt-2 text-right"><button type="button" className="inline-flex items-center gap-1 text-[12.5px] text-ink-2 hover:text-danger" onClick={() => setRows((rs) => rs.filter((x) => x.id !== r.id))}><Trash2 size={13} /> Remove row</button></div> : null}
            </div>
          );
        })}
        <Button icon={Plus} onClick={() => setRows((rs) => [...rs, blank()])}>Add another chemical</Button>
      </form>
    </SlidePanel>
  );
}
