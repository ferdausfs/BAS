import { Search, SlidersHorizontal } from 'lucide-react';
import { forwardRef, useState } from 'react';
import TransitionClearInput from './TransitionClearInput';
import { useT } from '../lib/i18n';

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
  ({
    value,
    onChange,
    onSearch,
    placeholder,
    className = '',
    suggestions = [],
    recentSearches = [],
    onClearRecent,
    onOpenOccasions,
  }, ref) => {
    const [focused, setFocused] = useState(false);
    const t = useT();
    const resolvedPlaceholder = placeholder ?? t('home.searchPlaceholder');
    const visibleSuggestions = (value ? suggestions : recentSearches).slice(0, 5);
    const showDropdown = focused && visibleSuggestions.length > 0;

    const chooseSearch = (term: string) => {
      onChange(term);
      onSearch?.(term);
      setFocused(false);
    };

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="group relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-tertiary transition-colors group-focus-within:text-primary" strokeWidth={1.9} />
          <TransitionClearInput
            inputRef={ref}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onKeyDown={(event) => event.key === 'Enter' && onSearch?.(value)}
            placeholder={resolvedPlaceholder}
            inputClassName="h-11 w-full rounded-full border border-border bg-surface pl-12 pr-11 text-md font-medium text-text shadow-card outline-none transition placeholder:font-normal placeholder:text-transparent focus:border-accent focus:ring-4 focus:ring-primary/10"
            textLayerClassName="pl-12 pr-11 text-md font-medium text-text placeholder:font-normal text-text-tertiary"
          />

          {showDropdown && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 rounded-2xl border border-border bg-surface p-3 shadow-float">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-base font-semibold text-text">{value ? t('home.searchResultsLabel') : t('home.recentSearch')}</span>
                {!value && onClearRecent && (
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={onClearRecent}
                    className="text-xs font-medium text-text-tertiary"
                  >
                    {t('common.clearAll')}
                  </button>
                )}
              </div>
              <div className="divide-y divide-divider">
                {visibleSuggestions.map((term) => (
                  <button
                    type="button"
                    key={term}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseSearch(term)}
                    className="flex w-full items-center gap-4 px-1 py-3 text-left transition active:bg-bg"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <Search className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-md font-medium text-text">{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {onOpenOccasions && (
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onOpenOccasions}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-card transition active:scale-95"
            aria-label={t('home.browseOccasion')}
          >
            <SlidersHorizontal className="h-5 w-5" strokeWidth={1.9} />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
