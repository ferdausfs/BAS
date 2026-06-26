type OccasionIconProps = {
  id: string;
  size?: number;
  className?: string;
};

export default function OccasionIcon({ id, size = 24, className = '' }: OccasionIconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  if (id === 'birthday') {
    return (
      <svg {...common}>
        <path d="M12 4v3" />
        <path d="M10.5 5.2 12 3.7l1.5 1.5" />
        <path d="M5 12.5h14" />
        <path d="M6.5 9.5h11A1.5 1.5 0 0 1 19 11v7.5A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5V11a1.5 1.5 0 0 1 1.5-1.5Z" />
        <path d="M5 14.5c1.4 0 1.4 1 2.8 1s1.4-1 2.8-1 1.4 1 2.8 1 1.4-1 2.8-1 1.4 1 2.8 1" />
      </svg>
    );
  }

  if (id === 'anniversary') {
    return (
      <svg {...common}>
        <path d="M12 20s-7-4.35-7-10a3.9 3.9 0 0 1 7-2.35A3.9 3.9 0 0 1 19 10c0 5.65-7 10-7 10Z" />
        <path d="M9.2 10.2h.01" />
        <path d="M14.8 10.2h.01" />
      </svg>
    );
  }

  if (id === 'cupcakes') {
    return (
      <svg {...common}>
        <path d="M8 12.2c-.9-.6-1.3-1.4-1.3-2.3 0-2 2.2-3.6 5.3-3.6s5.3 1.6 5.3 3.6c0 .9-.4 1.7-1.3 2.3" />
        <path d="M7 12h10l-1.2 8H8.2L7 12Z" />
        <path d="M9 15h6" />
        <path d="M10 18h4" />
        <path d="M12 4.5v1.3" />
      </svg>
    );
  }

  if (id === 'gift') {
    return (
      <svg {...common}>
        <path d="M4.5 11h15v8.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5V11Z" />
        <path d="M3.8 7.5h16.4V11H3.8z" />
        <path d="M12 7.5V21" />
        <path d="M12 7.5c-2.7 0-4.5-.8-4.5-2.2C7.5 4.2 8.4 3.5 9.4 4c1.2.5 2 1.8 2.6 3.5Z" />
        <path d="M12 7.5c2.7 0 4.5-.8 4.5-2.2 0-1.1-.9-1.8-1.9-1.3-1.2.5-2 1.8-2.6 3.5Z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M12 3.5 13.8 8l4.7 1.7-4.7 1.8L12 16l-1.8-4.5-4.7-1.8L10.2 8 12 3.5Z" />
      <path d="M18 14.5 18.8 17l2.2.8-2.2.9L18 21l-.8-2.3-2.2-.9 2.2-.8.8-2.5Z" />
    </svg>
  );
}