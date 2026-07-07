import { X } from 'lucide-react';
import { categories } from '../lib/data';
import type { Category } from '../types';
import OccasionIcon from './OccasionIcon';
import { useModalDepth } from '../hooks/useModalDepth';

type Props = {
  open: boolean;
  onClose: () => void;
  // Same signature as HomeScreen's openOccasion(c, btn) so the zoom-in
  // page transition works identically whether triggered from the old
  // inline row or from here.
  onSelect: (c: Category, btn: HTMLButtonElement) => void;
};

export default function OccasionSheet({ open, onClose, onSelect }: Props) {
  useModalDepth(open);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[65] flex items-end justify-center anim-fade">
      <button
        type="button"
        aria-label="Close occasions"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        className="relative max-h-[72%] w-full overflow-hidden rounded-t-[28px] glass-strong anim-up"
        style={{ boxShadow: '0 -20px 60px -20px rgba(26,19,17,.25)' }}
      >
        <header className="flex items-center justify-between glass-subtle px-5 py-4">
          <div>
            <div className="font-display text-[16px] font-bold text-ink">Browse by occasion</div>
            <div className="text-[11px] text-ink-200">Pick a category to explore</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink-200 active:scale-90"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </header>

        <div className="no-scrollbar grid grid-cols-3 gap-y-5 overflow-y-auto p-5 pb-8">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={(e) => {
                // Capture the tapped button + fire the zoom-transition first
                // (it reads getBoundingClientRect synchronously), then close
                // the sheet — the full-screen zoom overlay (z-[200], app
                // root) renders above this sheet regardless of sheet state.
                onSelect(c, e.currentTarget);
                onClose();
              }}
              className="flex flex-col items-center gap-2"
            >
              <div
                className="flex items-center justify-center rounded-2xl transition-transform active:scale-90"
                style={{
                  width: 64,
                  height: 64,
                  background: `linear-gradient(160deg, ${c.color} 0%, #FFFFFF 130%)`,
                  border: `1px solid ${c.fg}1F`,
                  boxShadow: `0 1px 2px rgba(26,19,17,.03), 0 4px 10px -5px ${c.fg}40, inset 0 1px 0 rgba(255,255,255,.8)`,
                }}
              >
                <OccasionIcon id={c.id} size={26} style={{ color: c.fg }} />
              </div>
              <span className="text-[11px] font-semibold" style={{ color: c.fg }}>
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
