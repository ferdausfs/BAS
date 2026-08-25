import { useEffect, useRef } from 'react';

type Tab<T extends string> = { value: T; label: string };

export default function UnderlineTabs<T extends string>({
  tabs,
  value,
  onChange,
  className = '',
}: {
  tabs: readonly Tab<T>[];
  value?: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    activeRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [value]);

  return (
    <div className={`no-scrollbar flex gap-5 overflow-x-auto border-b border-border ${className}`}>
      {tabs.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            ref={active ? activeRef : undefined}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`relative shrink-0 origin-bottom whitespace-nowrap pb-2.5 font-bold transition-all duration-300 ease-out active:scale-95 ${
              active ? 'scale-110 text-[15px] text-ink' : 'scale-100 text-[13px] text-text-tertiary'
            }`}
          >
            <span className={active ? 'inline-block anim-pop' : 'inline-block'}>{tab.label}</span>
            {active && (
              <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-coral transition-all duration-300 ease-out" />
            )}
          </button>
        );
      })}
    </div>
  );
}
