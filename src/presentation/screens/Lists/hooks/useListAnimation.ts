// ========================================
// List Animation Hook - Success/Error Modals
// ========================================

import { useCallback, useState } from 'react';
import { Animated } from 'react-native';

interface UseListAnimationReturn {
  // Success Modal
  showSuccessModal: boolean;
  successMessage: string;
  successSubtitle: string;
  successFadeAnim: Animated.Value;
  successScaleAnim: Animated.Value;
  showSuccessModalWithAnimation: (message: string, subtitle: string) => void;
  hideSuccessModalWithAnimation: () => void;

  // Error Modal
  showErrorModal: boolean;
  errorMessage: string;
  errorSubtitle: string;
  errorFadeAnim: Animated.Value;
  errorScaleAnim: Animated.Value;
  showErrorModalWithAnimation: (message: string, subtitle: string) => void;
  hideErrorModalWithAnimation: () => void;
}

export const useListAnimation = (): UseListAnimationReturn => {
  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successSubtitle, setSuccessSubtitle] = useState('');
  const [successFadeAnim] = useState(new Animated.Value(0));
  const [successScaleAnim] = useState(new Animated.Value(0.3));

  // Error modal state
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorSubtitle, setErrorSubtitle] = useState('');
  const [errorFadeAnim] = useState(new Animated.Value(0));
  const [errorScaleAnim] = useState(new Animated.Value(0.3));

  // Success modal animation functions
  const showSuccessModalWithAnimation = useCallback(
    (message: string, subtitle: string) => {
      setSuccessMessage(message);
      setSuccessSubtitle(subtitle);
      setShowSuccessModal(true);

      Animated.parallel([
        Animated.timing(successFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(successScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [successFadeAnim, successScaleAnim]
  );

  const hideSuccessModalWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(successFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(successScaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSuccessModal(false);
      setSuccessMessage('');
      setSuccessSubtitle('');
    });
  }, [successFadeAnim, successScaleAnim]);

  // Error modal animation functions
  const showErrorModalWithAnimation = useCallback(
    (message: string, subtitle: string) => {
      setErrorMessage(message);
      setErrorSubtitle(subtitle);
      setShowErrorModal(true);

      Animated.parallel([
        Animated.timing(errorFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(errorScaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [errorFadeAnim, errorScaleAnim]
  );

  const hideErrorModalWithAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(errorFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(errorScaleAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowErrorModal(false);
      setErrorMessage('');
      setErrorSubtitle('');
    });
  }, [errorFadeAnim, errorScaleAnim]);

  return {
    // Success Modal
    showSuccessModal,
    successMessage,
    successSubtitle,
    successFadeAnim,
    successScaleAnim,
    showSuccessModalWithAnimation,
    hideSuccessModalWithAnimation,

    // Error Modal
    showErrorModal,
    errorMessage,
    errorSubtitle,
    errorFadeAnim,
    errorScaleAnim,
    showErrorModalWithAnimation,
    hideErrorModalWithAnimation,
  };
};
