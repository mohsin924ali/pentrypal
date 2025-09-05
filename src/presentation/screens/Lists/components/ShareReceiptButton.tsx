// ========================================
// Share Receipt Button Component
// ========================================

import React from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';

interface ShareReceiptButtonProps {
  onPress: () => void;
  isGenerating: boolean;
  isSharing: boolean;
  disabled?: boolean;
}

export const ShareReceiptButton: React.FC<ShareReceiptButtonProps> = ({
  onPress,
  isGenerating,
  isSharing,
  disabled = false,
}) => {
  const { theme } = useTheme();

  const isLoading = isGenerating || isSharing;
  const isDisabled = disabled || isLoading;

  const getButtonText = () => {
    if (isGenerating) return 'Generating Receipt...';
    if (isSharing) return 'Sharing...';
    return 'Share Receipt';
  };

  const getButtonIcon = () => {
    if (isLoading) return null;
    return '📤';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDisabled ? '#E5E7EB' : theme.colors.primary[500],
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        minWidth: 140,
        opacity: isDisabled ? 0.6 : 1,
      }}
      activeOpacity={0.7}>
      {isLoading ? (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ActivityIndicator
            size='small'
            color={theme.colors.text.onPrimary}
            style={{ marginRight: 8 }}
          />
          <Typography
            variant='body2'
            style={{
              color: theme.colors.text.onPrimary,
              fontWeight: '600',
            }}>
            {getButtonText()}
          </Typography>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {getButtonIcon() && (
            <Typography variant='body1' style={{ marginRight: 8, fontSize: 16 }}>
              {getButtonIcon()}
            </Typography>
          )}
          <Typography
            variant='body2'
            style={{
              color: isDisabled ? '#9CA3AF' : theme.colors.text.onPrimary,
              fontWeight: '600',
            }}>
            {getButtonText()}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};
