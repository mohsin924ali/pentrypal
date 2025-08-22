/**
 * Lists Screen
 * Shopping lists management with shared lists and item tracking
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { BottomNavigation } from '@/presentation/components/organisms';
import { AssignmentModal } from '@/presentation/components/molecules';
import type { NavigationTab } from '@/presentation/components/organisms';
import type { ShoppingList, Collaborator } from '@/application/store/slices/shoppingListsSlice';
import { addCollaborator, assignItemToUser, unassignItem, updateList, removeCollaborator } from '@/application/store/slices/shoppingListsSlice';
import type { Friend } from '@/shared/types';
import SocialService from '@/infrastructure/services/socialService';
import ShoppingListService from '@/infrastructure/services/shoppingListService';
import AuthService from '@/infrastructure/services/authService';
import NotificationService, { type Notification } from '@/infrastructure/services/notificationService';
import { getAvatarAsset, isValidAvatarIdentifier, isCustomImageUri } from '@/shared/utils/avatarUtils';
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/shared/utils/currencyUtils';

export interface ListsScreenProps {
  onAddListPress: () => void;
  onEditListPress: (list: ShoppingList) => void;
  onNavigationTabPress: (tab: NavigationTab) => void;
  shoppingLists: ShoppingList[];
  isLoading?: boolean;
  currentUser?: any;
}

export const ListsScreen: React.FC<ListsScreenProps> = ({
  onAddListPress,
  onEditListPress,
  onNavigationTabPress,
  shoppingLists,
  isLoading = false,
  currentUser,
}) => {
  const dispatch = useDispatch();
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [showAddContributorModal, setShowAddContributorModal] = useState(false);
  const [selectedListForContributor, setSelectedListForContributor] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  
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

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Assignment state
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedItemForAssignment, setSelectedItemForAssignment] = useState<any>(null);
  const [selectedListForAssignment, setSelectedListForAssignment] = useState<string | null>(null);

  // Archive state
  const [showArchivedLists, setShowArchivedLists] = useState(false);
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

  // Load user currency preference
  useEffect(() => {
    const loadUserCurrency = async () => {
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user) {
          const profile = await AuthService.getUserProfile(session.user.id);
          if (profile?.preferences?.currency) {
            setUserCurrency(profile.preferences.currency);
          }
        }
      } catch (error) {
        console.error('Error loading user currency:', error);
      }
    };
    
    loadUserCurrency();
  }, [currentUser]);

  // Sync current user with social service
  useEffect(() => {
    const syncCurrentUser = async () => {
      if (currentUser) {
        try {
          await SocialService.setCurrentUser(currentUser.id);
        } catch (error) {
          console.error('Error syncing current user with social service:', error);
        }
      }
    };
    
    syncCurrentUser();
  }, [currentUser]);

  const loadFriends = useCallback(async () => {
    try {
      setIsLoadingFriends(true);
      console.log('Loading fresh friends data...');
      const friendsData = await SocialService.getFriends();
      
      console.log('Fresh friends data loaded:', friendsData.length, 'friends');
      friendsData.forEach(friend => {
        console.log(`Friend: ${friend.name} (${friend.email}) - Avatar: ${friend.avatar}`);
      });
      
      console.log('Setting friends state with fresh data...');
      setFriends(friendsData);
      console.log('Friends state updated successfully');
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends. Please try again.');
    } finally {
      setIsLoadingFriends(false);
    }
  }, []);

  // Load friends when modal opens
  useEffect(() => {
    if (showAddContributorModal) {
      loadFriends();
    }
  }, [showAddContributorModal, loadFriends]);

  // Refresh friends when current user changes (e.g., after profile updates)
  useEffect(() => {
    if (currentUser) {
      // Force a fresh load of friends data to ensure updated avatars are displayed
      console.log('Refreshing friends data due to current user change');
      loadFriends();
    }
  }, [currentUser, loadFriends]);

  // Subscribe to notifications
  useEffect(() => {
    const updateNotifications = (notificationList: Notification[]) => {
      setNotifications(notificationList);
      setUnreadCount(notificationList.filter(n => !n.isRead).length);
    };

    // Subscribe to updates from global service
    const unsubscribe = NotificationService.subscribe(updateNotifications);

    return unsubscribe;
  }, []);

  const handleAddContributor = useCallback((listId: string) => {
    setSelectedListForContributor(listId);
    setShowAddContributorModal(true);
  }, []);

  // Assignment functions
  const handleAssignItem = (listId: string, item: any) => {
    const list = shoppingLists.find(l => l.id === listId);
    console.log('=== ASSIGNMENT MODAL DEBUG ===');
    console.log('Opening assignment modal for item:', item.name);
    console.log('Current user:', { id: currentUser?.id, name: currentUser?.name });
    console.log('List owner:', { id: list?.ownerId, name: list?.ownerName });
    console.log('List collaborators:', list?.collaborators);
    console.log('Collaborators count:', list?.collaborators?.length);
    
    // Check each collaborator
    list?.collaborators?.forEach((collab, index) => {
      console.log(`Collaborator ${index}:`, {
        userId: (collab as any).userId,
        id: (collab as any).id,
        name: collab.name,
        role: (collab as any).role
      });
    });
    
    setSelectedListForAssignment(listId);
    setSelectedItemForAssignment(item);
    setShowAssignmentModal(true);
  };

  const handleAssignToUser = async (itemId: string, userId: string) => {
    if (!selectedListForAssignment) return;
    
    console.log(`Assigning item ${itemId} to user ${userId} in list ${selectedListForAssignment}`);
    
    try {
      // Update the service layer first
      const currentList = shoppingLists.find(list => list.id === selectedListForAssignment);
      if (!currentList) {
        throw new Error('List not found');
      }
      
      // Update the item assignment in the service
      const updatedItems = currentList.items.map(item =>
        item.id === itemId ? { ...item, assignedTo: userId } : item
      );
      
      const updatedList = await ShoppingListService.updateList(selectedListForAssignment, {
        items: updatedItems
      });
      
      // Dispatch to Redux to update the state
      dispatch(assignItemToUser({
        listId: selectedListForAssignment,
        itemId: itemId,
        userId: userId,
      }));
      
      // Show success message
      setSuccessMessage('Item Assigned');
      setSuccessSubtitle('Item has been successfully assigned');
      showSuccessModalWithAnimation();
      
      // Close the assignment modal
      setShowAssignmentModal(false);
      
      // Auto-hide success message
      setTimeout(hideSuccessModalWithAnimation, 2000);
    } catch (error) {
      console.error('Error assigning item:', error);
      setErrorMessage('Assignment Failed');
      setErrorSubtitle('Failed to assign item. Please try again.');
      showErrorModalWithAnimation();
      setTimeout(hideErrorModalWithAnimation, 3000);
    }
  };

  const handleUnassignItem = async (itemId: string) => {
    if (!selectedListForAssignment) return;
    
    console.log(`Unassigning item ${itemId} from list ${selectedListForAssignment}`);
    
    try {
      // Update the service layer first
      const currentList = shoppingLists.find(list => list.id === selectedListForAssignment);
      if (!currentList) {
        throw new Error('List not found');
      }
      
      // Update the item assignment in the service
      const updatedItems = currentList.items.map(item =>
        item.id === itemId ? { ...item, assignedTo: undefined } : item
      );
      
      const updatedList = await ShoppingListService.updateList(selectedListForAssignment, {
        items: updatedItems
      });
      
      // Dispatch to Redux to update the state
      dispatch(unassignItem({
        listId: selectedListForAssignment,
        itemId: itemId,
      }));
      
      // Show success message
      setSuccessMessage('Item Unassigned');
      setSuccessSubtitle('Item assignment has been removed');
      showSuccessModalWithAnimation();
      
      // Close the assignment modal
      setShowAssignmentModal(false);
      
      // Auto-hide success message
      setTimeout(hideSuccessModalWithAnimation, 2000);
    } catch (error) {
      console.error('Error unassigning item:', error);
      setErrorMessage('Unassignment Failed');
      setErrorSubtitle('Failed to unassign item. Please try again.');
      showErrorModalWithAnimation();
      setTimeout(hideErrorModalWithAnimation, 3000);
    }
  };

  const getUserName = (userId: string): string => {
    // In a real app, this would look up user info from a service or store
    if (userId === currentUser?.id) return 'You';
    
    // Look up in collaborators from all lists
    for (const list of shoppingLists) {
      const collaborator = list.collaborators.find(c => c.userId === userId);
      if (collaborator) return collaborator.name;
    }
    
    // Look up in friends list
    const friend = friends.find(f => f.id === userId);
    if (friend) return friend.name;
    
    // Fallback
    return 'Unknown User';
  };

  const getUserAvatar = (userId: string) => {
    console.log(`getUserAvatar called for userId: ${userId}`);
    console.log(`Current friends state has ${friends.length} friends:`, friends.map(f => ({ id: f.id, email: f.email, avatar: f.avatar })));
    
    // First check if it's the current user
    if (currentUser && currentUser.id === userId) {
      const avatarData = currentUser.avatar;
      console.log(`Found current user avatar: ${avatarData}`);
      
      if (isValidAvatarIdentifier(avatarData)) {
        return getAvatarAsset(avatarData);
      }
      
      if (isCustomImageUri(avatarData)) {
        return avatarData;
      }
      
      return avatarData || '👤';
    }
    
    // Look up in collaborators from all lists
    for (const list of shoppingLists) {
      const collaborator = list.collaborators.find(c => c.userId === userId);
      if (collaborator) {
        const avatarData = collaborator.avatar;
        console.log(`Found collaborator avatar: ${avatarData}`);
        
        if (isValidAvatarIdentifier(avatarData)) {
          return getAvatarAsset(avatarData);
        }
        
        if (isCustomImageUri(avatarData)) {
          return avatarData;
        }
        
        return avatarData || '👤';
      }
    }
    
    // Look up in friends list by ID
    const friendById = friends.find(f => f.id === userId);
    if (friendById) {
      const avatarData = friendById.avatar;
      console.log(`Found friend by ID avatar: ${avatarData}`);
      
      if (isValidAvatarIdentifier(avatarData)) {
        return getAvatarAsset(avatarData);
      }
      
      if (isCustomImageUri(avatarData)) {
        return avatarData;
      }
      
      return avatarData || '👤';
    }
    
    // Look up in friends list by email
    const friendByEmail = friends.find(f => f.email === userId);
    if (friendByEmail) {
      const avatarData = friendByEmail.avatar;
      console.log(`Found friend by email avatar: ${avatarData}`);
      
      if (isValidAvatarIdentifier(avatarData)) {
        return getAvatarAsset(avatarData);
      }
      
      if (isCustomImageUri(avatarData)) {
        return avatarData;
      }
      
      return avatarData || '👤';
    }
    
    console.log(`No avatar found for userId: ${userId}, returning fallback`);
    // Fallback
    return '👤';
  };

  // No more adapter functions needed - single source of truth! 🎯

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

  // Check if a friend is already a contributor to the selected list
  const isFriendContributor = useCallback((friend: Friend, listId: string | null): boolean => {
    if (!listId) return false;
    const list = shoppingLists.find(l => l.id === listId);
    if (!list) return false;
    
    // Check if friend is already a contributor
    return list.collaborators.some(collaborator => {
      // Check by name (works for existing data)
      return collaborator.name === friend.name;
    });
  }, [shoppingLists]);

  // Get the actual user ID for a friend (same logic used in add/remove)
  const getFriendUserId = useCallback(async (friend: Friend): Promise<string> => {
    let actualUserId = friend.id;
    try {
      const authUser = await AuthService.getUserByEmail(friend.email);
      if (authUser) {
        actualUserId = authUser.id;
      }
    } catch (error) {
      console.error('Error looking up auth user:', error);
    }
    return actualUserId;
  }, []);

  // Handle removing a contributor
  const handleRemoveContributor = useCallback(async (friend: Friend) => {
    if (!selectedListForContributor) return;
    
    try {
      // Get current list from Redux
      const currentList = shoppingLists.find(l => l.id === selectedListForContributor);
      if (!currentList) {
        throw new Error('List not found');
      }
      
      // Get the actual user ID for the friend (same logic as adding)
      const actualUserId = await getFriendUserId(friend);
      
      // Use the dedicated service method to remove contributor
      const updatedList = await ShoppingListService.removeContributor(selectedListForContributor, actualUserId);
      
      // Update Redux with the result from service
      dispatch(updateList({ 
        id: selectedListForContributor, 
        updates: { collaborators: updatedList.collaborators } 
      }));
      
      // Close the add contributor modal first
      setShowAddContributorModal(false);
      setSelectedListForContributor(null);
      
      // Show success modal
      setSuccessMessage(`${friend.name} Removed Successfully!`);
      setSuccessSubtitle(`${friend.name} has been removed as a contributor from this list.`);
      showSuccessModalWithAnimation();
      
    } catch (error) {
      console.error('Error removing contributor:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to remove contributor';
      
      // Close the add contributor modal first
      setShowAddContributorModal(false);
      setSelectedListForContributor(null);
      
      // Show error modal
      setErrorMessage('Unable to Remove Contributor');
      setErrorSubtitle(`Failed to remove ${friend.name} as a contributor. Please try again.`);
      showErrorModalWithAnimation();
    }
  }, [selectedListForContributor, dispatch]);

  const handleSelectFriend = useCallback(async (friend: Friend) => {
    if (!selectedListForContributor) return;

    try {
      // Get the actual user ID for the friend
      const actualUserId = await getFriendUserId(friend);
      
      // Create contributor object with safe property extraction
      const contributor = {
        userId: String(actualUserId || friend.id || ''),
        name: String(friend.name || ''),
        avatar: String(friend.avatar || '👤'),
        listId: selectedListForContributor,
        role: 'editor' as const,
        permissions: ['read', 'write'],
        invitedAt: new Date().toISOString(),
        acceptedAt: new Date().toISOString(),
      };
      
      // Get current list from Redux
      const currentList = shoppingLists.find(l => l.id === selectedListForContributor);
      if (!currentList) {
        throw new Error('List not found');
      }
      
      // Use the dedicated service method to add contributor
      const updatedList = await ShoppingListService.addContributor(selectedListForContributor, contributor);
      
      // Update Redux with the result from service
      dispatch(updateList({ 
        id: selectedListForContributor, 
        updates: { collaborators: updatedList.collaborators } 
      }));
      
      // Send notifications
      // Get current user ID before switching context
      const currentUserId = NotificationService.getCurrentUserId();
      
      // Send notification to the contributor
      NotificationService.setCurrentUser(actualUserId);
      NotificationService.notifyListShared(currentList.name, currentUser?.name || 'Someone');
      
      // Switch back to current user and notify them
      if (currentUserId) {
        NotificationService.setCurrentUser(currentUserId);
      }
      NotificationService.notifyContributorAdded(currentList.name, friend.name);
      
      // Close the add contributor modal first
      setShowAddContributorModal(false);
      setSelectedListForContributor(null);
      
      // Show success modal
      setSuccessMessage(`${friend.name} Added Successfully!`);
      setSuccessSubtitle(`${friend.name} has been added as a contributor to this list and can now view and edit it.`);
      showSuccessModalWithAnimation();
      
    } catch (error) {
      console.error('Error adding contributor:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to add contributor';
      
      // Close the add contributor modal first
      setShowAddContributorModal(false);
      setSelectedListForContributor(null);
      
      // Show error modal
      setErrorMessage('Unable to Add Contributor');
      setErrorSubtitle(errorMsg === 'User is already a contributor to this list' 
        ? `${friend.name} is already a contributor to this list.` 
        : `Failed to add ${friend.name} as a contributor. Please try again.`);
      showErrorModalWithAnimation();
    }
  }, [selectedListForContributor, dispatch, currentUser]);

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

  // Helper function to resolve actual owner name dynamically
  const resolveOwnerName = (list: ShoppingList): string => {
    // If the list owner ID matches current user ID, return current user's name
    if (currentUser && list.ownerId === currentUser.id) {
      return currentUser.name || currentUser.email || 'You';
    }
    
    // If ownerName is generic, try to resolve from collaborators or context
    if (list.ownerName === 'Current User' || list.ownerName === 'You') {
      // Look for the actual owner in the collaborators list
      // The owner should be the person who is not the current viewer
      const ownerCollaborator = list.collaborators.find(c => 
        c.id !== currentUser?.id && 
        c.name !== 'You' && 
        c.name !== currentUser?.name
      );
      
      if (ownerCollaborator) {
        return ownerCollaborator.name;
      }
      
      // If we can't resolve from collaborators, but we know the list is shared,
      // it means the owner is someone else. Use a more specific approach.
      // Check if current user is viewing a shared list (more than 1 collaborator)
      if (list.collaborators.length > 1) {
        // Find the collaborator who is likely the owner (not current user)
        const potentialOwner = list.collaborators.find(c => 
          c.id !== currentUser?.id && c.name !== 'You'
        );
        if (potentialOwner) {
          return potentialOwner.name;
        }
      }
      
      // Fallback: if current user is viewing their own list, return their name
      if (currentUser) {
        return currentUser.name || currentUser.email || 'You';
      }
    }
    
    // Return the original owner name if it's already meaningful
    return list.ownerName || 'Unknown';
  };

  // Helper functions for filtering lists
  const getActiveLists = () => shoppingLists.filter(list => list.status !== 'archived');
  const getArchivedLists = () => shoppingLists.filter(list => list.status === 'archived');
  const archivedCount = getArchivedLists().length;

  const renderHeader = () => (
    <View style={styles.header}>
      <Typography
        variant="h2"
        color={Theme.colors.text.primary}
        style={styles.headerTitle}
      >
        Shopping Lists
      </Typography>

      <View style={styles.headerRightSection}>
        <TouchableOpacity
          onPress={() => setShowNotificationsModal(true)}
          style={styles.notificationButton}
          accessibilityRole="button"
          accessibilityLabel="View notifications"
        >
          <Typography variant="h3" color={Theme.colors.text.primary}>
            🔔
          </Typography>
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Typography variant="caption" style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={onAddListPress}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Add new list"
        >
          <Typography variant="h3" color={Theme.colors.primary[500]}>
            +
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderListCard = useCallback((list: ShoppingList) => {
    const isShared = list.collaborators.length > 1;
    const timeAgo = getTimeAgo(list.createdAt);
    const isArchived = list.status === 'archived';

    
    return (
      <View key={list.id} style={styles.listCardContainer}>

        
        <TouchableOpacity
          style={[styles.listCard, isArchived && styles.archivedListCard]}
          onPress={isArchived ? undefined : () => setSelectedList(selectedList === list.id ? null : list.id)}
          accessibilityRole="button"
          accessibilityLabel={isArchived ? `View archived ${list.name} list` : `Open ${list.name} list`}
          activeOpacity={isArchived ? 1 : 0.8}
          disabled={isArchived}
        >
          <View style={styles.listHeader}>
            <View style={styles.listInfo}>
              <View style={styles.listTitleRow}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.primary}
                  style={styles.listTitle}
                >
                  {list.name}
                </Typography>
                {isShared && (
                  <Typography
                    variant="caption"
                    color={Theme.colors.text.secondary}
                    style={styles.sharedText}
                  >
                    Shared
                  </Typography>
                )}
              </View>
              
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                style={styles.listSubtitle}
              >
                {list.completedCount || 0} of {list.itemsCount || 0} items completed
              </Typography>
              
              {list.totalSpent > 0 && (
                <Typography
                  variant="caption"
                  color="#16a34a"
                  style={styles.totalSpent}
                >
                  💰 Total spent: {formatCurrency(list.totalSpent, userCurrency)}
                </Typography>
              )}
              
              {(() => {
                // If current user is not the owner, show who created it
                if (list.ownerId !== currentUser?.id && list.ownerName && list.ownerName !== 'You') {
                  return (
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.tertiary}
                      style={styles.ownerInfo}
                    >
                      📝 Created by {list.ownerName}
                    </Typography>
                  );
                }
                
                // Don't show "Created by You" for own lists
                return null;
              })()}
              
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
                style={styles.lastUpdated}
              >
                Created {timeAgo}
              </Typography>
            </View>

            <View style={styles.rightSection}>
              {!isArchived && (
                <TouchableOpacity
                  style={styles.addContributorButton}
                  onPress={(event) => {
                    event.stopPropagation();
                    handleAddContributor(list.id);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Add contributor"
                >
                  <Typography
                    variant="caption"
                    color={Theme.colors.primary[500]}
                    style={styles.addContributorText}
                  >
                    📤 Share
                  </Typography>
                </TouchableOpacity>
              )}
              {isArchived && (
                <View style={styles.archivedBadge}>
                  <Typography
                    variant="caption"
                    color={Theme.colors.text.secondary}
                    style={styles.archivedText}
                  >
                    📦 Archived
                  </Typography>
                </View>
              )}
            </View>
          </View>

          {/* Enhanced Progress Bar with Percentage Inside */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${list.progress || 0}%` }
                ]}
              />
              <View style={styles.progressTextContainer}>
                <Typography
                  variant="caption"
                  color={(list.progress || 0) > 50 ? Theme.colors.background.primary : Theme.colors.text.secondary}
                  style={styles.progressText}
                >
                  {list.progress || 0}% completed
                </Typography>
              </View>
            </View>
          </View>

          {/* Collaborators */}
          {list.collaborators.length > 0 && (
            <View style={styles.collaboratorsSection}>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
                style={styles.collaboratorsLabel}
              >
                Collaborators:
              </Typography>
              <View style={styles.collaboratorsList}>
              {list.collaborators
                .filter((collaborator, index, array) => {
                  // Always keep "You" entries
                  if (collaborator.name === 'You') {
                    return true;
                  }
                  
                  // If current user appears by their actual name AND there's also a "You" entry, remove the name entry
                  if (currentUser && collaborator.name === currentUser.name) {
                    const hasYouEntry = array.some(c => c.name === 'You');
                    return !hasYouEntry; // Only keep this if there's no "You" entry
                  }
                  
                  return true; // Keep all other entries (other collaborators)
                })
                .map((collaborator, index) => {
                let displayName = collaborator.name;
                const userId = (collaborator as any).userId || (collaborator as any).id;
                
                // Try to get avatar by email first, then by ID
                let avatar = getUserAvatar(collaborator.email);
                if (!avatar || avatar === '👤') {
                  avatar = getUserAvatar(userId);
                }
                
                if (collaborator.name === 'You') {
                  // This is definitely the current user
                  displayName = 'You';
                } else {
                  // This is another collaborator - show their name
                  displayName = collaborator.name;
                }
                

                
                return (
                  <View key={`${collaborator.id}-${index}`} style={styles.collaboratorChip}>
                    <View style={styles.collaboratorAvatarContainer}>
                      {(() => {
                        // Check if it's a require() result (number) - treat as local asset
                        if (typeof avatar === 'number') {
                          return (
                            <Image 
                              source={avatar} 
                              style={styles.collaboratorAvatarImage}
                            />
                          );
                        }
                        
                        // Check if it's an asset (object)
                        if (typeof avatar === 'object') {
                          return (
                            <Image 
                              source={avatar} 
                              style={styles.collaboratorAvatarImage}
                            />
                          );
                        }
                        
                        // Check if it's a custom image URI
                        if (typeof avatar === 'string' && isCustomImageUri(avatar)) {
                          return (
                            <Image 
                              key={`collaborator-avatar-${collaborator.userId}-${avatar}`}
                              source={{ uri: avatar }} 
                              style={styles.collaboratorAvatarImage}
                            />
                          );
                        }
                        
                        // Fallback to emoji/text
                        return (
                          <Typography
                            variant="caption"
                            color={Theme.colors.text.primary}
                            style={styles.collaboratorAvatarText}
                          >
                            {avatar || '👤'}
                          </Typography>
                        );
                      })()}
                    </View>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.primary}
                    >
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
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.itemsTitle}
            >
              Items:
            </Typography>
            {list.items.map((item) => {
              const isOwner = currentUser?.id === list.ownerId;
              const canAssign = !isArchived && (isOwner || item.assignedTo === currentUser?.id || !item.assignedTo);
              
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.listItem,
                    item.assignedTo && styles.listItemAssigned,
                    isArchived && styles.archivedListItem
                  ]}
                  onLongPress={canAssign ? () => handleAssignItem(list.id, item) : undefined}
                  delayLongPress={500}
                  activeOpacity={isArchived ? 1 : 0.7}
                  disabled={isArchived}
                >
                  <View style={styles.itemLeft}>
                    <View style={[
                      styles.checkbox,
                      item.completed && styles.checkboxCompleted
                    ]}>
                      {item.completed && (
                        <Typography
                          variant="caption"
                          color={Theme.colors.background.primary}
                        >
                          ✓
                        </Typography>
                      )}
                    </View>
                    <View style={styles.itemInfo}>
                      <Typography
                        variant="body"
                        color={item.completed ? Theme.colors.text.secondary : Theme.colors.text.primary}
                        style={[
                          styles.itemName,
                          item.completed && styles.itemNameCompleted
                        ]}
                      >
                        {item.icon} {item.name}
                      </Typography>
                      <View style={styles.itemDetails}>
                        <Typography
                          variant="caption"
                          color={Theme.colors.text.secondary}
                        >
                          {item.quantity} {item.unit} • {item.category.name}
                        </Typography>
                        {item.assignedTo && (
                          <View style={styles.assignmentRow}>
                            <Typography
                              variant="caption"
                              color="#3B82F6"
                              style={styles.assignmentIndicator}
                            >
                              • Assigned to {getUserName(item.assignedTo)}
                            </Typography>
                            <View style={styles.assignedAvatarInline}>
                              {(() => {
                                const avatar = getUserAvatar(item.assignedTo);
                                
                                // Check if it's an asset (object)
                                if (typeof avatar === 'object') {
                                  return (
                                    <Image 
                                      source={avatar} 
                                      style={styles.assignedAvatarImageInline}
                                    />
                                  );
                                }
                                
                                // Check if it's a require() result (number) - treat as local asset
                                if (typeof avatar === 'number') {
                                  return (
                                    <Image 
                                      source={avatar} 
                                      style={styles.assignedAvatarImageInline}
                                    />
                                  );
                                }
                                
                                // Check if it's a custom image URI
                                if (typeof avatar === 'string' && isCustomImageUri(avatar)) {
                                  return (
                                    <Image 
                                      key={`assigned-inline-avatar-${item.assignedTo}-${avatar}`}
                                      source={{ uri: avatar }} 
                                      style={styles.assignedAvatarImageInline}
                                    />
                                  );
                                }
                                
                                // Fallback to emoji/text
                                return (
                                  <Typography
                                    variant="caption"
                                    color={Theme.colors.background.primary}
                                    style={styles.assignedAvatarTextInline}
                                  >
                                    {avatar}
                                  </Typography>
                                );
                              })()}
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {canAssign && (
                    <TouchableOpacity
                      style={styles.assignButton}
                      onPress={() => handleAssignItem(list.id, item)}
                    >
                      <Typography
                        variant="caption"
                        color={Theme.colors.primary}
                      >
                        {item.assignedTo ? '↻' : '+'}
                      </Typography>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
            
            {/* Edit button - only show for lists owned by current user */}
            {!isArchived && currentUser?.id === list.ownerId && (
              <View style={styles.editButtonContainer}>
                <Button
                  title="✏️ Edit List"
                  variant="primary"
                  size="medium"
                  onPress={() => onEditListPress(list)}
                  style={styles.editButton}
                />
              </View>
            )}
          </View>
        )}
        </TouchableOpacity>
      </View>
    );
  }, [currentUser, friends, selectedList, handleAddContributor]);

  const renderFriendsModal = () => {
    return (
    <Modal
      visible={showAddContributorModal}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.modalTitle}
            >
              Add Contributor
            </Typography>
            <TouchableOpacity
              onPress={() => {
                setShowAddContributorModal(false);
                setSelectedListForContributor(null);
              }}
              style={styles.modalCloseButton}
            >
              <Typography variant="h3" color={Theme.colors.text.secondary}>
                ✕
              </Typography>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {isLoadingFriends ? (
              <View style={styles.modalLoadingContainer}>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.modalLoadingText}
                >
                  Loading your friends...
                </Typography>
              </View>
            ) : friends && friends.length > 0 ? (
              friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={styles.friendItem}
                  onPress={() => handleSelectFriend(friend)}
                >
                  <View style={styles.friendInfo}>
                    <View style={styles.friendAvatar}>
                      {(() => {
                        // Try to get avatar by email first, then by ID
                        let avatar = getUserAvatar(friend.email);
                        if (!avatar || avatar === '👤') {
                          avatar = getUserAvatar(friend.id);
                        }
                        
                        // Check if it's a require() result (number) - treat as local asset
                        if (typeof avatar === 'number') {
                          return (
                            <Image 
                              key={`avatar-${friend.id}-${avatar}`}
                              source={avatar} 
                              style={styles.friendAvatarImage}
                            />
                          );
                        }
                        
                        // Check if it's an asset (object)
                        if (typeof avatar === 'object') {
                          return (
                            <Image 
                              key={`avatar-${friend.id}-${JSON.stringify(avatar)}`}
                              source={avatar} 
                              style={styles.friendAvatarImage}
                            />
                          );
                        }
                        
                        // Check if it's a custom image URI
                        if (typeof avatar === 'string' && isCustomImageUri(avatar)) {
                          return (
                            <Image 
                              key={`avatar-${friend.id}-${avatar}`}
                              source={{ uri: avatar }} 
                              style={styles.friendAvatarImage}
                            />
                          );
                        }
                        
                        // Fallback to emoji/text
                        return (
                          <Typography variant="h3" color={Theme.colors.text.primary}>
                            {avatar || '👤'}
                          </Typography>
                        );
                      })()}
                    </View>
                    <View style={styles.friendDetails}>
                      <Typography
                        variant="body"
                        color={Theme.colors.text.primary}
                        style={styles.friendName}
                      >
                        {friend.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        color={Theme.colors.text.secondary}
                      >
                        {friend.email}
                      </Typography>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const isContributor = isFriendContributor(friend, selectedListForContributor);
                      if (isContributor) {
                        handleRemoveContributor(friend);
                      } else {
                        handleSelectFriend(friend);
                      }
                    }}
                    style={[
                      styles.friendActionButton,
                      isFriendContributor(friend, selectedListForContributor) && styles.removeButton
                    ]}
                  >
                    <Typography
                      variant="caption"
                      color={Theme.colors.background.primary}
                      style={styles.addButtonText}
                    >
                      {isFriendContributor(friend, selectedListForContributor) ? 'Remove' : 'Add'}
                    </Typography>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.modalEmptyContainer}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.modalEmptyTitle}
                >
                  No Friends Yet
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.modalEmptyText}
                >
                  Add friends in the Community tab to share lists with them!
                </Typography>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
    );
  };

  const renderSuccessModal = () => (
    <Modal
      visible={showSuccessModal}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.successModalOverlay}>
        <Animated.View
          style={[
            styles.successModalContainer,
            {
              opacity: successFadeAnim,
              transform: [{ scale: successScaleAnim }],
            },
          ]}
        >
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <Typography variant="h1" style={styles.successIcon}>
              🎉
            </Typography>
          </View>

          {/* Success Message */}
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.successTitle}
          >
            {successMessage}
          </Typography>

          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            style={styles.successSubtitle}
          >
            {successSubtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.successButton}
            onPress={hideSuccessModalWithAnimation}
            activeOpacity={0.8}
          >
            <Typography
              variant="body"
              style={styles.successButtonText}
            >
              Great!
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderErrorModal = () => (
    <Modal
      visible={showErrorModal}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.errorModalOverlay}>
        <Animated.View
          style={[
            styles.errorModalContainer,
            {
              opacity: errorFadeAnim,
              transform: [{ scale: errorScaleAnim }],
            },
          ]}
        >
          {/* Error Icon */}
          <View style={styles.errorIconContainer}>
            <Typography variant="h1" style={styles.errorIcon}>
              ⚠️
            </Typography>
          </View>

          {/* Error Message */}
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.errorTitle}
          >
            {errorMessage}
          </Typography>

          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            style={styles.errorSubtitle}
          >
            {errorSubtitle}
          </Typography>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.errorButton}
            onPress={hideErrorModalWithAnimation}
            activeOpacity={0.8}
          >
            <Typography
              variant="body"
              style={styles.errorButtonText}
            >
              Try Again
            </Typography>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return '👥';
      case 'list_shared': return '📋';
      case 'list_activity': return '✅';
      default: return '📢';
    }
  };

  const getTimeAgoFromTimestamp = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotificationsModal = () => (
    <Modal
      visible={showNotificationsModal}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true}
    >
      <View style={styles.notificationModalOverlay}>
        <View style={styles.notificationModalContainer}>
          <View style={styles.notificationModalHeader}>
            <Typography
              variant="h3"
              color={Theme.colors.text.primary}
              style={styles.notificationModalTitle}
            >
              Notifications
            </Typography>
            <View style={styles.notificationHeaderActions}>
              {notifications.some(n => !n.isRead) && (
                <TouchableOpacity
                  onPress={() => NotificationService.markAllAsRead()}
                  style={styles.markAllReadButton}
                >
                  <Typography
                    variant="caption"
                    color={Theme.colors.primary[500]}
                    style={styles.markAllReadText}
                  >
                    Mark all read
                  </Typography>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => setShowNotificationsModal(false)}
                style={styles.notificationModalCloseButton}
              >
                <Typography variant="h3" color={Theme.colors.text.secondary}>
                  ✕
                </Typography>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.notificationModalContent}>
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationItem,
                    !notification.isRead && styles.notificationItemUnread
                  ]}
                  onPress={() => {
                    NotificationService.markAsRead(notification.id);
                    // You can add navigation logic here based on notification type
                  }}
                >
                  <View style={styles.notificationIconContainer}>
                    <Typography variant="h3" style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </Typography>
                    {notification.priority === 'high' && (
                      <View style={styles.priorityIndicator} />
                    )}
                  </View>
                  
                  <View style={styles.notificationContent}>
                    <Typography
                      variant="body"
                      color={Theme.colors.text.primary}
                      style={styles.notificationTitle}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.secondary}
                      style={styles.notificationMessage}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.secondary}
                      style={styles.notificationTime}
                    >
                      {getTimeAgoFromTimestamp(notification.timestamp)}
                    </Typography>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      NotificationService.deleteNotification(notification.id);
                    }}
                    style={styles.deleteNotificationButton}
                  >
                    <Typography variant="caption" color={Theme.colors.text.secondary}>
                      ✕
                    </Typography>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyNotificationsContainer}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyNotificationsTitle}
                >
                  No Notifications
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyNotificationsText}
                >
                  You're all caught up! Notifications about friend requests, list sharing, and activities will appear here.
                </Typography>
              </View>
            )}

            {notifications.length > 0 && (
              <View style={styles.clearAllContainer}>
                <TouchableOpacity
                  onPress={() => {
                    NotificationService.clearAll();
                    setShowNotificationsModal(false);
                  }}
                  style={styles.clearAllButton}
                >
                  <Typography
                    variant="caption"
                    color="#ef4444"
                    style={styles.clearAllText}
                  >
                    Clear All Notifications
                  </Typography>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
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
      >
        <View style={styles.listsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                style={styles.loadingText}
              >
                Loading your lists...
              </Typography>
            </View>
          ) : showArchivedLists ? (
            getArchivedLists().length > 0 ? (
              getArchivedLists().map(renderListCard)
            ) : (
              <View style={styles.emptyContainer}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyTitle}
                >
                  No Archived Lists
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyText}
                >
                  Archived lists will appear here when you finish shopping.
                </Typography>
              </View>
            )
          ) : getActiveLists().length > 0 ? (
            getActiveLists().map(renderListCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Typography
                variant="h3"
                color={Theme.colors.text.secondary}
                style={styles.emptyTitle}
              >
                No Lists Yet
              </Typography>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
                style={styles.emptyText}
              >
                Create your first shopping list to get started!
              </Typography>
            </View>
          )}
        </View>

        {/* Add New List Button */}
        <View style={styles.addButtonContainer}>
          <Button
            title="Create New List"
            variant="primary"
            size="medium"
            onPress={onAddListPress}
            style={styles.addButton}
          />
        </View>

        {/* Show Archived Lists Button */}
        {archivedCount > 0 && (
          <View style={styles.archiveButtonContainer}>
            <Button
              title={showArchivedLists ? "Show Active Lists" : `Show ${archivedCount} Archived Lists`}
              variant="outline"
              size="medium"
              onPress={() => setShowArchivedLists(!showArchivedLists)}
              style={styles.archiveButton}
            />
          </View>
        )}
      </ScrollView>



      <BottomNavigation
        activeTab="lists"
        onTabPress={onNavigationTabPress}
      />

      {renderFriendsModal()}
      {renderSuccessModal()}
      {renderErrorModal()}
      {renderNotificationsModal()}
      
      {/* Assignment Modal */}
      <AssignmentModal
        visible={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          setSelectedItemForAssignment(null);
          setSelectedListForAssignment(null);
        }}
        item={selectedItemForAssignment}
        collaborators={selectedListForAssignment ? 
          shoppingLists.find(list => list.id === selectedListForAssignment)?.collaborators || [] : []}
        currentUserId={currentUser?.id || ''}
        listOwnerId={selectedListForAssignment ? 
          shoppingLists.find(list => list.id === selectedListForAssignment)?.ownerId || '' : ''}
        onAssign={handleAssignToUser}
        onUnassign={handleUnassignItem}
        getUserName={getUserName}
        getUserAvatar={getUserAvatar}
      />
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  } as ViewStyle,

  header: {
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
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

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  listsContainer: {
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  listCardContainer: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  listCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing['2xl'],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  } as ViewStyle,

  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  listInfo: {
    flex: 1,
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  listTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  listTitle: {
    fontWeight: '700',
    marginRight: Theme.spacing.sm,
  } as ViewStyle,

  sharedText: {
    fontSize: 11,
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  listSubtitle: {
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  totalSpent: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  ownerInfo: {
    fontSize: 11,
    marginBottom: Theme.spacing.xs,
    fontStyle: 'italic',
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
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xs,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Theme.colors.primary[500],
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
    marginTop: Theme.spacing.md,
    paddingTop: Theme.spacing.md,
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
    marginBottom: Theme.spacing.md,
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
    minWidth: 2, // Ensure some visibility even at 0%
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
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  collaboratorsLabel: {
    marginBottom: Theme.spacing.xs,
    fontWeight: '500',
  } as ViewStyle,

  collaboratorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  } as ViewStyle,

  collaboratorChip: {
    backgroundColor: '#F0F4F2',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  } as ViewStyle,

  collaboratorAvatarContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  } as ViewStyle,

  collaboratorAvatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  } as ViewStyle,

  collaboratorAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  listItems: {
    borderTopWidth: 1,
    borderTopColor: '#F0F4F2',
    paddingTop: Theme.spacing.md,
  } as ViewStyle,

  itemsTitle: {
    fontWeight: '600',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.sm,
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
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemName: {
    fontWeight: '500',
    marginBottom: 2,
  } as ViewStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
  } as ViewStyle,

  // Assignment-related styles
  listItemAssigned: {
    backgroundColor: `${Theme.colors.primary}08`,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.xs,
  } as ViewStyle,

  assignedAvatarTextInline: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,
  assignedAvatarImageInline: {
    width: 16,
    height: 16,
    borderRadius: 8,
  } as ViewStyle,



  assignButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: `${Theme.colors.primary}30`,
  } as ViewStyle,

  addButtonContainer: {
    marginTop: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.lg,
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
    paddingVertical: Theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  loadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  emptyContainer: {
    paddingVertical: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyTitle: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  } as ViewStyle,

  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,

  modalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['2xl'],
    borderTopRightRadius: Theme.borderRadius['2xl'],
    maxHeight: '90%',
    minHeight: '70%',
  } as ViewStyle,

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  } as ViewStyle,

  modalTitle: {
    fontWeight: '700',
  } as ViewStyle,

  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  modalContent: {
    flex: 1,
    padding: Theme.spacing.lg,
  } as ViewStyle,

  modalLoadingContainer: {
    paddingVertical: Theme.spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  modalLoadingText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Theme.spacing.md,
    backgroundColor: '#F9F9F9',
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    overflow: 'hidden',
  } as ViewStyle,

  friendAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  } as ViewStyle,

  friendDetails: {
    flex: 1,
  } as ViewStyle,

  friendName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,



  friendActionButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.primary[500],
  } as ViewStyle,

  removeButton: {
    backgroundColor: Theme.colors.error[500],
  } as ViewStyle,

  addButtonText: {
    color: Theme.colors.background.primary,
    fontWeight: '600',
  } as ViewStyle,

  modalEmptyContainer: {
    paddingVertical: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  modalEmptyTitle: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  } as ViewStyle,

  modalEmptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  successModalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing['2xl'],
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
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  successIcon: {
    fontSize: 40,
  } as ViewStyle,

  successTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  successSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  successButton: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  successButtonText: {
    color: Theme.colors.background.primary,
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Error Modal Styles
  errorModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  errorModalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing['2xl'],
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
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  errorIcon: {
    fontSize: 40,
  } as ViewStyle,

  errorTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  errorSubtitle: {
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  errorButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  } as ViewStyle,

  errorButtonText: {
    color: Theme.colors.background.primary,
    fontWeight: '600',
    fontSize: 16,
  } as ViewStyle,

  // Header notification styles
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
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
    color: Theme.colors.background.primary,
    fontSize: 10,
    fontWeight: '700',
  } as ViewStyle,

  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  } as ViewStyle,

  notificationModalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderTopLeftRadius: Theme.borderRadius['2xl'],
    borderTopRightRadius: Theme.borderRadius['2xl'],
    maxHeight: '80%',
    minHeight: '60%',
  } as ViewStyle,

  notificationModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  } as ViewStyle,

  notificationModalTitle: {
    fontWeight: '700',
  } as ViewStyle,

  notificationHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
  } as ViewStyle,

  markAllReadButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
  } as ViewStyle,

  markAllReadText: {
    fontWeight: '600',
  } as ViewStyle,

  notificationModalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  notificationModalContent: {
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Theme.spacing.md,
    backgroundColor: '#F9F9F9',
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  notificationItemUnread: {
    backgroundColor: '#E0F2FE',
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary[500],
  } as ViewStyle,

  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    position: 'relative',
  } as ViewStyle,

  notificationIcon: {
    fontSize: 18,
  } as ViewStyle,

  priorityIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
  } as ViewStyle,

  notificationContent: {
    flex: 1,
    marginRight: Theme.spacing.sm,
  } as ViewStyle,

  notificationTitle: {
    fontWeight: '600',
    marginBottom: 4,
  } as ViewStyle,

  notificationMessage: {
    lineHeight: 18,
    marginBottom: 4,
  } as ViewStyle,

  notificationTime: {
    fontSize: 11,
    opacity: 0.7,
  } as ViewStyle,

  deleteNotificationButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyNotificationsContainer: {
    paddingVertical: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  emptyNotificationsTitle: {
    marginBottom: Theme.spacing.md,
    textAlign: 'center',
  } as ViewStyle,

  emptyNotificationsText: {
    textAlign: 'center',
    lineHeight: 22,
  } as ViewStyle,

  clearAllContainer: {
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
  } as ViewStyle,

  clearAllButton: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
  } as ViewStyle,

  clearAllText: {
    fontWeight: '600',
  } as ViewStyle,

  // Archive button styles
  archiveButtonContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.sm,
    alignItems: 'center',
  } as ViewStyle,

  archiveButton: {
    borderColor: Theme.colors.text.secondary,
    borderWidth: 1,
    minWidth: 200,
    maxWidth: 300,
    height: 44, // Match the height of primary button
    paddingVertical: 12, // Ensure consistent padding
  } as ViewStyle,

  // Archived list styles
  archivedListCard: {
    opacity: 0.7,
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  } as ViewStyle,

  archivedBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: Theme.borderRadius.md,
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
};
