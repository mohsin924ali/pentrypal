// ========================================
// Onboarding Screens - Export Module
// ========================================

export { OnboardingScreen } from './OnboardingScreen';
export { OnboardingContainer } from './OnboardingContainer';
export type { OnboardingScreenProps } from './OnboardingScreen';

// Re-export any onboarding-related types
export interface OnboardingSlide {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly image: any;
}

export interface OnboardingFlow {
  readonly slides: OnboardingSlide[];
  readonly currentSlide: number;
  readonly isComplete: boolean;
}
