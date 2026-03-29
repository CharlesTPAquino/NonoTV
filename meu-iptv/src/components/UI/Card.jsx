import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Card Component - NonoTV Design System
 * 
 * Variants:
 * - default: Standard card
 * - interactive: Hover effects for clickable cards
 * - glass: Glassmorphism effect
 */
const Card = forwardRef(({
  children,
  variant = 'default',
  interactive = false,
  className,
  padding = 'md',
  ...props
}, ref) => {
  const baseStyles = 'rounded-2xl border border-border transition-all duration-250';

  const variants = {
    default: 'bg-surface',
    glass: 'bg-bg-tertiary/60 backdrop-blur-xl',
    elevated: 'bg-surface shadow-elevation-lg'
  };

  const interactiveStyles = interactive 
    ? 'cursor-pointer hover:border-border-hover hover:bg-surface-hover hover:shadow-elevation-md hover:scale-[1.02] active:scale-[0.98]'
    : '';

  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  };

  return (
    <div
      ref={ref}
      className={twMerge(baseStyles, variants[variant], interactiveStyles, paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;