// ========================================
// List Error Modal Component
// ========================================

import React from 'react';
import { Animated, Modal, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import { baseStyles } from '../EnhancedListsScreen.styles';

interface ListErrorModalProps {
  visible: boolean;
  message: string;
  subtitle: string;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onClose: () => void;
}

export const ListErrorModal: React.FC<ListErrorModalProps> = ({
  visible,
  message,
  subtitle,
  fadeAnim,
  scaleAnim,
  onClose,
}) => {
  const { theme } = useTheme();

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          text: {
            primary: '#000000',
            secondary: '#666666',
          },
        },
      };

  return (
    <Modal visible={visible} transparent={true} animationType='none' statusBarTranslucent={true}>
      <View style={baseStyles.errorModalOverlay}>
        <Animated.View
          style={[
            baseStyles.errorModalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Error Icon */}
          <View style={baseStyles.errorIconContainer}>
            <Typography variant='h1' style={baseStyles.errorIcon}>
              ⚠️
            </Typography>
          </View>

          {/* Error Message */}
          <Typography
            variant='h3'
            color={safeTheme.colors.text.primary}
            style={baseStyles.errorTitle}>
            {message}
          </Typography>

          <Typography
            variant='body1'
            color={safeTheme.colors.text.secondary}
            style={baseStyles.errorSubtitle}>
            {subtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity style={baseStyles.errorButton} onPress={onClose} activeOpacity={0.8}>
            <Typography variant='body1' style={baseStyles.errorButtonText}>
              Try Again
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
