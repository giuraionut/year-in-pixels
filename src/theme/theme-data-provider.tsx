'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import setGlobalColorTheme from '@/theme/theme-colors';
import { ThemeProviderProps, useTheme } from 'next-themes';
import { ThemeColors, ThemeContextParams } from './theme.types';

const ThemeContext = createContext<ThemeContextParams>(
  {} as ThemeContextParams
);

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const [themeColor, setThemeColor] = useState<ThemeColors | null>(null); // Use `null` to detect hydration issues
  const [customHue, setCustomHue] = useState<number | undefined>(undefined);
  const { resolvedTheme } = useTheme(); // Get the current resolved theme (light/dark/system)

  // Load saved values from localStorage (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Ensure this only runs client-side
    try {
      const savedThemeColor = localStorage.getItem('themeColor') as ThemeColors;
      const savedCustomHue = Number(localStorage.getItem('customHue'));

      setThemeColor(savedThemeColor || 'Zinc'); // Default to 'Zinc' if nothing is stored
      setCustomHue(!isNaN(savedCustomHue) ? savedCustomHue : undefined);
    } catch (error) {
      console.error('Error loading theme settings from localStorage:', error);
    }
  }, []);

  // Save values to localStorage and apply the theme whenever they change
  useEffect(() => {
    if (themeColor === null) return; // Skip until hydration is complete
    try {
      localStorage.setItem('themeColor', themeColor || 'Zinc');
      if (customHue !== undefined) {
        localStorage.setItem('customHue', customHue.toString());
      }
      setGlobalColorTheme(
        (resolvedTheme as 'light' | 'dark') || 'light',
        themeColor,
        customHue
      );
    } catch (error) {
      console.error('Error saving theme settings to localStorage:', error);
    }
  }, [themeColor, customHue, resolvedTheme]);

  // Avoid rendering the provider until hydration is complete
  if (themeColor === null) return null;

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
