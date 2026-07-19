import { X, Bell, CheckCheck } from 'lucide-react';
import { useUI } from '../lib/store';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';

export default function NotificationsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { notifications, markAllRead } = useUI();
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);
  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 z-[120] flex items-end justify-center ${closing ? 'anim-fade-out' : 'anim-fade'}`}>
      <button type="button" aria-label="Close notifications" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <section className={`relative max-h-[76%] w-full overflow-hidden rounded-t-[28px] border border-border bg-surface shadow-float ${closing ? 'anim-down' : 'anim-up'}`} aria-label="Notifications">
        <header className="flex items-center justify-between border-b border-divider px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-primary shadow-card"><Bell className="h-5 w-5" strokeWidth={1.8} /></span>
            <div>
              <h2 className=" text-[20px] font-semibold text-text">Notifications</h2>
              <p className="text-[13px] text-text-secondary">{notifications.length} updates</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button type="button" onClick={markAllRead} className="flex h-10 items-center gap-1 rounded-[14px] px-2.5 text-[12px] font-semibold text-primary transition hover:bg-secondary active:scale-95">
                <CheckCheck className="h-4 w-4" strokeWidth={2} /> Read all
              </button>
            )}
            <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-text-secondary transition active:scale-90" aria-label="Close">
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="no-scrollbar max-h-[60vh] overflow-y-auto p-4">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-secondary text-primary shadow-card"><Bell className="h-8 w-8" strokeWidth={1.5} /></span>
              <p className="mt-4 text-[16px] font-semibold text-text">No notifications yet</p>
              <p className="mt-1 max-w-[230px] text-[13px] leading-relaxed text-text-secondary">Order and promo updates will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <article key={notification.id} className={`rounded-[20px] border p-4 shadow-card ${notification.read ? 'border-border bg-surface' : 'border-accent bg-secondary/45'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-divider' : 'bg-primary'}`} />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold text-text">{notification.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">{notification.body}</p>
                      <time className="mt-2 block text-[11px] font-medium text-text-tertiary">{new Date(notification.createdAt).toLocaleString('en-BD')}</time>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
