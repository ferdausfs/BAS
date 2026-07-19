import { X } from 'lucide-react';
import { categories } from '../lib/data';
import type { Category } from '../types';
import OccasionIcon from './OccasionIcon';
import { useModalDepth } from '../hooks/useModalDepth';
import { useSheetTransition } from '../hooks/useSheetTransition';

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (category: Category, button: HTMLButtonElement) => void;
};

export default function OccasionSheet({ open, onClose, onSelect }: Props) {
  const { mounted, closing } = useSheetTransition(open);
  useModalDepth(mounted);
  if (!mounted) return null;

  return (
    <div className={`absolute inset-0 z-[120] flex items-end justify-center ${closing ? 'anim-fade-out' : 'anim-fade'}`}>
      <button type="button" aria-label="Close occasions" className="absolute inset-0 bg-ink/45" onClick={onClose} />
      <section className={`relative max-h-[76%] w-full overflow-hidden rounded-t-[22px] border border-border bg-surface shadow-float ${closing ? 'anim-down' : 'anim-up'}`} aria-label="Browse by occasion">
        <header className="flex items-center justify-between border-b border-divider px-6 py-4">
          <div>
            <h2 className=" text-[20px] font-semibold text-text">Browse by occasion</h2>
            <p className="mt-0.5 text-[14px] text-text-secondary">Pick a category to explore</p>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-secondary text-text-secondary transition active:scale-90" aria-label="Close">
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="no-scrollbar grid grid-cols-3 gap-x-3 gap-y-5 overflow-y-auto p-6 pb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={(event) => {
                onSelect(category, event.currentTarget);
                onClose();
              }}
              className="flex min-w-0 flex-col items-center gap-2.5 rounded-[18px] py-1 transition active:scale-95"
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-[20px] border shadow-card"
                style={{ background: `${category.color}1A`, borderColor: `${category.color}33`, color: category.fg }}
              >
                <OccasionIcon id={category.id} size={26} />
              </span>
              <span className="truncate text-[12px] font-semibold text-text-secondary">{category.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
