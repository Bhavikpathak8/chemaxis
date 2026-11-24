import { useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { inr } from '../../lib/format.js';
import { buyerPriceFor, describePolicy, MARGIN_TYPES } from '../../lib/pricing.js';
import { Field } from '../../ui/Field.jsx';
import { Button, Banner } from '../../ui/bits.jsx';
import { Spread } from '../../ui/Spread.jsx';

// Sets the buyer-facing price of a chemical. The seller never sees this page's
// numbers; buyers see only the resulting buyer price.
export default function PricePanel({ chemical, onDone }) {
  const toast = useToast();
  const sug = useFetch(`/margin-policies/suggest/${chemical.id}`);
  const seller = Number(chemical.seller_price);

  const form = useForm({
    initial: {
      marginType: chemical.margin_type ?? 'FIXED',
      marginValue: chemical.margin_value != null ? String(Number(chemical.margin_value)) : '',
    },
    rules: {
      marginValue: [
        v.required('a margin value'),
        v.positive('The margin value'),
        (x, all) => {
          const b = buyerPriceFor(all.marginType, seller, x);
          return b !== null && b <= seller ? `The buyer price would be ${inr(b)}, which is not above the seller price of ${inr(seller)}` : null;
        },
      ],
    },
    onSubmit: async (vals) => {
      await api.patch(`/chemicals/admin/${chemical.id}/price`, { marginType: vals.marginType, marginValue: Number(vals.marginValue) });
      toast.success(`${chemical.name} is now listed for buyers`);
      onDone();
    },
  });

  // keep the dependent validation fresh when the type changes
  useEffect(() => { if (form.values.marginValue !== '') form.validate(); /* eslint-disable-next-line */ }, [form.values.marginType]);

  const buyer = buyerPriceFor(form.values.marginType, seller, form.values.marginValue);
  const suggested = sug.data?.suggestedBuyerPrice;
  const policy = sug.data?.policy;
  const typeInfo = MARGIN_TYPES.find((t) => t.value === form.values.marginType);

  return (
    <form onSubmit={form.submit} className="space-y-5" noValidate>
      {!chemical.is_active ? <Banner tone="wait">This chemical is inactive. Buyers will not see it until the seller reactivates it.</Banner> : null}
      {chemical.seller_verification_status !== 'APPROVED' ? <Banner tone="wait">The seller is not approved yet, so this chemical stays hidden from buyers.</Banner> : null}

      <div className="rounded-[6px] border border-line bg-paper px-4 py-3">
        <div className="text-[12.5px] text-ink-3">Seller price (private to ChemAxis)</div>
        <div className="fig text-[20px] text-slate">{inr(seller)} <span className="text-[13px] text-ink-3">per {chemical.unit.toLowerCase()}</span></div>
      </div>

      {policy ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-[6px] border border-brand/30 bg-brand-wash px-3.5 py-2.5 text-[13.5px] text-brand-deep">
          <span>Policy “{policy.name}” ({policy.scope.toLowerCase()}) suggests {describePolicy(policy)} → <strong className="fig">{inr(suggested)}</strong></span>
          <button type="button" className="btn btn-quiet btn-sm" onClick={() => { form.set('marginType', policy.margin_type); form.set('marginValue', String(Number(policy.margin_value))); }}>Use this</button>
        </div>
      ) : sug.data ? <p className="text-[13px] text-ink-3">No margin policy applies to this chemical. Set the margin by hand.</p> : null}

      <Field label="How to price" as="select" {...form.bind('marginType')} options={MARGIN_TYPES.map((t) => ({ value: t.value, label: t.label }))} hint={typeInfo?.hint} />
      <Field
        label={form.values.marginType === 'MANUAL' ? 'Buyer price' : form.values.marginType === 'FIXED' ? 'Margin per unit' : 'Margin percentage'}
        type="number" inputMode="decimal" step="0.01" min="0" required
        prefix={form.values.marginType === 'PERCENTAGE' ? undefined : '₹'} suffix={form.values.marginType === 'PERCENTAGE' ? '%' : undefined}
        {...form.bind('marginValue')}
      />

      {buyer !== null ? (
        <div className="rounded-[6px] border border-line p-4"><Spread seller={seller} buyer={buyer} unit={chemical.unit} quantity={Number(chemical.quantity_available) || undefined} /></div>
      ) : null}

      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <Button type="submit" variant="primary" loading={form.busy}>{chemical.buyer_price ? 'Update price' : 'Price and list'}</Button>
      </div>
    </form>
  );
}
