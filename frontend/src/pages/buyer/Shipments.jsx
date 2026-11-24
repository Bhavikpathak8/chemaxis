import { useEffect, useMemo, useState } from 'react';
import { useFetch } from '../../lib/useFetch.js';
import { date, statusLabel } from '../../lib/format.js';
import { Async, Empty, PageHeader, Panel, StatusMark } from '../../ui/bits.jsx';
import { ShipmentRail } from '../../ui/domain.jsx';

export default function Shipments() {
  const ships = useFetch('/transportation/mine');
  const orders = useFetch('/purchase-orders/mine');
  const [sel, setSel] = useState(null);

  const names = useMemo(() => Object.fromEntries((orders.data ?? []).map((o) => [o.id, o.items.map((i) => i.chemical_name).join(', ')])), [orders.data]);
  const awaiting = (orders.data ?? []).filter((o) => o.status === 'CONFIRMED' && !(ships.data ?? []).some((s) => s.purchase_order_id === o.id));
  const list = ships.data ?? [];

  useEffect(() => {
    if (!sel && list.length) setSel((list.find((s) => !['DELIVERED', 'COMPLETED'].includes(s.status)) ?? list[0]).id);
  }, [list, sel]);

  const current = list.find((s) => s.id === sel);

  return (
    <>
      <PageHeader title="Shipment tracking" subtitle="Where each confirmed order is, from pickup to delivery." />
      <Async state={ships}>
        {() => list.length === 0 && awaiting.length === 0 ? (
          <div className="rounded-[6px] border border-line bg-surface"><Empty title="Nothing to track yet" hint="Shipments appear here after C-Tech confirms an order and arranges transport." /></div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
            <ul className="self-start overflow-hidden rounded-[6px] border border-line bg-surface">
              {list.map((s) => (
                <li key={s.id} className="border-b border-line last:border-0">
                  <button onClick={() => setSel(s.id)} aria-current={sel === s.id} className={`w-full px-4 py-3 text-left ${sel === s.id ? 'bg-brand-wash/60' : 'hover:bg-paper'}`}>
                    <span className="flex items-center justify-between gap-2"><span className="fig font-medium">{s.po_number}</span><span className="text-[12.5px] text-ink-3">{date(s.scheduled_at)}</span></span>
                    <span className="mt-1 block text-[13px] text-ink-2">{names[s.purchase_order_id]}</span>
                    <span className="mt-1.5 block"><StatusMark status={s.status} label={statusLabel(s.status)} /></span>
                  </button>
                </li>
              ))}
              {awaiting.map((o) => (
                <li key={o.id} className="border-b border-line px-4 py-3 last:border-0">
                  <span className="fig font-medium">{o.po_number}</span>
                  <span className="mt-1 block text-[13px] text-ink-2">{names[o.id]}</span>
                  <span className="mt-1.5 block"><StatusMark tone="wait" label="Transport being arranged" /></span>
                </li>
              ))}
            </ul>
            <Panel title={current ? `${current.po_number} · ${names[current.purchase_order_id] ?? ''}` : 'Shipment'}>
              {current ? <ShipmentRail shipment={current} /> : <p className="text-[13.5px] text-ink-2">Select an order to see its shipment.</p>}
            </Panel>
          </div>
        )}
      </Async>
    </>
  );
}
