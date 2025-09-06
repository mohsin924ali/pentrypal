// ========================================
// Authentication Error Display Component
// ========================================

import React from 'react';
import { View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import { createThemedStyles } from '../LoginScreen.styles';

interface AuthErrorDisplayProps {
  error: string | null;
}

export const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error }) => {
  const { theme } = useTheme();
  const themedStyles = createThemedStyles(theme);

  if (!error) return null;

  return (
    <View style={themedStyles.errorContainer}>
      <Typography variant='body2' color={theme.colors.semantic.error[700]} align='center'>
        {error}
      </Typography>
    </View>
  );
};
