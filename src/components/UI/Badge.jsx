import { twMerge } from 'tailwind-merge';

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
  dot = false,
}) {
  const variants = {
    default: 'bg-white/[0.05] text-content-tertiary border-border-subtle',
    primary: 'bg-brand/15 text-brand border-brand/20',
    success: 'bg-accent-emerald/15 text-accent-emerald border-accent-emerald/20',
    warning: 'bg-state-warning/15 text-state-warning border-state-warning/20',
    error: 'bg-accent-live/15 text-accent-live border-accent-live/20',
    info: 'bg-accent-blue/15 text-accent-blue border-accent-blue/20',
    live: 'bg-accent-live/20 text-accent-live border-accent-live/30',
    movie: 'bg-accent-movie/20 text-accent-movie border-accent-movie/30',
    series: 'bg-accent-series/20 text-accent-series border-accent-series/30',
    premium: 'bg-accent-premium/20 text-accent-premium border-accent-premium/30',
  };

  const sizes = {
    xs: 'text-[8px] px-1.5 py-0.5',
    sm: 'text-[9px] px-2 py-0.5',
    md: 'text-[10px] px-2.5 py-1',
    lg: 'text-xs px-3 py-1.5',
  };

  const dotColors = {
    default: 'bg-content-muted',
    primary: 'bg-brand',
    success: 'bg-accent-emerald',
    warning: 'bg-state-warning',
    error: 'bg-accent-live',
    info: 'bg-accent-blue',
    live: 'bg-accent-live animate-pulse',
    movie: 'bg-accent-movie',
    series: 'bg-accent-series',
    premium: 'bg-accent-premium',
  };

  return (
    <span
      className={twMerge(
        'inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && <span className={twMerge('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}
