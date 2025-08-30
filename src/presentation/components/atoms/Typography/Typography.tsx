// ========================================
// Typography Component - Semantic Text Component
// ========================================

import React, { type FC } from 'react';
import { type TextProps as RNTextProps, Text } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import type { BaseTextProps } from '../../../../shared/types/ui';

// Typography Variants
export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'caption'
  | 'overline'
  | 'button';

// Typography Props
export interface TypographyProps extends Omit<RNTextProps, 'style'> {
  readonly variant?: TypographyVariant;
  readonly color?: string;
  readonly style?: any;
  readonly align?: 'left' | 'center' | 'right' | 'justify';
  readonly weight?:
    | 'thin'
    | 'extraLight'
    | 'light'
    | 'normal'
    | 'medium'
    | 'semiBold'
    | 'bold'
    | 'extraBold'
    | 'black';
  readonly size?: number;
  readonly lineHeight?: number;
  readonly letterSpacing?: number;
  readonly underline?: boolean;
  readonly strikethrough?: boolean;
  readonly italic?: boolean;
  readonly truncate?: boolean;
  readonly numberOfLines?: number;
}

/**
 * Typography Component
 *
 * Semantic text component with consistent styling
 * Supports all typography variants from the design system
 */
export const Typography: FC<TypographyProps> = ({
  variant = 'body1',
  color,
  align = 'left',
  weight,
  size,
  lineHeight,
  letterSpacing,
  underline = false,
  strikethrough = false,
  italic = false,
  truncate = false,
  numberOfLines,
  style,
  children,
  ...rest
}) => {
  const { theme } = useTheme();

  // Get base style from variant
  const variantStyle = theme.typography.textStyles[variant];

  // Override with custom props
  const textStyle = React.useMemo(() => {
    const baseStyle = {
      ...variantStyle,
      color: color || theme.colors.text.primary,
      textAlign: align,
    };

    // Apply custom overrides
    if (weight) {
      baseStyle.fontWeight = theme.typography.fontWeights[weight];
    }

    if (size) {
      baseStyle.fontSize = size;
    }

    if (lineHeight) {
      baseStyle.lineHeight = lineHeight;
    }

    if (letterSpacing) {
      baseStyle.letterSpacing = letterSpacing;
    }

    // Text decorations
    const textDecorationLine = [];
    if (underline) textDecorationLine.push('underline');
    if (strikethrough) textDecorationLine.push('line-through');

    if (textDecorationLine.length > 0) {
      baseStyle.textDecorationLine = textDecorationLine.join(' ') as any;
    }

    if (italic) {
      baseStyle.fontStyle = 'italic';
    }

    return baseStyle;
  }, [
    variantStyle,
    color,
    theme.colors.text.primary,
    align,
    weight,
    theme.typography.fontWeights,
    size,
    lineHeight,
    letterSpacing,
    underline,
    strikethrough,
    italic,
  ]);

  return (
    <Text
      style={[textStyle, style] as any}
      numberOfLines={truncate ? 1 : numberOfLines}
      ellipsizeMode={truncate ? 'tail' : undefined}
      {...rest}>
      {children}
    </Text>
  );
};

// Typography variants as individual components for convenience
export const Heading1: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h1' {...props} />
);

export const Heading2: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h2' {...props} />
);

export const Heading3: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h3' {...props} />
);

export const Heading4: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h4' {...props} />
);

export const Heading5: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h5' {...props} />
);

export const Heading6: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='h6' {...props} />
);

export const Body: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='body1' {...props} />
);

export const Caption: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='caption' {...props} />
);

export const Overline: FC<Omit<TypographyProps, 'variant'>> = props => (
  <Typography variant='overline' {...props} />
);
