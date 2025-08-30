// ========================================
// List Creation Success Animation Component
// ========================================

import React, { type FC, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Modal, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { useTheme } from '../../../providers/ThemeProvider';

// ========================================
// Component Props Interface
// ========================================

export interface ListCreationSuccessAnimationProps {
  readonly visible: boolean;
  readonly onAnimationComplete?: () => void;
  readonly testID?: string;
}

// ========================================
// Animation Stages Enum
// ========================================

enum AnimationStage {
  HIDDEN = 'hidden',
  BASKET = 'basket',
  SUCCESS = 'success',
  HIDING = 'hiding',
}

// ========================================
// List Creation Success Animation Component
// ========================================

export const ListCreationSuccessAnimation: FC<ListCreationSuccessAnimationProps> = ({
  visible,
  onAnimationComplete,
  testID = 'list-creation-success-animation',
}) => {
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [stage, setStage] = useState<AnimationStage>(AnimationStage.HIDDEN);

  // Refs for Lottie animations
  const basketAnimationRef = useRef<LottieView>(null);
  const successAnimationRef = useRef<LottieView>(null);

  // ========================================
  // Animation Effects
  // ========================================

  useEffect(() => {
    if (visible) {
      console.log('🎬 Starting list creation animation sequence...');

      // Stage 1: Show and animate in
      setStage(AnimationStage.BASKET);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Stage 1 complete: Start basket animation
        basketAnimationRef.current?.play();
      });

      // Stage 2: Switch to success animation after 1.8 seconds
      const basketTimer = setTimeout(() => {
        console.log('🎬 Switching to success animation...');
        setStage(AnimationStage.SUCCESS);

        // Small scale animation for transition
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start(() => {
          successAnimationRef.current?.play();
        });
      }, 1800); // 1.8 seconds for basket animation

      // Stage 3: Hide animation after total of 3.6 seconds
      const completeTimer = setTimeout(() => {
        console.log('🎬 Completing animation sequence...');
        handleAnimationComplete();
      }, 3600); // Total: 1.8s basket + 1.8s success

      return () => {
        clearTimeout(basketTimer);
        clearTimeout(completeTimer);
      };
    } else {
      // Reset animations
      setStage(AnimationStage.HIDDEN);
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
      return;
    }
  }, [visible, fadeAnim, scaleAnim]);

  // ========================================
  // Handlers
  // ========================================

  const handleAnimationComplete = () => {
    setStage(AnimationStage.HIDING);

    // Animate out
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 0.8,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStage(AnimationStage.HIDDEN);
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
  };

  // ========================================
  // Render Animation Based on Stage
  // ========================================

  const renderCurrentAnimation = () => {
    switch (stage) {
      case AnimationStage.BASKET:
        return (
          <LottieView
            ref={basketAnimationRef}
            source={require('../../../../assets/animations/Thanksgiving basket.json')}
            autoPlay={false}
            loop={false}
            style={styles.animation}
            testID={`${testID}-basket-lottie`}
          />
        );

      case AnimationStage.SUCCESS:
        return (
          <LottieView
            ref={successAnimationRef}
            source={require('../../../../assets/animations/Check Mark.json')}
            autoPlay={false}
            loop={false}
            style={styles.animation}
            testID={`${testID}-success-lottie`}
          />
        );

      default:
        return null;
    }
  };

  // ========================================
  // Render
  // ========================================

  if (stage === AnimationStage.HIDDEN) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType='none'
      statusBarTranslucent={true}
      onRequestClose={handleAnimationComplete}
      testID={testID}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            backgroundColor: theme?.colors?.neutral?.[900]
              ? `${theme.colors.neutral[900]}60`
              : 'rgba(0, 0, 0, 0.4)',
            opacity: fadeAnim,
          },
        ]}>
        {/* Animation Container */}
        <Animated.View
          style={[
            styles.animationContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}>
          {renderCurrentAnimation()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ========================================
// Styles
// ========================================

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const styles = {
  backdrop: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  animationContainer: {
    width: 250,
    height: 250,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  animation: {
    width: '100%',
    height: '100%',
  } as any,
};
