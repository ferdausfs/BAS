import { ChevronRight } from 'lucide-react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
};

export default function SectionHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <div className="flex items-end justify-between px-5">
      <div>
        {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
        <h2 className="mt-1 font-display text-[19px] font-bold tracking-tight text-ink">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-ink-200">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="flex items-center gap-0.5 text-[13px] font-semibold text-coral transition active:scale-95"
        >
          {action.label}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}