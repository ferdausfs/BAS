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
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-ink-50 text-ink-300 transition active:scale-90"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        )}

        {(suggestions && suggestions.length > 0) || (recentSearches && recentSearches.length > 0 && !value) ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[22px] border border-black/5 bg-white p-1.5"
            style={{ boxShadow: '0 20px 44px -20px rgba(26,19,17,0.28), 0 4px 14px -6px rgba(26,19,17,0.12)' }}
          >
            {/* Recent searches */}
            {!value && recentSearches && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-3 pt-1.5 pb-1">
                  <span className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">Recent</span>
                  {onClearRecent && (
                    <button onClick={onClearRecent} className="text-[10px] font-medium text-coral">Clear</button>
                  )}
                </div>
                {recentSearches.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    onClick={() => { onChange(s); onSearch?.(s); }}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left text-[13px] font-medium text-ink transition hover:bg-cream active:bg-cream"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-cream">
                      <Clock className="h-3.5 w-3.5 text-ink-200" />
                    </span>
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
                    className="flex w-full items-center gap-2.5 rounded-2xl px-2.5 py-2 text-left text-[13px] font-medium text-ink transition hover:bg-cream active:bg-cream"
                  >
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral-100 to-coral-200">
                      <Search className="h-3.5 w-3.5 text-coral-700" />
                    </span>
                    <span>{s}</span>
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
