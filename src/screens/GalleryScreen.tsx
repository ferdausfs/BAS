import { useMemo, useState } from 'react';
import { ArrowLeft, Images, X } from 'lucide-react';
import { useUI } from '../lib/store';
import { useT } from '../lib/i18n';
import { useGallery } from '../hooks/useGallery';
import { hapticTap, safeArray } from '../lib/utils';
import type { GalleryItem } from '../types';

const isFileNameCaption = (caption: string): boolean =>
  !caption.trim() || /\.(jpe?g|png|webp|gif|heic|avif)$/i.test(caption.trim());

export default function GalleryScreen() {
  const { back, go } = useUI();
  const t = useT();
  const { gallery, loading } = useGallery();
  const [openId, setOpenId] = useState<string | null>(null);

  const items = useMemo(
    () => safeArray<GalleryItem>(gallery).filter((item) => !!item.image),
    [gallery],
  );
  const openItem = items.find((item) => item.id === openId) ?? null;

  return (
    <div className="flex h-full flex-col">
      <header className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="relative flex h-14 items-center justify-center">
          <button
            type="button"
            onClick={back}
            className="absolute left-0 flex h-12 w-12 items-center justify-center rounded-full bg-surface text-ink-200 shadow-card transition active:scale-90"
            aria-label={t('common.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink">{t('gallery.title')}</h1>
        </div>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-primary">{t('gallery.kicker')}</p>
        <h2 className="mt-1 text-[22px] font-medium tracking-[-0.02em] text-ink-300">{t('gallery.subtitle')}</h2>

        {loading && items.length === 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index} className="shimmer relative block h-40 overflow-hidden rounded-[22px]" aria-hidden="true" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-coral shadow-card">
              <Images size={28} strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[14px] font-medium text-ink-300">{t('gallery.empty')}</p>
            <p className="mt-1 text-[12px] text-ink-200">{t('gallery.emptyBody')}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  hapticTap();
                  setOpenId(item.id);
                }}
                className="group overflow-hidden rounded-[22px] border border-border bg-surface text-left shadow-card transition active:scale-[0.98]"
              >
                <img
                  src={item.image}
                  alt={isFileNameCaption(item.caption) ? t('gallery.title') : item.caption}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    const img = event.currentTarget as HTMLImageElement;
                    img.onerror = null;
                    img.src = '/cakes/logo-cake.png';
                  }}
                  className="h-40 w-full object-cover"
                />
                {!isFileNameCaption(item.caption) && (
                  <p className="line-clamp-2 px-3 py-2 text-[12px] font-semibold text-ink">{item.caption}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {openItem && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 p-5"
          onClick={() => setOpenId(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setOpenId(null)}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white active:scale-90"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" strokeWidth={2.2} />
          </button>
          <img
            src={openItem.image}
            alt={isFileNameCaption(openItem.caption) ? t('gallery.title') : openItem.caption}
            className="max-h-[70vh] w-full max-w-md rounded-2xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />
          {!isFileNameCaption(openItem.caption) && (
            <p className="mt-4 max-w-sm text-center text-[13px] font-semibold text-white/90">{openItem.caption}</p>
          )}
          {openItem.product_id && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setOpenId(null);
                go({ name: 'product', productId: openItem.product_id! });
              }}
              className="mt-4 rounded-full bg-coral px-5 py-2.5 text-[13px] font-bold text-white shadow-btn"
            >
              {t('gallery.openProduct')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
