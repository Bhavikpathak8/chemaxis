import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { useToast } from '../../lib/toast.jsx';
import { date, dateTime, inr } from '../../lib/format.js';
import { Banner, Button, Facts, Panel, Skeleton } from '../../ui/bits.jsx';
import { useConfirm } from '../../ui/Confirm.jsx';
import { DocLink, ItemsTable, PathLink } from '../../ui/domain.jsx';
import { Statement } from '../../ui/Statement.jsx';
import { Field } from '../../ui/Field.jsx';
import { AssignTransport, ShipmentBlock } from './shipping.jsx';
import { PaymentForm } from './PaymentForm.jsx';

// ---- dynamic-row expense entry -------------------------------------------
let rid = 0;
const blank = () => ({ k: ++rid, categoryName: '', amount: '', description: '' });

export function ExpenseRows({ poId, categories, onSaved, compact }) {
  const toast = useToast();
  const [rows, setRows] = useState([blank()]);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const active = (categories ?? []).filter((c) => c.is_active);
  const patch = (k, p) => setRows((rs) => rs.map((r) => (r.k === k ? { ...r, ...p } : r)));
  const filled = (r) => r.categoryName || r.amount !== '' || r.description;

  const save = async () => {
    const todo = rows.filter(filled);
    const e = {};
    todo.forEach((r) => {
      if (!r.categoryName) e[r.k] = 'Choose a category';
      else if (!(Number(r.amount) > 0)) e[r.k] = 'Enter an amount above 0';
    });
    setErrs(e);
    if (!todo.length) { setErrs({ [rows[0].k]: 'Add at least one expense' }); return; }
    if (Object.keys(e).length) return;
    setBusy(true);
    const failed = [];
    let saved = 0;
    for (const r of todo) {
      try {
        await api.post('/expenses', { purchaseOrderId: poId, categoryName: r.categoryName, amount: Number(r.amount), ...(r.description.trim() ? { description: r.description.trim() } : {}) });
        saved++;
      } catch (err) { failed.push({ ...r, why: err.message }); }
    }
    setBusy(false);
    if (saved) toast.success(`${saved} expense${saved === 1 ? '' : 's'} recorded`);
    if (failed.length) {
      toast.error(`${failed.length} could not be saved: ${failed[0].why}`);
      setRows(failed.map(({ why: _why, ...r }) => r));
    } else setRows([blank()]);
    if (saved) onSaved();
  };

  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.k} className="grid gap-2 sm:grid-cols-[1.1fr_0.8fr_1.4fr_auto] sm:items-start">
          <div>
            <select aria-label={`Category, row ${i + 1}`} className="input" value={r.categoryName} onChange={(e) => patch(r.k, { categoryName: e.target.value })} aria-invalid={errs[r.k] ? 'true' : undefined}>
              <option value="">Category</option>
              {active.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div className="relative">
            <span className="fig pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3">₹</span>
            <input aria-label={`Amount, row ${i + 1}`} className="input fig pl-7" type="number" min="0" step="0.01" inputMode="decimal" placeholder="Amount" value={r.amount} onChange={(e) => patch(r.k, { amount: e.target.value })} aria-invalid={errs[r.k] ? 'true' : undefined} />
          </div>
          <input aria-label={`Note, row ${i + 1}`} className="input" placeholder="Note (optional)" value={r.description} onChange={(e) => patch(r.k, { description: e.target.value })} />
          <button type="button" aria-label={`Remove row ${i + 1}`} disabled={rows.length === 1} onClick={() => setRows((rs) => rs.filter((x) => x.k !== r.k))} className="btn btn-ghost btn-sm h-9 !px-2 disabled:opacity-30"><Trash2 size={15} /></button>
          {errs[r.k] ? <p role="alert" className="text-[12.5px] font-medium text-danger sm:col-span-4">{errs[r.k]}</p> : null}
        </div>
      ))}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button size="sm" icon={Plus} onClick={() => setRows((rs) => [...rs, blank()])}>Add another</Button>
        <div className="flex items-center gap-3">
          {rows.filter(filled).length > 1 || Number(rows[0].amount) > 0 ? <span className="fig text-[13px] text-ink-2">Total {inr(rows.reduce((s, r) => s + (Number(r.amount) || 0), 0))}</span> : null}
          <Button variant="primary" loading={busy} onClick={save}>{compact ? 'Save' : 'Save expenses'}</Button>
        </div>
      </div>
    </div>
  );
}

