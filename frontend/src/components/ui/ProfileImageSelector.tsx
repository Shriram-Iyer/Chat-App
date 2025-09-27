'use client';

import React, { useRef } from 'react';
import clsx from 'clsx';
import { useToast } from '@/hooks/useToast';
import { Avatar } from './Avatar';

export interface ProfileImageSelectorProps {
  value?: string;
  onChange?: (imageData: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  className?: string;
  disabled?: boolean;
  showEditButton?: boolean;
}

export function ProfileImageSelector({
  value,
  onChange,
  size = 'lg',
  name,
  className,
  disabled = false,
  showEditButton = true,
}: ProfileImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Size mappings for different components
  const avatarSize = {
    sm: 'md' as const,
    md: 'lg' as const,
    lg: 'xl' as const,
    xl: '2xl' as const,
  };

  const handleEditClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result: string | ArrayBuffer | null = reader.result;
        if (typeof result === 'string') {
          onChange?.(result); // Now TypeScript knows result is a string
        }
      };
    }

    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  // Use provided value directly (URL or base64) for preview
  const previewSrc = value;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Avatar Display with Edit Button */}
      <div className={clsx('relative inline-block', className)}>
        <Avatar
          src={previewSrc}
          name={name}
          size={avatarSize[size]}
          fallback="silhouette"
        />

        {showEditButton && (
          <button
            type="button"
            onClick={handleEditClick}
            disabled={disabled}
            className={clsx(
              'absolute -bottom-1 -right-1 w-8 h-8 rounded-full',
              'bg-primary hover:bg-primary/90 text-primary-content',
              'flex items-center justify-center transition-colors',
              'shadow-lg border-2 border-base-100',
              'cursor-pointer',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
      </div>
    </>
  );
}