// ========================================
// Theme Provider - Context for theme throughout the app
// ========================================

import React, {
  type FC,
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import { theme } from '../../shared/theme';
import type { Theme } from '../../shared/types/ui';

// Theme Context
interface ThemeContextValue {
  readonly theme: Theme;
  readonly isDarkMode: boolean;
  readonly toggleTheme: () => void;
  readonly setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  readonly themeMode: 'light' | 'dark' | 'system';
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Theme Provider Props
interface ThemeProviderProps extends PropsWithChildren {
  readonly initialTheme?: 'light' | 'dark' | 'system';
}

/**
 * Theme Provider Component
 *
 * Provides theme context throughout the application
 * Supports light/dark mode with system preference detection
 */
export const ThemeProvider: FC<ThemeProviderProps> = ({ children, initialTheme = 'system' }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(initialTheme);

  // Determine if dark mode should be active
  const isDarkMode = React.useMemo(() => {
    switch (themeMode) {
      case 'dark':
        return true;
      case 'light':
        return false;
      case 'system':
        return systemColorScheme === 'dark';
      default:
        return false;
    }
  }, [themeMode, systemColorScheme]);

  // Create theme with appropriate colors
  const currentTheme = React.useMemo((): Theme => {
    // For now, just return the light theme regardless of dark mode
    // TODO: Implement proper dark theme colors
    return theme;
  }, [isDarkMode]);

  // Toggle between light and dark mode
  const toggleTheme = React.useCallback(() => {
    setThemeMode(current => {
      switch (current) {
        case 'light':
          return 'dark';
        case 'dark':
          return 'system';
        case 'system':
          return 'light';
        default:
          return 'light';
      }
    });
  }, []);

  // Set specific theme mode
  const setThemeModeCallback = React.useCallback((mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
  }, []);

  const contextValue = React.useMemo(
    (): ThemeContextValue => ({
      theme: currentTheme,
      isDarkMode,
      toggleTheme,
      setThemeMode: setThemeModeCallback,
      themeMode,
    }),
    [currentTheme, isDarkMode, toggleTheme, setThemeModeCallback, themeMode]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

/**
 * Hook to use theme context
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    console.error('❌ useTheme called outside of ThemeProvider');
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  // Theme is working correctly

  return context;
};

/**
 * Hook to get current theme object
 * @returns Current theme configuration
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook to get typography styles
 * @returns Typography configuration
 */
export const useTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook to get spacing values
 * @returns Spacing configuration
 */
export const useSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};
