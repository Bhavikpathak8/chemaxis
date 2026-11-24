import { useState } from 'react';
import { api } from '../../lib/api.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { Field, FileInput } from '../../ui/Field.jsx';
import { Banner, Button } from '../../ui/bits.jsx';
import { statusLabel } from '../../lib/format.js';
import { ShipmentRail } from '../../ui/domain.jsx';

export const STATUS_ORDER = ['PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];
const NEXT_LABEL = {
  PICKUP_SCHEDULED: 'Schedule pickup', PICKED_UP: 'Mark picked up', IN_TRANSIT: 'Mark in transit',
  DELIVERED: 'Mark delivered', COMPLETED: 'Close shipment',
};

export const useVendors = () => useFetch('/transport-vendors');
export const useDrivers = () => useFetch('/drivers');

// Step 1 of delivery: choose route, vehicle and cost. The cost becomes an
// expense on the order automatically, so profit stays honest.
export function AssignTransport({ order, onDone }) {
  const vendors = useVendors();
  const form = useForm({
    initial: {
      pickupLocation: order.seller_location ?? '', deliveryLocation: order.delivery_address ?? '',
      distanceKm: '', vehicleType: '', cost: '', vendorId: '',
    },
    draftKey: `assign-transport-${order.id}`,
    rules: {
      pickupLocation: v.required('the pickup location'),
      deliveryLocation: v.required('the delivery location'),
      vehicleType: v.required('a vehicle type'),
      cost: v.positive('the transport cost'),
      distanceKm: (x) => (x !== '' && Number(x) <= 0 ? 'Distance must be more than 0' : null),
    },
    onSubmit: async (vals) => {
      await api.post(`/transportation/order/${order.id}`, {
        pickupLocation: vals.pickupLocation.trim(), deliveryLocation: vals.deliveryLocation.trim(), vehicleType: vals.vehicleType.trim(),
        cost: Number(vals.cost), ...(vals.distanceKm !== '' ? { distanceKm: Number(vals.distanceKm) } : {}), ...(vals.vendorId ? { vendorId: vals.vendorId } : {}),
      });
      onDone(); return true;
    },
  });
  const active = (vendors.data ?? []).filter((x) => x.is_active);
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pickup location" required {...form.bind('pickupLocation')} />
        <Field label="Delivery location" required {...form.bind('deliveryLocation')} />
        <Field label="Vehicle type" required placeholder="Chemical tanker, 20 ft container…" {...form.bind('vehicleType')} />
        <Field label="Distance" type="number" min="0" step="0.1" suffix="km" {...form.bind('distanceKm')} />
        <Field label="Transport cost" type="number" min="0" step="0.01" prefix="₹" required hint="Recorded as a Transportation expense on this order." {...form.bind('cost')} />
        <Field label="Transport vendor" as="select" {...form.bind('vendorId')} hint={active.length ? undefined : 'No vendors yet. Add them under Transportation → Vendors.'}>
          <option value="">Own vehicle / none</option>
          {active.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
        </Field>
      </div>
      <div className="flex justify-end"><Button type="submit" variant="primary" loading={form.busy}>Assign transport</Button></div>
    </form>
  );
}

// Moves a shipment exactly one step forward. Scheduling a pickup needs a driver.
export function AdvanceControls({ shipment, onDone }) {
  const drivers = useDrivers();
  const vendors = useVendors();
  const [driverId, setDriverId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [pod, setPod] = useState(null);
  const idx = STATUS_ORDER.indexOf(shipment.status);
  const next = STATUS_ORDER[idx + 1];
  const adv = useAction((body) => api.patch(`/transportation/${shipment.id}/status`, body), { success: (o) => `Shipment is now ${statusLabel(o?.status ?? '')}` });
  const up = useAction(() => api.upload(`/transportation/${shipment.id}/pod`, pod), { success: 'Proof of delivery uploaded' });
  const needsDriver = next === 'PICKUP_SCHEDULED';
  const activeDrivers = (drivers.data ?? []).filter((d) => d.is_active);
  const delivered = ['DELIVERED', 'COMPLETED'].includes(shipment.status);

  return (
    <div className="space-y-4">
      {next ? (
        <div className="space-y-3 rounded-[6px] border border-line bg-paper p-4">
          {needsDriver ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[13px] font-medium" htmlFor={`drv-${shipment.id}`}>Driver <span className="text-danger" aria-hidden>*</span></label>
                <select id={`drv-${shipment.id}`} className="input" value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                  <option value="">Choose a driver</option>
                  {activeDrivers.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.phone}</option>)}
                </select>
                {!activeDrivers.length && !drivers.loading ? <p className="mt-1 text-[12.5px] text-amber">No active drivers. Add one under Transportation → Drivers.</p> : null}
              </div>
              <div>
                <label className="mb-1 block text-[13px] font-medium" htmlFor={`vnd-${shipment.id}`}>Vendor (optional)</label>
                <select id={`vnd-${shipment.id}`} className="input" value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                  <option value="">{shipment.vendor_name ?? 'Keep current'}</option>
                  {(vendors.data ?? []).filter((x) => x.is_active).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                </select>
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-ink-2">Next step: <strong>{NEXT_LABEL[next]}</strong>{next === 'DELIVERED' ? '. This marks the order delivered and works out the profit.' : ''}</p>
            <Button variant="primary" loading={adv.busy} disabled={needsDriver && !driverId} onClick={async () => {
              const o = await adv.run({ status: next, ...(needsDriver ? { driverId, ...(vendorId ? { vendorId } : {}) } : {}) }); if (o.ok) onDone();
            }}>{NEXT_LABEL[next]}</Button>
          </div>
        </div>
      ) : <p className="text-[13.5px] text-ink-2">This shipment is closed.</p>}

      {delivered ? (
        <div className="space-y-3">
          {shipment.pod_url ? <Banner tone="ok">Proof of delivery is on file. Uploading again replaces it.</Banner> : <Banner tone="wait">Proof of delivery has not been uploaded.</Banner>}
          <FileInput label="Proof of delivery" file={pod} onChange={setPod} hint="Signed delivery note or photo. PDF, PNG, JPEG or WEBP." />
          <div className="flex justify-end"><Button disabled={!pod} loading={up.busy} onClick={async () => { const o = await up.run(); if (o.ok) { setPod(null); onDone(); } }}>Upload proof</Button></div>
        </div>
      ) : null}
    </div>
  );
}

export function ShipmentBlock({ shipment, onDone }) {
  return (
    <div className="space-y-4">
      <ShipmentRail shipment={shipment} showCost />
      <AdvanceControls shipment={shipment} onDone={onDone} />
    </div>
  );
}
