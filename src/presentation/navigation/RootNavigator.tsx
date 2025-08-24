// ========================================
// Root Navigator - Main navigation structure
// ========================================

import React, { useEffect, useState, type FC } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Screens and Navigators
import { OnboardingContainer } from '../screens/Onboarding/OnboardingContainer';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

// Components
import { LoadingScreen } from '../components/atoms/LoadingScreen/LoadingScreen';

// Store
import type { RootState } from '../../application/store';

// Types
import type { RootStackParamList } from '../../shared/types/navigation';

// Create stack navigator
const Stack = createStackNavigator<RootStackParamList>();

/**
 * Root Navigator Component
 *
 * Main navigation structure that handles:
 * - App initialization
 * - Onboarding flow
 * - Authentication flow
 * - Authenticated app navigation
 */
export const RootNavigator: FC = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Log authentication state changes
  useEffect(() => {
    console.log(
      `🔐 Auth state changed: isAuthenticated=${isAuthenticated}, hasSeenOnboarding=${hasSeenOnboarding}`
    );
  }, [isAuthenticated, hasSeenOnboarding]);

  // Simulate app initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user has seen onboarding
        // const onboardingSeen = await AsyncStorage.getItem('@onboarding_seen');
        // setHasSeenOnboarding(!!onboardingSeen);

        // For demo purposes, assume onboarding not seen
        setHasSeenOnboarding(false);

        // Additional initialization tasks...
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsAppReady(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  // Show loading screen during initialization
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  // Determine initial route
  const getInitialRouteName = (): keyof RootStackParamList => {
    if (!hasSeenOnboarding) {
      return 'Onboarding';
    }

    if (!isAuthenticated) {
      return 'Auth';
    }

    return 'Main';
  };

  // Handle onboarding completion
  const handleOnboardingComplete = async () => {
    console.log('Handling onboarding completion...');
    // await AsyncStorage.setItem('@onboarding_seen', 'true');
    setHasSeenOnboarding(true);
    // Navigation will happen automatically due to state change
    console.log('Onboarding completed - state updated, navigation will follow');
  };

  // Handle authentication success
  const handleAuthSuccess = () => {
    // Navigation will be handled by state change automatically
    console.log('Authentication successful, isAuthenticated will trigger navigation');
  };

  // Determine what screens to show based on current state
  const renderNavigator = () => {
    if (!hasSeenOnboarding) {
      return (
        <Stack.Screen name='Onboarding'>
          {props => (
            <OnboardingContainer
              {...props}
              onComplete={handleOnboardingComplete}
              onSkip={handleOnboardingComplete}
            />
          )}
        </Stack.Screen>
      );
    }

    if (!isAuthenticated) {
      return (
        <Stack.Screen name='Auth'>
          {props => <AuthNavigator {...props} onAuthSuccess={handleAuthSuccess} />}
        </Stack.Screen>
      );
    }

    return <Stack.Screen name='Main' component={MainNavigator} />;
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animationEnabled: true,
        }}>
        {renderNavigator()}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
