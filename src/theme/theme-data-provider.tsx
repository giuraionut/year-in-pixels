'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import setGlobalColorTheme from '@/theme/theme-colors';
import { ThemeProviderProps, useTheme } from 'next-themes';
import { ThemeColors, ThemeContextParams } from './theme.types';

const ThemeContext = createContext<ThemeContextParams>(
  {} as ThemeContextParams
);

export default function ThemeDataProvider({ children }: ThemeProviderProps) {
  const [themeColor, setThemeColor] = useState<ThemeColors | undefined>(
    undefined
  ); // Null indicates hydration incomplete
  const [customHue, setCustomHue] = useState<number | undefined>(undefined);
  const { resolvedTheme } = useTheme();

  // Load saved values from localStorage on hydration
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedThemeColor = localStorage.getItem('themeColor') as ThemeColors;
      const savedCustomHue = localStorage.getItem('customHue');
      const parsedCustomHue = savedCustomHue
        ? Number(savedCustomHue)
        : undefined;

      // Prioritize customHue if defined
      if (parsedCustomHue !== undefined && !isNaN(parsedCustomHue)) {
        setCustomHue(parsedCustomHue);
        setThemeColor(undefined); // Use `null` to indicate custom hue
      } else {
        setThemeColor(savedThemeColor || 'Zinc'); // Default to Zinc if undefined
      }
    } catch (error) {
      console.error('Error loading theme settings from localStorage:', error);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (themeColor === undefined && customHue === undefined) return; // Skip incomplete state
    try {
      if (customHue !== undefined) {
        localStorage.setItem('customHue', customHue.toString());
        localStorage.removeItem('themeColor'); // Remove themeColor if customHue is set
      } else {
        localStorage.setItem('themeColor', themeColor || 'Zinc');
        localStorage.removeItem('customHue'); // Remove customHue if themeColor is set
      }
      setGlobalColorTheme(
        (resolvedTheme as 'light' | 'dark') || 'light',
        themeColor || 'Zinc',
        customHue
      );
    } catch (error) {
      console.error('Error saving theme settings to localStorage:', error);
    }
  }, [themeColor, customHue, resolvedTheme]);

  // Avoid rendering the provider until hydration is complete
  if (themeColor === undefined && customHue === undefined) return null;

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
