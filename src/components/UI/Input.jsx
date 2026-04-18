import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Input Component - NonoTV Design System
 */
const Input = forwardRef(({
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  className,
  ...props
}, ref) => {
  const baseStyles = `
    w-full bg-bg-tertiary border rounded-xl px-4 py-3
    text-content-primary placeholder:text-content-muted
    focus:border-primary focus:ring-1 focus:ring-primary
    transition-all duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
    min-h-11
  `;

  const errorStyles = error 
    ? 'border-state-error focus:border-state-error focus:ring-state-error'
    : 'border-border';

  return (
    <div className="relative">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-content-muted">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={twMerge(
          baseStyles,
          errorStyles,
          icon && 'pl-10',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-state-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;