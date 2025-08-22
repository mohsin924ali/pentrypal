/**
 * Onboarding Screen
 * Main onboarding flow with slides based on Stitch designs
 */

import React, { useState, useCallback } from 'react';
import { View, ViewStyle } from 'react-native';
import { OnboardingSlide } from '@/presentation/components/organisms/OnboardingSlide';
import { Theme } from '@/shared/theme';

// Import placeholder images (using existing intro images)
const illustrations = {
  slide1: require('../../../assets/Intro-1-image.png'),
  slide2: require('../../../assets/Intro-2-image.png'),
  slide3: require('../../../assets/Intro-3-image.png'),
};

interface OnboardingScreenProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onSkip,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Create Shopping Lists',
      description:
        'Collaborate with friends and family on shared shopping lists. Never forget an item again!',
      illustration: illustrations.slide1,
      primaryButtonTitle: 'Get Started',
    },
    {
      title: 'Share & Assign with Friends/Family',
      description:
        'Collaborate on shopping lists and assign items to different members of your household.',
      illustration: illustrations.slide2,
      primaryButtonTitle: 'Next',
    },
    {
      title: 'Track Spending & Pantry',
      description:
        'Keep tabs on your grocery expenses and manage your pantry inventory effortlessly.',
      illustration: illustrations.slide3,
      primaryButtonTitle: 'Get Started',
    },
  ];

  const handleNext = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, slides.length, onComplete]);

  const handleSkip = useCallback(() => {
    onSkip();
  }, [onSkip]);

  const currentSlideData = slides[currentSlide];

  return (
    <View style={styles.container}>
      <OnboardingSlide
        title={currentSlideData.title}
        description={currentSlideData.description}
        illustration={currentSlideData.illustration}
        currentStep={currentSlide}
        totalSteps={slides.length}
        primaryButtonTitle={currentSlideData.primaryButtonTitle}
        showSkip={currentSlide < slides.length - 1}
        onPrimaryPress={handleNext}
        onSkipPress={handleSkip}
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,
};
