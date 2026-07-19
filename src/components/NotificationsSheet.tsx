import { X, Bell, CheckCheck } from 'lucide-react';
import { useUI } from '../lib/store';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';

export default function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markAllRead } = useUI();
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);
  if (!mounted) return null;

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <div className={`absolute inset-0 z-[120] flex items-end justify-center ${closing ? 'anim-fade-out' : 'anim-fade'}`}>
      <button type="button" aria-label="Close notifications" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <section className={`relative max-h-[76%] w-full overflow-hidden rounded-t-[22px] bg-surface shadow-float ${closing ? 'anim-down' : 'anim-up'}`} aria-label="Notifications">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-medium text-text">Notifications</h2>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold leading-none text-white">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[13px] text-text-secondary">{notifications.length} updates</p>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button type="button" onClick={markAllRead} className="flex h-11 items-center gap-1 rounded-full bg-secondary px-3 text-[12px] font-semibold text-primary transition active:scale-95">
                <CheckCheck className="h-4 w-4" strokeWidth={2} /> Read all
              </button>
            )}
            <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-text shadow-card transition active:scale-90" aria-label="Close">
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="no-scrollbar max-h-[60vh] overflow-y-auto px-6 pb-5">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card"><Bell className="h-8 w-8" strokeWidth={1.5} /></span>
              <p className="mt-4 text-[16px] font-semibold text-text">No notifications yet</p>
              <p className="mt-1 max-w-[230px] text-[13px] leading-relaxed text-text-secondary">Order and promo updates will appear here.</p>
            </div>
          ) : (
            <div>
              <div className="mb-1 flex items-center justify-between px-0.5 text-[12px] font-medium">
                <span className="tracking-[0.14em] text-text-tertiary">TODAY</span>
                <button type="button" onClick={markAllRead} className="text-primary">Mark all as read</button>
              </div>
              <div className="divide-y divide-divider">
                {notifications.map((notification) => (
                  <article key={notification.id} className="flex gap-4 px-0.5 py-[18px]">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <Bell className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="truncate text-[16px] font-semibold text-text">{notification.title}</h3>
                        <time className="shrink-0 text-[12px] text-text-tertiary">{new Date(notification.createdAt).toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}</time>
                      </div>
                      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{notification.body}</p>
                      {!notification.read && <span className="mt-2 inline-flex h-2 w-2 rounded-full bg-primary" aria-label="Unread" />}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
