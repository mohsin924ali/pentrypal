// ========================================
// Onboarding Container - Business Logic Container
// ========================================

import React, { type FC } from 'react';
import { OnboardingScreen } from './OnboardingScreen';

// Props interface
interface OnboardingContainerProps {
  readonly onComplete: () => void;
  readonly onSkip: () => void;
}

/**
 * Onboarding Container Component
 *
 * Handles the business logic for onboarding flow
 * Acts as a bridge between the presentation layer and application logic
 */
export const OnboardingContainer: FC<OnboardingContainerProps> = ({ onComplete, onSkip }) => {
  // Handle onboarding completion
  const handleComplete = React.useCallback(() => {
    console.log('Onboarding completed - navigating to auth');
    onComplete();
  }, [onComplete]);

  // Handle onboarding skip
  const handleSkip = React.useCallback(() => {
    console.log('Onboarding skipped - navigating to auth');
    onSkip();
  }, [onSkip]);

  return <OnboardingScreen onComplete={handleComplete} onSkip={handleSkip} />;
};
