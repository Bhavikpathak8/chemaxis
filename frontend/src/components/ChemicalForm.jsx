import { useEffect } from 'react';
import { useForm, v } from '../lib/form.js';
import { Button } from '../ui/bits.jsx';
import { Field, FileInput, DraftBar } from '../ui/Field.jsx';

const CATEGORIES = ['Industrial Chemical', 'Solvent', 'Acid', 'Alkali', 'Intermediate', 'Polymer', 'Other'];

export const EMPTY_CHEMICAL = { name: '', category: 'Industrial Chemical', casNumber: '', purity: '', unit: 'KG', sellerPrice: '', warehouseLocation: '', description: '', availableQuantity: '' };

// Used for both "add chemical" (with stock + files) and "edit chemical".
export function ChemicalForm({ initial = EMPTY_CHEMICAL, draftKey, creating, onSubmit, submitLabel, coa, setCoa, msds, setMsds }) {
  const form = useForm({
    initial, draftKey,
    rules: {
      name: v.required('the chemical name'),
      purity: v.required('the purity, e.g. 99%'),
      sellerPrice: v.positive('your price per unit'),
      warehouseLocation: v.required('the warehouse location'),
      casNumber: (x) => (!x || /^\d{2,7}-\d{2}-\d$/.test(x.trim()) ? null : 'CAS numbers look like 108-95-2'),
      ...(creating ? { availableQuantity: v.positive('the stock quantity') } : {}),
    },
    onSubmit,
  });
  useEffect(() => { form.reset(initial); }, [JSON.stringify(initial)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      {draftKey ? <DraftBar draft={form.draft} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2" label="Chemical name" required placeholder="Phenol" {...form.bind('name')} />
        <Field label="Category" as="select" {...form.bind('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Field>
        <Field label="CAS number" placeholder="108-95-2" {...form.bind('casNumber')} />
        <Field label="Purity" required placeholder="99.9%" {...form.bind('purity')} />
        <Field label="Unit of sale" as="select" {...form.bind('unit')}><option value="KG">Kilogram</option><option value="TON">Tonne</option><option value="LITRE">Litre</option></Field>
        <Field label="Your price per unit" required type="number" min="0" step="0.01" inputMode="decimal" prefix="₹" hint="What ChemAxis pays you. Buyers never see it." {...form.bind('sellerPrice')} />
        {creating ? <Field label="Stock available" required type="number" min="0" step="any" inputMode="decimal" {...form.bind('availableQuantity')} /> : <div />}
        <Field className="sm:col-span-2" label="Warehouse location" required placeholder="Bharuch, Gujarat" {...form.bind('warehouseLocation')} />
        <Field className="sm:col-span-2" as="textarea" label="Description" hint="Grade, packaging, anything a buyer should know." {...form.bind('description')} />
      </div>
      {creating ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FileInput label="Certificate of analysis (COA)" file={coa} onChange={setCoa} hint="PDF or image, up to 20 MB. Can be added later." />
          <FileInput label="Safety data sheet (MSDS)" file={msds} onChange={setMsds} hint="PDF or image, up to 20 MB. Can be added later." />
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button type="submit" variant="primary" loading={form.busy} disabled={!creating && !form.dirty}>{submitLabel}</Button>
        {draftKey ? <Button onClick={form.draft.save} disabled={!form.dirty}>Save draft</Button> : null}
      </div>
    </form>
  );
}
