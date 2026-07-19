import { Search, SlidersHorizontal, X } from 'lucide-react';
import { forwardRef } from 'react';

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  className?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onClearRecent?: () => void;
  onOpenOccasions?: () => void;
};

const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, onSearch, placeholder = 'Search cakes, flavors, occasions', className = '', onOpenOccasions }, ref) => (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="group relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within:text-primary" strokeWidth={1.9} />
        <input
          ref={ref}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && onSearch?.(value)}
          placeholder={placeholder}
          className="h-13 w-full rounded-[18px] border border-border bg-surface pl-12 pr-11 text-[14px] font-medium text-text shadow-card outline-none transition placeholder:font-normal placeholder:text-text-tertiary focus:border-accent focus:ring-4 focus:ring-primary/10"
        />
        {value && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-secondary text-text-secondary transition active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
      {onOpenOccasions && (
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={onOpenOccasions}
          className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[18px] border border-border bg-secondary text-primary shadow-card transition active:scale-95"
          aria-label="Browse by occasion"
        >
          <SlidersHorizontal className="h-5 w-5" strokeWidth={1.9} />
        </button>
      )}
    </div>
  )
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
