import { Search } from 'lucide-react';
import { forwardRef } from 'react';

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
};

const SearchBar = forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, placeholder = 'Search cakes, occasions, flavors…', className = '' }, ref) => {
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
          className="h-12 w-full rounded-2xl border border-ink-50/80 bg-white pl-11 pr-4 text-[14px] font-medium text-ink outline-none transition placeholder:font-normal placeholder:text-ink-100 focus:border-coral focus:bg-white focus:ring-4 focus:ring-coral/10"
        />
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
export default SearchBar;