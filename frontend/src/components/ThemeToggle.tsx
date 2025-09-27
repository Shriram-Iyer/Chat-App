// ThemeToggle: switch DaisyUI theme at runtime. Supports two rendering variants:
// - 'button': a standalone circular button opening a grid of themes
// - 'menuitem': an option suitable for a menu list that opens a side panel
'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

type ThemeToggleProps = {
  variant?: 'button' | 'menuitem';
};

export default function ThemeToggle({ variant = 'button' }: ThemeToggleProps) {
  const { theme, setTheme, themes } = useTheme();

  const handleThemeChange = (themeName: string) => {
    setTheme(themeName);
  };

  if (variant === 'button') {
    return (
  <div className="dropdown dropdown-end" aria-label="Theme selector">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-circle btn-ghost bg-base-200/80 backdrop-blur-sm border border-base-300 hover:bg-base-300 transition-all duration-200"
          title="Change Theme"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <div
          tabIndex={0}
          className="dropdown-content bg-base-100 rounded-box z-[1] w-80 p-4 shadow-xl border border-base-300"
        >
          <div className="mb-3">
            <h3 className="font-semibold text-base-content mb-2">Choose Theme</h3>
          </div>

          <ScrollArea className="max-h-96">
            <div className="grid grid-cols-4 gap-2" role="list">
            {themes.map((themeName) => (
              <button
                key={themeName}
                onClick={() => handleThemeChange(themeName)}
                className={`group relative p-2 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                  theme === themeName
                    ? 'border-primary bg-primary/10'
                    : 'border-base-300 hover:border-primary/50'
                }`}
                data-theme={themeName}
                title={themeName}
                aria-pressed={theme === themeName}
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 rounded-full bg-primary border-2 border-primary-content shadow-sm"></div>
                  <span className="text-xs capitalize font-medium text-base-content truncate w-full text-center">
                    {themeName}
                  </span>
                </div>

                {theme === themeName && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <svg
                      className="w-2.5 h-2.5 text-primary-content"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Menu item variant: looks like a normal menu entry and opens a side panel
  return <ThemeMenuItem themes={themes} theme={theme} onChange={setTheme} />;
}

function ThemeMenuItem({
  themes,
  theme,
  onChange,
}: {
  themes: string[];
  theme: string;
  onChange: (theme: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openTheme, setOpenTheme] = useState<string | null>(null);
  const wrapperRef = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const handleSelect = (name: string) => {
    // Close first, then apply theme to avoid any restyle flicker
    setOpen(false);
    // Use double rAF to ensure DOM has updated and dropdown is removed
    requestAnimationFrame(() => requestAnimationFrame(() => onChange(name)));
  };

  return (
    <li ref={wrapperRef} className="relative">
      <button
        type="button"
        className="flex w-full items-center justify-between px-4 py-2 rounded-md hover:bg-base-200"
        onClick={() =>
          setOpen((v) => {
            const next = !v;
            if (next) {
              // Freeze the side panel theme to the current theme when opening
              setOpenTheme(theme);
            }
            return next;
          })
        }
      >
        <span>Theme</span>
        <svg
          className="w-4 h-4 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {open && (
        <ScrollArea
          className="absolute right-full top-0 mr-2 bg-base-100 rounded-box z-[2] w-80 max-h-96 p-3 shadow-xl border border-base-300"
          dataTheme={openTheme ?? theme}
        >
          <ul className="relative w-full space-y-1 before:content-[''] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0 before:bg-transparent">
              {themes.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(name)}
                    className={`w-full flex items-center justify-between gap-3 px-2 py-2 rounded-md border transition-colors duration-150 focus:outline-none ${
                      theme === name
                        ? 'border-primary bg-primary/10'
                        : 'border-transparent hover:bg-base-200'
                    }`}
                    title={name}
                  >
                    <div className="flex items-center gap-3">
                      {/* Swatch preview for the theme only */}
                      <div className="pointer-events-none flex items-center -space-x-1" data-theme={name}>
                        <span className="w-4 h-4 rounded-full bg-primary border border-base-300"></span>
                        <span className="w-4 h-4 rounded-full bg-secondary border border-base-300"></span>
                        <span className="w-4 h-4 rounded-full bg-accent border border-base-300"></span>
                      </div>
                      <span className="capitalize text-sm truncate max-w-[12rem]">{name}</span>
                    </div>
                    {theme === name && (
                      <svg
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
      </ul>
    </ScrollArea>
      )}
    </li>
  );
}

// Lightweight scroll container to show a slim, floating scrollbar on hover/scroll
function ScrollArea({
  className,
  children,
  dataTheme,
}: {
  className?: string;
  children: ReactNode;
  dataTheme?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let to: number | undefined;
    const onScroll = () => {
      el.classList.add('scrolling');
      if (to) window.clearTimeout(to);
      to = window.setTimeout(() => el.classList.remove('scrolling'), 400);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (to) window.clearTimeout(to);
      el.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`overflow-y-auto overflow-x-hidden scrollbar-theme ${className ?? ''}`}
      data-theme={dataTheme}
    >
      {children}
    </div>
  );
}