const inrFmt = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inrFmt0 = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const numFmt = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

const toNum = (v) => (v === null || v === undefined || v === '' ? 0 : Number(v));

export const inr = (v) => inrFmt.format(toNum(v));
export const inr0 = (v) => inrFmt0.format(toNum(v));
export const num = (v) => numFmt.format(toNum(v));

// Compact rupee amounts for chart axes: 5.35L, 1.2Cr (Indian numbering).
export function inrShort(v) {
  const n = toNum(v);
  const a = Math.abs(n);
  if (a >= 1e7) return `₹${+(n / 1e7).toFixed(2)}Cr`;
  if (a >= 1e5) return `₹${+(n / 1e5).toFixed(2)}L`;
  if (a >= 1e3) return `₹${+(n / 1e3).toFixed(1)}k`;
  return `₹${n}`;
}

const UNIT = { KG: 'kg', TON: 't', LITRE: 'L' };
export const unitLabel = (u) => UNIT[u] ?? (u || '').toLowerCase();
export const qty = (v, unit) => `${num(v)} ${unitLabel(unit)}`;
export const perUnit = (v, unit) => `${inr(v)}/${unitLabel(unit)}`;

const TZ = 'Asia/Kolkata';
const dateFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });
const dateTimeFmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });
const timeFmt = new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: TZ });

export const date = (d) => (d ? dateFmt.format(new Date(d)) : '—');
export const dateTime = (d) => (d ? dateTimeFmt.format(new Date(d)) : '—');
export const time = (d) => (d ? timeFmt.format(new Date(d)) : '—');
export const isoDate = (d) => new Date(d).toISOString().slice(0, 10);

export function ago(d) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.round(s / 86400)} d ago`;
  return date(d);
}

export const words = (s) => {
  const t = String(s ?? '').toLowerCase().replace(/_/g, ' ');
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Status → tone for the diamond mark. ok = done/healthy, wait = needs someone,
// bad = failed/blocked, info = in motion, idle = closed/neutral.
const TONES = {
  APPROVED: 'ok', VERIFIED: 'ok', PAID: 'ok', DELIVERED: 'ok', COMPLETED: 'ok', ACCEPTED: 'ok', ACTIVE: 'ok', LIVE: 'ok', SENT: 'info',
  PENDING: 'wait', REQUESTED: 'wait', REVIEWED: 'wait', DRAFT: 'wait', PICKUP_SCHEDULED: 'wait', CONFIRMED: 'info', QUOTED: 'info',
  IN_TRANSIT: 'info', PICKED_UP: 'info',
  REJECTED: 'bad', CANCELLED: 'bad', BANNED: 'bad', EXPIRED: 'bad', OVERDUE: 'bad',
  INACTIVE: 'idle',
};
export const toneOf = (status) => TONES[status] ?? 'idle';

export const STATUS_LABEL = {
  REQUESTED: 'Awaiting quote', REVIEWED: 'Being quoted', QUOTED: 'Quote received',
  IN_TRANSIT: 'In transit', PICKUP_SCHEDULED: 'Pickup scheduled', PICKED_UP: 'Picked up',
  BANK_TRANSFER: 'Bank transfer', UPI: 'UPI', CHEQUE: 'Cheque', CASH: 'Cash', OTHER: 'Other',
  SUPER_ADMIN: 'Super admin', TRADER_STAFF: 'Trader staff',
};
export const statusLabel = (s) => STATUS_LABEL[s] ?? words(s);

export function csvCell(v) {
  if (v === null || v === undefined) return '';
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`; // never let a spreadsheet run a formula
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(filename, columns, rows) {
  const head = columns.map((c) => csvCell(c.label)).join(',');
  const body = rows.map((r) => columns.map((c) => csvCell(c.value(r))).join(','));
  const blob = new Blob(['﻿' + [head, ...body].join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
