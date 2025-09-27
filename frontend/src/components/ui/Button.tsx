import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
  const baseClasses = 'btn transition-all duration-300 border border-base-300 rounded-full font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
      primary: 'bg-gradient-to-r from-primary via-secondary to-primary text-white shadow-2xl hover:shadow-3xl hover:scale-105 focus:ring-primary/50',
      secondary: 'bg-gradient-to-r from-secondary to-accent text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-secondary/50',
      outline: 'bg-transparent border-2 border-primary text-primary hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:scale-105 focus:ring-primary/50',
      ghost: 'bg-transparent text-base-content hover:bg-base-200 hover:scale-105 focus:ring-base-300',
      danger: 'bg-gradient-to-r from-error to-red-600 text-white shadow-lg hover:shadow-xl hover:scale-105 focus:ring-error/50'
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm min-h-8',
      md: 'h-12 px-6 text-base min-h-12',
      lg: 'h-14 px-8 text-lg min-h-14'
    };

    const widthClass = fullWidth ? 'w-full' : '';

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={clsx(
          baseClasses,
          variants[variant],
          sizes[size],
          widthClass,
          isDisabled && 'opacity-50 cursor-not-allowed transform-none',
          className
        )}
        disabled={isDisabled}
        {...props}
      >
        <div className="flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <span className="loading loading-spinner loading-sm"></span>
              {loadingText || children}
            </>
          ) : (
            <>
              {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
              {children}
              {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </>
          )}
        </div>
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };