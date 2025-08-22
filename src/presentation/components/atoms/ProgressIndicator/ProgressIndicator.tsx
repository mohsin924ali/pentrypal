/**
 * Progress Indicator Component
 * Dot-based progress indicator from Stitch designs
 */

import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Theme } from '@/shared/theme';

export interface ProgressIndicatorProps {
  totalSteps: number;
  currentStep: number;
  style?: ViewStyle;
  testID?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  totalSteps,
  currentStep,
  style,
  testID,
}) => {
  const getDotStyle = (index: number): ViewStyle => {
    const isActive = index === currentStep;

    return {
      height: Theme.designSpacing.progressDotSize,
      width: isActive
        ? Theme.designSpacing.progressDotActiveWidth
        : Theme.designSpacing.progressDotSize,
      borderRadius: Theme.borderRadius.full,
      backgroundColor: isActive
        ? Theme.colors.primary[500]
        : Theme.colors.neutral[300],
      marginHorizontal: Theme.spacing.xs / 2,
    };
  };

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={`Step ${currentStep + 1} of ${totalSteps}`}
      testID={testID}
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={getDotStyle(index)} />
      ))}
    </View>
  );
};
