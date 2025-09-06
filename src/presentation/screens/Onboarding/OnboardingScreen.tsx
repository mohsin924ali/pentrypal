// ========================================
// Onboarding Screen - App Introduction Flow
// ========================================

import React, { type FC, useRef, useState } from 'react';
import { Animated, Dimensions, Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  type PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';
import { useTheme } from '../../providers/ThemeProvider';

// Types
interface OnboardingSlide {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly image: any; // Will be replaced with actual images
}

export interface OnboardingScreenProps {
  readonly onComplete: () => void;
  readonly onSkip: () => void;
}

/**
 * Onboarding Screen Component
 *
 * Beautiful onboarding flow with:
 * - 4 feature introduction slides
 * - Smooth animations and transitions
 * - Progress indicator
 * - Swipe gesture support
 * - Accessibility support
 */
export const OnboardingScreen: FC<OnboardingScreenProps> = ({ onComplete, onSkip }) => {
  const { theme } = useTheme();
  const { width: screenWidth } = Dimensions.get('window');

  // State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation refs
  const scrollX = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const slideTransform = useRef(new Animated.Value(0)).current;

  // Onboarding slides data
  const slides: OnboardingSlide[] = [
    {
      id: 'create-lists',
      title: 'Create Shopping Lists',
      description:
        'Collaborate with friends and family on shared shopping lists. Never forget an item again!',
      image: require('../../../assets/images/onboarding-1.png'),
    },
    {
      id: 'share-assign',
      title: 'Share & Assign with Friends/Family',
      description:
        'Collaborate on shopping lists and assign items to different members of your household.',
      image: require('../../../assets/images/onboarding-2.png'),
    },
    {
      id: 'track-spending',
      title: 'Track Spending & Pantry',
      description:
        'Keep tabs on your grocery expenses and manage your pantry inventory effortlessly.',
      image: require('../../../assets/images/onboarding-3.png'),
    },
    {
      id: 'shop-together',
      title: 'Shop smarter, together',
      description: 'Plan meals, share lists, and track pantry items with ease.',
      image: require('../../../assets/images/onboarding-4.png'),
    },
  ];

  // Handle slide change with animation
  const goToSlide = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= slides.length) return;

      setCurrentSlide(index);

      // Animate scroll position
      Animated.timing(scrollX, {
        toValue: index * screenWidth,
        duration: theme.animations.durations.normal,
        useNativeDriver: false,
      }).start();

      // Animate progress
      Animated.timing(progressAnimation, {
        toValue: index,
        duration: theme.animations.durations.normal,
        useNativeDriver: false,
      }).start();

      // Animate slide transform
      Animated.timing(slideTransform, {
        toValue: -index * screenWidth,
        duration: theme.animations.durations.normal,
        useNativeDriver: true,
      }).start();

      // Removed slide-in animation to prevent text shivering
    },
    [
      slides.length,
      screenWidth,
      scrollX,
      progressAnimation,
      slideAnimation,
      slideTransform,
      theme.animations.durations.normal,
    ]
  );

  // Handle next button
  const handleNext = React.useCallback(() => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  }, [currentSlide, slides.length, goToSlide, onComplete]);

  // Handle previous button
  const handlePrevious = React.useCallback(() => {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1);
    }
  }, [currentSlide, goToSlide]);

  // Handle swipe gesture
  const onPanGestureEvent = Animated.event([{ nativeEvent: { translationX: scrollX } }], {
    useNativeDriver: false,
  });

  const onPanHandlerStateChange = React.useCallback(
    (event: PanGestureHandlerStateChangeEvent) => {
      if (event.nativeEvent.state === State.END) {
        const { translationX, velocityX } = event.nativeEvent;
        const threshold = screenWidth * 0.3;

        if (translationX < -threshold || velocityX < -500) {
          // Swipe left - next slide
          handleNext();
        } else if (translationX > threshold || velocityX > 500) {
          // Swipe right - previous slide
          handlePrevious();
        } else {
          // Snap back to current slide
          Animated.spring(slideTransform, {
            toValue: -currentSlide * screenWidth,
            useNativeDriver: true,
          }).start();
        }
      }
    },
    [screenWidth, handleNext, handlePrevious, slideTransform, currentSlide]
  );

  // Progress indicator dots
  const renderProgressDots = () => {
    return (
      <View style={styles.progressContainer}>
        {slides.map((_, index) => {
          const dotOpacity = progressAnimation.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          const dotScale = progressAnimation.interpolate({
            inputRange: [index - 1, index, index + 1],
            outputRange: [0.8, 1.2, 0.8],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: theme.colors.primary[500],
                  opacity: dotOpacity,
                  transform: [{ scale: dotScale }],
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // Render slide content
  const renderSlideContent = (slide: OnboardingSlide, index: number) => {
    const isActive = index === currentSlide;

    return (
      <Animated.View
        key={slide.id}
        style={
          [
            styles.slideContainer,
            {
              width: screenWidth,
              // Removed translateY animation to prevent text shivering
            },
          ] as any
        }>
        {/* Image */}
        <Animated.View style={styles.imageContainer}>
          {slide.image ? (
            <Image source={slide.image} style={styles.slideImage} resizeMode='contain' />
          ) : (
            <View
              style={[
                styles.slideImage,
                {
                  backgroundColor: theme.colors.primary[100],
                  borderRadius: theme.borders.radius.lg,
                  justifyContent: 'center',
                  alignItems: 'center',
                },
              ]}>
              <Typography variant='h1' style={{ fontSize: 64 }}>
                {slide.id === 'create-lists'
                  ? '📝'
                  : slide.id === 'share-assign'
                    ? '👥'
                    : slide.id === 'track-spending'
                      ? '📊'
                      : '🛒'}
              </Typography>
            </View>
          )}
        </Animated.View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Typography
            variant='h2'
            color={theme.colors.text.primary}
            align='center'
            style={{
              marginBottom: theme.spacing.lg,
              fontSize: 28,
              fontWeight: '700',
              textAlign: 'center',
            }}>
            {slide.title}
          </Typography>

          <Typography
            variant='body1'
            color={theme.colors.text.secondary}
            align='center'
            style={{
              lineHeight: 26,
              fontSize: 16,
              textAlign: 'center',
              maxWidth: 320,
            }}>
            {slide.description}
          </Typography>
        </View>
      </Animated.View>
    );
  };

  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <GradientBackground>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaView style={styles.container}>
          {/* Skip Button */}
          <View style={styles.header}>
            <Button
              title='Skip'
              variant='ghost'
              size='sm'
              onPress={onSkip}
              style={{ alignSelf: 'flex-end' }}
            />
          </View>

          {/* Progress Indicator */}
          {renderProgressDots()}

          {/* Slides Container */}
          <PanGestureHandler
            onGestureEvent={onPanGestureEvent}
            onHandlerStateChange={onPanHandlerStateChange}>
            <Animated.View style={styles.slidesContainer}>
              <Animated.View
                style={[
                  styles.slidesWrapper,
                  {
                    flexDirection: 'row',
                    transform: [
                      {
                        translateX: slideTransform,
                      },
                    ],
                  },
                ]}>
                {slides.map((slide, index) => renderSlideContent(slide, index))}
              </Animated.View>
            </Animated.View>
          </PanGestureHandler>

          {/* Navigation Buttons */}
          <View style={styles.footer}>
            {isLastSlide ? (
              <Button
                title='Get Started'
                variant='primary'
                size='lg'
                fullWidth
                onPress={onComplete}
                style={{ marginBottom: theme.spacing.md }}
              />
            ) : (
              <View style={styles.navigationButtons}>
                <Button
                  title='Previous'
                  variant='outline'
                  size='md'
                  onPress={handlePrevious}
                  disabled={currentSlide === 0}
                  style={{ flex: 1, marginRight: theme.spacing.sm }}
                />

                <Button
                  title={isLastSlide ? 'Get Started' : 'Next'}
                  variant='primary'
                  size='md'
                  onPress={handleNext}
                  style={{ flex: 1, marginLeft: theme.spacing.sm }}
                />
              </View>
            )}
          </View>
        </SafeAreaView>
      </GestureHandlerRootView>
    </GradientBackground>
  );
};

// Styles
const styles = {
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  progressContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingVertical: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  slidesContainer: {
    flex: 1,
    overflow: 'hidden' as const,
  },
  slidesWrapper: {
    flex: 1,
  },
  slideContainer: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    height: '100%',
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  slideImage: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },
  textContent: {
    flex: 0.4,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  navigationButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
};
