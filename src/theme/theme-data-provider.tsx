'use client';
import setGlobalColorTheme from '@/theme/theme-colors';
import { ThemeProviderProps, useTheme } from 'next-themes';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeColors, ThemeContextParams } from './theme.types';

const ThemeContext = createContext<ThemeContextParams>(
  {} as ThemeContextParams
);

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const getSavedThemeColor = () => {
    try {
      return (localStorage.getItem('themeColor') as ThemeColors) || 'Zinc';
    } catch (error) {
      console.log('Error getting theme color:', error);
      return 'Zinc';
    }
  };

  const getSavedCustomHue = () => {
    try {
      return Number(localStorage.getItem('customHue')) || undefined;
    } catch (error) {
      console.log('Error getting custom hue:', error);
      return undefined;
    }
  };

  const [themeColor, setThemeColor] = useState<ThemeColors>(
    getSavedThemeColor()
  );
  const [customHue, setCustomHue] = useState<number | undefined>(
    getSavedCustomHue()
  );
  const [isMounted, setIsMounted] = useState(false);
  const { resolvedTheme } = useTheme(); // Use `resolvedTheme` for actual applied theme

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true);
      return;
    }

    if (themeColor) localStorage.setItem('themeColor', themeColor);
    if (customHue !== undefined) {
      localStorage.setItem('customHue', customHue.toString());
    }

    setGlobalColorTheme(
      (resolvedTheme as 'light' | 'dark') || 'light',
      themeColor,
      customHue
    );
  }, [themeColor, customHue, resolvedTheme, isMounted]);

  if (!isMounted) return null;

  return (
    <ThemeContext.Provider
      value={{ themeColor, setThemeColor, customHue, setCustomHue }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
