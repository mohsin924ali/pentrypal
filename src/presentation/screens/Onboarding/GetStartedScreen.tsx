/**
 * Get Started Screen
 * Complete onboarding flow with intro slides and auth options
 * Based on Stitch design specifications
 */

import React, { useState, useCallback } from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { ProgressIndicator } from '@/presentation/components/atoms/ProgressIndicator';

interface GetStartedScreenProps {
  onSignUp: () => void;
  onLogin: () => void;
  onSkip: () => void;
}

interface SlideData {
  title: string;
  description: string;
  illustration: string; // URL from design specs
  showButtons?: boolean;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({
  onSignUp,
  onLogin,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideData[] = [
    {
      title: 'Create Shopping Lists',
      description:
        'Collaborate with friends and family on shared shopping lists. Never forget an item again!',
      illustration:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBpbxZZ__gXeG37DQGGtsbGaQIEnObvhiMN8T5YnvpTIP1I_eDxt9avTJyFW8YuNYNEYPrXEwyXWprtgMtxY1Quq-oqbVUBt-6ERpFzj471VtiGft2dM47YMpFWtDRONVm5K55ZJ8cQACY3_KpsaJn7aHbrmM0wx5WMp5t1GSfvblhvzS4ira9CIVmp7bx1808H9ZGy8r2XzkEOjQBu4TG-0GPpuWt-nZjRZETy1t3q0yYRAKID6LCMJEbAwRa04pB0Zw3uyapsgg',
    },
    {
      title: 'Share & Assign with Friends/Family',
      description:
        'Collaborate on shopping lists and assign items to different members of your household.',
      illustration:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE1TzSzkGIjQt5B5U0bsprl4n8FLVvEnQy2yqzCXVpocL77YvHp-FxsDA7aCmiVTdrGDTtegPB7u-045ShW3gCtcG_RybyQBSVWfgX2eMFYdnqTcB7lqP4ZPP4wTDg07QhEqFgG-hOH-jgTdEitgsCj_27ubDN9aOQmuHq31dsmL2-FsEKl5_hgVqvwGOoUzb5IOQ9RlKz4_e9sS0Pd006dwZHegGYdilgwR7YaxZUV1ixLkV2dsKXOnM0WoShKbNrE2fjKDBPxg',
    },
    {
      title: 'Track Spending & Pantry',
      description:
        'Keep tabs on your grocery expenses and manage your pantry inventory effortlessly.',
      illustration:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB-5D1kfRyPk4KqcrBsUlLzGFpKC6SQfhhrP4dYZa42-Wx2jO9tXPqcIhr9qfn5U9Dbhzl5ZqzuKs4KOe4FBBAPACif9ID0LE2MPvuBoCbwyxFyU-hMFnGVZHfqFbHSpKW3SSEPi31PugZpBUsDHi6DZcg8uS7oYmSj0y3cu06vzuf_Rd9M3ks3-F_Z_r5SuFGJSMm37kgb09RmlmCNWosGN7pBw46Imq1XZBRPoFhnQVGr-GGfoJAo8HRxnmUZMRc-bnHDoLxJkg',
    },
    {
      title: 'Shop smarter, together',
      description: 'Plan meals, share lists, and track pantry items with ease.',
      illustration:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB7mCQdKp_ze9GJI2pQLLLX_iAcgW04Ccoo9FGPFkZgR8UmLE_Gf9unl6hC0CnZ14Gso2PFaBp_dkfWG_CQtXIXbfQbck66GPbL9Fq3JCI1FYYufZsv6KR8MG5N-HEqmbuTIsU2mZkZMxKhkAq4vJg_eRr7LWu4XzZvO8CQTzedFUmTkHMYEp0f6TurfBIbB_OGxd8OQeJmYdP13oVyShJm259CVNhAM6PlzP5-U7ajAtgo5q7yPpt5ssYl-pOT3zTXpbDjatJanw',
      showButtons: true,
    },
  ];

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  }, [currentSlide, slides.length]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Skip Button */}
      {!isLastSlide && (
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
          >
            <Typography variant="body" color={Theme.colors.text.secondary}>
              Skip
            </Typography>
          </TouchableOpacity>
        </View>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        {/* Progress Indicator - only show on first 3 slides */}
        {!isLastSlide && (
          <View style={styles.progressContainer}>
            <ProgressIndicator
              totalSteps={3}
              currentStep={currentSlide}
              style={styles.progressIndicator}
              testID="progress-indicator"
            />
          </View>
        )}

        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View
            style={[
              styles.illustration,
              { backgroundColor: Theme.colors.neutral[200] },
            ]}
            accessibilityRole="image"
            accessibilityLabel={`Illustration for ${currentSlideData.title}`}
            testID={`illustration-${currentSlide}`}
          />
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Typography
            variant="h1"
            color={Theme.colors.text.primary}
            align="center"
            style={styles.title}
          >
            {currentSlideData.title}
          </Typography>

          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            align="center"
            style={styles.description}
          >
            {currentSlideData.description}
          </Typography>
        </View>
      </View>

      {/* Footer with Buttons */}
      <View style={styles.footer}>
        {currentSlideData.showButtons ? (
          // Final slide with Sign Up and Log In buttons
          <View style={styles.authButtonContainer}>
            <Button
              title="Sign Up"
              variant="primary"
              size="large"
              fullWidth
              onPress={onSignUp}
              style={styles.signUpButton}
            />
            <Button
              title="Log In"
              variant="outline"
              size="large"
              fullWidth
              onPress={onLogin}
              style={styles.loginButton}
            />
          </View>
        ) : (
          // Navigation buttons for intro slides
          <Button
            title={currentSlide === 0 ? 'Get Started' : 'Next'}
            variant="primary"
            size="large"
            fullWidth
            onPress={handleNext}
            style={styles.nextButton}
          />
        )}
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

  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  progressIndicator: {
    // Additional styles if needed
  } as ViewStyle,

  illustrationContainer: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1,
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  illustration: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius['2xl'],
  } as ViewStyle,

  textContent: {
    width: '100%',
    maxWidth: 320,
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

  authButtonContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  } as ViewStyle,

  signUpButton: {
    marginBottom: Theme.spacing.base,
  } as ViewStyle,

  loginButton: {
    // No additional styles needed
  } as ViewStyle,

  nextButton: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
  } as ViewStyle,
};
