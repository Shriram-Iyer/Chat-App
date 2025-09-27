import { InputHTMLAttributes, forwardRef, useState, useId } from 'react';
import { clsx } from 'clsx';

// Function to get appropriate icon based on field type/label
const getFieldIcon = (type?: string, label?: string) => {
  const lowerLabel = label?.toLowerCase() || '';
  const lowerType = type?.toLowerCase() || '';

  // Email icon
  if (lowerType === 'email' || lowerLabel.includes('email')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  }

  // Password icon
  if (lowerLabel.includes('password')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    );
  }

  // Username icon
  if (lowerLabel.includes('username') || lowerLabel.includes('user name')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    );
  }

  // Default to no icon
  return null;
};

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'filled' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  isPassword?: boolean;
  showPasswordToggle?: boolean;
  // When false, uses native border instead of the custom notched overlay
  notched?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      success,
      leftIcon,
      rightIcon,
  variant = 'outlined',
      size = 'md',
      type = 'text',
      isPassword = false,
      showPasswordToggle = false,
      className,
      id,
      value,
      onFocus,
      onBlur,
      notched,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const generatedId = useId();
    const inputId = id || generatedId;
    const hasValue = value && value.toString().length > 0;
    const shouldShowLabel = focused || hasValue;
    const autoIcon = getFieldIcon(type, label);
    const displayIcon = leftIcon || autoIcon;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseClasses = 'peer w-full outline-none transition-all duration-200';
    
    const variants = {
      filled: 'bg-base-100 backdrop-blur-sm shadow-sm',
      outlined: 'bg-base-100'
    };

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-3 text-base',
      lg: 'px-5 py-4 text-lg'
    };

    const labelClasses = clsx(
      'absolute px-1 transition-all duration-200 pointer-events-none inline-block bg-base-100 rounded z-10',
      displayIcon ? 'left-10' : 'left-3',
      shouldShowLabel 
        ? '-top-2.5 text-xs font-medium' 
        : size === 'sm' ? 'top-2 text-sm' : size === 'lg' ? 'top-4 text-base' : 'top-3 text-base',
      error 
        ? 'text-error' 
        : success && hasValue
        ? 'text-success'
        : 'text-base-content/70 peer-focus:text-primary peer-focus:-top-2.5 peer-focus:text-sm peer-focus:font-medium'
    );

    const labelWidth = label ? label.length * 0.6 + 1 : 0; // Approximate label width
    const labelStart = displayIcon ? 40 : 12; // Starting position in pixels

  const useNotch = notched ?? false;

    const borderColorClasses = error
      ? 'border-error focus:border-error'
      : success && hasValue
      ? 'border-success focus:border-success'
      : 'border-base-300 focus:border-primary';

    return (
      <div className="form-control">
        <div className="relative">
          {/* Custom border segments (optional) */}
          {useNotch && (
            <div className="absolute inset-0 pointer-events-none">
            {/* Top border with notch */}
            {shouldShowLabel && label ? (
              <>
                {/* Top left segment */}
                <div 
                  className={clsx(
                    'absolute top-0 left-0 h-0.5 transition-all duration-200',
                    error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
                  )}
                  style={{ width: `${labelStart}px` }}
                />
                {/* Top right segment */}
                <div 
                  className={clsx(
                    'absolute top-0 right-0 h-0.5 transition-all duration-200',
                    error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
                  )}
                  style={{ left: `${labelStart + labelWidth * 16}px` }}
                />
              </>
            ) : (
              /* Full top border when label is down */
              <div 
                className={clsx(
                  'absolute top-0 left-0 right-0 h-0.5 transition-all duration-200',
                  error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
                )}
              />
            )}
            
            {/* Other borders */}
            <div className={clsx(
              'absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-200',
              error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
            )} />
            <div className={clsx(
              'absolute top-0 bottom-0 left-0 w-0.5 transition-all duration-200',
              error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
            )} />
            <div className={clsx(
              'absolute top-0 bottom-0 right-0 w-0.5 transition-all duration-200',
              error ? 'bg-error' : success && hasValue ? 'bg-success' : 'bg-base-300 peer-focus:bg-primary'
            )} />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={clsx(
              baseClasses,
              variants[variant],
              sizes[size],
              'rounded-full',
              useNotch ? 'border-0' : clsx('border', borderColorClasses),
              displayIcon && 'pl-10',
              (rightIcon || (isPassword && showPasswordToggle)) && 'pr-10',
              'text-base-content',
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
            <label htmlFor={inputId} className={labelClasses}>
              {label}
            </label>
          )}

          {displayIcon && (
            <div
              className={clsx(
                'absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors',
                error
                  ? 'text-error'
                  : success && hasValue
                  ? 'text-success'
                  : 'text-base-content/50 peer-focus:text-primary'
              )}
            >
              {displayIcon}
            </div>
          )}

          {(rightIcon || (isPassword && showPasswordToggle)) && (
            <div
              className={clsx(
                'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                error
                  ? 'text-error'
                  : success && hasValue
                  ? 'text-success'
                  : 'text-base-content/50 peer-focus:text-primary'
              )}
            >
              {isPassword && showPasswordToggle ? (
                <button
                  type="button"
                  className={clsx('transition-colors duration-200 p-1',
                    error
                      ? 'text-error hover:text-error'
                      : success && hasValue
                      ? 'text-success hover:text-success'
                      : 'text-base-content/50 hover:text-base-content')}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };