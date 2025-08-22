/**
 * PentryPal Expo App
 * Beautiful onboarding flow
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LoginScreen, SignUpScreen } from './src/presentation/screens/Auth';
import { DashboardScreen } from './src/presentation/screens/Dashboard';
import { ListsScreen, CreateListScreen } from './src/presentation/screens/Lists';
import { SocialScreen } from './src/presentation/screens/Social';
import { ShopScreen } from './src/presentation/screens/Shop';
import { ProfileScreen } from './src/presentation/screens/Profile';
import { BottomNavigation } from './src/presentation/components/organisms';
import type { LoginData, SignUpData } from './src/presentation/screens/Auth';
import type { NavigationTab } from './src/presentation/components/organisms';
import ShoppingListService from './src/infrastructure/services/shoppingListService';
import AuthService from './src/infrastructure/services/authService';
import SocialService from './src/infrastructure/services/socialService';
import NotificationService from './src/infrastructure/services/notificationService';
import { ReduxProvider } from './src/application/providers/ReduxProvider';
import { useAppDispatch, useAppSelector } from './src/application/store/hooks';
import { 
  selectAllLists, 
  selectListsLoading, 
  setLists, 
  addList as addListAction,
  updateList
} from './src/application/store/slices/shoppingListsSlice';
import type { ShoppingList } from './src/application/store/slices/shoppingListsSlice';

type AppScreen = 'onboarding' | 'login' | 'signup' | 'dashboard' | 'lists' | 'create-list' | 'edit-list' | 'pantry' | 'shopping' | 'community' | 'profile';

// AppContent component that uses Redux
function AppContent() {
  const dispatch = useAppDispatch();
  const shoppingLists = useAppSelector(selectAllLists);
  const isLoadingLists = useAppSelector(selectListsLoading);
  
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('onboarding');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageScaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const titleSlideAnim = useRef(new Animated.Value(50)).current;
  const descriptionSlideAnim = useRef(new Animated.Value(50)).current;
  
  // Welcome modal animations
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const modalScaleAnim = useRef(new Animated.Value(0.8)).current;
  
  // Error modal animations
  const errorModalFadeAnim = useRef(new Animated.Value(0)).current;
  const errorModalScaleAnim = useRef(new Animated.Value(0.8)).current;

  const slides = [
    {
      title: 'Create Shopping Lists',
      description:
        'Collaborate with friends and family on shared shopping lists. Never forget an item again!',
      image: require('./assets/Intro-1-image.png'),
    },
    {
      title: 'Share & Assign with Friends/Family',
      description:
        'Collaborate on shopping lists and assign items to different members of your household.',
      image: require('./assets/Intro-2-image.png'),
    },
    {
      title: 'Track Spending & Pantry',
      description:
        'Keep tabs on your grocery expenses and manage your pantry inventory effortlessly.',
      image: require('./assets/Intro-3-image.png'),
    },
    {
      title: 'Shop smarter, together',
      description: 'Plan meals, share lists, and track pantry items with ease.',
      image: require('./assets/Intro-4-image.png'),
    },
  ];

  // Animation functions
  const animateSlideTransition = () => {
    // Fade out current content
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageScaleAnim, {
        toValue: 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Change slide and fade in new content
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(descriptionSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const animateProgressBar = () => {
    Animated.timing(progressAnim, {
      toValue: currentSlide,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const showWelcomeModalWithAnimation = () => {
    modalFadeAnim.setValue(0);
    modalScaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(modalScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideWelcomeModalWithAnimation = () => {
    Animated.parallel([
      Animated.timing(modalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(modalScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowWelcomeModal(false);
      setCurrentScreen('login'); // Navigate to login screen after modal closes
    });
  };

  const showErrorModalWithAnimation = () => {
    errorModalFadeAnim.setValue(0);
    errorModalScaleAnim.setValue(0.8);
    
    Animated.parallel([
      Animated.timing(errorModalFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(errorModalScaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideErrorModalWithAnimation = () => {
    Animated.parallel([
      Animated.timing(errorModalFadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(errorModalScaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowErrorModal(false);
    });
  };

  const handleNext = () => {
    // Reset text positions for animation
    titleSlideAnim.setValue(30);
    descriptionSlideAnim.setValue(30);

    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
      animateSlideTransition();
    } else {
      setCurrentSlide(0); // Reset to first slide
      animateSlideTransition();
    }
  };

  // Initial animation on mount
  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(imageScaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(descriptionSlideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    animateProgressBar();
  }, []);

  // Animate progress when slide changes
  useEffect(() => {
    animateProgressBar();
  }, [currentSlide]);

  useEffect(() => {
    if (showWelcomeModal) {
      console.log('Welcome modal useEffect triggered, starting animation...');
      showWelcomeModalWithAnimation();
    }
  }, [showWelcomeModal]);

  useEffect(() => {
    if (showErrorModal) {
      showErrorModalWithAnimation();
    }
  }, [showErrorModal]);

  // Load current user session on app start
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Refresh current user when returning from profile screen
  useEffect(() => {
    if (currentScreen === 'profile') {
      // Refresh current user data when entering profile screen
      loadCurrentUser();
    }
  }, [currentScreen]);

  const loadCurrentUser = async () => {
    try {
      const session = await AuthService.getCurrentSession();
      if (session?.user) {
        console.log('Loading current user:', session.user);
        setCurrentUser(session.user);
        
        // Sync user with services
        try {
          await SocialService.addUserFromAuth(session.user);
          await SocialService.setCurrentUser(session.user.id);
          NotificationService.setCurrentUser(session.user.id);
        } catch (error) {
          console.error('Error syncing existing user with services:', error);
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const refreshCurrentUser = async () => {
    console.log('Refreshing current user data...');
    await loadCurrentUser();
  };

  // Auth handlers
  const handleSignUp = async (data: SignUpData) => {
    console.log('Sign up data:', data);
    
    try {
      const result = await AuthService.register({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
        confirmPassword: data.password, // SignUp screen already validates password confirmation
      });
      
      if (result.success) {
        console.log(`Welcome ${data.firstName}! Account created successfully.`);
        console.log('Setting welcome modal to show...');
        setWelcomeUserName(data.firstName);
        setCurrentUser(result.user);
        
        // Sync user with services
        try {
          await SocialService.addUserFromAuth(result.user);
          await SocialService.setCurrentUser(result.user.id);
          NotificationService.setCurrentUser(result.user.id);
          // Send welcome notification
          NotificationService.notifyAccountCreated();
        } catch (error) {
          console.error('Error syncing user with services:', error);
        }
        
        setShowWelcomeModal(true);
        console.log('Welcome modal state set to true');
      } else {
        console.log('Sign up failed:', result.message);
        setErrorMessage(result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowErrorModal(true);
    }
  };

  const handleLogin = async (data: LoginData) => {
    console.log('Login data:', data);
    
    try {
      const result = await AuthService.login({
        email: data.email,
        password: data.password,
      });
      
      if (result.success) {
        console.log(`Welcome back! Logged in successfully as ${data.email}`);
        setCurrentUser(result.user);
        
        // Sync user with services
        try {
          await SocialService.addUserFromAuth(result.user);
          await SocialService.setCurrentUser(result.user.id);
          NotificationService.setCurrentUser(result.user.id);
        } catch (error) {
          console.error('Error syncing user with services:', error);
        }
        
        setCurrentScreen('dashboard');
      } else {
        console.log('Login failed:', result.message);
        setErrorMessage(result.message);
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('An unexpected error occurred');
      setShowErrorModal(true);
    }
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
    console.log('Forgot password functionality coming soon!');
  };

  // Navigation handlers
  const handleShowSignUp = () => {
    setCurrentScreen('signup');
  };

  const handleShowLogin = () => {
    setCurrentScreen('login');
  };

  const handleBackToOnboarding = () => {
    setCurrentScreen('onboarding');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleDashboardFilter = () => {
    console.log('Dashboard filter pressed');
    // TODO: Implement filter functionality
  };

  const handleLogout = async () => {
    console.log('Logging out...');
    try {
      await AuthService.logout();
      setCurrentUser(null);
      setCurrentScreen('onboarding');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate away even if logout fails
      setCurrentUser(null);
      setCurrentScreen('onboarding');
    }
  };

  const handleNavigationTabPress = (tab: NavigationTab) => {
    console.log(`Navigating to ${tab}`);
    setCurrentScreen(tab);
  };

  const handleAddList = () => {
    console.log('Add new list pressed');
    setCurrentScreen('create-list');
  };

  // Load lists when navigating to lists screen
  useEffect(() => {
    if (currentScreen === 'lists') {
      loadShoppingLists();
    }
  }, [currentScreen]);

  // Clear all shopping lists from Redux store
  const clearShoppingLists = () => {
    dispatch(setLists({}));
  };

  // Load all shopping lists
  const loadShoppingLists = async () => {
    try {
      // Only load from service if Redux state is empty (first time loading)
      const currentLists = Object.keys(shoppingLists).length;
      if (currentLists === 0) {
        // Load fresh data from service only if Redux is empty
        const lists = await ShoppingListService.getAllLists();
        // Convert array to object for Redux store
        const listsObject = lists.reduce((acc, list) => {
          acc[list.id] = list;
          return acc;
        }, {} as Record<string, ShoppingList>);
        
        dispatch(setLists(listsObject));
      }
      // If Redux already has data, keep it (don't clear it)
    } catch (error) {
      console.error('Error loading shopping lists:', error);
    }
  };

  // Create a new shopping list
  const handleCreateList = async (listName: string, selectedItems: any[]) => {
    try {
      console.log('Creating list:', listName, 'with items:', selectedItems);
      
      // REAL FIX: Pass current user info to fix the root cause
      const listData = {
        name: listName,
        items: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          icon: item.icon,
          category: item.category,
        })),
        ownerId: currentUser?.id || 'current_user_1',
        ownerName: currentUser?.name || 'Current User',
      };

      console.log('DEBUG: Creating list with owner info - ID:', listData.ownerId, 'Name:', listData.ownerName);
      const newList = await ShoppingListService.createList(listData);
      console.log('New list created:', newList);

      // Add the new list to Redux store
      dispatch(addListAction(newList));
      setCurrentScreen('lists');
    } catch (error) {
      console.error('Error creating list:', error);
    }
  };

  // Edit an existing shopping list
  const handleEditList = (list: ShoppingList) => {
    setEditingList(list);
    setCurrentScreen('edit-list');
  };

  // Update an existing shopping list
  const handleUpdateList = async (listName: string, selectedItems: any[]) => {
    try {
      if (!editingList) {
        console.error('No list is being edited');
        return;
      }
      
      console.log('Updating list:', editingList.id, 'with name:', listName, 'and items:', selectedItems);
      
      const updates = {
        name: listName,
        items: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          icon: item.icon,
          category: item.category,
          completed: false, // Reset completion status for edited items
        })),
      };

      const updatedList = await ShoppingListService.updateList(editingList.id, updates);
      console.log('List updated:', updatedList);

      if (updatedList) {
        // Update the list in Redux store using the correct action format
        dispatch(updateList({ 
          id: editingList.id, 
          updates: updatedList 
        }));
        setEditingList(null);
        setCurrentScreen('lists');
      } else {
        console.error('Failed to update list - list not found');
      }
    } catch (error) {
      console.error('Error updating list:', error);
    }
  };

  const currentSlideData = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  // Render modals globally (outside of screen-specific returns)
  const renderModals = () => (
    <>
      {/* Welcome Modal */}
      <Modal
        visible={showWelcomeModal}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={welcomeModalStyles.overlay}>
          <Animated.View
            style={[
              welcomeModalStyles.modalContainer,
              {
                opacity: modalFadeAnim,
                transform: [{ scale: modalScaleAnim }],
              },
            ]}
          >
            {/* Success Icon */}
            <View style={welcomeModalStyles.iconContainer}>
              <Text style={welcomeModalStyles.successIcon}>🎉</Text>
            </View>

            {/* Welcome Message */}
            <Text style={welcomeModalStyles.title}>Welcome to PantryPal!</Text>
            <Text style={welcomeModalStyles.subtitle}>
              Hi {welcomeUserName}! Your account has been created successfully.
            </Text>
            <Text style={welcomeModalStyles.description}>
              You're all set to start creating shopping lists, collaborating with friends, and managing your pantry effortlessly.
            </Text>

            {/* Action Button */}
            <TouchableOpacity
              style={welcomeModalStyles.continueButton}
              onPress={hideWelcomeModalWithAnimation}
              activeOpacity={0.8}
            >
              <Text style={welcomeModalStyles.continueButtonText}>Let's Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="none"
        statusBarTranslucent={true}
      >
        <View style={errorModalStyles.overlay}>
          <Animated.View
            style={[
              errorModalStyles.modalContainer,
              {
                opacity: errorModalFadeAnim,
                transform: [{ scale: errorModalScaleAnim }],
              },
            ]}
          >
            {/* Error Icon */}
            <View style={errorModalStyles.iconContainer}>
              <Text style={errorModalStyles.errorIcon}>⚠️</Text>
            </View>

            {/* Error Message */}
            <Text style={errorModalStyles.title}>Oops! Something went wrong</Text>
            <Text style={errorModalStyles.errorText}>{errorMessage}</Text>

            {/* Action Button */}
            <TouchableOpacity
              style={errorModalStyles.tryAgainButton}
              onPress={hideErrorModalWithAnimation}
              activeOpacity={0.8}
            >
              <Text style={errorModalStyles.tryAgainButtonText}>Try Again</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </>
  );

  // Render different screens based on current screen state
  if (currentScreen === 'login') {
    return (
      <SafeAreaProvider>
        <LoginScreen
          onLogin={handleLogin}
          onSignUpPress={handleShowSignUp}
          onForgotPasswordPress={handleForgotPassword}
          onBackPress={handleBackToOnboarding}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'signup') {
    return (
      <SafeAreaProvider>
        <SignUpScreen
          onSignUp={handleSignUp}
          onLoginPress={handleShowLogin}
          onBackPress={handleBackToOnboarding}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'dashboard') {
    return (
      <SafeAreaProvider>
        <DashboardScreen
          onFilterPress={handleDashboardFilter}
          onNavigationTabPress={handleNavigationTabPress}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'lists') {
    return (
      <SafeAreaProvider>
        <ListsScreen
          onAddListPress={handleAddList}
          onEditListPress={handleEditList}
          onNavigationTabPress={handleNavigationTabPress}
          shoppingLists={shoppingLists}
          isLoading={isLoadingLists}
          currentUser={currentUser}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'create-list') {
    return (
      <SafeAreaProvider>
        <CreateListScreen
          onBackPress={() => setCurrentScreen('lists')}
          onCreateList={handleCreateList}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'edit-list') {
    return (
      <SafeAreaProvider>
        <CreateListScreen
          onBackPress={() => {
            setEditingList(null);
            setCurrentScreen('lists');
          }}
          onCreateList={handleCreateList}
          onUpdateList={handleUpdateList}
          editMode={true}
          existingListName={editingList?.name || ''}
          existingItems={editingList?.items || []}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'community') {
    return (
      <SafeAreaProvider>
        <SocialScreen
          onBackPress={handleLogout}
          onNavigationTabPress={handleNavigationTabPress}
          currentUser={currentUser}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <SafeAreaProvider>
        <ProfileScreen
          onBackPress={handleLogout}
          onNavigationTabPress={handleNavigationTabPress}
          currentUser={currentUser}
          onUserUpdated={refreshCurrentUser}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  if (currentScreen === 'shopping') {
    return (
      <SafeAreaProvider>
        <ShopScreen
          onBackPress={handleLogout}
          onNavigationTabPress={handleNavigationTabPress}
          currentUser={currentUser}
          shoppingLists={shoppingLists}
        />
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  // Placeholder screen for pantry
  if (currentScreen === 'pantry') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="auto" />
          <Animated.View style={[styles.content, { opacity: 1 }]}>
            <Animated.Text style={[styles.title, { transform: [{ translateY: 0 }], opacity: 1 }]}>
              Pantry Screen
            </Animated.Text>
            <Animated.Text style={[styles.description, { transform: [{ translateY: 0 }], opacity: 1 }]}>
              Coming Soon! This pantry screen will be implemented in the future.
            </Animated.Text>
          </Animated.View>
          <Animated.View style={[styles.footer, { opacity: 1 }]}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={() => setCurrentScreen('dashboard')}
            >
              <Text style={styles.buttonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
        {renderModals()}
      </SafeAreaProvider>
    );
  }

  // Default onboarding screen
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {slides.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.progressDot,
                index === currentSlide && styles.progressDotActive,
                {
                  transform: [
                    {
                      scale: index === currentSlide ? 1.2 : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <Animated.Image
            source={currentSlideData.image}
            style={[
              styles.illustration,
              {
                transform: [{ scale: imageScaleAnim }],
              },
            ]}
            resizeMode="contain"
          />

          <Animated.Text
            style={[
              styles.title,
              {
                transform: [{ translateY: titleSlideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {currentSlideData.title}
          </Animated.Text>

          <Animated.Text
            style={[
              styles.description,
              {
                transform: [{ translateY: descriptionSlideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {currentSlideData.description}
          </Animated.Text>
        </Animated.View>

        {/* Footer */}
        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          {isLastSlide ? (
            <>
              <TouchableOpacity
                style={[styles.primaryButton, styles.buttonShadow]}
                onPress={handleShowSignUp}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryButton, styles.buttonShadow]}
                onPress={handleShowLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Log In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, styles.buttonShadow]}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {currentSlide === 0 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </SafeAreaView>
      {renderModals()}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressDotActive: {
    width: 24,
    backgroundColor: '#19e680',
    elevation: 4,
    shadowColor: '#19e680',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 320,
    height: 320,
    borderRadius: 24,
    marginBottom: 40,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 17,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#19e680',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#19e680',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  buttonShadow: {
    elevation: 6,
    shadowColor: '#19e680',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: '#19e680',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

const welcomeModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: Dimensions.get('window').width - 48,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#19e680',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  continueButton: {
    backgroundColor: '#19e680',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#19e680',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

const errorModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    maxWidth: Dimensions.get('window').width - 48,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  iconContainer: {
    marginBottom: 24,
  },
  errorIcon: {
    fontSize: 64,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 8,
    fontWeight: '500',
  },
  tryAgainButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tryAgainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#ffffff',
    margin: 24,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#19e680',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#19e680',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bioCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bioTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  bioText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#19e680',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    marginHorizontal: 24,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 100,
  },
});

// Main App component with Redux Provider
export default function App() {
  return (
    <ReduxProvider>
      <AppContent />
    </ReduxProvider>
  );
}
