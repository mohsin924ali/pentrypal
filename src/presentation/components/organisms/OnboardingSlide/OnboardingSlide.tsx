/**
 * Onboarding Slide Component
 * Reusable slide component for onboarding screens
 */

import React from 'react';
import {
  View,
  Image,
  ImageSourcePropType,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { ProgressIndicator } from '@/presentation/components/atoms/ProgressIndicator';

export interface OnboardingSlideProps {
  title: string;
  description: string;
  illustration: ImageSourcePropType;
  currentStep: number;
  totalSteps: number;
  primaryButtonTitle?: string;
  secondaryButtonTitle?: string;
  showSkip?: boolean;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  onSkipPress?: () => void;
  style?: ViewStyle;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  illustration,
  currentStep,
  totalSteps,
  primaryButtonTitle,
  secondaryButtonTitle,
  showSkip = false,
  onPrimaryPress,
  onSecondaryPress,
  onSkipPress,
  style,
}) => {
  return (
    <SafeAreaView style={[styles.container, style]}>
      {/* Header with Skip Button */}
      {showSkip && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onSkipPress}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Typography variant="caption" color={Theme.colors.text.secondary}>
              Skip
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Progress Indicator */}
        <ProgressIndicator
          totalSteps={totalSteps}
          currentStep={currentStep}
          style={styles.progressIndicator}
        />

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={illustration}
            style={styles.illustration}
            resizeMode="cover"
            accessibilityRole="image"
            accessibilityLabel={`Illustration for ${title}`}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Typography
            variant="slideTitle"
            color={Theme.colors.text.primary}
            align="center"
            style={styles.title}
          >
            {title}
          </Typography>

          <Typography
            variant="slideDescription"
            color={Theme.colors.text.secondary}
            align="center"
            style={styles.description}
          >
            {description}
          </Typography>
        </View>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        <View style={styles.buttonContainer}>
          {primaryButtonTitle && (
            <Button
              title={primaryButtonTitle}
              variant="primary"
              size="large"
              fullWidth
              onPress={onPrimaryPress}
              style={styles.primaryButton}
            />
          )}

          {secondaryButtonTitle && (
            <Button
              title={secondaryButtonTitle}
              variant="outline"
              size="large"
              fullWidth
              onPress={onSecondaryPress}
              style={styles.secondaryButton}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  header: {
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingTop: Theme.spacing.base,
    alignItems: 'flex-end',
  } as ViewStyle,

  skipButton: {
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.base,
  } as ViewStyle,

  content: {
    flex: 1,
    paddingHorizontal: Theme.designSpacing.screenPadding,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  progressIndicator: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  illustrationContainer: {
    width: '100%',
    maxWidth: Theme.designSpacing.maxContentWidth,
    aspectRatio: Theme.designSpacing.illustrationAspectRatio,
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius['2xl'],
  } as ViewStyle,

  textContent: {
    width: '100%',
    maxWidth: Theme.designSpacing.maxContentWidth,
    alignItems: 'center',
  } as ViewStyle,

  title: {
    marginBottom: Theme.spacing.base,
  } as ViewStyle,

  description: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  footer: {
    paddingHorizontal: Theme.designSpacing.screenPadding,
    paddingBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  buttonContainer: {
    width: '100%',
    maxWidth: Theme.designSpacing.maxContentWidth,
    alignSelf: 'center',
  } as ViewStyle,

  primaryButton: {
    marginBottom: Theme.spacing.base,
  } as ViewStyle,

  secondaryButton: {
    // No additional styles needed
  } as ViewStyle,
};
