'use client';

import * as React from 'react';
import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps,
} from 'next-themes';
import ThemeDataProvider from '@/theme/theme-data-provider';

export default function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeDataProvider>{children}</ThemeDataProvider>
    </NextThemesProvider>
  );
}
