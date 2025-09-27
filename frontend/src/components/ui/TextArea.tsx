import { forwardRef, TextareaHTMLAttributes, useId, useState } from 'react';
import { clsx } from 'clsx';

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: boolean;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  notched?: boolean; // kept for API parity; currently uses native border by default
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      success,
      variant = 'outlined',
      size = 'md',
      className,
      id,
      value,
      onFocus,
      onBlur,
      rows = 3,
      notched,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const generatedId = useId();
    const areaId = id || generatedId;

    const hasValue =
      (typeof value === 'string' && value.length > 0) ||
      (typeof value === 'number' && !Number.isNaN(value));
    const shouldShowLabel = focused || hasValue;

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const baseClasses = 'peer w-full outline-none transition-all duration-200';
    const variants = {
      filled: 'bg-base-100 backdrop-blur-sm shadow-sm',
      outlined: 'bg-base-100',
    } as const;

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg',
    } as const;

    const labelClasses = clsx(
      'absolute px-1 transition-all duration-200 pointer-events-none inline-block bg-base-100 rounded z-10',
      'left-3',
      shouldShowLabel
        ? '-top-2.5 text-xs font-medium'
        : size === 'sm'
        ? 'top-2 text-sm'
        : size === 'lg'
        ? 'top-4 text-base'
        : 'top-3 text-base',
      error
        ? 'text-error'
        : success && hasValue
        ? 'text-success'
        : 'text-base-content/70 peer-focus:text-primary peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-medium'
    );

    const borderColorClasses = error
      ? 'border-error focus:border-error'
      : success && hasValue
      ? 'border-success focus:border-success'
      : 'border-base-300 focus:border-primary';

    const useNotch = notched ?? false;

    return (
      <div className="form-control">
        <div className="relative">
          <textarea
            ref={ref}
            id={areaId}
            rows={rows}
            className={clsx(
              baseClasses,
              variants[variant],
              sizes[size],
              'rounded-3xl',
              useNotch ? 'border-0' : clsx('border', borderColorClasses),
              'text-base-content resize-none',
              className
            )}
            placeholder=" "
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={!!error}
            {...props}
          />

          {label && (
            <label htmlFor={areaId} className={labelClasses}>
              {label}
            </label>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
