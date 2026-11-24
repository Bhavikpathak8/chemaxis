import { useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useFetch } from '../../lib/useFetch.js';
import { useForm, v } from '../../lib/form.js';
import { useToast } from '../../lib/toast.jsx';
import { date, inr, statusLabel } from '../../lib/format.js';
import { DataTable } from '../../ui/DataTable.jsx';
import { SlidePanel } from '../../ui/SlidePanel.jsx';
import { Field } from '../../ui/Field.jsx';
import { Button, Empty, FigureStrip, PageHeader, StatusMark, Tabs } from '../../ui/bits.jsx';
import { ShipmentBlock } from './shipping.jsx';
import OrderDesk from './OrderDesk.jsx';

const SHIP_STATES = ['PENDING', 'PICKUP_SCHEDULED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];

function VendorForm({ item, onDone }) {
  const toast = useToast();
  const form = useForm({
    initial: { name: item?.name ?? '', contactPhone: item?.contact_phone ?? '', contactEmail: item?.contact_email ?? '', isActive: item?.is_active ?? true },
    rules: { name: v.required('the vendor name'), contactPhone: v.phone(), contactEmail: v.email() },
    onSubmit: async (x) => {
      const body = { name: x.name.trim(), ...(x.contactPhone ? { contactPhone: x.contactPhone.trim() } : {}), ...(x.contactEmail ? { contactEmail: x.contactEmail.trim() } : {}), isActive: x.isActive };
      if (item) await api.patch(`/transport-vendors/${item.id}`, body); else await api.post('/transport-vendors', body);
      toast.success(item ? 'Vendor updated' : 'Vendor added'); onDone(); return true;
    },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Field label="Vendor name" required {...form.bind('name')} />
      <Field label="Phone" inputMode="tel" {...form.bind('contactPhone')} />
      <Field label="Email" type="email" {...form.bind('contactEmail')} />
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={form.values.isActive} onChange={(e) => form.set('isActive', e.target.checked)} /> Active (can be chosen for new shipments)</label>
      <div className="flex justify-end"><Button type="submit" variant="primary" loading={form.busy}>{item ? 'Save changes' : 'Add vendor'}</Button></div>
    </form>
  );
}

function DriverForm({ item, vendors, onDone }) {
  const toast = useToast();
  const form = useForm({
    initial: { name: item?.name ?? '', phone: item?.phone ?? '', licenseNumber: item?.license_number ?? '', vendorId: item?.vendor_id ?? '', isActive: item?.is_active ?? true },
    rules: { name: v.required('the driver name'), phone: [v.required('a phone number'), v.phone()], licenseNumber: v.required('the licence number') },
    onSubmit: async (x) => {
      const body = { name: x.name.trim(), phone: x.phone.trim(), licenseNumber: x.licenseNumber.trim(), isActive: x.isActive, ...(x.vendorId ? { vendorId: x.vendorId } : {}) };
      if (item) await api.patch(`/drivers/${item.id}`, body); else await api.post('/drivers', body);
      toast.success(item ? 'Driver updated' : 'Driver added'); onDone(); return true;
    },
  });
  return (
    <form onSubmit={form.submit} noValidate className="space-y-4">
      <Field label="Driver name" required {...form.bind('name')} />
      <Field label="Mobile number" required inputMode="tel" {...form.bind('phone')} />
      <Field label="Licence number" required {...form.bind('licenseNumber')} />
      <Field label="Works for vendor" as="select" {...form.bind('vendorId')}>
        <option value="">Own driver</option>
        {(vendors ?? []).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
      </Field>
      <label className="flex items-center gap-2 text-[14px]"><input type="checkbox" checked={form.values.isActive} onChange={(e) => form.set('isActive', e.target.checked)} /> Active</label>
      <div className="flex justify-end"><Button type="submit" variant="primary" loading={form.busy}>{item ? 'Save changes' : 'Add driver'}</Button></div>
    </form>
  );
}

export default function Transportation() {
  const [tab, setTab] = useState('shipments');
  const ships = useFetch('/transportation');
  const orders = useFetch('/purchase-orders/admin/all');
  const vendors = useFetch('/transport-vendors');
  const drivers = useFetch('/drivers');
  const [shipSel, setShipSel] = useState(null);
  const [orderSel, setOrderSel] = useState(null);
  const [edit, setEdit] = useState(null); // { kind, item }

  const withShip = new Set((ships.data ?? []).map((s) => s.purchase_order_id));
  const awaiting = (orders.data ?? []).filter((o) => o.status === 'CONFIRMED' && !withShip.has(o.id));
  const ship = (ships.data ?? []).find((s) => s.id === shipSel);
  const live = (ships.data ?? []).filter((s) => !['DELIVERED', 'COMPLETED'].includes(s.status)).length;
  const reload = () => { ships.refresh(); orders.refresh(); };

  const shipCols = [
    { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
    { key: 'route', label: 'Route', value: (r) => `${r.pickup_location} → ${r.delivery_location}`, render: (r) => `${r.pickup_location} → ${r.delivery_location}` },
    { key: 'veh', label: 'Vehicle', value: (r) => r.vehicle_type },
    { key: 'drv', label: 'Driver', value: (r) => r.driver_name ?? '', render: (r) => r.driver_name ?? <span className="text-ink-3">Not assigned</span> },
    { key: 'vendor', label: 'Vendor', value: (r) => r.vendor_name ?? '', render: (r) => r.vendor_name ?? '—' },
    { key: 'cost', label: 'Cost', align: 'right', value: (r) => Number(r.cost), render: (r) => <span className="fig">{inr(r.cost)}</span> },
    { key: 'pod', label: 'POD', value: (r) => (r.pod_url ? 'Yes' : 'No'), render: (r) => (r.pod_url ? 'On file' : ['DELIVERED', 'COMPLETED'].includes(r.status) ? <span className="text-amber">Missing</span> : '—') },
    { key: 'st', label: 'Status', value: (r) => r.status, render: (r) => <StatusMark status={r.status} label={statusLabel(r.status)} /> },
  ];

  return (
    <>
      <PageHeader title="Transportation" subtitle="Move confirmed orders from warehouse to buyer, and keep your vendors and drivers." actions={
        tab === 'vendors' ? <Button variant="primary" icon={Plus} onClick={() => setEdit({ kind: 'vendor' })}>Add vendor</Button>
          : tab === 'drivers' ? <Button variant="primary" icon={Plus} onClick={() => setEdit({ kind: 'driver' })}>Add driver</Button> : null
      } />
      <FigureStrip items={[
        { label: 'Awaiting transport', value: awaiting.length, tone: awaiting.length ? 'wait' : undefined },
        { label: 'In progress', value: live },
        { label: 'Delivered', value: (ships.data ?? []).length - live, tone: 'ok' },
      ]} />
      <Tabs value={tab} onChange={setTab} tabs={[
        { value: 'shipments', label: 'Shipments' }, { value: 'awaiting', label: 'Awaiting transport', count: awaiting.length },
        { value: 'vendors', label: 'Vendors' }, { value: 'drivers', label: 'Drivers' },
      ]} />

      {tab === 'shipments' ? (
        <DataTable columns={shipCols} rows={ships.data} loading={ships.loading} error={ships.error} onRetry={ships.reload} exportName="shipments"
          defaultSort={{ key: 'st', dir: 'asc' }} onRowClick={(r) => setShipSel(r.id)} searchPlaceholder="Search shipments"
          filters={[{ label: 'Status', options: SHIP_STATES.map((s) => ({ value: s, label: statusLabel(s) })), test: (r, val) => r.status === val }]}
          empty={<Empty title="No shipments yet" hint="Confirm an order and assign transport to start one." />} />
      ) : null}

      {tab === 'awaiting' ? (
        <DataTable key="aw" columns={[
          { key: 'po', label: 'Order', value: (r) => r.po_number, render: (r) => <span className="fig font-medium">{r.po_number}</span> },
          { key: 'buyer', label: 'Buyer', value: (r) => r.buyer_company_name },
          { key: 'to', label: 'Deliver to', value: (r) => r.delivery_address },
          { key: 'due', label: 'Expected dispatch', value: (r) => r.expected_dispatch_date ?? '', render: (r) => (r.expected_dispatch_date ? date(r.expected_dispatch_date) : '—') },
          { key: 'a', label: '', sortable: false, csv: false, render: () => <span className="text-brand">Assign transport →</span> },
        ]} rows={orders.data ? awaiting : null} loading={orders.loading} error={orders.error} onRetry={orders.reload}
          onRowClick={(r) => setOrderSel(r.id)} empty={<Empty title="Nothing waiting" hint="Every confirmed order has transport." />} />
      ) : null}

      {tab === 'vendors' ? (
        <DataTable key="v" columns={[
          { key: 'name', label: 'Vendor', value: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'p', label: 'Phone', value: (r) => r.contact_phone ?? '', render: (r) => <span className="fig">{r.contact_phone ?? '—'}</span> },
          { key: 'e', label: 'Email', value: (r) => r.contact_email ?? '' },
          { key: 'a', label: 'Status', value: (r) => (r.is_active ? 'Active' : 'Inactive'), render: (r) => <StatusMark tone={r.is_active ? 'ok' : 'idle'} label={r.is_active ? 'Active' : 'Inactive'} /> },
        ]} rows={vendors.data} loading={vendors.loading} error={vendors.error} onRetry={vendors.reload} exportName="vendors" onRowClick={(r) => setEdit({ kind: 'vendor', item: r })}
          empty={<Empty title="No vendors yet" action={<Button variant="primary" onClick={() => setEdit({ kind: 'vendor' })}>Add vendor</Button>} />} />
      ) : null}

      {tab === 'drivers' ? (
        <DataTable key="d" columns={[
          { key: 'name', label: 'Driver', value: (r) => r.name, render: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'p', label: 'Phone', value: (r) => r.phone, render: (r) => <span className="fig">{r.phone}</span> },
          { key: 'l', label: 'Licence', value: (r) => r.license_number, render: (r) => <span className="fig">{r.license_number}</span> },
          { key: 'v', label: 'Vendor', value: (r) => r.vendor_name ?? 'Own driver' },
          { key: 'a', label: 'Status', value: (r) => (r.is_active ? 'Active' : 'Inactive'), render: (r) => <StatusMark tone={r.is_active ? 'ok' : 'idle'} label={r.is_active ? 'Active' : 'Inactive'} /> },
        ]} rows={drivers.data} loading={drivers.loading} error={drivers.error} onRetry={drivers.reload} exportName="drivers" onRowClick={(r) => setEdit({ kind: 'driver', item: r })}
          empty={<Empty title="No drivers yet" action={<Button variant="primary" onClick={() => setEdit({ kind: 'driver' })}>Add driver</Button>} />} />
      ) : null}

      <SlidePanel open={!!ship} onClose={() => setShipSel(null)} width={580} title={ship?.po_number} subtitle={ship ? `${ship.pickup_location} → ${ship.delivery_location}` : ''}>
        {ship ? <ShipmentBlock key={ship.id + ship.status} shipment={ship} onDone={reload} /> : null}
      </SlidePanel>
      <SlidePanel open={!!orderSel} onClose={() => setOrderSel(null)} width={700} title={(orders.data ?? []).find((o) => o.id === orderSel)?.po_number}>
        {orderSel ? <OrderDesk key={orderSel} id={orderSel} onChanged={reload} onClose={() => setOrderSel(null)} /> : null}
      </SlidePanel>
      <SlidePanel open={!!edit} onClose={() => setEdit(null)} width={460} title={edit ? `${edit.item ? 'Edit' : 'Add'} ${edit.kind}` : ''}>
        {edit?.kind === 'vendor' ? <VendorForm key={edit.item?.id ?? 'new'} item={edit.item} onDone={() => { setEdit(null); vendors.refresh(); }} /> : null}
        {edit?.kind === 'driver' ? <DriverForm key={edit.item?.id ?? 'new'} item={edit.item} vendors={(vendors.data ?? []).filter((x) => x.is_active)} onDone={() => { setEdit(null); drivers.refresh(); }} /> : null}
      </SlidePanel>
    </>
  );
}
