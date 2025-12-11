/**
 * Design System Utilities
 * 
 * Provides utility functions and constants for maintaining
 * consistent typography, spacing, and styling throughout the application.
 * 
 * These utilities help enforce the design system defined in the design document
 * and make it easier to apply consistent styles programmatically.
 */

/**
 * Typography utilities
 * Provides consistent font families, sizes, weights, and line heights
 */
export const typography = {
  // Font families
  fontFamily: {
    serif: 'var(--font-playfair), Georgia, serif',
    sans: 'var(--font-inter), system-ui, -apple-system, sans-serif',
  },

  // Font sizes (in rem)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
    '6xl': '3.75rem', // 60px
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,   // For headings
    normal: 1.5,   // For body text
    relaxed: 1.75, // For long-form content
  },
};

/**
 * Spacing scale utilities
 * Based on 4px base unit for consistent spacing
 */
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
};

/**
 * Breakpoint utilities
 * Responsive design breakpoints
 */
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

/**
 * Color utilities
 * Semantic color names for consistent theming
 */
export const colors = {
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

/**
 * Transition utilities
 * Consistent animation durations
 */
export const transitions = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
};

/**
 * Helper function to generate heading classes
 * Ensures all headings use the serif font family
 */
export const getHeadingClasses = (level: 1 | 2 | 3 | 4 | 5 | 6): string => {
  const baseClasses = 'font-serif font-semibold';
  
  const sizeClasses = {
    1: 'text-5xl md:text-6xl',
    2: 'text-4xl md:text-5xl',
    3: 'text-3xl md:text-4xl',
    4: 'text-2xl md:text-3xl',
    5: 'text-xl md:text-2xl',
    6: 'text-lg md:text-xl',
  };

  return `${baseClasses} ${sizeClasses[level]}`;
};

/**
 * Helper function to generate body text classes
 * Ensures all body text uses the sans-serif font family
 */
export const getBodyTextClasses = (size: 'sm' | 'base' | 'lg' = 'base'): string => {
  const baseClasses = 'font-sans';
  
  const sizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
  };

  return `${baseClasses} ${sizeClasses[size]}`;
};

/**
 * Helper function to validate spacing values
 * Ensures spacing values come from the defined scale
 */
export const isValidSpacing = (value: string): boolean => {
  return Object.values(spacing).includes(value);
};

/**
 * Helper function to get container max-width classes
 * Provides consistent container widths across the site
 */
export const getContainerClasses = (): string => {
  return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
};

/**
 * Helper function to get section spacing classes
 * Provides consistent vertical spacing for page sections
 */
export const getSectionSpacing = (): string => {
  return 'py-16 md:py-24';
};
