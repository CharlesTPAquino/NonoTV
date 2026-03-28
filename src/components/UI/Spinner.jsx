import { twMerge } from 'tailwind-merge';

/**
 * Spinner Component - NonoTV Design System
 * Animated loading indicator
 */
export default function Spinner({ 
  size = 'md', 
  variant = 'primary',
  className 
}) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const variants = {
    primary: 'border-primary/20 border-t-primary text-primary',
    white: 'border-white/20 border-t-white text-white',
    success: 'border-accent-emerald/20 border-t-accent-emerald text-accent-emerald'
  };

  return (
    <div className={twMerge(
      'animate-spin rounded-full border-2',
      sizes[size],
      variants[variant],
      className
    )} />
  );
}

/**
 * Loading Overlay - Full screen loading state
 */
export function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-bg-primary/80 backdrop-blur-xl flex flex-col items-center justify-center z-50">
      <Spinner size="xl" />
      {message && (
        <p className="mt-4 text-content-secondary font-display uppercase tracking-widest text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

/**
 * Skeleton - Loading placeholder
 */
export function Skeleton({ className, ...props }) {
  return (
    <div className={twMerge(
      'bg-bg-tertiary animate-pulse rounded-lg',
      className
    )} {...props} />
  );
}