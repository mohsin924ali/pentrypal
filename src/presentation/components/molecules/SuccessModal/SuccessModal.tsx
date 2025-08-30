// ========================================
// Professional Success Modal Component
// ========================================

import React, { type FC } from 'react';
import { Dimensions, Modal, Platform, TouchableOpacity, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { Typography } from '../../atoms/Typography/Typography';
import { Button } from '../../atoms/Button/Button';
import { useTheme } from '../../../providers/ThemeProvider';
import type { ButtonImageIcon } from '../../../../shared/types/ui';

// ========================================
// Component Props Interface
// ========================================

export interface SuccessModalProps {
  readonly visible: boolean;
  readonly title: string;
  readonly message: string;
  readonly primaryButtonText?: string;
  readonly primaryButtonIcon?: ButtonImageIcon;
  readonly secondaryButtonText?: string;
  readonly secondaryButtonIcon?: ButtonImageIcon;
  readonly onPrimaryPress: () => void;
  readonly onSecondaryPress?: () => void;
  readonly onDismiss?: () => void;
  readonly showCloseButton?: boolean;
  readonly testID?: string;
}

// ========================================
// Success Modal Component
// ========================================

export const SuccessModal: FC<SuccessModalProps> = ({
  visible,
  title,
  message,
  primaryButtonText = 'OK',
  primaryButtonIcon,
  secondaryButtonText,
  secondaryButtonIcon,
  onPrimaryPress,
  onSecondaryPress,
  onDismiss,
  showCloseButton = true,
  testID = 'success-modal',
}) => {
  const { theme } = useTheme();
  const screenHeight = Dimensions.get('window').height;

  // ========================================
  // Handlers
  // ========================================

  const handleBackdropPress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleClosePress = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  // ========================================
  // Render
  // ========================================

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='fade'
      statusBarTranslucent={Platform.OS === 'android'}
      onRequestClose={handleBackdropPress}
      testID={testID}>
      {/* Backdrop */}
      <TouchableOpacity
        style={[
          styles.backdrop,
          {
            backgroundColor: `${theme.colors.neutral[900]}80`, // 50% opacity
          },
        ]}
        activeOpacity={1}
        onPress={handleBackdropPress}>
        {/* Modal Container */}
        <View style={styles.modalContainer as any}>
          <TouchableOpacity
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.colors.surface.background,
                borderColor: theme.colors.border.primary,
                shadowColor: theme.colors.neutral[900],
                maxHeight: screenHeight * 0.8,
              },
            ]}
            activeOpacity={1}
            onPress={e => e.stopPropagation()}>
            {/* Close Button */}
            {showCloseButton && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  {
                    backgroundColor: (theme.colors.surface as any).secondary,
                  },
                ]}
                onPress={handleClosePress}
                testID={`${testID}-close-button`}>
                <Typography
                  variant='h6'
                  color={theme.colors.text.secondary}
                  style={styles.closeIcon}>
                  ✕
                </Typography>
              </TouchableOpacity>
            )}

            {/* Success Animation */}
            <View style={styles.animationContainer as any}>
              <LottieView
                source={require('../../../../assets/animations/Success.json')}
                autoPlay
                loop={false}
                style={styles.animation}
              />
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title */}
              <Typography
                variant='h4'
                color={theme.colors.text.primary}
                align='center'
                weight='bold'
                style={styles.title}>
                {title}
              </Typography>

              {/* Message */}
              <Typography
                variant='body1'
                color={theme.colors.text.secondary}
                align='center'
                style={styles.message}>
                {message}
              </Typography>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {/* Buttons Container */}
              <View style={styles.buttonsContainer}>
                {/* Secondary Button */}
                {secondaryButtonText && onSecondaryPress && (
                  <Button
                    {...({
                      title: secondaryButtonText,
                      variant: 'outline',
                      size: 'md',
                      leftIcon: secondaryButtonIcon,
                      onPress: onSecondaryPress,
                      style: styles.button,
                      testID: `${testID}-secondary-button`,
                    } as any)}
                  />
                )}

                {/* Primary Button */}
                <Button
                  {...({
                    title: primaryButtonText,
                    variant: 'primary',
                    size: 'md',
                    leftIcon: primaryButtonIcon,
                    onPress: onPrimaryPress,
                    style: styles.button,
                    testID: `${testID}-primary-button`,
                  } as any)}
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const styles = {
  backdrop: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 28,
    paddingHorizontal: 24,
    position: 'relative' as const,
    // Shadow for iOS
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    // Elevation for Android
    elevation: 16,
  },
  closeButton: {
    position: 'absolute' as const,
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 1,
  },
  closeIcon: {
    fontSize: 14,
    lineHeight: 14,
  },
  animationContainer: {
    alignItems: 'center' as const,
    marginBottom: 20,
    height: 200,
    width: '100%',
  },
  animation: {
    width: 200,
    height: 200,
  },
  content: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 12,
  },
  message: {
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  actions: {
    alignItems: 'center' as const,
  },
  buttonsContainer: {
    flexDirection: 'row' as const,
    gap: 12,
    justifyContent: 'center' as const,
    flexWrap: 'wrap' as const,
  },
  button: {
    minWidth: 120,
    paddingHorizontal: 24,
  },
};
