import { CheckCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { ago } from '../../lib/format.js';
import { useAction, useFetch } from '../../lib/useFetch.js';
import { Async, Button, Empty, PageHeader } from '../../ui/bits.jsx';

export default function Notifications() {
  const feed = useFetch('/notifications/mine');
  const markAll = useAction(() => api.patch('/notifications/mine/read-all'), { success: 'All notifications marked as read' });
  const markOne = useAction((id) => api.patch(`/notifications/${id}/read`));

  const unread = feed.data?.unreadCount ?? 0;

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Updates on approvals, quotations, shipments and payments that involve you."
        actions={<Button icon={CheckCheck} disabled={!unread} loading={markAll.busy} onClick={async () => { const r = await markAll.run(); if (r.ok) feed.refresh(); }}>Mark all as read</Button>}
      />
      <div className="rounded-[6px] border border-line bg-surface">
        <Async state={feed}>
          {(data) => data.items.length === 0 ? (
            <Empty title="No notifications yet" hint="When something happens on one of your orders or quotations, it will show up here." />
          ) : (
            <ul>
              {data.items.map((n) => (
                <li key={n.id} className="border-b border-line last:border-0">
                  <button
                    onClick={async () => { if (!n.is_read) { await markOne.run(n.id); feed.refresh(); } }}
                    className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-paper"
                  >
                    <i aria-hidden className={`mt-[7px] block size-[8px] shrink-0 rotate-45 ${n.is_read ? 'border-[1.5px] border-ink-3' : 'bg-brand'}`} />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[14px] ${n.is_read ? 'text-ink-2' : 'font-semibold text-ink'}`}>{n.title}</span>
                      <span className="block text-[13.5px] text-ink-2">{n.message}</span>
                    </span>
                    <span className="shrink-0 text-[12.5px] text-ink-3">{ago(n.created_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Async>
      </div>
    </>
  );
}
