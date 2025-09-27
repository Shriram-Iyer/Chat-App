import React from 'react';
import clsx from 'clsx';

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'circle' | 'rounded' | 'square';
  fallback?: 'silhouette' | 'initials';
  name?: string;
  className?: string;
}

// Default silhouette SVGs
const SILHOUETTE_SVG = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-base-content/60">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);

export function Avatar({
  src,
  alt,
  size = 'md',
  variant = 'circle',
  fallback = 'silhouette',
  name,
  className,
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Update loading state when src changes; handle cached images too
  React.useEffect(() => {
    if (!src) {
      setImageLoaded(false);
      setImageError(false);
      return;
    }

    // Base64 data URLs can be considered loaded immediately
    if (src.startsWith('data:')) {
      setImageLoaded(true);
      setImageError(false);
      return;
    }

    setImageLoaded(false);
    setImageError(false);

    // Preload to detect cached/instant-loaded images
    const probe = new Image();
    probe.decoding = 'async';
    probe.src = src;

    if (probe.complete) {
      // Already cached
      setImageLoaded(true);
      setImageError(false);
      return;
    }

    const handleLoad = () => {
      setImageLoaded(true);
      setImageError(false);
    };
    const handleError = () => {
      setImageLoaded(false);
      setImageError(true);
    };

    probe.addEventListener('load', handleLoad);
    probe.addEventListener('error', handleError);
    return () => {
      probe.removeEventListener('load', handleLoad);
      probe.removeEventListener('error', handleError);
    };
  }, [src]);

  // Size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  // Variant classes
  const variantClasses = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none',
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  // Determine what to show
  const showImage = src && !imageError;
  const showInitials = fallback === 'initials' && name && (!src || imageError);
  const showSilhouette = !showImage && !showInitials;

  return (
    <div
      className={clsx(
        'relative inline-flex items-center justify-center bg-base-200 overflow-hidden flex-shrink-0',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {/* Image */}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={clsx(
            'w-full h-full object-cover transition-opacity duration-200',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          loading="eager"
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
      )}

      {/* Initials Fallback */}
      {showInitials && (
        <span className="font-semibold text-base-content select-none">
          {getInitials(name!)}
        </span>
      )}

      {/* Silhouette Fallback */}
      {showSilhouette && (
        <div className="w-2/3 h-2/3 flex items-center justify-center">
          {SILHOUETTE_SVG}
        </div>
      )}

      {/* Loading state */}
      {src && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-base-200">
          <span className="loading loading-spinner loading-xs"></span>
        </div>
      )}
    </div>
  );
}

// Avatar Group component for showing multiple avatars
export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  size?: AvatarProps['size'];
  max?: number;
  spacing?: 'tight' | 'normal' | 'loose';
  className?: string;
}

export function AvatarGroup({
  avatars,
  size = 'md',
  max = 4,
  spacing = 'normal',
  className,
}: AvatarGroupProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(0, avatars.length - max);

  const spacingClasses = {
    tight: '-space-x-1',
    normal: '-space-x-2',
    loose: '-space-x-3',
  };

  return (
    <div className={clsx('flex items-center', spacingClasses[spacing], className)}>
      {visibleAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-base-100">
          <Avatar
            src={avatar.src}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
            fallback="initials"
          />
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div className="ring-2 ring-base-100">
          <Avatar
            size={size}
            fallback="initials"
            name={`+${remainingCount}`}
            className="bg-base-300"
          />
        </div>
      )}
    </div>
  );
}