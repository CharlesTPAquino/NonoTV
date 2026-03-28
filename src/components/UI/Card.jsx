import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const Card = forwardRef(
  (
    { children, variant = 'default', interactive = false, className, padding = 'md', ...props },
    ref
  ) => {
    const baseStyles = 'rounded-2xl border transition-all duration-300 ease-elegant';

    const variants = {
      default: 'bg-surface-card border-border-subtle',
      glass: 'bg-bg-glass backdrop-blur-2xl border-border-subtle/50',
      elevated: 'bg-surface-card border-border shadow-card-hover',
    };

    const interactiveStyles = interactive
      ? `
      cursor-pointer 
      hover:border-border-hover 
      hover:bg-surface-hover 
      hover:shadow-card-hover 
      hover:-translate-y-1
      active:scale-[0.98]
    `
      : '';

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={twMerge(
          baseStyles,
          variants[variant],
          interactiveStyles,
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
