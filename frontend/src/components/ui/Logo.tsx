import { clsx } from 'clsx';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'default' | 'minimal' | 'text-only';
  layout?: 'vertical' | 'horizontal';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({
  size = 'md',
  variant = 'default',
  layout = 'vertical',
  animated = true,
  className,
  onClick
}) => {
  const sizes = {
    sm: { 
      container: 'w-10 h-10', 
      icon: 'w-10 h-10', 
      text: 'text-2xl',
      sparkle1: 'w-2 h-2 -top-0.5 -right-0.5',
      sparkle2: 'w-1.5 h-1.5 -bottom-0.5 -left-0.5'
    },
    md: { 
      container: 'w-12 h-12', 
      icon: 'w-12 h-12', 
      text: 'text-3xl',
      sparkle1: 'w-2.5 h-2.5 -top-0.5 -right-0.5',
      sparkle2: 'w-2 h-2 -bottom-0.5 -left-0.5'
    },
    lg: { 
      container: 'w-16 h-16', 
      icon: 'w-16 h-16', 
      text: 'text-4xl',
      sparkle1: 'w-3 h-3 -top-1 -right-1',
      sparkle2: 'w-2 h-2 -bottom-1 -left-1'
    },
    xl: { 
      container: 'w-20 h-20', 
      icon: 'w-20 h-20', 
      text: 'text-5xl',
      sparkle1: 'w-4 h-4 -top-1 -right-1',
      sparkle2: 'w-3 h-3 -bottom-1 -left-1'
    },
    hero: {
      container: 'w-22 h-22',
      icon: 'w-22 h-22',
      text: 'text-6xl',
      sparkle1: 'w-4 h-4 -top-1 -right-1',
      sparkle2: 'w-3 h-3 -bottom-1 -left-1'
    }
  };

  const currentSize = sizes[size];

  const logoIcon = (
    <div
      className={clsx(
        'inline-flex items-center justify-center relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-secondary to-accent',
        currentSize.container,
        animated && 'transition-transform duration-300 hover:scale-105 active:scale-95',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <svg
        className={clsx(currentSize.icon, 'relative')}
        viewBox="0 0 120 120"
        role="img"
        aria-label="App logo"
      >
        {/* Scaled inner group to reduce perceived background square dominance */}
        <g transform="translate(-4,2) scale(1.12)">
          {/* Chat bubble with slight gradient + subtle outline for contrast on white themes */}
          <defs>
            <linearGradient id="bubbleFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" />
              <stop offset="100%" stopColor="rgba(245,245,245,0.85)" />
            </linearGradient>
            <filter id="cameraShadow" x="-20%" y="-40%" width="140%" height="200%" colorInterpolationFilters="sRGB">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="rgba(0,0,0,0.35)" floodOpacity="0.35" />
            </filter>
          </defs>
          <path
            d="M30 35 C30 28, 35 23, 42 23 L78 23 C85 23, 90 28, 90 35 L90 65 C90 72, 85 77, 78 77 L50 77 L35 90 L42 77 C35 77, 30 72, 30 65 Z"
            fill="url(#bubbleFill)"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth={2}
          />
          {/* Camera icon group (no solid backplate; rely on inner stroke + shadow) */}
          <g>
            <rect
              x="42" y="43" width="16" height="10" rx="2" ry="2"
              className="fill-accent"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth={0.8}
              filter="url(#cameraShadow)"
            />
            <rect
              x="42.5" y="43.5" width="15" height="9" rx="1.6" ry="1.6"
              fill="none"
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={0.6}
            />
            <path
              d="M58 46 L66 41 L66 55 L58 50 Z"
              className="fill-accent"
              stroke="rgba(0,0,0,0.22)"
              strokeWidth={0.7}
              filter="url(#cameraShadow)"
            />
            <path
              d="M58.4 46.3 L65.2 41.8 L65.2 54.2 L58.4 49.7 Z"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={0.5}
            />
          </g>
          {/* Phone simplified */}
          <g transform="translate(69 41) scale(0.6)">
            <rect x="0" y="0" width="18" height="26" rx="3" className="fill-accent" />
            <rect x="3" y="5" width="12" height="13" rx="1.5" fill="white" />
            <circle cx="9" cy="22" r="2" fill="white" />
            <rect x="7.5" y="2.2" width="3" height="0.9" rx="0.45" fill="white" />
          </g>
        </g>
      </svg>
    </div>
  );

  const logoText = (
    <h1 className={clsx(
      'font-extrabold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent tracking-tight',
      currentSize.text,
      onClick && 'cursor-pointer'
    )} onClick={onClick}>
      ConnectVibe
    </h1>
  );

  if (variant === 'text-only') {
    return logoText;
  }

  if (variant === 'minimal') {
    return logoIcon;
  }

  // Tighter vertical spacing to reduce empty space when used in hero contexts
  const gapClass = 'gap-2';
  const containerClass = layout === 'horizontal' 
    ? 'flex flex-row items-center' 
    : 'flex flex-col items-center';
    
  return (
    <div className={clsx(
      containerClass,
      gapClass,
      'leading-tight',
      onClick && 'cursor-pointer',
      className
    )} onClick={onClick}>
      <div className={clsx(size === 'xl' && layout === 'vertical' && '-mb-2')}>
        {logoIcon}
      </div>
      {logoText}
    </div>
  );
};

export { Logo };