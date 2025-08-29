// ========================================
// Enhanced Lists Screen - Complete Implementation
// ========================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  Alert,
  Animated,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { AssignmentModal } from '../../components/molecules/AssignmentModal';
import { AddContributorModal } from '../../components/molecules/AddContributorModal';
import { ListCreationSuccessAnimation } from '../../components/molecules/ListCreationSuccessAnimation';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { shoppingLogger } from '../../../shared/utils/logger';

// Note: Using emoji icons instead of imports to avoid module resolution issues
// In production, these would be actual icon imports
const CreateListIcon = '📝';
const NotificationIcon = '🔔';
const ShareIcon = '📤';
import { DEFAULT_CURRENCY, formatCurrency } from '../../../shared/utils/currencyUtils';
import { getAvatarProps, getFallbackAvatar } from '../../../shared/utils/avatarUtils';

// Services
import NotificationService from '../../../infrastructure/services/notificationService';

// Redux
import type { AppDispatch } from '../../../application/store';
import {
  addCollaboratorToList,
  assignShoppingItem,
  loadShoppingLists,
  removeCollaboratorFromList,
  selectIsLoadingLists,
  selectShoppingListError,
  selectShoppingLists,
  unassignShoppingItem,
} from '../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../application/store/slices/authSlice';
import { loadFriends, selectFriends } from '../../../application/store/slices/socialSlice';

// Navigation
import type { ListsStackParamList } from '../../navigation/ListsStackNavigator';
import type { StackNavigationProp } from '@react-navigation/stack';

// Types
import type {
  AvatarType,
  CurrencyCode,
  EnhancedListsScreenProps,
  Notification,
  ShoppingItem,
  ShoppingList,
} from '../../../shared/types/lists';

type NavigationProp = StackNavigationProp<ListsStackParamList, 'ListsHome'>;

/**
 * Enhanced Lists Screen Component
 *
 * Complete shopping lists management with:
 * - Advanced collaboration features
 * - Item assignment system
 * - Notification center
 * - Avatar management
 * - Currency formatting
 * - Animated modals
 * - Real-time updates
 */
