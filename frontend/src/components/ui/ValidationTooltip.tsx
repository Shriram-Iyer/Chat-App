import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

export interface ValidationRule {
  condition: boolean;
  message: string;
  type?: 'error' | 'success' | 'warning';
}

export interface ValidationTooltipProps {
  rules: ValidationRule[];
  show?: boolean;
  position?: 'top' | 'right' | 'bottom' | 'left';
  variant?: 'compact' | 'detailed';
  className?: string;
}

const ValidationTooltip: React.FC<ValidationTooltipProps> = ({
  rules,
  show = false,
  position = 'right',
  variant = 'detailed',
  className
}) => {
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (show && parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      let top = rect.top;
      let left = rect.right + 8; // 8px margin to the right
      
      // Adjust position based on the position prop
      switch (position) {
        case 'left':
          left = rect.left - 8; // Position to the left with margin
          break;
        case 'top':
          top = rect.top - 8;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + 8;
          left = rect.left + rect.width / 2;
          break;
        default: // 'right'
          left = rect.right + 8;
          break;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [show, position]);
  
  if (!show || rules.length === 0 || !tooltipPosition) return <div ref={parentRef} className="absolute inset-0 pointer-events-none" />;

  const baseClasses = 'fixed z-[9999] pointer-events-none';
  
  // Arrow component based on position
  const renderArrow = () => {
    const arrowClasses = "absolute w-0 h-0";
    
    switch (position) {
      case 'right':
        return (
          <>
            {/* Border arrow */}
            <div className={`${arrowClasses} -left-2.5 top-4 border-t-[9px] border-b-[9px] border-r-[9px] border-t-transparent border-b-transparent border-r-primary/20`} />
            {/* Fill arrow */}
            <div className={`${arrowClasses} -left-2 top-4 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-base-100`} />
          </>
        );
      case 'left':
        return (
          <>
            {/* Border arrow */}
            <div className={`${arrowClasses} -right-2.5 top-4 border-t-[9px] border-b-[9px] border-l-[9px] border-t-transparent border-b-transparent border-l-primary/20`} />
            {/* Fill arrow */}
            <div className={`${arrowClasses} -right-2 top-4 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-base-100`} />
          </>
        );
      case 'top':
        return (
          <>
            {/* Border arrow */}
            <div className={`${arrowClasses} -bottom-2.5 left-1/2 transform -translate-x-1/2 border-l-[9px] border-r-[9px] border-t-[9px] border-l-transparent border-r-transparent border-t-primary/20`} />
            {/* Fill arrow */}
            <div className={`${arrowClasses} -bottom-2 left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-base-100`} />
          </>
        );
      case 'bottom':
        return (
          <>
            {/* Border arrow */}
            <div className={`${arrowClasses} -top-2.5 left-1/2 transform -translate-x-1/2 border-l-[9px] border-r-[9px] border-b-[9px] border-l-transparent border-r-transparent border-b-primary/20`} />
            {/* Fill arrow */}
            <div className={`${arrowClasses} -top-2 left-1/2 transform -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-base-100`} />
          </>
        );
      default:
        return null;
    }
  };
  
  const tooltipContent = variant === 'compact' ? (
    <div className="relative bg-gradient-to-br from-base-100 via-base-50 to-base-100 border border-primary/20 rounded-lg shadow-2xl backdrop-blur-sm p-3 max-w-xs">
      {renderArrow()}
      <div className="space-y-2">
        {rules.map((rule, index) => (
          <div key={index} className={clsx(
            'flex items-center space-x-2 text-sm',
            rule.condition ? 'text-success' : rule.type === 'warning' ? 'text-warning' : 'text-error'
          )}>
            <div className="flex-shrink-0">
              {rule.condition ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="font-medium">{rule.message}</span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="relative bg-gradient-to-br from-base-100 via-base-50 to-base-100 border border-primary/20 rounded-lg shadow-2xl backdrop-blur-sm p-3 w-64">
      {renderArrow()}
      <div className="space-y-1">
        {rules.map((rule, index) => (
          <div key={index} className={clsx(
            'flex items-center space-x-2 text-xs',
            rule.condition ? 'text-success' : rule.type === 'warning' ? 'text-warning' : 'text-error'
          )}>
            <div className="flex-shrink-0">
              {rule.condition ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="font-medium">{rule.message}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div ref={parentRef} className="absolute inset-0 pointer-events-none" />
      {tooltipPosition && (
        <div 
          className={clsx(baseClasses, className)}
          style={{
            top: tooltipPosition.top,
            left: position === 'left' ? tooltipPosition.left - 256 : tooltipPosition.left, // 256px is approximate tooltip width
            transform: position === 'top' || position === 'bottom' ? 'translateX(-50%)' : 'none'
          }}
        >
          {tooltipContent}
        </div>
      )}
    </>
  );
};

export { ValidationTooltip };