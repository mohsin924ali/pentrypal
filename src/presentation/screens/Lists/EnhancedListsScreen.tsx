// ========================================
// Enhanced Lists Screen - Complete Implementation
// ========================================

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';

// Components
import { SafeAreaView } from 'react-native-safe-area-context';
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';
import { AssignmentModal } from '../../components/molecules/AssignmentModal';
import { AddContributorModal } from '../../components/molecules/AddContributorModal';
import { ListCreationSuccessAnimation } from '../../components/molecules/ListCreationSuccessAnimation';
import { ArchivedListModal, ListErrorModal, ListSuccessModal } from './components';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useContributorManagement, useListAnimation, useListManagement } from './hooks';
import { shoppingLogger } from '../../../shared/utils/logger';

import { DEFAULT_CURRENCY, formatCurrency } from '../../../shared/utils/currencyUtils';
import { getAvatarProps, getFallbackAvatar } from '../../../shared/utils/avatarUtils';

// Styles
import { baseStyles, createDynamicStyles, createThemedStyles } from './EnhancedListsScreen.styles';

// Services

// Redux
import type { AppDispatch } from '../../../application/store';
import {
  addCollaboratorToList,
  assignShoppingItem,
  loadShoppingList,
  loadShoppingLists,
  removeCollaboratorFromList,
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
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  // Navigation handlers
  const handleNavigateToCreateList = () => {
    navigation.navigate('CreateList', {
      editMode: false,
      existingListName: '',
      existingItems: [],
    });
  };

  // Use extracted hooks
  const {
    shoppingLists,
    isLoading,
    handleRefresh,
    handleViewArchivedList,
    showArchivedDetailModal,
    archivedListDetail,
    handleCloseArchivedModal,
    showSuccessAnimation,
    setShowSuccessAnimation,
  } = useListManagement();

  const {
    showAddContributorModal,
    selectedListForContributor,
    handleAddContributor,
    handleCloseContributorModal,
    handleAddContributorToList,
    handleRemoveContributorFromList,
  } = useContributorManagement();

  const {
    showSuccessModal,
    successMessage,
    successSubtitle,
    successFadeAnim,
    successScaleAnim,
    showSuccessModalWithAnimation,
    hideSuccessModalWithAnimation,
    showErrorModal,
    errorMessage,
    errorSubtitle,
    errorFadeAnim,
    errorScaleAnim,
    showErrorModalWithAnimation,
    hideErrorModalWithAnimation,
  } = useListAnimation();

  // Styles
  const themedStyles = createThemedStyles(theme);

  // Redux selectors and dispatch (remaining)
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const friends = useSelector(selectFriends);

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#3b82f6' },
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

  // State management (remaining local state)
  const [selectedList, setSelectedList] = useState<string | null>(null);

  // Bulk assignment state
  const [selectedItems, setSelectedItems] = useState<Record<string, Set<string>>>({});

  // Animation state for expand/collapse
  const [animatedValues] = useState<Record<string, Animated.Value>>({});

  // Handle success animation completion (local handler)
  const handleSuccessAnimationComplete = useCallback(() => {
    setShowSuccessAnimation(false);
  }, [setShowSuccessAnimation]);

  // Get or create animated value for a list
  const getAnimatedValue = useCallback(
    (listId: string): Animated.Value => {
      if (!animatedValues[listId]) {
        animatedValues[listId] = new Animated.Value(0);
      }
      return animatedValues[listId]!; // Non-null assertion since we just created it if it didn't exist
    },
    [animatedValues]
  );

  // Bulk assignment handlers
  const toggleItemSelection = useCallback((listId: string, itemId: string) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      if (!newSelected[listId]) {
        newSelected[listId] = new Set();
      } else {
        newSelected[listId] = new Set(newSelected[listId]);
      }

      const currentSet = newSelected[listId];
      if (currentSet && currentSet.has(itemId)) {
        currentSet.delete(itemId);
      } else if (currentSet) {
        currentSet.add(itemId);
      }

      // Clean up empty sets
      const setToCheck = newSelected[listId];
      if (setToCheck && setToCheck.size === 0) {
        delete newSelected[listId];
      }

      return newSelected;
    });
  }, []);

  const clearSelectedItems = useCallback((listId: string) => {
    setSelectedItems(prev => {
      const newSelected = { ...prev };
      delete newSelected[listId];
      return newSelected;
    });
  }, []);

  const getSelectedItemsForList = useCallback(
    (listId: string): string[] => {
      return Array.from(selectedItems[listId] || []);
    },
    [selectedItems]
  );

  // Handle list selection for real-time updates with animation
  const handleListSelection = useCallback(
    async (list: ShoppingList) => {
      const newSelectedId = selectedList === list.id ? null : list.id;
      const animatedValue = getAnimatedValue(list.id);

      // Animate expand/collapse
      if (newSelectedId) {
        // Expanding - set state first, then animate
        setSelectedList(newSelectedId);
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 350,
          useNativeDriver: false,
        }).start();
      } else {
        // Collapsing - animate first, then clear state
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start(() => {
          setSelectedList(newSelectedId);
          // Clear selections when collapsing
          clearSelectedItems(list.id);
        });
      }

      // If selecting a list (not deselecting), load it for WebSocket room joining
      if (newSelectedId) {
        try {
          await dispatch(loadShoppingList(list.id)).unwrap();
        } catch (loadError) {
          console.error('Failed to load shopping list for WebSocket room:', loadError);
          // Continue anyway with local state
        }
      }
    },
    [dispatch, selectedList, getAnimatedValue, clearSelectedItems]
  );

  // Notification state

  // Assignment state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedItemForAssignment, setSelectedItemForAssignment] = useState<ShoppingItem | null>(
    null
  );
  const [selectedListForAssignment, setSelectedListForAssignment] = useState<string | null>(null);

  // Bulk assignment state
  const [showBulkAssignmentModal, setShowBulkAssignmentModal] = useState(false);
  const [bulkAssignmentListId, setBulkAssignmentListId] = useState<string | null>(null);

  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // Local state for list tracking
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

  // Assignment handlers (remaining local business logic)
  const handleAssignItemToList = useCallback(
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
  // REMOVED: handleRemoveContributorFromList - Now provided by useContributorManagement hook

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
      showSuccessModalWithAnimation('Item Assigned', 'Item has been successfully assigned');

      // Close the assignment modal
      setShowAssignmentModal(false);

      // Send notification
      const assignedUserName = getUserName(userId);
      const currentUserName = user?.name ?? 'Someone';
      const listName = shoppingLists.find(l => l.id === selectedListForAssignment)?.name ?? 'list';
      const itemName = selectedItemForAssignment?.name ?? 'item';

      // Notification would be sent here in production

      // Refresh lists to get updated data with a small delay to ensure DB transaction is committed
      setTimeout(() => {
        dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
      }, 500);

      // Auto-hide success message
      setTimeout(hideSuccessModalWithAnimation, 2000);
    } catch (assignError: unknown) {
      shoppingLogger.error('Error assigning item:', assignError);
      const assignErrorMessage =
        (assignError as { message?: string })?.message ??
        'Failed to assign item. Please try again.';
      showErrorModalWithAnimation('Assignment Failed', assignErrorMessage);
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
      showSuccessModalWithAnimation('Item Unassigned', 'Item assignment has been removed');

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
      const unassignErrorMessage =
        (unassignError as { message?: string })?.message ??
        'Failed to unassign item. Please try again.';
      showErrorModalWithAnimation('Unassignment Failed', unassignErrorMessage);
      setTimeout(hideErrorModalWithAnimation, 3000);
    }
  };

  // Bulk assignment handlers
  const handleBulkAssign = useCallback(
    (listId: string) => {
      const selectedItemIds = getSelectedItemsForList(listId);
      if (selectedItemIds.length < 2) return; // Only enable for 2+ items

      setBulkAssignmentListId(listId);
      setShowBulkAssignmentModal(true);
    },
    [getSelectedItemsForList]
  );

  const handleBulkAssignToUser = useCallback(
    async (userId: string) => {
      if (!bulkAssignmentListId) return;

      const selectedItemIds = getSelectedItemsForList(bulkAssignmentListId);
      if (selectedItemIds.length === 0) return;

      try {
        // Assign all selected items to the user
        const assignPromises = selectedItemIds.map(itemId =>
          dispatch(
            assignShoppingItem({
              listId: bulkAssignmentListId,
              itemId,
              userId,
            })
          ).unwrap()
        );

        await Promise.all(assignPromises);

        // Show success message
        const itemCount = selectedItemIds.length;
        showSuccessModalWithAnimation(
          'Items Assigned',
          `${itemCount} items have been successfully assigned`
        );

        // Clear selections and close modal
        clearSelectedItems(bulkAssignmentListId);
        setShowBulkAssignmentModal(false);
        setBulkAssignmentListId(null);

        // Refresh lists
        setTimeout(() => {
          dispatch(loadShoppingLists({ limit: 100 })).catch(console.error);
        }, 500);

        // Auto-hide success message
        setTimeout(hideSuccessModalWithAnimation, 2000);
      } catch (bulkAssignError: unknown) {
        shoppingLogger.error('Error bulk assigning items:', bulkAssignError);
        const bulkAssignErrorMessage =
          (bulkAssignError as { message?: string })?.message ??
          'Failed to assign items. Please try again.';
        showErrorModalWithAnimation('Bulk Assignment Failed', bulkAssignErrorMessage);
        setTimeout(hideErrorModalWithAnimation, 3000);
      }
    },
    [
      bulkAssignmentListId,
      getSelectedItemsForList,
      dispatch,
      showSuccessModalWithAnimation,
      clearSelectedItems,
      showErrorModalWithAnimation,
      hideSuccessModalWithAnimation,
      hideErrorModalWithAnimation,
    ]
  );

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

  // Modal functions REMOVED - Now handled by useListAnimation hook

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
    () =>
      shoppingLists
        .filter(list => list.status !== 'archived')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [shoppingLists]
  );

  const archivedLists = useMemo(
    () =>
      shoppingLists
        .filter(list => list.status === 'archived')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
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
        backgroundColor: safeTheme?.colors?.primary?.['500'] || '#3b82f6',
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
            backgroundColor: '#3b82f6',
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

  const renderListCard = useCallback(
    (list: ShoppingList) => {
      const isShared = list.collaborators.length > 1;
      const isArchived = list.status === 'archived';
      const isExpanded = selectedList === list.id;
      const selectedItemIds = getSelectedItemsForList(list.id);
      const hasSelectedItems = selectedItemIds.length > 1;
      const animatedValue = getAnimatedValue(list.id);

      // Interpolated values for animation
      const animatedOpacity = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
      });

      const animatedMaxHeight = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 2000], // Large enough to accommodate any content
      });

      return (
        <View key={list.id} style={baseStyles.listCardContainer}>
          <View style={[baseStyles.listCard, isArchived && baseStyles.archivedListCard]}>
            {/* Header - Following design.txt layout */}
            <View style={baseStyles.newCardHeader}>
              <View style={baseStyles.leftSection}>
                <Typography
                  variant='h5'
                  color={safeTheme?.colors?.text?.primary || '#000000'}
                  style={baseStyles.cardTitle}>
                  {list.name}
                </Typography>
                {isShared && (
                  <Typography
                    variant='caption'
                    color={safeTheme?.colors?.text?.secondary || '#666666'}
                    style={baseStyles.sharedBadge}>
                    Shared
                  </Typography>
                )}
              </View>

              <View style={baseStyles.cardRightSection}>
                {/* Collaborator avatars - overlapping style from design */}
                {list.collaborators.length > 0 && (
                  <View style={baseStyles.avatarsContainer}>
                    {list.collaborators.slice(0, 2).map((collaborator, index) => (
                      <View
                        key={`${collaborator.id}-${index}`}
                        style={[baseStyles.avatarWrapper, { marginLeft: index > 0 ? -8 : 0 }]}>
                        {renderAvatar(getUserAvatar(collaborator.userId), 24)}
                      </View>
                    ))}
                  </View>
                )}

                {/* Expand/Collapse button */}
                {!isArchived && (
                  <TouchableOpacity
                    style={baseStyles.expandButton}
                    onPress={() => handleListSelection(list)}
                    accessibilityRole='button'
                    accessibilityLabel={
                      isExpanded ? `Collapse ${list.name} list` : `Expand ${list.name} list`
                    }
                    activeOpacity={0.7}>
                    <Typography style={baseStyles.expandIcon}>{isExpanded ? '▲' : '▼'}</Typography>
                  </TouchableOpacity>
                )}
                {/* For archived lists, show a view button instead of expand/collapse */}
                {isArchived && (
                  <TouchableOpacity
                    style={baseStyles.expandButton}
                    onPress={() => handleViewArchivedList(list)}
                    accessibilityRole='button'
                    accessibilityLabel={`View archived ${list.name} list`}
                    activeOpacity={0.7}>
                    <Typography style={baseStyles.expandIcon}>👁</Typography>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Progress info - stats on one line */}
            <View style={baseStyles.progressInfo}>
              <View style={baseStyles.statsRow}>
                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={baseStyles.statsText}>
                  ✓ {list.completedCount || 0}/{list.itemsCount || 0} items
                </Typography>
                {list.totalSpent > 0 && (
                  <>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={baseStyles.statsSeparator}>
                      •
                    </Typography>
                    <Typography variant='caption' color='#f59e0b' style={baseStyles.statsText}>
                      💰 {formatCurrency(list.totalSpent, userCurrency)}
                    </Typography>
                  </>
                )}
              </View>
            </View>

            {/* Thin progress bar */}
            <View style={baseStyles.progressBarSection}>
              <View style={[baseStyles.thinProgressBar, themedStyles.shopStyleProgressBar]}>
                <View
                  style={[
                    themedStyles.shopStyleProgressFill,
                    { width: `${Math.round(list.progress || 0)}%` },
                  ]}
                />
              </View>
            </View>

            {/* Animated Expanded View */}
            <Animated.View
              style={[
                baseStyles.expandedSection,
                {
                  maxHeight: animatedMaxHeight,
                  opacity: animatedOpacity,
                  overflow: 'hidden',
                },
              ]}
              pointerEvents={isExpanded ? 'auto' : 'none'}>
              {/* Divider */}
              <View style={baseStyles.sectionDivider} />

              {/* Items Header */}
              <View style={baseStyles.itemsHeader}>
                <Typography
                  variant='body1'
                  color={safeTheme?.colors?.text?.primary || '#000000'}
                  style={baseStyles.itemsTitle}>
                  Items
                </Typography>
                <View style={baseStyles.itemsActions}>
                  {!isArchived && list.ownerId === user?.id && (
                    <TouchableOpacity
                      onPress={event => {
                        event.stopPropagation();
                        handleAddContributor(list.id);
                      }}
                      style={baseStyles.shareButton}
                      accessibilityRole='button'
                      accessibilityLabel='Share list'>
                      <Typography style={baseStyles.shareButtonText}>Share</Typography>
                    </TouchableOpacity>
                  )}
                  {!isArchived && (
                    <TouchableOpacity
                      onPress={event => {
                        event.stopPropagation();
                        handleBulkAssign(list.id);
                      }}
                      style={[
                        baseStyles.bulkAssignButton,
                        !hasSelectedItems && baseStyles.bulkAssignButtonDisabled,
                      ]}
                      disabled={!hasSelectedItems}
                      accessibilityRole='button'
                      accessibilityLabel={`Assign ${selectedItemIds.length} selected items`}>
                      <Typography
                        style={[
                          baseStyles.bulkAssignButtonText,
                          !hasSelectedItems && baseStyles.bulkAssignButtonTextDisabled,
                        ]}>
                        Assign
                      </Typography>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Items List */}
              <View style={baseStyles.itemsList}>
                {list.items.map(item => {
                  const isOwner = user?.id === list.ownerId;
                  const canAssign =
                    !isArchived && (isOwner || item.assignedTo === user?.id || !item.assignedTo);
                  const isItemSelected = selectedItemIds.includes(item.id);
                  const isInSelectionMode = selectedItemIds.length > 0;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        baseStyles.expandedListItem,
                        !!item.assignedTo && baseStyles.listItemAssigned,
                        isArchived && baseStyles.archivedListItem,
                        isItemSelected && baseStyles.selectedListItem,
                      ]}
                      onPress={() => {
                        if (!isArchived) {
                          toggleItemSelection(list.id, item.id);
                        }
                      }}
                      onLongPress={canAssign ? () => handleAssignItem(list.id, item) : undefined}
                      delayLongPress={500}
                      activeOpacity={isArchived ? 1 : 0.7}
                      disabled={isArchived}>
                      {/* Unified Checkbox - Selection or Completion */}
                      <TouchableOpacity
                        onPress={e => {
                          e.stopPropagation();
                          if (!isArchived) {
                            toggleItemSelection(list.id, item.id);
                          }
                        }}
                        style={baseStyles.checkboxContainer}>
                        <View
                          style={[
                            baseStyles.unifiedCheckbox,
                            isInSelectionMode
                              ? isItemSelected && baseStyles.unifiedCheckboxSelected
                              : item.completed && baseStyles.unifiedCheckboxCompleted,
                          ]}>
                          {(isInSelectionMode ? isItemSelected : item.completed) && (
                            <Typography style={baseStyles.unifiedCheckmark}>✓</Typography>
                          )}
                        </View>
                      </TouchableOpacity>

                      {/* Item Content */}
                      <View style={baseStyles.itemContent}>
                        <Typography
                          variant='body1'
                          color={
                            item.completed
                              ? safeTheme?.colors?.text?.secondary || '#666666'
                              : safeTheme?.colors?.text?.primary || '#000000'
                          }
                          style={[
                            baseStyles.expandedItemName,
                            item.completed && baseStyles.itemNameCompleted,
                          ]}>
                          {item.name}
                        </Typography>

                        <Typography
                          variant='caption'
                          color={safeTheme?.colors?.text?.secondary || '#666666'}>
                          {item.quantity} {item.unit} • {item.category.name}
                        </Typography>

                        {item.assignedTo && (
                          <View style={baseStyles.assignedInfo}>
                            <Typography
                              variant='caption'
                              color='#3B82F6'
                              style={baseStyles.assignedText}>
                              Assigned to {getUserName(item.assignedTo)}
                            </Typography>
                            <View style={baseStyles.assignedAvatar}>
                              {renderAvatar(getUserAvatar(item.assignedTo), 20)}
                            </View>
                          </View>
                        )}
                      </View>

                      {/* Assignment/Action Button */}
                      {canAssign && (
                        <TouchableOpacity
                          style={baseStyles.itemActionButton}
                          onPress={() => handleAssignItem(list.id, item)}>
                          <Typography
                            variant='caption'
                            color={safeTheme?.colors?.text?.secondary || '#666666'}>
                            ↻
                          </Typography>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>

            {/* Archived badge for collapsed archived lists */}
            {isArchived && !isExpanded && (
              <View style={baseStyles.archivedInfo}>
                <Typography
                  variant='caption'
                  color={safeTheme?.colors?.text?.secondary || '#666666'}
                  style={baseStyles.archivedText}>
                  📦 Archived
                </Typography>
              </View>
            )}
          </View>
        </View>
      );
    },
    [
      user,
      selectedList,
      handleAddContributor,
      userCurrency,
      getUserAvatar,
      getUserName,
      handleAssignItem,
      handleListSelection,
      handleViewArchivedList,
      renderAvatar,
      safeTheme?.colors,
      themedStyles.shopStyleProgressBar,
      themedStyles.shopStyleProgressFill,
      getSelectedItemsForList,
      handleBulkAssign,
      toggleItemSelection,
      getAnimatedValue,
    ]
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

  // Handle success animation complete
  // REMOVED: duplicate handleSuccessAnimationComplete

  // Modal render functions REMOVED - Now using extracted modal components

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        {/* Header */}
        <View style={baseStyles.header}>
          <Typography variant='h3' color={safeTheme.colors.text.primary}>
            Shopping Lists
          </Typography>
        </View>

        <ScrollView
          style={baseStyles.scrollView}
          contentContainerStyle={baseStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              tintColor={safeTheme.colors.primary['500']}
            />
          }>
          <View style={baseStyles.listsContainer}>
            {isLoading ? (
              <View style={baseStyles.loadingContainer}>
                <Typography
                  variant='body1'
                  color={safeTheme.colors.text.secondary}
                  style={baseStyles.loadingText}>
                  Loading your lists...
                </Typography>
              </View>
            ) : activeLists.length > 0 ? (
              activeLists.map(renderListCard)
            ) : (
              <View style={baseStyles.emptyContainer}>
                <Typography
                  variant='h3'
                  color={safeTheme.colors.text.secondary}
                  style={baseStyles.emptyTitle}>
                  No Lists Yet
                </Typography>
                <Typography
                  variant='body1'
                  color={safeTheme.colors.text.secondary}
                  style={baseStyles.emptyText}>
                  Create your first shopping list to get started!
                </Typography>
              </View>
            )}
          </View>

          {/* Add New List Button */}
          <View style={baseStyles.addButtonContainer}>
            <Button
              title='Create New List'
              variant='primary'
              size='md'
              onPress={onAddListPress || handleNavigateToCreateList}
              style={baseStyles.addButton}
            />
          </View>

          {/* Show Archived Lists Button */}
          {archivedCount > 0 && (
            <View style={baseStyles.archiveButtonContainer}>
              <Button
                title={`View ${archivedCount} Archived Lists`}
                variant='outline'
                size='md'
                onPress={() => navigation.navigate('ArchivedLists')}
                style={baseStyles.archiveButton}
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
              ? shoppingLists.find(list => list.id === selectedListForAssignment)?.collaborators ||
                []
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

        {/* Bulk Assignment Modal */}
        <AssignmentModal
          visible={showBulkAssignmentModal}
          onClose={() => {
            setShowBulkAssignmentModal(false);
            setBulkAssignmentListId(null);
          }}
          item={null} // No specific item for bulk assignment
          collaborators={
            bulkAssignmentListId
              ? shoppingLists.find(list => list.id === bulkAssignmentListId)?.collaborators || []
              : []
          }
          currentUserId={user?.id || ''}
          listOwnerId={
            bulkAssignmentListId
              ? shoppingLists.find(list => list.id === bulkAssignmentListId)?.ownerId || ''
              : ''
          }
          onAssign={handleBulkAssignToUser}
          onUnassign={() => {}} // No unassign for bulk
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
          onRemoveContributor={(friendId: string) =>
            handleRemoveContributorFromList(selectedListForContributor || '', friendId)
          }
          isLoading={false}
        />

        {/* Modals - Using extracted components */}
        <ArchivedListModal
          visible={showArchivedDetailModal}
          list={archivedListDetail}
          onClose={handleCloseArchivedModal}
        />

        <ListSuccessModal
          visible={showSuccessModal}
          message={successMessage}
          subtitle={successSubtitle}
          fadeAnim={successFadeAnim}
          scaleAnim={successScaleAnim}
          onClose={hideSuccessModalWithAnimation}
        />

        <ListErrorModal
          visible={showErrorModal}
          message={errorMessage}
          subtitle={errorSubtitle}
          fadeAnim={errorFadeAnim}
          scaleAnim={errorScaleAnim}
          onClose={hideErrorModalWithAnimation}
        />

        {/* List Creation Success Animation */}
        <ListCreationSuccessAnimation
          visible={showSuccessAnimation}
          onAnimationComplete={handleSuccessAnimationComplete}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};
