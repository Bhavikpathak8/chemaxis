import { api } from '../../lib/api.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { inr } from '../../lib/format.js';
import { Field } from '../../ui/Field.jsx';
import { Button } from '../../ui/bits.jsx';

const METHODS = [['BANK_TRANSFER', 'Bank transfer'], ['UPI', 'UPI'], ['CHEQUE', 'Cheque'], ['CASH', 'Cash'], ['OTHER', 'Other']];

// Records money received against an invoice. The amount can't exceed what's
// outstanding; the server checks it as well.
export function PaymentForm({ invoice, onDone }) {
  const toast = useToast();
  const outstanding = Number(invoice.outstanding);
  const form = useForm({
    initial: { amount: String(outstanding), method: 'BANK_TRANSFER', referenceNote: '' },
    rules: {
      amount: [v.positive('an amount'), (x) => (Number(x) > outstanding + 0.01 ? `More than the ${inr(outstanding)} outstanding` : null)],
      method: v.required('a method'),
    },
    onSubmit: async (vals) => {
      await api.post('/payments', { invoiceId: invoice.id, amount: Number(vals.amount), method: vals.method, ...(vals.referenceNote.trim() ? { referenceNote: vals.referenceNote.trim() } : {}) });
      toast.success(`${inr(vals.amount)} recorded against ${invoice.invoice_number}`);
      onDone();
      return true;
    },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-3 rounded-[6px] border border-line bg-paper p-4">
      <h4 className="text-[14px]">Record a payment received</h4>
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Amount" type="number" min="0" step="0.01" prefix="₹" required {...form.bind('amount')} />
        <Field label="Method" as="select" options={METHODS.map(([value, label]) => ({ value, label }))} {...form.bind('method')} />
        <Field label="Reference" placeholder="UTR / cheque no." {...form.bind('referenceNote')} />
      </div>
      <div className="flex justify-end"><Button type="submit" variant="primary" loading={form.busy}>Record payment</Button></div>
    </form>
  );
}
