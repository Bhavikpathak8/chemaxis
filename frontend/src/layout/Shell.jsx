import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, CornerDownLeft, LogOut, Menu, Search, WifiOff, X } from 'lucide-react';
import { useAuth, isStaff } from '../lib/auth.jsx';
import { api, isOffline, onNetChange } from '../lib/api.js';
import { ago, time } from '../lib/format.js';
import { flatItems, portalFor } from './nav.js';
import { Banner } from '../ui/bits.jsx';
import { useFetch } from '../lib/useFetch.js';

import ChemAxisLogo from '../components/ui/ChemAxisLogo.jsx';

function Wordmark({ label }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
      <ChemAxisLogo theme="dark" variant="full" size={28} />
    </div>
  );
}

function NavList({ portal, role, badges, onNavigate }) {
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto dark-scrollbar px-2 pb-4">
      {portal.groups.filter((g) => !g.superOnly || role === 'SUPER_ADMIN').map((g, gi) => (
        <div key={gi} className={gi ? 'mt-5' : ''}>
          {g.title ? <div className="px-2.5 pb-1.5 text-[12px] text-slate-soft/80">{g.title}</div> : null}
          <ul className="space-y-px">
            {g.items.map((it) => {
              const Icon = it.icon;
              const count = it.badge ? badges[it.badge] : 0;
              return (
                <li key={it.to}>
                  <NavLink
                    to={`${portal.base}${it.to ? `/${it.to}` : ''}`}
                    end={it.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `group relative flex items-center gap-2.5 rounded-[5px] px-2.5 py-[7px] text-[13.5px] transition-colors ${isActive ? 'bg-white/[0.08] text-white' : 'text-slate-soft hover:bg-white/[0.05] hover:text-white'}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive ? <span className="absolute -left-2 top-1.5 h-[calc(100%-12px)] w-[3px] rounded-r bg-brand" aria-hidden /> : null}
                        <Icon size={16} strokeWidth={1.75} aria-hidden />
                        <span className="flex-1">{it.label}</span>
                        {count ? <span className="fig rounded-sm bg-amber-wash px-1.5 text-[11.5px] font-medium text-amber">{count}</span> : null}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CommandPalette({ open, onClose, items, base }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => !needle || `${i.label} ${i.group ?? ''}`.toLowerCase().includes(needle));
  }, [items, q]);

  useEffect(() => { if (open) { setQ(''); setIdx(0); setTimeout(() => inputRef.current?.focus(), 0); } }, [open]);
  useEffect(() => setIdx(0), [q]);

  if (!open) return null;
  const go = (it) => { navigate(`${base}${it.to ? `/${it.to}` : ''}`); onClose(); };

  return (
    <div className="fixed inset-0 z-[70] grid place-items-start justify-center p-4 pt-[12vh]" onKeyDown={(e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter' && results[idx]) go(results[idx]);
    }}>
      <div className="anim-scrim absolute inset-0 bg-slate-deep/40" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Jump to a page" className="anim-rise relative w-full max-w-md overflow-hidden rounded-[8px] border border-line-strong bg-surface">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search size={16} className="text-ink-3" aria-hidden />
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Jump to a page" aria-label="Jump to a page" className="h-11 flex-1 bg-transparent text-[14.5px] outline-none placeholder:text-ink-3" />
        </div>
        <ul className="max-h-72 overflow-y-auto p-1.5" role="listbox">
          {results.length === 0 ? <li className="px-3 py-6 text-center text-[13.5px] text-ink-3">No page matches “{q}”.</li> : results.map((it, i) => {
            const Icon = it.icon;
            return (
              <li key={it.to} role="option" aria-selected={i === idx}>
                <button onMouseEnter={() => setIdx(i)} onClick={() => go(it)} className={`flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-left text-[14px] ${i === idx ? 'bg-brand-wash text-ink' : 'text-ink-2'}`}>
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                  <span className="flex-1">{it.label}</span>
                  {it.group ? <span className="text-[12px] text-ink-3">{it.group}</span> : null}
                  {i === idx ? <CornerDownLeft size={13} className="text-ink-3" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function NotificationBell({ base }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const box = useRef(null);
  const feed = useFetch('/notifications/mine');
  const { refresh } = feed;

  useEffect(() => { const t = setInterval(refresh, 45000); return () => clearInterval(t); }, [refresh]);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const items = feed.data?.items ?? [];
  const unread = feed.data?.unreadCount ?? 0;

  const read = async (n) => {
    if (!n.is_read) { try { await api.patch(`/notifications/${n.id}/read`); refresh(); } catch { /* shown on the full page */ } }
  };

  return (
    <div className="relative" ref={box}>
      <button onClick={() => { setOpen(!open); if (!open) refresh(); }} aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'} aria-expanded={open} className="relative rounded-[5px] p-2 text-ink-2 hover:bg-paper">
        <Bell size={18} strokeWidth={1.75} />
        {unread ? <span className="fig absolute -right-0.5 -top-0.5 grid min-w-[17px] place-items-center rounded-full bg-danger px-1 text-[10.5px] font-medium leading-[17px] text-white">{unread > 9 ? '9+' : unread}</span> : null}
      </button>
      {open ? (
        <div className="anim-rise absolute right-0 top-full z-50 mt-1.5 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-[8px] border border-line-strong bg-surface">
          <div className="flex items-center justify-between border-b border-line px-3.5 py-2.5">
            <span className="text-[14px] font-semibold">Notifications</span>
            <button className="text-[12.5px] font-medium text-brand hover:underline" onClick={() => { setOpen(false); navigate(`${base}/notifications`); }}>See all</button>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? <li className="px-4 py-8 text-center text-[13.5px] text-ink-3">You're all caught up.</li> : items.slice(0, 8).map((n) => (
              <li key={n.id}>
                <button onClick={() => read(n)} className="flex w-full gap-2.5 border-b border-line px-3.5 py-2.5 text-left last:border-0 hover:bg-paper">
                  <i aria-hidden className={`mt-[7px] block size-[7px] shrink-0 rotate-45 ${n.is_read ? 'border border-ink-3' : 'bg-brand'}`} />
                  <span className="min-w-0">
                    <span className={`block text-[13.5px] ${n.is_read ? 'text-ink-2' : 'font-medium text-ink'}`}>{n.title}</span>
                    <span className="block text-[12.5px] text-ink-2">{n.message}</span>
                    <span className="block text-[12px] text-ink-3">{ago(n.created_at)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function OfflineBar() {
  const [off, setOff] = useState(isOffline());
  useEffect(() => onNetChange(setOff), []);
  if (!off) return null;
  return (
    <div role="status" className="flex items-center gap-2 border-b border-amber-mark/40 bg-amber-wash px-4 py-2 text-[13px] text-amber md:px-8">
      <WifiOff size={15} aria-hidden />
      <span>The server can't be reached. You're seeing the last data saved on this device, and changes are paused until it's back. Retrying every few seconds.</span>
    </div>
  );
}

export default function Shell() {
  const { user, profile, logout } = useAuth();
  const portal = portalFor(user.role);
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const items = useMemo(() => flatItems(portal, user.role), [portal, user.role]);

  // Badge counts for the trader's sidebar (what needs attention right now).
  const dash = useFetch(isStaff(user.role) ? '/analytics/trader/dashboard' : null);
  const { refresh: refreshDash } = dash;
  useEffect(() => { if (!isStaff(user.role)) return undefined; const t = setInterval(refreshDash, 60000); return () => clearInterval(t); }, [user.role, refreshDash]);
  useEffect(() => { if (isStaff(user.role)) refreshDash(); }, [location.pathname, user.role, refreshDash]);
  const d = dash.data;
  const badges = {
    approvals: d ? d.attention.pendingSellers + d.attention.pendingBuyers : 0,
    quotations: d?.pendingQuotations.total ?? 0,
    orders: d?.attention.ordersToConfirm ?? 0,
    transport: d?.pendingDeliveries.total ?? 0,
  };

  useEffect(() => { setDrawer(false); }, [location.pathname]);
  useEffect(() => {
    const current = [...items].reverse().find((i) => location.pathname === `${portal.base}${i.to ? `/${i.to}` : ''}` || location.pathname.startsWith(`${portal.base}/${i.to}/`) && i.to);
    document.title = `${current?.label ?? 'Home'} · ChemAxis`;
  }, [location.pathname, items, portal.base]);
  useEffect(() => {
    const k = (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); } };
    document.addEventListener('keydown', k);
    return () => document.removeEventListener('keydown', k);
  }, []);

  const bottom = portal.bottom.map((t) => items.find((i) => i.to === t)).filter(Boolean);
  const company = profile?.company_name;
  const doLogout = useCallback(() => logout(), [logout]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[236px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col bg-slate-deep dark-scrollbar md:flex">
        <Wordmark label={portal.label} />
        <NavList portal={portal} role={user.role} badges={badges} />
        <div className="border-t border-white/10 p-3">
          <div className="truncate px-1 text-[13px] text-white">{company ?? user.email}</div>
          <div className="truncate px-1 text-[12px] text-slate-soft">{company ? user.email : user.role === 'SUPER_ADMIN' ? 'Super admin' : user.role === 'TRADER_STAFF' ? 'Trader staff' : ''}</div>
          <button onClick={doLogout} className="mt-2 flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-[13px] text-slate-soft hover:bg-white/[0.06] hover:text-white"><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      {drawer ? (
        <div className="fixed inset-0 z-[65] md:hidden">
          <div className="anim-scrim absolute inset-0 bg-slate-deep/50" onClick={() => setDrawer(false)} aria-hidden />
          <aside className="anim-panel absolute left-0 top-0 flex h-full w-[272px] max-w-[85vw] flex-col bg-slate-deep dark-scrollbar" style={{ animationName: 'none' }}>
            <div className="flex items-start justify-between pr-2"><Wordmark label={portal.label} /><button onClick={() => setDrawer(false)} aria-label="Close menu" className="mt-4 rounded p-1.5 text-slate-soft hover:bg-white/10"><X size={18} /></button></div>
            <NavList portal={portal} role={user.role} badges={badges} onNavigate={() => setDrawer(false)} />
            <div className="border-t border-white/10 p-3"><button onClick={doLogout} className="flex w-full items-center gap-2 rounded-[5px] px-2 py-1.5 text-[13px] text-slate-soft hover:bg-white/[0.06]"><LogOut size={15} /> Sign out</button></div>
          </aside>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-[52px] items-center gap-2 border-b border-line bg-surface px-3 md:px-6">
          <button onClick={() => setDrawer(true)} aria-label="Open menu" className="rounded-[5px] p-2 text-ink-2 hover:bg-paper md:hidden"><Menu size={19} /></button>
          <button onClick={() => setPalette(true)} className="flex h-8 w-full max-w-[300px] items-center gap-2 rounded-[5px] border border-line-strong bg-paper/60 px-2.5 text-[13px] text-ink-3 hover:bg-paper">
            <Search size={14} aria-hidden /> <span className="flex-1 text-left">Jump to a page</span>
            <kbd className="fig hidden rounded border border-line-strong bg-surface px-1.5 text-[11px] text-ink-3 sm:inline">Ctrl K</kbd>
          </button>
          <div className="ml-auto flex items-center gap-1">
            <span className="hidden pr-2 text-[12.5px] text-ink-3 lg:inline">{time(new Date())}</span>
            <NotificationBell base={portal.base} />
          </div>
        </header>
        <OfflineBar />
        <main className="min-w-0 flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-7">
          {user.role === 'SELLER' || user.role === 'BUYER' ? <VerificationBanner profile={profile} role={user.role} /> : null}
          <Outlet />
        </main>
      </div>

      <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-40 grid border-t border-line bg-surface md:hidden" style={{ gridTemplateColumns: `repeat(${bottom.length}, minmax(0, 1fr))` }}>
        {bottom.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink key={it.to} to={`${portal.base}${it.to ? `/${it.to}` : ''}`} end={it.end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'font-medium text-brand' : 'text-ink-3'}`}>
              <Icon size={19} strokeWidth={1.75} aria-hidden />
              <span className="max-w-full truncate px-1">{it.label.replace('Browse chemicals', 'Chemicals').replace('Company profile', 'Profile')}</span>
            </NavLink>
          );
        })}
      </nav>
      <CommandPalette open={palette} onClose={() => setPalette(false)} items={items} base={portal.base} />
    </div>
  );
}

function VerificationBanner({ profile, role }) {
  if (!profile) return null;
  if (profile.verification_status === 'APPROVED') return null;
  const what = role === 'SELLER' ? 'list chemicals' : 'request quotations';
  if (profile.verification_status === 'REJECTED') {
    return <Banner tone="bad" title="Your account wasn't approved.">ChemAxis reviewed your company details and couldn't verify them. Contact the ChemAxis team to correct your details.</Banner>;
  }
  return <Banner tone="wait" title="Waiting for approval.">The ChemAxis team is checking your GST number{role === 'SELLER' ? ' and documents' : ''}. You can explore the portal now; you'll be able to {what} once you're approved.</Banner>;
}
