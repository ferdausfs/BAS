import { ChevronRight } from 'lucide-react';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onClick: () => void };
};

export default function SectionHeader({ eyebrow, title, subtitle, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 px-5">
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>}
        <h2 className=" text-[20px] font-semibold tracking-[-0.02em] text-text">{title}</h2>
        {subtitle && <p className="mt-1 text-[14px] text-text-secondary">{subtitle}</p>}
      </div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mb-0.5 flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-[13px] font-semibold text-primary transition hover:bg-secondary active:scale-95"
        >
          {action.label}
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
