/**
 * Typography Component
 * Consistent text component with theme integration
 */

import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { Theme, TypographyKey } from '@/shared/theme';

export interface TypographyProps extends TextProps {
  variant?: TypographyKey;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const getTextStyle = (): TextStyle => {
    const baseStyle = Theme.typography[variant];

    return {
      ...baseStyle,
      ...(color && { color }),
      textAlign: align,
      ...(style as TextStyle),
    };
  };

  return (
    <Text style={getTextStyle()} {...props}>
      {children}
    </Text>
  );
};
