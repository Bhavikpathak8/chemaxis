import { useMemo } from 'react';
import { useForm } from '../lib/form.js';
import { Field } from './Field.jsx';
import { Button } from './bits.jsx';
import { SlidePanel } from './SlidePanel.jsx';

// Slide-in form driven by a field list. fields: { name, label, type, as, options, required, rules, hint, prefix, suffix, show(values) }
function Body({ fields, initial, submitLabel, onSave, onClose, draftKey }) {
  const rules = useMemo(() => Object.fromEntries(fields.filter((f) => f.rules).map((f) => [f.name, f.rules])), [fields]);
  const form = useForm({
    initial, rules, draftKey,
    onSubmit: async (vals) => { const out = await onSave(vals); if (out !== false) onClose(); return out; },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      {fields.filter((f) => !f.show || f.show(form.values)).map((f) => (
        <Field key={f.name} label={f.label} type={f.type} as={f.as} options={f.options} required={f.required} hint={f.hint} prefix={f.prefix} suffix={f.suffix} placeholder={f.placeholder} step={f.step} min={f.min} {...form.bind(f.name)}>
          {f.children}
        </Field>
      ))}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" loading={form.busy}>{submitLabel}</Button>
      </div>
    </form>
  );
}

export function EditPanel({ open, onClose, title, subtitle, fields, initial, submitLabel = 'Save', onSave, draftKey, width = 480 }) {
  return (
    <SlidePanel open={open} onClose={onClose} title={title} subtitle={subtitle} width={width}>
      {open ? <Body key={JSON.stringify(initial)} fields={fields} initial={initial} submitLabel={submitLabel} onSave={onSave} onClose={onClose} draftKey={draftKey} /> : null}
    </SlidePanel>
  );
}
