'use client';

import { createContext, useContext, useEffect, useState } from 'react';

// All available DaisyUI themes
const THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro',
  'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
  'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business',
  'acid', 'lemonade', 'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
];

interface ThemeContextType {
  theme: string;
  setTheme: (theme: string) => void;
  themes: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<string>('light');
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && THEMES.includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      // Apply to both html and document for DaisyUI compatibility
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.className = theme;
      localStorage.setItem('theme', theme);
      console.log('Theme applied:', theme); // Debug log
    }
  }, [theme, mounted]);

  const setTheme = (newTheme: string) => {
    console.log('Setting theme to:', newTheme); // Debug log
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  // Prevent flash of unstyled content during hydration
  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}