// ---- the desk -------------------------------------------------------------
export default function OrderDesk({ id, onChanged, onClose }) {
  const confirm = useConfirm();
  const po = useFetch(`/purchase-orders/admin/${id}`);
  const ship = useFetch(`/transportation/order/${id}`);
  const exp = useFetch(`/expenses/order/${id}`);
  const cats = useFetch('/expenses/categories');
  const invs = useFetch('/invoices');
  const gstCfg = useFetch('/gst-settings');
  const payouts = useFetch(`/payments/payouts/order/${id}`);

  const reloadAll = () => { po.refresh(); ship.refresh(); exp.refresh(); invs.refresh(); payouts.refresh(); onChanged(); };
  const confirmOrder = useAction(() => api.patch(`/purchase-orders/admin/${id}/confirm`), { success: 'Order confirmed. Stock is reserved.' });
  const cancelOrder = useAction(() => api.patch(`/purchase-orders/admin/${id}/cancel`), { success: 'Order cancelled' });

  if (!po.data) return po.error ? <Banner tone="bad">{po.error}</Banner> : <Skeleton />;
  const o = po.data;
  const items = o.items ?? [];
  const sellerAmt = items.reduce((s, i) => s + Number(i.seller_price_per_unit) * Number(i.quantity), 0);
  const buyerAmt = items.reduce((s, i) => s + Number(i.buyer_price_per_unit) * Number(i.quantity), 0);
  const expenses = exp.data ?? [];
  const totalExp = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const gross = buyerAmt - sellerAmt;
  const settled = ['DELIVERED', 'COMPLETED'].includes(o.status);
  const invoice = (invs.data ?? []).find((x) => x.purchase_order_id === id);
  const paidOut = (payouts.data ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const owed = sellerAmt - paidOut;
  const shipment = ship.data;
  const canCancel = ['PENDING', 'CONFIRMED'].includes(o.status);

  return (
    <div className="space-y-5">
      <Facts items={[
        ['Buyer', o.buyer_company_name], ['Buyer GSTIN', o.buyer_gst_number, true],
        ['Placed', dateTime(o.created_at)], ['Confirmed', o.confirmed_at ? dateTime(o.confirmed_at) : '—'],
        ['Deliver to', o.delivery_address], ['Payment terms', o.payment_terms],
        ['Expected dispatch', o.expected_dispatch_date ? date(o.expected_dispatch_date) : 'Not set'], ['Delivered', o.delivered_at ? dateTime(o.delivered_at) : '—'],
      ]} />

      <ItemsTable items={items} showSeller />

      {o.status === 'PENDING' ? (
        <Banner tone="wait" title="Waiting for you to confirm." action={
          <Button variant="primary" size="sm" loading={confirmOrder.busy} onClick={async () => { const r = await confirmOrder.run(); if (r.ok) reloadAll(); }}>Confirm order</Button>
        }>Confirming reserves the stock and lets you arrange transport.</Banner>
      ) : null}

      <Panel title="Profit" subtitle={settled ? 'Final for this order. It updates if more expenses are added.' : 'Projected. It becomes final when the shipment is delivered.'}>
        <Statement caption="Profit on this order" rows={[
          { label: 'Buyer pays ChemAxis', amount: buyerAmt },
          { label: 'ChemAxis pays seller', amount: sellerAmt, kind: 'less' },
          { label: 'Gross margin', amount: gross, kind: 'sub' },
          ...expenses.map((e) => ({ label: e.category_name, note: e.description || undefined, amount: Number(e.amount), kind: 'less' })),
          { label: 'Net profit', amount: gross - totalExp, kind: 'grand', note: expenses.length ? `After ${inr(totalExp)} of expenses` : 'No expenses recorded yet' },
        ]} />
      </Panel>

      {o.status !== 'CANCELLED' ? (
        <Panel title="Documents">
          <ul className="space-y-2 text-[14px]">
            <li><PathLink path={`/purchase-orders/${id}/documents/po`}>Purchase order (PDF)</PathLink></li>
            <li><PathLink path={`/purchase-orders/${id}/documents/challan`} disabledReason={shipment ? undefined : 'after transport is assigned'}>Delivery challan (PDF)</PathLink></li>
            <li><PathLink path={`/purchase-orders/${id}/documents/eway`} disabledReason={shipment ? undefined : 'after transport is assigned'}>E-way bill details sheet (PDF)</PathLink></li>
          </ul>
        </Panel>
      ) : null}

      <Panel title="Transport">
        {shipment ? <ShipmentBlock shipment={shipment} onDone={reloadAll} /> : ship.loading ? <Skeleton rows={2} /> : o.status === 'CONFIRMED' ? <AssignTransport order={o} onDone={reloadAll} /> : (
          <p className="text-[13.5px] text-ink-2">{o.status === 'PENDING' ? 'Confirm the order first, then assign transport.' : o.status === 'CANCELLED' ? 'This order was cancelled.' : 'No transport on record.'}</p>
        )}
      </Panel>

      {o.status !== 'CANCELLED' ? (
        <Panel title="Expenses" subtitle="Anything it cost ChemAxis to complete this order. Transport is added automatically.">
          {expenses.length ? (
            <ul className="mb-4 divide-y divide-line rounded-[5px] border border-line text-[14px]">
              {expenses.map((e) => <li key={e.id} className="flex items-center justify-between gap-3 px-3 py-2"><span>{e.category_name}{e.description ? <span className="ml-2 text-[12.5px] text-ink-3">{e.description}</span> : null}</span><span className="fig">{inr(e.amount)}</span></li>)}
            </ul>
          ) : null}
          <ExpenseRows poId={id} categories={cats.data} onSaved={reloadAll} compact />
        </Panel>
      ) : null}

      <Panel title="Invoice and payment">
        {invoice ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="fig text-[15px]">{invoice.invoice_number}</p><p className="text-[13px] text-ink-2">{inr(invoice.total_amount)} incl. {inr(invoice.gst_amount)} GST · due {date(invoice.due_date)}</p></div>
              <DocLink url={invoice.pdf_url}>GST invoice PDF</DocLink>
            </div>
            <Facts items={[['Received', inr(invoice.paid), true], ['Outstanding', inr(invoice.outstanding), true]]} />
            {Number(invoice.outstanding) > 0.004 ? <PaymentForm invoice={invoice} onDone={reloadAll} /> : <Banner tone="ok">Fully paid.</Banner>}
          </div>
        ) : o.status === 'CANCELLED' ? <p className="text-[13.5px] text-ink-2">No invoice for a cancelled order.</p> : (
          <GenerateInvoice poId={id} defaultRate={gstCfg.data ? Number(gstCfg.data.default_gst_rate_percent) : 18} subtotal={Number(o.total_amount)} onDone={reloadAll} />
        )}
      </Panel>

      {o.status !== 'CANCELLED' ? (
        <Panel title="Seller payout" subtitle="Record what you have paid the seller for this order.">
          <Facts items={[['Owed to seller', inr(sellerAmt), true], ['Paid so far', inr(paidOut), true], ['Still owed', inr(Math.max(0, owed)), true]]} />
          {(payouts.data ?? []).length ? (
            <ul className="mt-3 divide-y divide-line rounded-[5px] border border-line text-[13.5px]">
              {payouts.data.map((p) => <li key={p.id} className="flex justify-between px-3 py-2"><span>{date(p.paid_at)}{p.notes ? <span className="ml-2 text-ink-3">{p.notes}</span> : null}</span><span className="fig">{inr(p.amount)}</span></li>)}
            </ul>
          ) : null}
          {owed > 0.004 ? <PayoutForm poId={id} owed={owed} onDone={reloadAll} /> : <p className="mt-3 text-[13px] text-brand">Seller fully paid.</p>}
        </Panel>
      ) : null}

      {canCancel ? (
        <div className="border-t border-line pt-4">
          <Button variant="danger" loading={cancelOrder.busy} onClick={async () => {
            if (await confirm({ title: `Cancel ${o.po_number}?`, message: 'Reserved stock goes back on the shelf and the buyer is notified. You cannot cancel once the goods are on the road.', confirmLabel: 'Cancel order', danger: true })) {
              const r = await cancelOrder.run(); if (r.ok) { reloadAll(); onClose?.(); }
            }
          }}>Cancel this order</Button>
        </div>
      ) : null}
    </div>
  );
}

