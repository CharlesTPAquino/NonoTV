import { twMerge } from 'tailwind-merge';

/**
 * Badge Component - NonoTV Design System
 */
export default function Badge({ 
  children, 
  variant = 'default',
  size = 'md',
  className 
}) {
  const variants = {
    default: 'bg-white/5 text-content-secondary',
    primary: 'bg-primary/20 text-primary',
    success: 'bg-accent-emerald/20 text-accent-emerald',
    warning: 'bg-state-warning/20 text-state-warning',
    error: 'bg-state-error/20 text-state-error',
    info: 'bg-accent-blue/20 text-accent-blue'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <span className={twMerge(
      'inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wider',
      variants[variant],
      sizes[size],
      className
    )}>
      {children}
    </span>
  );
}