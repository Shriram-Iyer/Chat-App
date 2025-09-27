'use client';

import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export const useToast = () => {
  const showToast = {
    success: (message: string, options?: ToastOptions) => {
      return toast.success(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        style: {
          background: 'hsl(var(--su))',
          color: 'hsl(var(--suc))',
          border: '1px solid hsl(var(--su))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
        iconTheme: {
          primary: 'hsl(var(--suc))',
          secondary: 'hsl(var(--su))',
        },
      });
    },

    error: (message: string, options?: ToastOptions) => {
      return toast.error(message, {
        duration: options?.duration || 5000,
        position: options?.position || 'bottom-right',
        style: {
          background: 'hsl(var(--er))',
          color: 'hsl(var(--erc))',
          border: '1px solid hsl(var(--er))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
        iconTheme: {
          primary: 'hsl(var(--erc))',
          secondary: 'hsl(var(--er))',
        },
      });
    },

    warning: (message: string, options?: ToastOptions) => {
      return toast(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        icon: '⚠️',
        style: {
          background: 'hsl(var(--wa))',
          color: 'hsl(var(--wac))',
          border: '1px solid hsl(var(--wa))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
      });
    },

    info: (message: string, options?: ToastOptions) => {
      return toast(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        icon: 'ℹ️',
        style: {
          background: 'hsl(var(--in))',
          color: 'hsl(var(--inc))',
          border: '1px solid hsl(var(--in))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
      });
    },

    loading: (message: string) => {
      return toast.loading(message, {
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          border: '1px solid hsl(var(--p))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
        iconTheme: {
          primary: 'hsl(var(--p))',
          secondary: 'hsl(var(--b1))',
        },
      });
    },

    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: Error) => string);
      },
      options?: ToastOptions
    ) => {
      return toast.promise(promise, messages, {
        position: options?.position || 'bottom-right',
        style: {
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
        success: {
          style: {
            background: 'hsl(var(--su))',
            color: 'hsl(var(--suc))',
            border: '1px solid hsl(var(--su))',
          },
        },
        error: {
          style: {
            background: 'hsl(var(--er))',
            color: 'hsl(var(--erc))',
            border: '1px solid hsl(var(--er))',
          },
        },
        loading: {
          style: {
            background: 'hsl(var(--b1))',
            color: 'hsl(var(--bc))',
            border: '1px solid hsl(var(--p))',
          },
        },
      });
    },

    custom: (message: string, options?: ToastOptions & { icon?: string }) => {
      return toast(message, {
        duration: options?.duration || 4000,
        position: options?.position || 'bottom-right',
        icon: options?.icon,
        style: {
          background: 'hsl(var(--b1))',
          color: 'hsl(var(--bc))',
          border: '1px solid hsl(var(--b3))',
          borderRadius: 'var(--rounded-btn, 0.5rem)',
          fontSize: '0.875rem',
          fontWeight: '500',
          padding: '12px 16px',
        },
      });
    },

    dismiss: (toastId?: string) => {
      toast.dismiss(toastId);
    },

    remove: (toastId?: string) => {
      toast.remove(toastId);
    },
  };

  return showToast;
};