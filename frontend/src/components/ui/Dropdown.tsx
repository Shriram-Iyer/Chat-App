import { useState, useRef, useEffect, useId } from 'react';
import { clsx } from 'clsx';

export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | number | (string | number)[];
  placeholder?: string;
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  multiSelect?: boolean;
  searchable?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined';
  onChange?: (value: string | number | (string | number)[]) => void;
  onSearch?: (query: string) => void;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  label,
  error,
  success,
  helperText,
  multiSelect = false,
  searchable = false,
  disabled = false,
  clearable = false,
  size = 'md',
  variant = 'filled',
  onChange,
  onSearch,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
  const hasValue = selectedValues.length > 0;
  const generatedId = useId();
  const dropdownId = generatedId;

  // Filter options based on search query
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (optionValue: string | number) => {
    if (multiSelect) {
      const newSelection = selectedValues.includes(optionValue)
        ? selectedValues.filter(val => val !== optionValue)
        : [...selectedValues, optionValue];
      onChange?.(newSelection);
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(multiSelect ? [] : '');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
    setFocusedIndex(-1);
  };

  const getSelectedLabel = () => {
    if (!hasValue) return placeholder;
    
    if (multiSelect) {
      const selectedOptions = options.filter(opt => selectedValues.includes(opt.value));
      return selectedOptions.length > 1 
        ? `${selectedOptions.length} items selected`
        : selectedOptions[0]?.label || placeholder;
    } else {
      const selectedOption = options.find(opt => opt.value === value);
      return selectedOption?.label || placeholder;
    }
  };

  const baseClasses = 'w-full cursor-pointer transition-all duration-200';
  
  const variants = {
    filled: 'bg-gradient-to-r from-base-100/50 to-base-100/80 backdrop-blur-sm border-2 rounded-lg shadow-lg hover:shadow-xl',
    outlined: 'bg-transparent border-2 rounded-lg'
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const borderColors = error 
    ? 'border-error focus-within:border-error' 
    : success 
    ? 'border-success focus-within:border-success' 
    : 'border-base-300 focus-within:border-primary hover:border-base-400';

  return (
    <div className="form-control">
      {label && (
        <label htmlFor={dropdownId} className="label">
          <span className={clsx(
            'label-text font-medium',
            error ? 'text-error' : success && hasValue ? 'text-success' : 'text-base-content/70'
          )}>
            {label}
          </span>
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        <div
          id={dropdownId}
          className={clsx(
            baseClasses,
            variants[variant],
            sizes[size],
            borderColors,
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <span className={clsx(
              'truncate',
              hasValue ? 'text-base-content' : 'text-base-content/50'
            )}>
              {getSelectedLabel()}
            </span>
            
            <div className="flex items-center gap-2">
              {clearable && hasValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-base-content/50 hover:text-base-content transition-colors duration-200 p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              
              <svg 
                className={clsx(
                  'w-5 h-5 text-base-content/50 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-2xl z-50 max-h-60 overflow-hidden">
            {searchable && (
              <div className="p-2 border-b border-base-300">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full px-3 py-2 text-sm bg-base-200 border border-base-300 rounded-md outline-none focus:border-primary"
                />
              </div>
            )}
            
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-base-content/50 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selectedValues.includes(option.value);
                  const isFocused = index === focusedIndex;
                  
                  return (
                    <div
                      key={option.value}
                      className={clsx(
                        'px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-150',
                        isSelected && 'bg-primary/10 text-primary font-medium',
                        isFocused && 'bg-base-200',
                        option.disabled && 'opacity-50 cursor-not-allowed',
                        !option.disabled && !isSelected && !isFocused && 'hover:bg-base-200'
                      )}
                      onClick={() => !option.disabled && handleOptionSelect(option.value)}
                    >
                      {multiSelect && (
                        <div className={clsx(
                          'w-4 h-4 border-2 rounded flex-shrink-0',
                          isSelected 
                            ? 'bg-primary border-primary' 
                            : 'border-base-300'
                        )}>
                          {isSelected && (
                            <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      )}
                      
                      {option.icon && (
                        <span className="flex-shrink-0">{option.icon}</span>
                      )}
                      
                      <span className="truncate">{option.label}</span>
                      
                      {!multiSelect && isSelected && (
                        <svg className="w-4 h-4 text-primary ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <div className={clsx(
          'mt-1 text-xs px-1',
          error ? 'text-error' : 'text-base-content/60'
        )}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export { Dropdown };