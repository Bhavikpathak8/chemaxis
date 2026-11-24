import { dateTime } from '../lib/format.js';

const STEPS = [
  { key: 'PENDING', label: 'Transport booked', at: 'scheduled_at' },
  { key: 'PICKUP_SCHEDULED', label: 'Pickup scheduled, driver assigned' },
  { key: 'PICKED_UP', label: 'Picked up from warehouse', at: 'picked_up_at' },
  { key: 'IN_TRANSIT', label: 'In transit' },
  { key: 'DELIVERED', label: 'Delivered', at: 'delivered_at' },
  { key: 'COMPLETED', label: 'Shipment closed', at: 'completed_at' },
];

// Vertical rail: filled diamonds are done, the current step is ringed, the
// rest are hollow. Times appear only where the system actually recorded one.
export function ShipmentRail({ shipment }) {
  const idx = STEPS.findIndex((s) => s.key === shipment.status);
  return (
    <ol className="relative ml-1.5">
      {STEPS.map((s, i) => {
        const done = i < idx || (i === idx && (s.key === 'COMPLETED' || s.key === 'DELIVERED'));
        const current = i === idx && !done;
        const ts = s.at ? shipment[s.at] : null;
        return (
          <li key={s.key} className="relative pb-4 pl-6 last:pb-0">
            {i < STEPS.length - 1 ? <span className={`absolute left-[4px] top-3 h-full w-px ${i < idx ? 'bg-brand' : 'bg-line-strong'}`} aria-hidden /> : null}
            <i
              aria-hidden
              className={`absolute left-0 top-[5px] block size-[9px] rotate-45 ${done || i < idx ? 'bg-brand' : current ? 'bg-surface ring-2 ring-brand ring-offset-1' : 'border border-line-strong bg-surface'}`}
            />
            <p className={`text-[13.5px] ${done || current || i < idx ? 'font-medium text-ink' : 'text-ink-3'}`}>{s.label}{current ? <span className="ml-2 text-[12px] font-normal text-brand">Now</span> : null}</p>
            {ts && (done || i <= idx) ? <p className="fig text-[12px] text-ink-3">{dateTime(ts)}</p> : null}
          </li>
        );
      })}
    </ol>
  );
}
