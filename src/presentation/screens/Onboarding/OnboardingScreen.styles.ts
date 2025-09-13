// ========================================
// Onboarding Screen Styles
// ========================================

import { type ImageStyle, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { Theme } from '../../../shared/types/ui';

/**
 * Base styles that don't depend on theme
 */
export const baseStyles = StyleSheet.create({
  // Main Container
  container: {
    flex: 1,
  } as ViewStyle,

  // Header Section
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  } as ViewStyle,

  skipButtonContainer: {
    alignSelf: 'flex-end',
  } as ViewStyle,

  // Progress Indicator
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  } as ViewStyle,

  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  } as ViewStyle,

  // Slides Container
  slidesContainer: {
    flex: 1,
    overflow: 'hidden',
  } as ViewStyle,

  slidesWrapper: {
    flex: 1,
  } as ViewStyle,

  slideContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: '100%',
  } as ViewStyle,

  // Image Section
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  slideImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
  } as ImageStyle,

  fallbackImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  fallbackImageEmoji: {
    fontSize: 64,
  } as TextStyle,

  // Text Content Section
  textContent: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
  } as ViewStyle,

  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  } as TextStyle,

  slideDescription: {
    lineHeight: 26,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 320,
  } as TextStyle,

  // Footer Section
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  } as ViewStyle,

  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  getStartedButton: {
    // marginBottom will be set dynamically
  } as ViewStyle,

  previousButton: {
    flex: 1,
    // marginRight will be set dynamically
  } as ViewStyle,

  nextButton: {
    flex: 1,
    // marginLeft will be set dynamically
  } as ViewStyle,

  // Gesture Handler
  gestureHandlerRoot: {
    flex: 1,
  } as ViewStyle,
});

/**
 * Create themed styles using the provided theme
 */
export const createThemedStyles = (theme: Theme) =>
  StyleSheet.create({
    // Dynamic styles that depend on theme colors
  });

/**
 * Create dynamic styles for runtime calculations
 */
export const createDynamicStyles = (theme: Theme) => ({
  // Slide title with dynamic spacing
  slideTitleDynamic: (marginBottom: number) => ({
    marginBottom,
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center' as const,
  }),

  // Slide description with theme spacing
  slideDescriptionDynamic: () => ({
    lineHeight: 26,
    fontSize: 16,
    textAlign: 'center' as const,
    maxWidth: 320,
  }),

  // Get Started button with dynamic margin
  getStartedButtonDynamic: (marginBottom: number) => ({
    marginBottom,
  }),

  // Previous button with dynamic margin
  previousButtonDynamic: (marginRight: number) => ({
    flex: 1,
    marginRight,
  }),

  // Next button with dynamic margin
  nextButtonDynamic: (marginLeft: number) => ({
    flex: 1,
    marginLeft,
  }),

  // Fallback image container with theme colors
  fallbackImageContainerDynamic: (backgroundColor: string, borderRadius: number) => ({
    width: 280,
    height: 280,
    backgroundColor,
    borderRadius,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  }),

  // Slide container with dynamic width
  slideContainerDynamic: (width: number) => ({
    width,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    height: '100%' as const,
  }),

  // Progress dot with dynamic colors and animations
  progressDotDynamic: (backgroundColor: string, opacity: any, scale: any) => ({
    backgroundColor,
    opacity,
    transform: [{ scale }],
  }),

  // Slides wrapper with transform
  slidesWrapperDynamic: (translateX: any) => ({
    flexDirection: 'row' as const,
    transform: [{ translateX }],
  }),
});
