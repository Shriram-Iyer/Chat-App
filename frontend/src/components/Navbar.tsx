'use client';

import Link from 'next/link';
import { Logo } from '@/components/ui';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/AuthProvider';
import { useAuthStore } from '@/stores/authStore';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';

// Dynamically import ThemeToggle to avoid SSR issues
const ThemeToggle = dynamic(() => import('./ThemeToggle'), {
  ssr: false,
  loading: () => null, // Don't show anything while loading
});

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { logout } = useAuthStore();
  const navRef = useRef<HTMLElement | null>(null);

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Measure navbar height and set CSS variable for global offset
  useEffect(() => {
    const setVar = () => {
      const h = navRef.current?.getBoundingClientRect().height || 56;
      document.documentElement.style.setProperty('--navbar-height', `${Math.round(h)}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener('resize', setVar);
    const id = requestAnimationFrame(setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <>
      <nav
        ref={navRef}
        className="navbar fixed top-0 left-0 right-0 z-[1000] bg-transparent backdrop-blur-0 shadow-none border-none min-h-0 py-1 px-2"
      >
        <div className="flex-1">
          <div className="cursor-pointer" onClick={handleLogoClick}>
            <Logo
              size="sm"
              variant="default"
              layout="horizontal"
              animated={true}
              className="flex-shrink-0"
            />
          </div>
        </div>

        <div className="flex-none flex items-center gap-2">
          {user ? (
            <>
              {/* Top-level tabs with spacing and glass morphism */}
              <div
                role="tablist"
                className="tabs tabs-boxed tabs-sm rounded-lg p-1 gap-3 flex bg-gradient-to-br from-base-100/50 to-base-100/80 backdrop-blur-sm border-2 border-base-300/50 shadow-lg"
              >
                <Link
                  href="/"
                  role="tab"
                  className={clsx(
                    'tab tab-sm rounded-md mx-0 px-4 md:px-5 py-2 transition-[colors,transform,shadow] duration-200 ease-out',
                    'bg-base-100/20 hover:bg-base-100/30 border border-base-300/40 hover:border-base-300/60',
                    'backdrop-blur-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-md',
                    'hover:scale-[1.02] active:scale-[0.99] text-base-content/80 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    { 'tab-active bg-base-100/40 !border-base-300/70 shadow-md text-base-content': pathname === '/' }
                  )}
                >
                  Chat
                </Link>
                <Link
                  href="/social"
                  role="tab"
                  className={clsx(
                    'tab tab-sm rounded-md mx-0 px-4 md:px-5 py-2 transition-[colors,transform,shadow] duration-200 ease-out',
                    'bg-base-100/20 hover:bg-base-100/30 border border-base-300/40 hover:border-base-300/60',
                    'backdrop-blur-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-md',
                    'hover:scale-[1.02] active:scale-[0.99] text-base-content/80 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    { 'tab-active bg-base-100/40 !border-base-300/70 shadow-md text-base-content': pathname.startsWith('/social') }
                  )}
                >
                  Social
                </Link>
                <Link
                  href="/profile"
                  role="tab"
                  className={clsx(
                    'tab tab-sm rounded-md mx-0 px-4 md:px-5 py-2 transition-[colors,transform,shadow] duration-200 ease-out',
                    'bg-base-100/20 hover:bg-base-100/30 border border-base-300/40 hover:border-base-300/60',
                    'backdrop-blur-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-md',
                    'hover:scale-[1.02] active:scale-[0.99] text-base-content/80 hover:text-base-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                    { 'tab-active bg-base-100/40 !border-base-300/70 shadow-md text-base-content': pathname.startsWith('/profile') }
                  )}
                >
                  Profile
                </Link>
              </div>

              {/* Logout icon button */}
              <button
                onClick={handleLogout}
                className="btn btn-circle btn-ghost btn-sm bg-base-200/60 border border-base-300 hover:bg-base-300/60 backdrop-blur-sm"
                title="Logout"
                aria-label="Logout"
              >
                {/* Heroicons outline: Arrow Right On Rectangle */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="w-4 h-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
                </svg>
                <span className="sr-only">Logout</span>
              </button>
            </>
          ) : null}
          {/* Standalone Theme toggle at the far right (last) */}
          <ThemeToggle variant="button" />
        </div>
      </nav>
    </>
  );
}