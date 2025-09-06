// ========================================
// Biometric Login Button Component
// ========================================

import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { baseStyles, createDynamicStyles, createThemedStyles } from '../LoginScreen.styles';

interface BiometricLoginButtonProps {
  onPress: () => void;
  disabled?: boolean;
  biometricType: string | null;
  testID?: string;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  onPress,
  disabled = false,
  biometricType,
  testID = 'biometric-login-icon-button',
}) => {
  const { theme } = useTheme();

  const themedStyles = createThemedStyles(theme);
  const dynamicStyles = createDynamicStyles({ isLoading: disabled });

  return (
    <View style={{ marginLeft: 12 }}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          baseStyles.biometricIconButton,
          themedStyles.biometricIconButtonThemed,
          dynamicStyles.biometricIconDisabled,
        ]}
        testID={testID}
        accessibilityLabel={`${biometricType} login`}
        accessibilityHint={`Use ${biometricType} to sign in quickly`}>
        <View style={baseStyles.biometricIcon}>
          <Image
            source={require('../../../../assets/images/Fingerprint.png')}
            style={[baseStyles.fingerprintImage, themedStyles.fingerprintImageThemed]}
            resizeMode='contain'
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};
