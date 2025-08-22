/**
 * Spacing System
 * Consistent spacing values based on 4px grid system
 */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  '5xl': 80,
  '6xl': 96,
} as const;

// Specific spacing from designs
export const DesignSpacing = {
  // Padding values from Stitch designs
  screenPadding: 24, // px-6 = 24px
  cardPadding: 24,
  buttonPadding: 16,

  // Margins
  sectionMargin: 32,
  elementMargin: 16,
  smallMargin: 8,

  // Component specific
  buttonHeight: 56, // h-14 = 56px
  iconSize: 24,
  progressDotSize: 8, // h-2 = 8px
  progressDotActiveWidth: 20, // w-5 = 20px

  // Layout
  maxContentWidth: 384, // max-w-sm = 384px
  illustrationAspectRatio: 1, // aspect-square
} as const;

export type SpacingKey = keyof typeof Spacing;
