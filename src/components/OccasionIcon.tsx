type OccasionId = 'all' | 'birthday' | 'anniversary' | 'wedding' | 'cupcakes' | 'gift' | 'premium';

type OccasionIconProps = {
  id: string;
  size?: number;
  className?: string;
};

export default function OccasionIcon({ id, size = 24, className = '' }: OccasionIconProps) {
  const iconId = id as OccasionId;

  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.15,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
    shapeRendering: 'geometricPrecision' as const,
  };

  switch (iconId) {
    case 'all':
      return (
        <svg {...common}>
          <rect x="4.5" y="4.5" width="6.25" height="6.25" rx="1.4" />
          <rect x="13.25" y="4.5" width="6.25" height="6.25" rx="1.4" />
          <rect x="4.5" y="13.25" width="6.25" height="6.25" rx="1.4" />
          <rect x="13.25" y="13.25" width="6.25" height="6.25" rx="1.4" />
        </svg>
      );

    case 'birthday':
      return (
        <svg {...common}>
          <path d="M12 3.5v3.25" />
          <path d="M10.75 5 12 3.5 13.25 5" />
          <path d="M6 10.5h12" />
          <path d="M6.75 10.5h10.5A1.75 1.75 0 0 1 19 12.25v5.5a1.75 1.75 0 0 1-1.75 1.75H6.75A1.75 1.75 0 0 1 5 17.75v-5.5a1.75 1.75 0 0 1 1.75-1.75Z" />
          <path d="M7.25 14.8c.95 0 .95-.75 1.9-.75s.95.75 1.9.75.95-.75 1.9-.75.95.75 1.9.75.95-.75 1.9-.75.95.75 1.9.75" />
        </svg>
      );

    case 'anniversary':
      return (
        <svg {...common}>
          <path d="M12 19.75s-6.75-4.2-6.75-9.55a3.75 3.75 0 0 1 6.75-2.25 3.75 3.75 0 0 1 6.75 2.25c0 5.35-6.75 9.55-6.75 9.55Z" />
        </svg>
      );

    case 'wedding':
      return (
        <svg {...common}>
          <circle cx="9" cy="13" r="4.25" />
          <circle cx="15" cy="13" r="4.25" />
          <path d="M15 4.5v2.25" />
          <path d="M13.9 5.65h2.2" />
        </svg>
      );

    case 'cupcakes':
      return (
        <svg {...common}>
          <path d="M7 11.5c-1.2-.65-1.9-1.8-1.9-3.1 0-2.15 1.95-3.9 4.3-3.9.95 0 1.8.28 2.6.8.8-.52 1.65-.8 2.6-.8 2.35 0 4.3 1.75 4.3 3.9 0 1.3-.7 2.45-1.9 3.1" />
          <path d="M6.4 11.5h11.2l-1.15 7.35a1.45 1.45 0 0 1-1.45 1.15H8.99a1.45 1.45 0 0 1-1.44-1.15L6.4 11.5Z" />
          <path d="M9.15 14.6h5.7" />
          <path d="M10.15 17.25h3.7" />
        </svg>
      );

    case 'gift':
      return (
        <svg {...common}>
          <path d="M4.75 11h14.5v8A1.75 1.75 0 0 1 17.5 20.75h-11A1.75 1.75 0 0 1 4.75 19v-8Z" />
          <path d="M3.75 7.5h16.5V11H3.75z" />
          <path d="M12 7.5v13.25" />
          <path d="M12 7.5c-2.55 0-4.25-.75-4.25-2.1 0-1 .78-1.7 1.7-1.3 1.12.5 1.9 1.68 2.55 3.4Z" />
          <path d="M12 7.5c2.55 0 4.25-.75 4.25-2.1 0-1-.78-1.7-1.7-1.3-1.12.5-1.9 1.68-2.55 3.4Z" />
        </svg>
      );

    case 'premium':
    default:
      return (
        <svg {...common}>
          <path d="M12 4.25 13.6 8.4 17.75 10 13.6 11.6 12 15.75 10.4 11.6 6.25 10 10.4 8.4 12 4.25Z" />
          <path d="M18.1 14.6 18.8 16.45 20.65 17.15 18.8 17.85 18.1 19.7 17.4 17.85 15.55 17.15 17.4 16.45 18.1 14.6Z" />
        </svg>
      );
  }
}
