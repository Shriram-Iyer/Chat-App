'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={0}
      containerClassName="pointer-events-none z-[10000]"
      containerStyle={{}}
      toastOptions={{
        // Default options
  duration: 4000,
        className: 'pointer-events-auto',
        style: {
          background: 'hsl(var(--b1))', // DaisyUI base-100
          color: 'hsl(var(--bc))', // DaisyUI base-content
          border: '1px solid hsl(var(--b3))', // DaisyUI base-300
          borderRadius: 'var(--rounded-btn, 0.5rem)', // DaisyUI button border radius
          boxShadow: 'var(--shadow, 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05))',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
        // Success toasts
        success: {
          style: {
            background: 'hsl(var(--su))', // DaisyUI success color
            color: 'hsl(var(--suc))', // DaisyUI success content
            border: '1px solid hsl(var(--su))',
            borderRadius: 'var(--rounded-btn, 0.5rem)',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'hsl(var(--suc))',
            secondary: 'hsl(var(--su))',
          },
        },
        // Error toasts
        error: {
          style: {
            background: 'hsl(var(--er))', // DaisyUI error color
            color: 'hsl(var(--erc))', // DaisyUI error content
            border: '1px solid hsl(var(--er))',
            borderRadius: 'var(--rounded-btn, 0.5rem)',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'hsl(var(--erc))',
            secondary: 'hsl(var(--er))',
          },
        },
        // Loading toasts
        loading: {
          style: {
            background: 'hsl(var(--b1))',
            color: 'hsl(var(--bc))',
            border: '1px solid hsl(var(--p))', // DaisyUI primary color
            borderRadius: 'var(--rounded-btn, 0.5rem)',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'hsl(var(--p))',
            secondary: 'hsl(var(--b1))',
          },
        },
      }}
    />
  );
}