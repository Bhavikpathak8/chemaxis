import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { date, inr } from '../../lib/format.js';
import { Async, Button, PageHeader, Panel } from '../../ui/bits.jsx';
import { Field } from '../../ui/Field.jsx';

function Form({ cfg, onDone }) {
  const toast = useToast();
  const form = useForm({
    initial: { rate: String(Number(cfg.default_gst_rate_percent)) },
    rules: { rate: [v.required('a rate'), v.atLeast(0, 'The rate'), v.atMost(100, 'The rate')] },
    onSubmit: async (x) => { await api.patch('/gst-settings', { defaultGstRatePercent: Number(x.rate) }); toast.success('Default GST rate updated'); onDone(); },
  });
  const r = Number(form.values.rate);
  return (
    <form onSubmit={form.submit} noValidate className="max-w-sm space-y-4">
      <Field label="Default GST rate" type="number" min="0" max="100" step="0.01" suffix="%" required hint={`Last changed ${date(cfg.updated_at)}`} {...form.bind('rate')} />
      {!Number.isNaN(r) && form.values.rate !== '' ? <p className="text-[13.5px] text-ink-2">On an order of <span className="fig">{inr(100000)}</span>, GST is <span className="fig">{inr(100000 * r / 100)}</span> and the invoice total <span className="fig">{inr(100000 * (1 + r / 100))}</span>.</p> : null}
      <Button type="submit" variant="primary" loading={form.busy} disabled={!form.dirty}>Save rate</Button>
    </form>
  );
}

export default function Gst() {
  const state = useFetch('/gst-settings');
  return (
    <>
      <PageHeader title="GST settings" subtitle="The rate applied to new invoices. You can still change the rate for a single invoice when you generate it. Invoices already issued keep their rate." />
      <Panel title="Default rate"><Async state={state}>{(cfg) => <Form key={cfg.updated_at} cfg={cfg} onDone={state.refresh} />}</Async></Panel>
    </>
  );
}
