// ========================================
// Smart Share Receipt Button Component - Enhanced PDF/Image Support
// ========================================

import React from 'react';
import { ActivityIndicator, Alert, TouchableOpacity, View } from 'react-native';
import { Typography } from '../../../components/atoms/Typography/Typography';
import { useTheme } from '../../../providers/ThemeProvider';
import type { ShoppingList } from '../../../../shared/types/lists';
import { SmartReceiptSharingService } from '../services/smartReceiptSharingService';

interface SmartShareReceiptButtonProps {
  list: ShoppingList | null;
  onPress: () => void;
  onPdfPress?: () => void;
  onImagePress?: () => void;
  onShowOptions?: () => void;
  isGenerating: boolean;
  isSharing: boolean;
  disabled?: boolean;
  showMethodHint?: boolean;
  showAdvancedOptions?: boolean;
}

export const SmartShareReceiptButton: React.FC<SmartShareReceiptButtonProps> = ({
  list,
  onPress,
  onPdfPress,
  onImagePress,
  onShowOptions,
  isGenerating,
  isSharing,
  disabled = false,
  showMethodHint = true,
  showAdvancedOptions = false,
}) => {
  const { theme } = useTheme();

  // Analyze sharing method
  const analysis = list ? SmartReceiptSharingService.analyzeSharing(list) : null;

  const isLoading = isGenerating || isSharing;
  const isDisabled = disabled || isLoading || !list;

  const getButtonText = () => {
    if (isGenerating) return 'Generating PDF...';
    if (isSharing) return 'Sharing PDF...';
    return 'Share as PDF';
  };

  const getButtonIcon = () => {
    if (isLoading) return null;
    return '📄';
  };

  const getMethodHint = () => {
    if (!analysis || !showMethodHint) return null;

    return analysis.reason;
  };

  const showSharingInfo = () => {
    if (!list || !analysis) return;

    const recommendations = SmartReceiptSharingService.getRecommendations(list);

    Alert.alert(
      'PDF Receipt Info',
      `${analysis.reason}\n\nPDF Benefits:\n${recommendations.benefits
        .slice(0, 4)
        .map(b => `• ${b}`)
        .join('\n')}`,
      [
        { text: 'Share PDF', onPress, style: 'default' },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleLongPress = () => {
    if (showAdvancedOptions) {
      showSharingInfo();
    } else if (onShowOptions) {
      onShowOptions();
    }
  };

  return (
    <View>
      {/* Main Share Button */}
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        disabled={isDisabled}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDisabled ? theme.colors.neutral[200] : theme.colors.semantic.info[600],
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderRadius: theme.borders.radius.lg,
          minWidth: 160,
          ...theme.shadows.sm,
        }}
        activeOpacity={0.7}>
        {isLoading ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator
              size='small'
              color={theme.colors.text.onPrimary}
              style={{ marginRight: theme.spacing.xs }}
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
              <Typography
                variant='body1'
                style={{
                  marginRight: theme.spacing.xs,
                  fontSize: 16,
                }}>
                {getButtonIcon()}
              </Typography>
            )}
            <Typography
              variant='body2'
              style={{
                color: isDisabled ? theme.colors.text.disabled : theme.colors.text.onPrimary,
                fontWeight: '600',
              }}>
              {getButtonText()}
            </Typography>
          </View>
        )}
      </TouchableOpacity>

      {/* Method Hint */}
      {showMethodHint && getMethodHint() && !isLoading && (
        <Typography
          variant='caption'
          style={{
            color: theme.colors.text.tertiary,
            fontSize: 11,
            textAlign: 'center',
            marginTop: theme.spacing.xs / 2,
            paddingHorizontal: theme.spacing.sm,
          }}>
          💡 {getMethodHint()}
        </Typography>
      )}

      {/* PDF Info */}
      {showAdvancedOptions && !isLoading && list && analysis && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
            gap: theme.spacing.sm,
          }}>
          {/* PDF Badge */}
          <View
            style={{
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs / 2,
              borderRadius: theme.borders.radius.md,
              borderWidth: 1,
              borderColor: theme.colors.semantic.info[300],
              backgroundColor: theme.colors.semantic.info[50],
            }}>
            <Typography
              variant='caption'
              style={{
                color: theme.colors.semantic.info[700],
                fontSize: 10,
                fontWeight: '600',
              }}>
              📄 PDF Format
            </Typography>
          </View>

          {/* Info Button */}
          <TouchableOpacity
            onPress={showSharingInfo}
            style={{
              paddingHorizontal: theme.spacing.xs,
              paddingVertical: theme.spacing.xs / 2,
              borderRadius: theme.borders.radius.md,
            }}>
            <Typography
              variant='caption'
              style={{
                color: theme.colors.text.tertiary,
                fontSize: 12,
              }}>
              ℹ️
            </Typography>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