export function GenerateInvoice({ poId, defaultRate, subtotal, onDone }) {
  const [rate, setRate] = useState('');
  const effective = rate === '' ? defaultRate : Number(rate);
  const bad = rate !== '' && (Number.isNaN(Number(rate)) || Number(rate) < 0 || Number(rate) > 100);
  const gen = useAction(() => api.post(`/invoices/order/${poId}`, rate === '' ? {} : { gstRatePercent: Number(rate) }), { success: 'Invoice generated and sent to the buyer' });
  return (
    <div className="space-y-3">
      <p className="text-[13.5px] text-ink-2">No invoice yet. Generating one creates the GST invoice PDF with a QR code and notifies the buyer.</p>
      <div className="grid items-end gap-3 sm:grid-cols-[1fr_auto]">
        <Field label="GST rate" type="number" min="0" max="100" step="0.01" suffix="%" placeholder={String(defaultRate)} value={rate} onChange={(e) => setRate(e.target.value)} error={bad ? 'Enter a rate from 0 to 100' : null} hint={`Leave blank to use the default (${defaultRate}%). GST ${inr(subtotal * effective / 100)}, total ${inr(subtotal * (1 + effective / 100))}.`} />
        <Button variant="primary" loading={gen.busy} disabled={bad} onClick={async () => { const r = await gen.run(); if (r.ok) onDone(); }}>Generate invoice</Button>
      </div>
    </div>
  );
}

export function PayoutForm({ poId, owed, onDone }) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const act = useAction(() => api.post(`/payments/payouts/order/${poId}`, { amount: Number(amount), ...(notes.trim() ? { notes: notes.trim() } : {}) }), { success: 'Payout recorded' });
  const err = amount !== '' && (!(Number(amount) > 0) ? 'Enter an amount above 0' : Number(amount) > owed + 0.01 ? `More than the ${inr(owed)} still owed` : null);
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1.4fr_auto] sm:items-start">
      <Field label="Amount paid" type="number" min="0" step="0.01" prefix="₹" value={amount} onChange={(e) => setAmount(e.target.value)} error={err} />
      <Field label="Note" placeholder="UTR / reference (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button className="sm:mt-[22px]" variant="primary" loading={act.busy} disabled={!amount || !!err} onClick={async () => { const r = await act.run(); if (r.ok) { setAmount(''); setNotes(''); onDone(); } }}>Record payout</Button>
    </div>
  );
}
