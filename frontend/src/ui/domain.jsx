import { useState } from 'react';
import { FileText, Phone } from 'lucide-react';
import { openFile, openPath } from '../lib/api.js';
import { useToast } from '../lib/toast.jsx';
import { dateTime, date, inr, num, unitLabel } from '../lib/format.js';
import { StatusMark } from './bits.jsx';

// Opens a private file (PDF/image) with the session token.
export function DocLink({ url, children = 'Open', icon = true, className = '' }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (!url) return <span className="text-ink-3 text-xs">Not uploaded</span>;
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await openFile(url);
        } catch (err) {
          toast.error(err.message || 'Unable to open document');
        } finally {
          setBusy(false);
        }
      }}
      className={`inline-flex items-center gap-1.5 font-semibold disabled:opacity-60 transition-all ${className || 'text-brand hover:underline'}`}
    >
      {icon ? <FileText size={14} aria-hidden /> : null}
      {busy ? 'Opening…' : children}
    </button>
  );
}

const STEPS = [
  { key: 'PENDING', label: 'Transport assigned', at: 'scheduled_at' },
  { key: 'PICKUP_SCHEDULED', label: 'Pickup scheduled' },
  { key: 'PICKED_UP', label: 'Picked up from warehouse', at: 'picked_up_at' },
  { key: 'IN_TRANSIT', label: 'In transit' },
  { key: 'DELIVERED', label: 'Delivered', at: 'delivered_at' },
  { key: 'COMPLETED', label: 'Shipment closed', at: 'completed_at' },
];

// The shipment as a rail: each node is a stage, filled once reached, with the
// real timestamp where the system recorded one.
export function ShipmentRail({ shipment, showCost }) {
  const reached = STEPS.findIndex((s) => s.key === shipment.status);
  return (
    <div>
      <ol className="relative">
        {STEPS.map((s, i) => {
          const done = i <= reached;
          const current = i === reached;
          return (
            <li key={s.key} className="relative flex gap-3 pb-4 last:pb-0">
              {i < STEPS.length - 1 ? <span aria-hidden className={`absolute left-[4px] top-4 h-[calc(100%-6px)] w-px ${i < reached ? 'bg-brand' : 'bg-line-strong'}`} /> : null}
              <i aria-hidden className={`relative z-10 mt-[6px] block size-[9px] shrink-0 rotate-45 ${done ? 'bg-brand' : 'border border-line-strong bg-surface'} ${current ? 'ring-4 ring-brand/20' : ''}`} />
              <div className="min-w-0">
                <p className={`text-[14px] ${current ? 'font-semibold text-ink' : done ? 'text-ink' : 'text-ink-3'}`}>{s.label}</p>
                {done && s.at && shipment[s.at] ? <p className="fig text-[12.5px] text-ink-3">{dateTime(shipment[s.at])}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
        <Row label="From" value={shipment.pickup_location} />
        <Row label="To" value={shipment.delivery_location} />
        <Row label="Vehicle" value={shipment.vehicle_type} />
        <Row label="Distance" value={shipment.distance_km ? `${num(shipment.distance_km)} km` : null} mono />
        <Row label="Driver" value={shipment.driver_name ? (
          <span>{shipment.driver_name}{shipment.driver_phone ? <a href={`tel:${shipment.driver_phone}`} className="fig ml-2 inline-flex items-center gap-1 text-brand hover:underline"><Phone size={12} />{shipment.driver_phone}</a> : null}</span>
        ) : null} />
        {showCost ? <Row label="Transport vendor" value={shipment.vendor_name} /> : null}
        {showCost ? <Row label="Transport cost" value={inr(shipment.cost)} mono /> : null}
        <Row label="Proof of delivery" value={shipment.pod_url ? <DocLink url={shipment.pod_url}>View proof</DocLink> : (shipment.status === 'DELIVERED' || shipment.status === 'COMPLETED' ? 'Not uploaded yet' : null)} />
      </dl>
    </div>
  );
}

function Row({ label, value, mono }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-ink-3">{label}</dt>
      <dd className={`mt-0.5 break-words text-[14px] ${mono ? 'fig' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

// Line items on an order. `showSeller` is trader-only.
export function ItemsTable({ items, showSeller }) {
  return (
    <div className="overflow-x-auto rounded-[5px] border border-line">
      <table className="tbl">
        <thead>
          <tr>
            <th>Chemical</th><th className="text-right">Quantity</th>
            {showSeller ? <th className="text-right">Seller price</th> : null}
            <th className="text-right">{showSeller ? 'Buyer price' : 'Price'}</th><th className="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>{it.chemical_name}</td>
              <td className="fig text-right">{num(it.quantity)} {unitLabel(it.unit)}</td>
              {showSeller ? <td className="fig text-right text-slate">{inr(it.seller_price_per_unit)}</td> : null}
              <td className="fig text-right">{inr(it.buyer_price_per_unit)}</td>
              <td className="fig text-right">{inr(it.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OrderLine({ po }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="fig">{po.po_number}</span><StatusMark status={po.status} /><span className="text-ink-3">{date(po.created_at)}</span>
    </span>
  );
}

// Like DocLink, for documents the server renders on request (PO, challan, e-way sheet).
export function PathLink({ path, children, disabledReason }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  if (disabledReason) return <span className="text-[13px] text-ink-3" title={disabledReason}>{children} · <span>{disabledReason}</span></span>;
  return (
    <button type="button" disabled={busy} onClick={async () => { setBusy(true); try { await openPath(path); } catch (err) { toast.error(err.message); } finally { setBusy(false); } }}
      className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline disabled:opacity-60">
      <FileText size={14} aria-hidden />{busy ? 'Opening…' : children}
    </button>
  );
}
