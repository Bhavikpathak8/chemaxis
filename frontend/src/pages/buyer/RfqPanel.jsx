import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useForm } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { inr, num, unitLabel } from '../../lib/format.js';
import { DraftBar, Field } from '../../ui/Field.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Button } from '../../ui/bits.jsx';

const blank = (chemicalId = '') => ({ chemicalId, quantity: '' });

// Request a quotation for one or more chemicals (dynamic rows). One request is
// created per row, because the trader quotes each chemical on its own.
export default function RfqPanel({ open, onClose, catalog, initialChemicalId, onDone }) {
  const toast = useToast();
  const [rowErrors, setRowErrors] = useState({});
  const byId = useMemo(() => Object.fromEntries((catalog ?? []).map((c) => [c.id, c])), [catalog]);

  const form = useForm({
    initial: { lines: [blank(initialChemicalId)] },
    draftKey: 'rfq',
    rules: { lines: (lines) => (lines.length ? null : 'Add at least one chemical') },
    onSubmit: async ({ lines }) => {
      const errs = {};
      lines.forEach((l, i) => {
        const c = byId[l.chemicalId];
        if (!l.chemicalId) errs[i] = 'Choose a chemical';
        else if (!(Number(l.quantity) > 0)) errs[i] = 'Enter a quantity above 0';
        else if (Number(l.quantity) > Number(c?.quantity_available ?? 0)) errs[i] = `Only ${num(c.quantity_available)} ${unitLabel(c.unit)} in stock`;
      });
      const chosen = lines.map((l) => l.chemicalId).filter(Boolean);
      lines.forEach((l, i) => { if (!errs[i] && chosen.indexOf(l.chemicalId) !== i) errs[i] = 'This chemical is already on another row'; });
      setRowErrors(errs);
      if (Object.keys(errs).length) return false;

      let sent = 0;
      const failed = [];
      for (const l of lines) {
        const c = byId[l.chemicalId];
        try {
          await api.post('/quotation-requests', { chemicalId: l.chemicalId, requestedQuantity: Number(l.quantity), unit: c.unit });
          sent += 1;
        } catch (err) {
          failed.push(`${c.name}: ${err.message}`);
        }
      }
      if (sent) toast.success(sent === 1 ? 'Quotation requested. C-Tech will reply with a price.' : `${sent} quotations requested`);
      failed.forEach((f) => toast.error(f));
      if (sent) { onDone?.(); }
      if (!failed.length) { onClose(); return true; }
      return false;
    },
  });

  useEffect(() => {
    if (open) { form.reset({ lines: [blank(initialChemicalId)] }); setRowErrors({}); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialChemicalId]);

  const lines = form.values.lines;
  const setLine = (i, patch) => form.set('lines', lines.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  return (
    <SlidePanel
      open={open}
      onClose={onClose}
      title="Request a quotation"
      subtitle="Tell us what you need. C-Tech replies with a price and a quotation PDF."
      footer={(
        <>
          <Button onClick={form.draft.save} disabled={!form.dirty}>Save draft</Button>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={form.busy} onClick={form.submit}>Send request{lines.length > 1 ? 's' : ''}</Button>
        </>
      )}
    >
      <DraftBar draft={form.draft} />
      <form onSubmit={form.submit} noValidate className="space-y-4">
        {lines.map((l, i) => {
          const c = byId[l.chemicalId];
          return (
            <fieldset key={i} className="rounded-[6px] border border-line p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <legend className="text-[13px] font-medium text-ink-2">Chemical {lines.length > 1 ? i + 1 : ''}</legend>
                {lines.length > 1 ? (
                  <button type="button" onClick={() => form.set('lines', lines.filter((_, j) => j !== i))} aria-label={`Remove chemical ${i + 1}`} className="rounded p-1 text-ink-3 hover:bg-danger-wash hover:text-danger"><Trash2 size={15} /></button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                <Field as="select" label="Chemical" value={l.chemicalId} onChange={(e) => setLine(i, { chemicalId: e.target.value })} error={rowErrors[i] && !l.chemicalId ? rowErrors[i] : null}>
                  <option value="">Choose a chemical</option>
                  {(catalog ?? []).map((ch) => <option key={ch.id} value={ch.id}>{ch.name} ({ch.purity})</option>)}
                </Field>
                <Field label="Quantity" inputMode="decimal" suffix={c ? unitLabel(c.unit) : ''} value={l.quantity} onChange={(e) => setLine(i, { quantity: e.target.value })} error={rowErrors[i] && l.chemicalId ? rowErrors[i] : null} />
              </div>
              {c ? (
                <p className="mt-2 text-[12.5px] text-ink-2">
                  Listed at <span className="fig">{inr(c.buyer_price)}/{unitLabel(c.unit)}</span> · <span className="fig">{num(c.quantity_available)} {unitLabel(c.unit)}</span> in stock at {c.warehouse_location}. The quoted price may differ for your quantity.
                </p>
              ) : null}
            </fieldset>
          );
        })}
        <Button icon={Plus} onClick={() => form.set('lines', [...lines, blank()])}>Add another chemical</Button>
      </form>
    </SlidePanel>
  );
}
