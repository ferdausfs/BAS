import { Search, X, Clock } from 'lucide-react';
import { forwardRef, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
    const [focused, setFocused] = useState(false);
    const [box, setBox] = useState<{ top: number; bottom: number; left: number; width: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const setRefs = (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as any).current = node;
    };

    const dismiss = () => {
      inputRef.current?.blur();
      setFocused(false);
    };

    const hasContent =
      (suggestions && suggestions.length > 0) || (recentSearches && recentSearches.length > 0 && !value);
    const showDropdown = focused && hasContent;

    // Track the input's on-screen position so the portaled overlay (which escapes
    // any ancestor `transform` — e.g. the `anim-up` entrance animation leaves a
    // lingering `transform: translateY(0)` that turns its container into a
    // containing block and traps `position: fixed` descendants) can still line
    // up directly under the real input.
    useLayoutEffect(() => {
      if (!showDropdown || !inputRef.current) return;
      const update = () => {
        const r = inputRef.current?.getBoundingClientRect();
        if (r) setBox({ top: r.top, bottom: r.bottom, left: r.left, width: r.width });
      };
      update();
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      return () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    }, [showDropdown]);

    // Dismiss on scroll so a stale dropdown never lingers over content that moved.
    useEffect(() => {
      if (!showDropdown) return;
      const onScroll = () => dismiss();
      window.addEventListener('scroll', onScroll, true);
      return () => window.removeEventListener('scroll', onScroll, true);
    }, [showDropdown]);

    return (
      <div className={`group relative ${className}`}>
        <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-100 transition-colors group-focus-within:text-coral">
          <Search className="h-[18px] w-[18px]" strokeWidth={2} />
        </div>
        <input
          ref={setRefs}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
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

        {showDropdown && box &&
          createPortal(
            <>
              {/* Backdrop — split above/below the input's own row so the input
                  itself stays sharp; only the header text above and the page
                  content below get blurred/dimmed. Portaled to <body> so it
                  truly covers the full screen instead of being trapped inside
                  an ancestor with a lingering transform (anim-up). */}
              <div
                className="fixed inset-x-0 top-0 z-[9998] bg-ink/10 backdrop-blur-md transition-opacity"
                style={{ height: box.top }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={dismiss}
                aria-hidden="true"
              />
              <div
                className="fixed inset-x-0 bottom-0 z-[9998] bg-ink/10 backdrop-blur-md transition-opacity"
                style={{ top: box.bottom }}
                onMouseDown={(e) => e.preventDefault()}
                onClick={dismiss}
                aria-hidden="true"
              />

              <div
                className="fixed z-[9999] overflow-hidden rounded-[22px] border border-black/5 bg-white p-1.5"
                style={{
                  top: box.bottom + 8,
                  left: box.left,
                  width: box.width,
                  boxShadow: '0 24px 48px -18px rgba(26,19,17,0.35), 0 6px 16px -6px rgba(26,19,17,0.15)',
                }}
              >
                {/* Recent searches */}
                {!value && recentSearches && recentSearches.length > 0 && (
                  <>
                    <div className="flex items-center justify-between px-3 pt-1.5 pb-1">
                      <span className="text-[10px] font-bold tracking-wider text-ink-200 uppercase">Recent</span>
                      {onClearRecent && (
                        <button
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={onClearRecent}
                          className="text-[10px] font-medium text-coral"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    {recentSearches.slice(0, 4).map((s) => (
                      <button
                        key={s}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onChange(s); onSearch?.(s); dismiss(); }}
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
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { onChange(s); onSearch?.(s); dismiss(); }}
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
            </>,
            document.body
          )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;
