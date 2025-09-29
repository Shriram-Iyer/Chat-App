import React from 'react';

interface SkeletonProps {
  height?: number | string;
  width?: number | string;
  count?: number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ height = 20, width = '100%', count = 1, className = '' }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-base-300 rounded ${className}`}
          style={{ height, width, marginBottom: 8 }}
        />
      ))}
    </>
  );
};