export const EnhancedListsScreen: React.FC<EnhancedListsScreenProps> = ({
  onAddListPress,
  onEditListPress,
  onNavigationTabPress: _onNavigationTabPress,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  // Redux selectors
  const user = useSelector(selectUser);
  const shoppingLists = useSelector(selectShoppingLists);
  const isLoading = useSelector(selectIsLoadingLists);
  const error = useSelector(selectShoppingListError);
  const friends = useSelector(selectFriends);

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e' },
          text: {
            primary: '#000000',
            secondary: '#666666',
            tertiary: '#999999',
            onPrimary: '#ffffff',
            onSecondary: '#000000',
            onSurface: '#000000',
            disabled: '#9ca3af',
            inverse: '#ffffff',
          },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5' },
          border: { primary: '#e5e5e5' },
        },
      };

  // State management
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddContributorModal, setShowAddContributorModal] = useState(false);
  const [selectedListForContributor, setSelectedListForContributor] = useState<string | null>(null);

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

  // Load shopping lists on mount
  useEffect(() => {
    if (typeof user?.id === 'string' && user.id.length > 0) {
      shoppingLogger.debug('🛒 Enhanced Lists - Loading shopping lists for user:', user.id);
      // Load both active and archived lists - PRODUCTION SAFE
      dispatch(loadShoppingLists({ limit: 100 })).catch(loadError => {
        console.error('Failed to load shopping lists:', loadError);
      });
    }
  }, [dispatch, user?.id]);

  // Handle shopping list errors (like authentication failures)
  useEffect(() => {
    if (typeof error === 'string' && error.includes('Not authenticated')) {
      shoppingLogger.warn('🚨 Authentication error in lists - forcing logout');
      // Import and dispatch logout - PRODUCTION SAFE
      import('../../../application/store/slices/authSlice')
        .then(({ logoutUser }) => {
          dispatch(logoutUser()).catch(logoutError => {
            console.error('Logout failed:', logoutError);
          });
        })
        .catch(importError => {
          console.error('Failed to import logout:', importError);
        });
    }
  }, [error, dispatch]);

  // Handle pull to refresh
  const handleRefresh = useCallback(async () => {
    if (typeof user?.id !== 'string' || user.id.length === 0) return;

    shoppingLogger.debug('🔄 Enhanced Lists - Refreshing shopping lists...');
    try {
      await dispatch(loadShoppingLists({ limit: 100 })).unwrap(); // Load all lists
    } catch (refreshError) {
      shoppingLogger.error('Failed to refresh shopping lists:', refreshError);
    }
  }, [dispatch, user?.id]);

  // Refresh lists when screen comes into focus (e.g., returning from CreateList)
  useFocusEffect(
    useCallback(() => {
      if (typeof user?.id === 'string' && user.id.length > 0) {
        shoppingLogger.debug('🔄 Enhanced Lists - Screen focused, refreshing lists...');
        const currentListCount = shoppingLists?.length || 0;

        // Store current count before refreshing
        setPreviousListCount(currentListCount);

        // PRODUCTION SAFE: Handle promise rejection
        dispatch(loadShoppingLists({ limit: 100 })).catch(focusError => {
          console.error('Failed to load shopping lists on focus:', focusError);
        });
      }
    }, [dispatch, user?.id, shoppingLists?.length])
  );
  const [errorFadeAnim] = useState(new Animated.Value(0));
  const [errorScaleAnim] = useState(new Animated.Value(0.3));

  // ========================================
  // Navigation Handlers
  // ========================================

  const handleViewArchivedList = (list: ShoppingList) => {
    shoppingLogger.debug('🗃️ Opening archived list modal for:', list.name);
    shoppingLogger.debug('🗃️ List data:', {
      itemsCount: list.itemsCount,
      completedCount: list.completedCount,
      totalSpent: list.totalSpent,
      itemsLength: list.items?.length,
      collaboratorsLength: list.collaborators?.length,
    });
    setArchivedListDetail(list);
    setShowArchivedDetailModal(true);
  };

  // Handle navigation to create list screen
  const handleNavigateToCreateList = useCallback(() => {
    shoppingLogger.debug('🔍 DEBUG: Enhanced Lists - Navigating to create list screen');
    navigation.navigate('CreateList', {});
  }, [navigation]);

  // Handle success animation completion
  const handleSuccessAnimationComplete = useCallback(() => {
    setShowSuccessAnimation(false);
  }, []);

  // Notification state
  const [unreadCount, setUnreadCount] = useState(0);

  // Assignment state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedItemForAssignment, setSelectedItemForAssignment] = useState<ShoppingItem | null>(
    null
  );
  const [selectedListForAssignment, setSelectedListForAssignment] = useState<string | null>(null);

  // Archive state
  const [showArchivedLists, setShowArchivedLists] = useState(false);
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // Archived List Detail Modal state
  const [showArchivedDetailModal, setShowArchivedDetailModal] = useState(false);
  const [archivedListDetail, setArchivedListDetail] = useState<ShoppingList | null>(null);

  // List Creation Success Animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [previousListCount, setPreviousListCount] = useState(0);

  // Load user currency preference - PRODUCTION SAFE
  useEffect(() => {
    // Safe access with type checking to prevent runtime crashes
    const userPrefs = user?.preferences;
    const preferredCurrency = (userPrefs as { currency?: string })?.currency;
    if (typeof preferredCurrency === 'string' && preferredCurrency.length > 0) {
      setUserCurrency(preferredCurrency as CurrencyCode);
    }
  }, [user]);

  // Check for new list creation and trigger success animation
  useEffect(() => {
    const currentListCount = shoppingLists?.length || 0;

    // If list count increased (new list was created)
    if (previousListCount > 0 && currentListCount > previousListCount) {
      shoppingLogger.debug('🎉 New list detected! Triggering success animation...');
      shoppingLogger.debug(
        'Previous count:',
        previousListCount,
        'Current count:',
        currentListCount
      );
      setShowSuccessAnimation(true);
    }
  }, [shoppingLists?.length, previousListCount]);

  // Subscribe to notifications
  useEffect(() => {
    const updateNotifications = (notificationList: Notification[]) => {
      setUnreadCount(notificationList.filter(n => !n.isRead).length);
    };

    // Set current user for notifications
    if (typeof user?.id === 'string' && user.id.length > 0) {
      NotificationService.setCurrentUser(user.id);
    }

    // Subscribe to updates from global service
    const unsubscribe = NotificationService.subscribe(updateNotifications);

    return unsubscribe;
  }, [user]);

  // Load friends when modal opens
  useEffect(() => {
    if (showAddContributorModal) {
      shoppingLogger.debug('🤝 Loading friends for contributor modal');
      // PRODUCTION SAFE: Handle promise rejection
      dispatch(loadFriends()).catch(friendsError => {
        console.error('Failed to load friends:', friendsError);
      });
    }
  }, [showAddContributorModal, dispatch]);

  // Handle add contributor
  const handleAddContributor = useCallback((listId: string) => {
    setSelectedListForContributor(listId);
    setShowAddContributorModal(true);
  }, []);

  // Handle close contributor modal
  const handleCloseContributorModal = useCallback(() => {
    setShowAddContributorModal(false);
    setSelectedListForContributor(null);
  }, []);

  // Handle add contributor to list
  const handleAddContributorToList = useCallback(
    async (friendId: string, friendName: string) => {
      if (typeof selectedListForContributor !== 'string' || selectedListForContributor.length === 0)
        return;

      try {
        shoppingLogger.debug('🤝 Adding contributor:', {
          friendId,
          friendName,
          listId: selectedListForContributor,
        });

        // Find the friend data from Redux state
        const friendUser = friends.find(friendship => {
          const isCurrentUserUser1 = friendship.user1Id === user?.id;
          const friendData = isCurrentUserUser1 ? friendship.user2 : friendship.user1;
          return friendData?.id === friendId;
        });

        const friend = friendUser
          ? friendUser.user1Id === user?.id
            ? friendUser.user2
            : friendUser.user1
          : null;

        if (!friend) {
          throw new Error('Friend data not found');
        }

        // Create collaborator object for optimistic update
        const newCollaborator = {
          id: `temp-${Date.now()}`, // Temporary ID
          userId: friendId,
          name: friend.name ?? friendName,
          email: friend.email ?? '',
          avatar: friend.avatar ?? '', // PRODUCTION SAFE: Provide fallback for required string
          listId: selectedListForContributor,
          role: 'editor' as const,
          permissions: ['can_edit_items', 'can_add_items'],
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        };

        // Optimistically update Redux state immediately
        dispatch(
          addCollaboratorToList({
            listId: selectedListForContributor,
            collaborator: newCollaborator,
          })
        );

        // Import shopping list API
        const { shoppingListApi } = await import('../../../infrastructure/api');

        // Add collaborator via API
        const response = await shoppingListApi.addCollaborator(selectedListForContributor, {
          user_id: friendId,
          role: 'editor',
          permissions: {
            can_edit_items: true,
            can_add_items: true,
            can_delete_items: false,
            can_invite_others: false,
          },
        });

        if (!response.data) {
          // Revert optimistic update on failure
          dispatch(
            removeCollaboratorFromList({
              listId: selectedListForContributor,
              userId: friendId,
            })
          );
          throw new Error(response.detail ?? 'Failed to add contributor');
        }

        shoppingLogger.debug('✅ Contributor added successfully:', response.data);

        // Show success message
        Alert.alert('Success', `${friendName} has been added as a contributor to the list.`, [
          { text: 'OK' },
        ]);

        // Refresh lists in background to sync with server (but UI already updated)
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
      } catch (addError: unknown) {
        shoppingLogger.error('❌ Failed to add contributor:', addError);
        throw addError; // Re-throw to let modal handle the error
      }
    },
    [selectedListForContributor, dispatch, friends, user?.id]
  );

  // Handle remove contributor from list
  const handleRemoveContributorFromList = useCallback(
    async (friendId: string) => {
      if (typeof selectedListForContributor !== 'string' || selectedListForContributor.length === 0)
        return;

      try {
        shoppingLogger.debug('🗑️ Removing contributor:', {
          friendId,
          listId: selectedListForContributor,
        });

        // Optimistically update Redux state immediately
        dispatch(
          removeCollaboratorFromList({
            listId: selectedListForContributor,
            userId: friendId,
          })
        );

        // Import shopping list API
        const { shoppingListApi } = await import('../../../infrastructure/api');

        // Remove collaborator via API
        await shoppingListApi.removeCollaborator(selectedListForContributor, friendId);

        shoppingLogger.debug('✅ Contributor removed successfully');

        // Show success message
        Alert.alert('Success', 'Contributor has been removed from the list.', [{ text: 'OK' }]);

        // Refresh lists in background to sync with server (but UI already updated)
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
      } catch (removeError: unknown) {
        shoppingLogger.error('❌ Failed to remove contributor:', removeError);

        // Revert optimistic update on failure - need to re-add the collaborator
        // For now, just refresh the lists to get the correct state
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);

        throw removeError; // Re-throw to let modal handle the error
      }
    },
    [selectedListForContributor, dispatch]
  );

  // Assignment functions
  const handleAssignItem = (listId: string, item: ShoppingItem) => {
    const list = shoppingLists.find(l => l.id === listId);
    shoppingLogger.debug('=== ASSIGNMENT MODAL DEBUG ===');
    shoppingLogger.debug('Opening assignment modal for item:', item.name);
    shoppingLogger.debug('Current user:', { id: user?.id, name: user?.name });
    shoppingLogger.debug('List owner:', { id: list?.ownerId, name: list?.ownerName });
    shoppingLogger.debug('List collaborators:', list?.collaborators);

    setSelectedListForAssignment(listId);
    setSelectedItemForAssignment(item);
    setShowAssignmentModal(true);
  };

  const handleAssignToUser = async (itemId: string, userId: string) => {
    if (typeof selectedListForAssignment !== 'string' || selectedListForAssignment.length === 0)
      return;

    shoppingLogger.debug(
      `Assigning item ${itemId} to user ${userId} in list ${selectedListForAssignment}`
    );

    try {
      // Call the actual API to assign the item
      await dispatch(
        assignShoppingItem({
          listId: selectedListForAssignment,
          itemId,
          userId,
        })
      ).unwrap();

      // Show success message
      setSuccessMessage('Item Assigned');
      setSuccessSubtitle('Item has been successfully assigned');
      showSuccessModalWithAnimation();

      // Close the assignment modal
      setShowAssignmentModal(false);

      // Send notification
      const assignedUserName = getUserName(userId);
      const currentUserName = user?.name ?? 'Someone';
      const listName = shoppingLists.find(l => l.id === selectedListForAssignment)?.name ?? 'list';
      const itemName = selectedItemForAssignment?.name ?? 'item';

      NotificationService.notifyItemAssigned(listName, itemName, assignedUserName, currentUserName);

      // Refresh lists to get updated data with a small delay to ensure DB transaction is committed
      setTimeout(() => {
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
      }, 500);

      // Auto-hide success message
      setTimeout(hideSuccessModalWithAnimation, 2000);
    } catch (assignError: unknown) {
      shoppingLogger.error('Error assigning item:', assignError);
      setErrorMessage('Assignment Failed');
      const assignErrorMessage =
        (assignError as { message?: string })?.message ??
        'Failed to assign item. Please try again.';
      setErrorSubtitle(assignErrorMessage);
      showErrorModalWithAnimation();
      setTimeout(hideErrorModalWithAnimation, 3000);
    }
  };

  const handleUnassignItem = async (itemId: string) => {
    if (typeof selectedListForAssignment !== 'string' || selectedListForAssignment.length === 0)
      return;

    shoppingLogger.debug(`Unassigning item ${itemId} from list ${selectedListForAssignment}`);

    try {
      // Call the actual API to unassign the item
      await dispatch(
        unassignShoppingItem({
          listId: selectedListForAssignment,
          itemId,
        })
      ).unwrap();

      // Show success message
      setSuccessMessage('Item Unassigned');
      setSuccessSubtitle('Item assignment has been removed');
      showSuccessModalWithAnimation();

      // Close the assignment modal
      setShowAssignmentModal(false);

      // Refresh lists to get updated data with a small delay to ensure DB transaction is committed
      setTimeout(() => {
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
      }, 500);

      // Auto-hide success message
      setTimeout(hideSuccessModalWithAnimation, 2000);
    } catch (unassignError: unknown) {
      shoppingLogger.error('Error unassigning item:', unassignError);
      setErrorMessage('Unassignment Failed');
      const unassignErrorMessage =
        (unassignError as { message?: string })?.message ??
        'Failed to unassign item. Please try again.';
      setErrorSubtitle(unassignErrorMessage);
      showErrorModalWithAnimation();
      setTimeout(hideErrorModalWithAnimation, 3000);
    }
  };

  const getUserName = useCallback(
    (userId: string): string => {
      if (userId === user?.id) return 'You';

      // Look up in collaborators from all lists
      for (const list of shoppingLists) {
        const collaborator = list.collaborators.find(c => c.userId === userId);
        if (collaborator) return collaborator.name;
      }

      // Look up in friends list
      const friendship = friends.find(f => f.user1Id === userId || f.user2Id === userId);
      if (friendship) {
        const friend = friendship.user1Id === userId ? friendship.user1 : friendship.user2;
        return friend?.name ?? 'Unknown User';
      }

      return 'Unknown User';
    },
    [user?.id, shoppingLists, friends]
  );

  const getUserAvatar = useCallback(
    (userId: string): AvatarType => {
      // First check if it's the current user
      if (user && user.id === userId) {
        return user.avatar ?? getFallbackAvatar(user.name);
      }

      // Look up in collaborators from all lists
      for (const list of shoppingLists) {
        const collaborator = list.collaborators.find(c => c.userId === userId);
        if (collaborator) {
          return collaborator.avatar ?? getFallbackAvatar(collaborator.name);
        }
      }

      // Look up in friends list
      const friendship = friends.find(f => f.user1Id === userId || f.user2Id === userId);
      if (friendship) {
        const friend = friendship.user1Id === userId ? friendship.user1 : friendship.user2;
        return friend?.avatar ?? getFallbackAvatar(friend?.name ?? 'Unknown');
      }

      return '👤';
    },
    [user, shoppingLists, friends]
  );

  // Success modal animation functions
  const showSuccessModalWithAnimation = () => {
    setShowSuccessModal(true);
    Animated.parallel([
      Animated.timing(successFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(successScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideSuccessModalWithAnimation = () => {
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
  };

  // Error modal animation functions
  const showErrorModalWithAnimation = () => {
    setShowErrorModal(true);
    Animated.parallel([
      Animated.timing(errorFadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(errorScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideErrorModalWithAnimation = () => {
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
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // PERFORMANCE OPTIMIZED: Memoize expensive list filtering operations
  const activeLists = useMemo(
    () => shoppingLists.filter(list => list.status !== 'archived'),
    [shoppingLists]
  );

  const archivedLists = useMemo(
    () => shoppingLists.filter(list => list.status === 'archived'),
    [shoppingLists]
  );

  const archivedCount = useMemo(() => archivedLists.length, [archivedLists]);

  // Avatar rendering helper
  const renderAvatar = (avatar: AvatarType, size: number = 20) => {
    try {
      const avatarProps = getAvatarProps(avatar);

      const containerStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: safeTheme?.colors?.primary?.['500'] || '#22c55e',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
      };

      const imageStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
      };

      const textStyle = {
        fontSize: size * 0.6,
        fontWeight: '600' as const,
        color:
          (safeTheme?.colors as any)?.background?.primary ||
          safeTheme?.colors?.text?.onPrimary ||
          '#ffffff',
      };

      switch (avatarProps.type) {
        case 'asset':
        case 'uri':
          return (
            <View style={containerStyle}>
              <Image source={avatarProps.source as any} style={imageStyle} />
            </View>
          );

        case 'emoji':
          return (
            <View style={containerStyle}>
              <Typography style={textStyle}>{avatarProps.emoji}</Typography>
            </View>
          );

        default:
          return (
            <View style={containerStyle}>
              <Typography style={textStyle}>👤</Typography>
            </View>
          );
      }
    } catch (renderError) {
      shoppingLogger.error('Error in renderAvatar:', renderError);
      // Return a fallback avatar
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#22c55e',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Typography style={{ fontSize: size * 0.6, fontWeight: '600', color: '#ffffff' }}>
            👤
          </Typography>
        </View>
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Typography variant='h2' color={safeTheme.colors.text.primary} style={styles.headerTitle}>
        Shopping Lists
      </Typography>

      <View style={styles.headerRightSection}>
        <TouchableOpacity
          onPress={() => Alert.alert('Notifications', 'Coming soon!')}
          style={styles.notificationButton}
          accessibilityRole='button'
          accessibilityLabel='View notifications'>
          <Typography
            variant='h3'
            style={{
              fontSize: 26,
              lineHeight: 26,
              color: safeTheme?.colors?.primary?.['500'] || '#22c55e',
            }}>
            {NotificationIcon}
          </Typography>
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Typography variant='caption' style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNavigateToCreateList}
          style={styles.headerButton}
          accessibilityRole='button'
          accessibilityLabel='Add new list'>
          <Typography
            variant='h3'
            style={{
              fontSize: 26,
              lineHeight: 26,
              color: safeTheme?.colors?.primary?.['500'] || '#22c55e',
            }}>
            {CreateListIcon}
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListCard = useCallback(
    (list: ShoppingList) => {
      const isShared = list.collaborators.length > 1;
      const timeAgo = getTimeAgo(list.createdAt);
      const isArchived = list.status === 'archived';

      return (
        <View key={list.id} style={styles.listCardContainer}>
          <TouchableOpacity
            style={[styles.listCard, isArchived && styles.archivedListCard]}
            onPress={
              isArchived
                ? () => handleViewArchivedList(list)
                : () => setSelectedList(selectedList === list.id ? null : list.id)
            }
            accessibilityRole='button'
            accessibilityLabel={
              isArchived ? `View archived ${list.name} list` : `Open ${list.name} list`
            }
            activeOpacity={0.8}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <View style={styles.listTitleRow}>
                  <Typography
                    variant='h5'
                    color={safeTheme?.colors?.text?.primary || '#000000'}
                    style={styles.listTitle}>
                    {list.name}
                  </Typography>
                  {isShared && (
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={styles.sharedText}>
                      Shared
                    </Typography>
                  )}
                </View>

                <Typography
                  variant='body1'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={styles.listSubtitle}>
                  {list.completedCount || 0} of {list.itemsCount || 0} items completed
                </Typography>

                {list.totalSpent > 0 && (
                  <Typography variant='caption' style={{ color: '#16a34a', ...styles.totalSpent }}>
                    💰 Total spent: {formatCurrency(list.totalSpent, userCurrency)}
                  </Typography>
                )}

                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={styles.lastUpdated}>
                  Created {timeAgo}
                </Typography>
              </View>

              <View style={styles.rightSection}>
                {!isArchived && (
                  <TouchableOpacity
                    onPress={event => {
                      event.stopPropagation();
                      handleAddContributor(list.id);
                    }}
                    accessibilityRole='button'
                    accessibilityLabel='Add contributor'>
                    <Typography
                      variant='body1'
                      style={{
                        fontSize: 22,
                        lineHeight: 22,
                        color: safeTheme?.colors?.primary?.['500'] || '#22c55e',
                      }}>
                      {ShareIcon}
                    </Typography>
                  </TouchableOpacity>
                )}
                {isArchived && (
                  <View style={styles.archivedBadge}>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={styles.archivedText}>
                      📦 Archived
                    </Typography>
                  </View>
                )}
              </View>
            </View>

            {/* Enhanced Progress Bar with Percentage Inside */}
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${list.progress || 0}%` }]} />
                <View style={styles.progressTextContainer}>
                  <Typography
                    variant='caption'
                    color={
                      (list.progress || 0) > 50
                        ? (safeTheme?.colors as any)?.background?.primary ||
                          safeTheme?.colors?.text?.onPrimary ||
                          '#ffffff'
                        : safeTheme?.colors?.text?.secondary || '#666666'
                    }
                    style={styles.progressText}>
                    {list.progress || 0}% completed
                  </Typography>
                </View>
              </View>
            </View>

            {/* Collaborators */}
            {list.collaborators.length > 0 && (
              <View style={styles.collaboratorsSection}>
                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={styles.collaboratorsLabel}>
                  Collaborators:
                </Typography>
                <View style={styles.collaboratorsList}>
                  {list.collaborators.map((collaborator, index) => {
                    const displayName =
                      collaborator.name === 'You' || collaborator.name === user?.name
                        ? 'You'
                        : collaborator.name;

                    const avatar = getUserAvatar(collaborator.userId);

                    return (
                      <View key={`${collaborator.id}-${index}`} style={styles.collaboratorChip}>
                        {renderAvatar(avatar, 20)}
                        <Typography
                          variant='caption'
                          color={safeTheme?.colors?.text?.primary || '#000000'}>
                          {displayName}
                        </Typography>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Expanded List Items */}
            {selectedList === list.id && (
              <View style={styles.listItems}>
                <Typography
                  variant='body1'
                  color={safeTheme?.colors?.text?.primary || '#000000'}
                  style={styles.itemsTitle}>
                  Items:
                </Typography>
                {list.items.map(item => {
                  const isOwner = user?.id === list.ownerId;
                  const canAssign =
                    !isArchived && (isOwner || item.assignedTo === user?.id || !item.assignedTo);

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.listItem,
                        !!item.assignedTo && styles.listItemAssigned, // PRODUCTION SAFE: Convert to boolean
                        isArchived && styles.archivedListItem,
                      ]}
                      onLongPress={canAssign ? () => handleAssignItem(list.id, item) : undefined}
                      delayLongPress={500}
                      activeOpacity={isArchived ? 1 : 0.7}
                      disabled={isArchived}>
                      <View style={styles.itemLeft}>
                        <View style={[styles.checkbox, item.completed && styles.checkboxCompleted]}>
                          {item.completed && (
                            <Typography
                              variant='caption'
                              color={
                                (safeTheme?.colors as any)?.background?.primary ||
                                safeTheme?.colors?.text?.onPrimary ||
                                '#ffffff'
                              }>
                              ✓
                            </Typography>
                          )}
                        </View>
                        <View style={styles.itemInfo}>
                          <Typography
                            variant='body1'
                            color={
                              item.completed
                                ? safeTheme?.colors?.text?.secondary || '#666666'
                                : safeTheme?.colors?.text?.primary || '#000000'
                            }
                            style={[styles.itemName, item.completed && styles.itemNameCompleted]}>
                            {item.icon} {item.name}
                          </Typography>
                          <View style={styles.itemDetails}>
                            <Typography
                              variant='caption'
                              color={safeTheme?.colors?.text?.secondary || '#666666'}>
                              {item.quantity} {item.unit} • {item.category.name}
                            </Typography>
                            {item.assignedTo && (
                              <View style={styles.assignmentRow}>
                                <Typography
                                  variant='caption'
                                  color='#3B82F6'
                                  style={styles.assignmentIndicator}>
                                  • Assigned to {getUserName(item.assignedTo)}
                                </Typography>
                                <View style={styles.assignedAvatarInline}>
                                  {renderAvatar(getUserAvatar(item.assignedTo), 16)}
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      </View>

                      {canAssign && (
                        <TouchableOpacity
                          style={styles.assignButton}
                          onPress={() => handleAssignItem(list.id, item)}>
                          <Typography
                            variant='caption'
                            color={safeTheme?.colors?.primary?.['500'] || '#22c55e'}>
                            {item.assignedTo ? '↻' : '+'}
                          </Typography>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}

                {/* Edit button - only show for lists owned by current user */}
                {!isArchived && user?.id === list.ownerId && (
                  <View style={styles.editButtonContainer}>
                    <Button
                      title='✏️ Edit List'
                      variant='primary'
                      size='md'
                      onPress={() => onEditListPress?.(list)}
                      style={styles.editButton}
                    />
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    },
    [user, selectedList, handleAddContributor, theme, userCurrency, friends]
  );

  // PERFORMANCE OPTIMIZED: Memoize expensive archived list calculations
  const archivedListTotalSpent = useMemo(() => {
    if (!archivedListDetail?.items) return 0;

    return (
      archivedListDetail.items
        .filter(item => item.completed)
        .reduce((sum, item) => {
          // PRODUCTION SAFE: Prevent null/undefined crashes
          const purchasedAmount = item.purchasedAmount
            ? parseFloat(String(item.purchasedAmount))
            : 0;
          const actualPrice = (item as any).actualPrice
            ? parseFloat(String((item as any).actualPrice))
            : 0;
          const estimatedPrice = item.price ? parseFloat(String(item.price)) : 0;

          const amount = purchasedAmount || actualPrice || estimatedPrice || 0;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0) || 0
    );
  }, [archivedListDetail?.items]);

  // PERFORMANCE OPTIMIZED: Memoize spending by user calculation
  const spendingByUser = useMemo((): Record<string, { total: number; items: number }> => {
    if (!archivedListDetail?.items) return {};

    const spending: Record<string, { total: number; items: number }> = {};
    archivedListDetail.items
      .filter(item => item.completed)
      .forEach(item => {
        // PRODUCTION SAFE: Prevent null/undefined crashes
        const purchasedAmount = item.purchasedAmount ? parseFloat(String(item.purchasedAmount)) : 0;
        const actualPrice = (item as any).actualPrice
          ? parseFloat(String((item as any).actualPrice))
          : 0;
        const estimatedPrice = item.price ? parseFloat(String(item.price)) : 0;

        const amount = purchasedAmount || actualPrice || estimatedPrice || 0;
        // If item is assigned, use assigned user; otherwise use the list owner
        const userName = item.assignedTo
          ? getUserName(item.assignedTo)
          : getUserName(archivedListDetail?.ownerId || '') || 'Unknown';

        if (!spending[userName]) {
          spending[userName] = { total: 0, items: 0 };
        }
        spending[userName]!.total += typeof amount === 'number' ? amount : 0;
        spending[userName]!.items += 1;
      });

    return spending;
  }, [archivedListDetail?.items, archivedListDetail?.ownerId, getUserName]);

  // Archived List Detail Modal
  const renderArchivedDetailModal = () => (
    <Modal
      visible={showArchivedDetailModal}
      transparent={true}
      animationType='fade'
      onRequestClose={() => setShowArchivedDetailModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.archivedModalContainer}>
          <View style={styles.archivedModalHeader}>
            <Typography variant='h4' style={styles.archivedModalTitle}>
              📦 {archivedListDetail?.name} (Archived)
            </Typography>
          </View>

          <ScrollView style={styles.archivedModalBody} showsVerticalScrollIndicator={false}>
            <Typography variant='body1' style={styles.archivedModalSubtitle}>
              This list was completed and archived.
            </Typography>

            <View style={styles.archivedInfoSection}>
              <View style={styles.archivedInfoRow}>
                <Typography variant='body1' style={styles.archivedInfoLabel}>
                  📅 Created:
                </Typography>
                <Typography variant='body1' style={styles.archivedInfoValue}>
                  {archivedListDetail
                    ? new Date(archivedListDetail.createdAt).toLocaleDateString()
                    : ''}
                </Typography>
              </View>
              <View style={styles.archivedInfoRow}>
                <Typography variant='body1' style={styles.archivedInfoLabel}>
                  📅 Archived:
                </Typography>
                <Typography variant='body1' style={styles.archivedInfoValue}>
                  {archivedListDetail
                    ? new Date(archivedListDetail.updatedAt).toLocaleDateString()
                    : ''}
                </Typography>
              </View>
              <View style={styles.archivedInfoRow}>
                <Typography variant='body1' style={styles.archivedInfoLabel}>
                  📦 Items:
                </Typography>
                <Typography variant='body1' style={styles.archivedInfoValue}>
                  {archivedListDetail?.itemsCount || 0}
                </Typography>
              </View>
              <View style={styles.archivedInfoRow}>
                <Typography variant='body1' style={styles.archivedInfoLabel}>
                  ✅ Completed:
                </Typography>
                <Typography variant='body1' style={styles.archivedInfoValue}>
                  {archivedListDetail?.completedCount || 0}
                </Typography>
              </View>
              <View style={styles.archivedInfoRow}>
                <Typography variant='body1' style={styles.archivedInfoLabel}>
                  💰 Total Spent:
                </Typography>
                <Typography variant='body1' style={styles.archivedInfoValue}>
                  ${archivedListTotalSpent.toFixed(2)}
                </Typography>
              </View>
            </View>

            {/* Scroll Indicator */}
            <View style={styles.scrollIndicator}>
              <Typography variant='caption' style={styles.scrollIndicatorText}>
                ⬇️ Scroll down for detailed items and spending breakdown ⬇️
              </Typography>
            </View>

            <View style={styles.itemsSection}>
              <Typography variant='h5' style={styles.sectionTitle}>
                All Items ({archivedListDetail?.itemsCount || 0})
              </Typography>

              {archivedListDetail?.items.length ? (
                archivedListDetail.items.map((item, index) => {
                  // PRODUCTION SAFE: Prevent null/undefined crashes
                  const purchasedAmount = item.purchasedAmount
                    ? parseFloat(String(item.purchasedAmount))
                    : 0;
                  const actualPrice = (item as any).actualPrice
                    ? parseFloat(String((item as any).actualPrice))
                    : 0;
                  const estimatedPrice = item.price ? parseFloat(String(item.price)) : 0;

                  const amount = purchasedAmount || actualPrice || estimatedPrice || 0;
                  const assignedUser = item.assignedTo ? getUserName(item.assignedTo) : null;

                  return (
                    <View
                      key={index}
                      style={[styles.itemRow, item.completed && styles.completedItemRow]}>
                      <View style={styles.itemLeft}>
                        <View
                          style={[
                            styles.itemCheckbox,
                            item.completed && styles.itemCheckboxCompleted,
                          ]}>
                          {item.completed && (
                            <Typography variant='caption' style={styles.checkmark}>
                              ✓
                            </Typography>
                          )}
                        </View>
                        <View style={styles.itemInfo}>
                          <Typography
                            variant='body1'
                            style={[styles.itemName, item.completed && styles.completedItemName]}>
                            {item.name}
                          </Typography>
                          <View style={styles.itemMeta}>
                            <Typography variant='caption' style={styles.itemQuantity}>
                              {item.quantity} {item.unit}
                            </Typography>
                            {assignedUser && (
                              <Typography variant='caption' style={styles.itemAssigned}>
                                • Assigned to {assignedUser}
                              </Typography>
                            )}
                          </View>
                        </View>
                      </View>
                      <View style={styles.itemRight}>
                        {item.completed ? (
                          <View style={styles.purchaseInfo}>
                            <Typography variant='body1' style={styles.purchaseAmount}>
                              ${(typeof amount === 'number' ? amount : 0).toFixed(2)}
                            </Typography>
                            <Typography variant='caption' style={styles.purchasedBy}>
                              by{' '}
                              {assignedUser ||
                                getUserName(archivedListDetail?.ownerId || '') ||
                                'Unknown'}
                            </Typography>
                          </View>
                        ) : (
                          <Typography variant='caption' style={styles.notPurchased}>
                            Not purchased
                          </Typography>
                        )}
                      </View>
                    </View>
                  );
                })
              ) : (
                <Typography variant='body1' style={styles.noItemsText}>
                  No items in this list
                </Typography>
              )}
            </View>

            <View style={styles.spendingSummarySection}>
              <Typography variant='h5' style={styles.sectionTitle}>
                Spending Summary
              </Typography>
              {Object.keys(spendingByUser).length > 0 ? (
                Object.entries(spendingByUser).map(([userName, data]) => (
                  <View key={userName} style={styles.spendingRow}>
                    <Typography variant='body1' style={styles.spendingUser}>
                      {userName}
                    </Typography>
                    <View style={styles.spendingDetails}>
                      <Typography variant='body1' style={styles.spendingAmount}>
                        ${data.total.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' style={styles.spendingItems}>
                        ({data.items} item{data.items > 1 ? 's' : ''})
                      </Typography>
                    </View>
                  </View>
                ))
              ) : (
                <Typography variant='body1' style={styles.noSpendingText}>
                  No purchases recorded
                </Typography>
              )}
            </View>

            <View style={styles.collaboratorsSection}>
              <Typography variant='h5' style={styles.sectionTitle}>
                Collaborators
              </Typography>
              <Typography variant='body1' style={styles.archivedCollaboratorsList}>
                {archivedListDetail?.collaborators.map(c => c.name).join(', ') || 'None'}
              </Typography>
            </View>
          </ScrollView>

          <View style={styles.archivedModalFooter}>
            <TouchableOpacity
              style={styles.archivedCloseButton}
              onPress={() => setShowArchivedDetailModal(false)}>
              <Typography variant='button' style={styles.archivedCloseButtonText}>
                Close
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Success Modal
  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType='none'
      statusBarTranslucent={true}>
      <View style={styles.successModalOverlay}>
        <Animated.View
          style={[
            styles.successModalContainer,
            {
              opacity: successFadeAnim,
              transform: [{ scale: successScaleAnim }],
            },
          ]}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Typography variant='h1' style={styles.successIcon}>
              🎉
            </Typography>
          </View>

          {/* Success Message */}
          <Typography
            variant='h3'
            color={safeTheme.colors.text.primary}
            style={styles.successTitle}>
            {successMessage}
          </Typography>

          <Typography
            variant='body1'
            color={safeTheme.colors.text.secondary}
            style={styles.successSubtitle}>
            {successSubtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.successButton}
            onPress={hideSuccessModalWithAnimation}
            activeOpacity={0.8}>
            <Typography variant='body1' style={styles.successButtonText}>
              Great!
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  // Error Modal
  const renderErrorModal = () => (
    <Modal
      visible={showErrorModal}
      transparent={true}
      animationType='none'
      statusBarTranslucent={true}>
      <View style={styles.errorModalOverlay}>
        <Animated.View
          style={[
            styles.errorModalContainer,
            {
              opacity: errorFadeAnim,
              transform: [{ scale: errorScaleAnim }],
            },
          ]}>
          {/* Error Icon */}
          <View style={styles.errorIconContainer}>
            <Typography variant='h1' style={styles.errorIcon}>
              ⚠️
            </Typography>
          </View>

          {/* Error Message */}
          <Typography variant='h3' color={safeTheme.colors.text.primary} style={styles.errorTitle}>
            {errorMessage}
          </Typography>

          <Typography
            variant='body1'
            color={safeTheme.colors.text.secondary}
            style={styles.errorSubtitle}>
            {errorSubtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.errorButton}
            onPress={hideErrorModalWithAnimation}
            activeOpacity={0.8}>
            <Typography variant='body1' style={styles.errorButtonText}>
              Try Again
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={safeTheme.colors.primary['500']}
          />
        }>
        <View style={styles.listsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.secondary}
                style={styles.loadingText}>
                Loading your lists...
              </Typography>
            </View>
          ) : showArchivedLists ? (
            archivedLists.length > 0 ? (
              archivedLists.map(renderListCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Typography
                  variant='h3'
                  color={safeTheme.colors.text.secondary}
                  style={styles.emptyTitle}>
                  No Archived Lists
                </Typography>
                <Typography
                  variant='body1'
                  color={safeTheme.colors.text.secondary}
                  style={styles.emptyText}>
                  Archived lists will appear here when you finish shopping.
                </Typography>
              </View>
            )
          ) : activeLists.length > 0 ? (
            activeLists.map(renderListCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Typography
                variant='h3'
                color={safeTheme.colors.text.secondary}
                style={styles.emptyTitle}>
                No Lists Yet
              </Typography>
              <Typography
                variant='body1'
                color={safeTheme.colors.text.secondary}
                style={styles.emptyText}>
                Create your first shopping list to get started!
              </Typography>
            </View>
          )}
        </View>

        {/* Add New List Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title='Create New List'
            variant='primary'
            size='md'
            onPress={onAddListPress || (() => {})}
            style={styles.addButton}
          />
        </View>

        {/* Show Archived Lists Button */}
        {archivedCount > 0 && (
          <View style={styles.archiveButtonContainer}>
            <Button
              title={
                showArchivedLists ? 'Show Active Lists' : `Show ${archivedCount} Archived Lists`
              }
              variant='outline'
              size='md'
              onPress={() => setShowArchivedLists(!showArchivedLists)}
              style={styles.archiveButton}
            />
          </View>
        )}
      </ScrollView>

      {/* Assignment Modal */}
      <AssignmentModal
        visible={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedItemForAssignment(null);
          setSelectedListForAssignment(null);
        }}
        item={selectedItemForAssignment}
        collaborators={
          selectedListForAssignment
            ? shoppingLists.find(list => list.id === selectedListForAssignment)?.collaborators || []
            : []
        }
        currentUserId={user?.id || ''}
        listOwnerId={
          selectedListForAssignment
            ? shoppingLists.find(list => list.id === selectedListForAssignment)?.ownerId || ''
            : ''
        }
        onAssign={handleAssignToUser}
        onUnassign={handleUnassignItem}
        getUserName={getUserName}
        getUserAvatar={getUserAvatar}
      />

      {/* Add Contributor Modal */}
      <AddContributorModal
        visible={showAddContributorModal}
        onClose={handleCloseContributorModal}
        selectedList={
          selectedListForContributor
            ? shoppingLists.find(list => list.id === selectedListForContributor) || null
            : null
        }
        onAddContributor={handleAddContributorToList}
        onRemoveContributor={handleRemoveContributorFromList}
        isLoading={false}
      />

      {/* Archived List Detail Modal */}
      {renderArchivedDetailModal()}

      {/* Success and Error Modals */}
      {renderSuccessModal()}
      {renderErrorModal()}

      {/* List Creation Success Animation */}
      <ListCreationSuccessAnimation
        visible={showSuccessAnimation}
        onAnimationComplete={handleSuccessAnimationComplete}
      />
    </SafeAreaView>
  );
};

// ========================================
// Styles - Enhanced with all features
// ========================================

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  } as ViewStyle,

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  headerButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  headerTitle: {
    fontWeight: '700',
    fontSize: 18,
  } as ViewStyle,

  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  } as ViewStyle,

  notificationButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  } as ViewStyle,

  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  } as ViewStyle,

  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  } as ViewStyle,

  listsContainer: {
    marginBottom: 32,
  } as ViewStyle,

  listCardContainer: {
    marginBottom: 20,
  } as ViewStyle,

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  } as ViewStyle,

  listInfo: {
    flex: 1,
    marginRight: 16,
  } as ViewStyle,

  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  listTitle: {
    fontWeight: '600',
    marginRight: 12,
  } as ViewStyle,

  sharedText: {
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  listSubtitle: {
    marginBottom: 8,
  } as ViewStyle,

  totalSpent: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  } as ViewStyle,

  lastUpdated: {
    fontSize: 12,
  } as ViewStyle,

  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    minHeight: 32,
    paddingTop: 2,
  } as ViewStyle,

  addContributorButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#22c55e',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  } as ViewStyle,

  addContributorText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.3,
  } as ViewStyle,

  editButtonContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    alignItems: 'center',
  } as ViewStyle,

  editButton: {
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  } as ViewStyle,

  progressBarContainer: {
    marginBottom: 16,
  } as ViewStyle,

  progressBar: {
    width: '100%',
    height: 24,
    backgroundColor: '#F0F4F2',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
  } as ViewStyle,

  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    minWidth: 2,
  } as ViewStyle,

  progressTextContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  } as ViewStyle,

  progressText: {
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
  } as ViewStyle,

  collaboratorsSection: {
    marginBottom: 16,
  } as ViewStyle,

  collaboratorsLabel: {
    marginBottom: 8,
    fontWeight: '500',
  } as ViewStyle,

  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  collaboratorChip: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,

  listItems: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: 16,
  } as ViewStyle,

  itemsTitle: {
    fontWeight: '600',
    marginBottom: 16,
  } as ViewStyle,

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  } as ViewStyle,

  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
  } as ViewStyle,

  listItemAssigned: {
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    marginHorizontal: -8,
    paddingHorizontal: 8,
  } as ViewStyle,

  itemDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  } as ViewStyle,

  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  } as ViewStyle,

  assignmentIndicator: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  assignedAvatarInline: {
    marginLeft: 8,
  } as ViewStyle,

  assignButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#22c55e30',
  } as ViewStyle,

  addButtonContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  } as ViewStyle,

  addButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minWidth: 200,
    maxWidth: 300,
  } as ViewStyle,

  loadingContainer: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  emptyContainer: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyTitle: {
    marginBottom: 16,
    textAlign: 'center',
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  archiveButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
  } as ViewStyle,

  archiveButton: {
    borderColor: '#6B7280',
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 300,
    height: 44,
    paddingVertical: 12,
  } as ViewStyle,

  archivedListCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  } as ViewStyle,

  archivedBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  archivedText: {
    fontWeight: '500',
    fontSize: 11,
  } as ViewStyle,

  archivedListItem: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
  } as ViewStyle,

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } as ViewStyle,

  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  } as ViewStyle,

  successIcon: {
    fontSize: 40,
  } as ViewStyle,

  successTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  } as ViewStyle,

  successSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  } as ViewStyle,

  successButton: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  successButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  } as ViewStyle,

  errorModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 320,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  } as ViewStyle,

  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  } as ViewStyle,

  errorIcon: {
    fontSize: 40,
  } as ViewStyle,

  errorTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  } as ViewStyle,

  errorSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  } as ViewStyle,

  errorButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Archived Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  } as ViewStyle,

  archivedModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    minHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  } as ViewStyle,

  archivedModalHeader: {
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  } as ViewStyle,

  archivedModalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
  } as ViewStyle,

  archivedModalBody: {
    flex: 1,
    padding: 24,
    paddingBottom: 0,
  } as ViewStyle,

  archivedModalSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  } as ViewStyle,

  archivedInfoSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  } as ViewStyle,

  archivedInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  } as ViewStyle,

  archivedInfoLabel: {
    fontSize: 16,
    color: '#4a4a4a',
    fontWeight: '500',
  } as ViewStyle,

  archivedInfoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '600',
  } as ViewStyle,

  scrollIndicator: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginVertical: 16,
    alignItems: 'center',
  } as ViewStyle,

  scrollIndicatorText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
    textAlign: 'center',
  } as ViewStyle,

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  } as ViewStyle,

  // Items Section Styles
  itemsSection: {
    marginBottom: 24,
  } as ViewStyle,

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  } as ViewStyle,

  completedItemRow: {
    backgroundColor: '#f0f9ff',
    borderColor: '#bae6fd',
  } as ViewStyle,

  itemCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  itemCheckboxCompleted: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  } as ViewStyle,

  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  } as ViewStyle,

  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 4,
  } as ViewStyle,

  completedItemName: {
    color: '#6b7280',
    textDecorationLine: 'line-through',
  } as ViewStyle,

  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,

  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  } as ViewStyle,

  itemAssigned: {
    fontSize: 12,
    color: '#3b82f6',
    marginLeft: 8,
  } as ViewStyle,

  itemRight: {
    alignItems: 'flex-end',
  } as ViewStyle,

  purchaseInfo: {
    alignItems: 'flex-end',
  } as ViewStyle,

  purchaseAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  } as ViewStyle,

  purchasedBy: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  } as ViewStyle,

  notPurchased: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  } as ViewStyle,

  noItemsText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  } as ViewStyle,

  // Spending Summary Styles
  spendingSummarySection: {
    marginBottom: 24,
  } as ViewStyle,

  spendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  } as ViewStyle,

  spendingUser: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  } as ViewStyle,

  spendingDetails: {
    alignItems: 'flex-end',
  } as ViewStyle,

  spendingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
  } as ViewStyle,

  spendingItems: {
    fontSize: 12,
    color: '#6b7280',
  } as ViewStyle,

  noSpendingText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
  } as ViewStyle,

  archivedCollaboratorsList: {
    fontSize: 14,
    color: '#4a4a4a',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  } as ViewStyle,

  archivedModalFooter: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  } as ViewStyle,

  archivedCloseButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,

  archivedCloseButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  } as ViewStyle,
};
