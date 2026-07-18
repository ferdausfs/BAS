import { Search, X } from 'lucide-react';
import { forwardRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch?: (v: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  onOpenOccasions?: () => void;
};

const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder = 'Search cakes, flavors, occasions', className = '', onOpenOccasions }, ref) => {
    return (
      <div className={`group relative ${className}`}>
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-200 transition-colors group-focus-within:text-coral">
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`glass h-[52px] w-full rounded-full pl-12 text-[14px] font-medium text-ink outline-none transition-shadow duration-200 placeholder:font-normal placeholder:text-ink-200 focus:ring-4 focus:ring-coral/12 ${
            onOpenOccasions ? 'pr-14' : 'pr-12'
          }`}
        />
        {value ? (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-ink-300 transition active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        ) : (
          onOpenOccasions && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={onOpenOccasions}
              className="absolute -right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 transition active:scale-95"
              aria-label="Browse by occasion"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white shadow-[0_4px_10px_-2px_rgba(42,27,18,0.4)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="5" cy="8" r="2" fill="currentColor" stroke="none" />
                  <line x1="9" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="15" y2="16" />
                  <circle cx="19" cy="16" r="2" fill="currentColor" stroke="none" />
                </svg>
              </span>
            </button>
          )
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
