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
};

const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder = 'Search cakes, occasions, flavors…', className = '' }, ref) => {
    return (
      <div className={`group relative ${className}`}>
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-100 transition-colors group-focus-within:text-coral">
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-[52px] w-full rounded-full border border-white/70 bg-white pl-12 pr-12 text-[14px] font-medium text-ink outline-none transition-shadow duration-200 placeholder:font-normal placeholder:text-ink-100 shadow-[0_2px_10px_-4px_rgba(26,19,17,0.14)] focus:shadow-[0_6px_20px_-6px_rgba(232,82,106,0.4)] focus:ring-4 focus:ring-coral/12"
        />

        {value && (
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-50 text-ink-300 transition active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
