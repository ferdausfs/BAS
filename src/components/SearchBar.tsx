import { Search, X, Clock } from 'lucide-react';
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
  ({ value, onChange, onSearch, placeholder = 'Search cakes, occasions, flavors…', className = '', suggestions, recentSearches, onClearRecent }, ref) => {
    return (
      <div className={`relative ${className}`}>
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-100">
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <input
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-2xl border border-ink-50/80 bg-white pl-11 pr-11 text-[14px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-100 focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10"
        />
        
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-100 text-ink transition active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}

        {(suggestions && suggestions.length > 0) || (recentSearches && recentSearches.length > 0 && !value) ? (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-ink-50 bg-white shadow-lg">
            
            {/* Recent searches */}
            {!value && recentSearches && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 pt-2.5 pb-1">
                  <span className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">Recent</span>
                  {onClearRecent && (
                    <button onClick={onClearRecent} className="text-[10px] text-coral font-medium">Clear</button>
                  )}
                </div>
                {recentSearches.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); onSearch?.(s); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-ink hover:bg-cream active:bg-cream transition"
                  >
                    <Clock className="h-3.5 w-3.5 flex-shrink-0 text-ink-200" />
                    {s}
                  </button>
                ))}
              </>
            )}

            {/* Autocomplete suggestions */}
            {value && suggestions && suggestions.length > 0 && (
              <>
                {suggestions.slice(0, 5).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); onSearch?.(s); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] text-ink hover:bg-cream active:bg-cream transition"
                  >
                    <Search className="h-3.5 w-3.5 flex-shrink-0 text-ink-200" />
                    <span>
                      {s}
                    </span>
                  </button>
                ))}
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
