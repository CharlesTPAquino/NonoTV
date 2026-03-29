import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Button Component - NonoTV Design System
 * 
 * Variants:
 * - primary: Main CTA with gold accent
 * - secondary: Alternative action
 * - ghost: Subtle action
 * - icon: Icon-only button
 * 
 * Sizes:
 * - sm, md, lg
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  icon,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-display font-bold uppercase tracking-wider
    transition-all duration-200 ease-smooth
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
  `;

  const variants = {
    primary: `
      bg-primary text-white px-6 py-3 rounded-xl
      hover:bg-primary-400 hover:-translate-y-0.5 hover:shadow-glow-md
      active:translate-y-0 active:scale-[0.98]
    `,
    secondary: `
      bg-white/5 text-content-primary px-6 py-3 rounded-xl
      border border-border
      hover:bg-surface-hover hover:border-border-hover
      active:scale-[0.98]
    `,
    ghost: `
      text-content-secondary px-4 py-2 rounded-lg
      hover:bg-white/5 hover:text-content-primary
    `,
    danger: `
      bg-state-error text-white px-6 py-3 rounded-xl
      hover:bg-red-600 hover:-translate-y-0.5
      active:translate-y-0 active:scale-[0.98]
    `
  };

  const sizes = {
    sm: 'text-xs px-4 py-2',
    md: 'text-sm px-6 py-3',
    lg: 'text-base px-8 py-4'
  };

  return (
    <button
      ref={ref}
      className={twMerge(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;