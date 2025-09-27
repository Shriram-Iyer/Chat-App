"use client";

import toast from 'react-hot-toast';

// Minimal themed toast utilities usable outside React components (e.g. in Zustand stores)
// Mirrors styling approach in ToastProvider / useToast hook.
export const themedToast = {
  success: (message: string, id?: string) =>
    toast.success(message, {
      duration: 4000,
      position: 'bottom-right',
      id,
      style: {
        background: 'hsl(var(--su))',
        color: 'hsl(var(--suc))',
        border: '1px solid hsl(var(--su))',
        borderRadius: 'var(--rounded-btn, 0.5rem)',
        fontSize: '0.875rem',
        fontWeight: 500,
        padding: '12px 16px',
      },
      iconTheme: {
        primary: 'hsl(var(--suc))',
        secondary: 'hsl(var(--su))',
      },
    }),
  error: (message: string, id?: string) =>
    toast.error(message, {
      duration: 5000,
      position: 'top-right',
      id,
      style: {
        background: 'hsl(var(--er))',
        color: 'hsl(var(--erc))',
        border: '1px solid hsl(var(--er))',
        borderRadius: 'var(--rounded-btn, 0.5rem)',
        fontSize: '0.875rem',
        fontWeight: 500,
        padding: '12px 16px',
      },
      iconTheme: {
        primary: 'hsl(var(--erc))',
        secondary: 'hsl(var(--er))',
      },
    }),
};

export type ThemedToast = typeof themedToast;
