'use client';

import { ThemeProvider } from "./ThemeProvider";

export default function ClientThemeWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}