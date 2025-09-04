// ========================================
// List Success Modal Component
// ========================================

import React from 'react';
import { Animated, Modal, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import { baseStyles } from '../EnhancedListsScreen.styles';

interface ListSuccessModalProps {
  visible: boolean;
  message: string;
  subtitle: string;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  onClose: () => void;
}

export const ListSuccessModal: React.FC<ListSuccessModalProps> = ({
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
      <View style={baseStyles.successModalOverlay}>
        <Animated.View
          style={[
            baseStyles.successModalContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}>
          {/* Success Icon */}
          <View style={baseStyles.successIconContainer}>
            <Typography variant='h1' style={baseStyles.successIcon}>
              🎉
            </Typography>
          </View>

          {/* Success Message */}
          <Typography
            variant='h3'
            color={safeTheme.colors.text.primary}
            style={baseStyles.successTitle}>
            {message}
          </Typography>

          <Typography
            variant='body1'
            color={safeTheme.colors.text.secondary}
            style={baseStyles.successSubtitle}>
            {subtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity style={baseStyles.successButton} onPress={onClose} activeOpacity={0.8}>
            <Typography variant='body1' style={baseStyles.successButtonText}>
              Great!
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};
