/**
 * Shop Screen - Shopping Mode for Lists
 * Allows users to shop for items from their shopping lists and mark them as completed
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Alert,
  Image,
  TextInput,
  Animated,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { BottomNavigation } from '@/presentation/components/organisms';
import { ArchiveConfirmationModal, UnfinishedListModal } from '@/presentation/components/molecules';
import type { NavigationTab } from '@/presentation/components/organisms';
import { useDispatch } from 'react-redux';
import ShoppingListService from '@/infrastructure/services/shoppingListService';
import AuthService from '@/infrastructure/services/authService';
import SocialService from '@/infrastructure/services/socialService';
import type { ShoppingList, ShoppingItem } from '@/application/store/slices/shoppingListsSlice';
import type { Friend } from '@/shared/types';
import { toggleItemCompleted, archiveList } from '@/application/store/slices/shoppingListsSlice';
import { getAvatarAsset, isValidAvatarIdentifier, isCustomImageUri } from '@/shared/utils/avatarUtils';
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/shared/utils/currencyUtils';

export interface ShopScreenProps {
  onBackPress: () => void;
  onNavigationTabPress: (tab: NavigationTab) => void;
  currentUser?: any;
  shoppingLists?: ShoppingList[];
  onListUpdate?: () => void;
}

type ShopMode = 'select-list' | 'shopping';

export const ShopScreen: React.FC<ShopScreenProps> = ({
  onBackPress,
  onNavigationTabPress,
  currentUser,
  shoppingLists = [],
  onListUpdate,
}) => {
  const [mode, setMode] = useState<ShopMode>('select-list');
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnfinishedModal, setShowUnfinishedModal] = useState(false);
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [friends, setFriends] = useState<Friend[]>([]);
  

  
  const dispatch = useDispatch();

  // Helper functions for user information
  const getUserName = (userId: string): string => {
    if (!selectedList) return 'Unknown';
    
    // Check if it's the current user
    if (userId === currentUser?.id) {
      return 'You';
    }
    
    // Find in collaborators
    const collaborator = selectedList.collaborators.find(collab => collab.userId === userId);
    if (collaborator) {
      return collaborator.name;
    }
    
    // Fallback
    return 'Unknown User';
  };

  // Color palette for different collaborators
  const collaboratorColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];

  const getCollaboratorColor = (userId: string): string => {
    if (!selectedList) return collaboratorColors[0];
    
    const collaboratorIndex = selectedList.collaborators.findIndex(c => c.userId === userId);
    if (collaboratorIndex === -1) return collaboratorColors[0];
    
    return collaboratorColors[collaboratorIndex % collaboratorColors.length];
  };

  const getUserAvatar = (userId: string) => {
    console.log(`ShopScreen getUserAvatar called for userId: ${userId}`);
    console.log(`ShopScreen current friends state has ${friends.length} friends:`, friends.map(f => ({ id: f.id, email: f.email, avatar: f.avatar })));
    
    // First check if it's the current user
    if (currentUser && currentUser.id === userId) {
      const avatarData = currentUser.avatar;
      console.log(`ShopScreen found current user avatar: ${avatarData}`);
      
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
        console.log(`ShopScreen found collaborator avatar: ${avatarData}`);
        
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
      console.log(`ShopScreen found friend by ID avatar: ${avatarData}`);
      
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
      console.log(`ShopScreen found friend by email avatar: ${avatarData}`);
      
      if (isValidAvatarIdentifier(avatarData)) {
        return getAvatarAsset(avatarData);
      }
      
      if (isCustomImageUri(avatarData)) {
        return avatarData;
      }
      
      return avatarData || '👤';
    }
    
    console.log(`ShopScreen no avatar found for userId: ${userId}, returning fallback`);
    // Fallback
    return '👤';
  };

  useEffect(() => {
    if (selectedList) {
      // Initialize completed items based on the list's current state
      const completed = new Set(
        selectedList.items.filter(item => item.completed).map(item => item.id)
      );
      setCompletedItems(completed);
    }
  }, [selectedList]);

  // Refresh state when entering shopping mode
  useEffect(() => {
    const refreshStateOnModeChange = async () => {
      if (mode === 'shopping' && selectedList) {
        try {
          // Fetch the latest list data from service
          const latestList = await ShoppingListService.getListById(selectedList.id);
          if (latestList) {
            // Update both selectedList and completedItems with latest data
            setSelectedList(latestList);
            const completed = new Set(
              latestList.items.filter(item => item.completed).map(item => item.id)
            );
            setCompletedItems(completed);
          }
        } catch (error) {
          console.error('Error refreshing list state:', error);
        }
      }
    };

    refreshStateOnModeChange();
  }, [mode, selectedList?.id]);

  // Load friends list
  useEffect(() => {
    const loadFriends = async () => {
      try {
        const friendsList = await SocialService.getFriends();
        setFriends(friendsList);
      } catch (error) {
        console.error('Error loading friends:', error);
      }
    };
    
    loadFriends();
  }, []);

  // Refresh friends when current user changes (e.g., after profile updates)
  useEffect(() => {
    const refreshFriends = async () => {
      if (currentUser) {
        // Force a fresh load of friends data to ensure updated avatars are displayed
        console.log('Refreshing friends data due to current user change');
        try {
          const friendsList = await SocialService.getFriends();
          console.log('Fresh friends data loaded:', friendsList.length, 'friends');
          friendsList.forEach(friend => {
            console.log(`Friend: ${friend.name} (${friend.email}) - Avatar: ${friend.avatar}`);
          });
          setFriends(friendsList);
        } catch (error) {
          console.error('Error refreshing friends:', error);
        }
      }
    };
    
    refreshFriends();
  }, [currentUser]);

  // Refresh list data from service when Redux state changes
  useEffect(() => {
    if (selectedList && shoppingLists.length > 0) {
      const refreshListFromService = async () => {
        try {
          const latestList = await ShoppingListService.getListById(selectedList.id);
          if (latestList) {
            setSelectedList(latestList);
          }
        } catch (error) {
          console.error('Error refreshing list from service:', error);
        }
      };
      
      refreshListFromService();
    }
  }, [shoppingLists, selectedList?.id]);

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

  const handleSelectList = async (list: ShoppingList) => {
    // If selecting a different list, clear previous state
    if (selectedList && selectedList.id !== list.id) {
      setCompletedItems(new Set());
    }
    
    // Always fetch the latest list data from service to ensure consistency
    // This ensures we get the most up-to-date data including collaborators
    try {
      const latestList = await ShoppingListService.getListById(list.id);
      if (latestList) {
        setSelectedList(latestList);
        // Update completed items based on latest service data
        const completed = new Set(
          latestList.items.filter(item => item.completed).map(item => item.id)
        );
        setCompletedItems(completed);
      } else {
        // Fallback to passed list data if service doesn't have it
        setSelectedList(list);
        const completed = new Set(
          list.items.filter(item => item.completed).map(item => item.id)
        );
        setCompletedItems(completed);
      }
    } catch (error) {
      console.error('Error fetching latest list data:', error);
      // Fallback to passed list data
      setSelectedList(list);
      const completed = new Set(
        list.items.filter(item => item.completed).map(item => item.id)
      );
      setCompletedItems(completed);
    }
    setMode('shopping');
  };

  const handleBackToListSelection = () => {
    setMode('select-list');
    // Don't clear selectedList or completedItems to maintain state
    // This allows returning to the same shopping session
  };

  const handleClearShoppingState = () => {
    // Use this function when completely exiting shopping or switching lists
    setSelectedList(null);
    setCompletedItems(new Set());
    setMode('select-list');
  };

  const handleToggleItem = async (item: ShoppingItem) => {
    if (!selectedList) return;

    const isCurrentlyCompleted = completedItems.has(item.id);
    
    if (isCurrentlyCompleted) {
      // If item is currently completed, just uncheck it
      handleItemCompletionWithAmount(item, undefined);
      setExpandedItemId(null);
      setAmountInput('');
    } else {
      // If item is not completed, show inline amount input
      setExpandedItemId(item.id);
      setAmountInput(item.price?.toString() || '');
    }
  };

  const handleItemCompletionWithAmount = async (item: ShoppingItem, purchasedAmount?: number) => {
    if (!selectedList) return;

    try {
      setIsLoading(true);
      
      // Update Redux store with the amount
      dispatch(toggleItemCompleted({
        listId: selectedList.id,
        itemId: item.id,
        purchasedAmount,
      }));

      const newCompleted = new Set(completedItems);
      
      if (newCompleted.has(item.id)) {
        newCompleted.delete(item.id);
      } else {
        newCompleted.add(item.id);
      }
      
      setCompletedItems(newCompleted);

      // Update the list in the service
      const updatedItems = selectedList.items.map(listItem => {
        if (listItem.id === item.id) {
          return {
            ...listItem,
            completed: newCompleted.has(listItem.id),
            purchasedAmount: newCompleted.has(listItem.id) ? purchasedAmount : undefined,
          };
        }
        return {
          ...listItem,
          completed: newCompleted.has(listItem.id),
        };
      });

      const completedCount = updatedItems.filter(item => item.completed).length;
      const progress = Math.round((completedCount / updatedItems.length) * 100);
      
      // Calculate total spent from all completed items with purchasedAmount
      const totalSpent = updatedItems.reduce((total, item) => {
        return total + (item.completed && item.purchasedAmount ? item.purchasedAmount : 0);
      }, 0);

      const updatedList = {
        ...selectedList,
        items: updatedItems,
        completedCount,
        progress,
        totalSpent,
      };

      await ShoppingListService.updateFullList(updatedList);
      setSelectedList(updatedList);
      
      if (onListUpdate) {
        onListUpdate();
      }

    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  const handleAmountConfirm = (item: ShoppingItem) => {
    const numericAmount = parseFloat(amountInput);
    const finalAmount = isNaN(numericAmount) ? 0 : numericAmount;
    
    handleItemCompletionWithAmount(item, finalAmount);
    setExpandedItemId(null);
    setAmountInput('');
  };

  const handleAmountCancel = () => {
    setExpandedItemId(null);
    setAmountInput('');
  };

  const handleFinishShopping = () => {
    if (!selectedList) return;
    
    // Check if all items are completed
    const remainingItems = selectedList.items.filter(item => !item.completed).length;
    
    if (remainingItems > 0) {
      // Show unfinished modal if there are still items to buy
      setShowUnfinishedModal(true);
    } else {
      // Show archive confirmation modal if everything is complete
      setShowArchiveModal(true);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!selectedList) return;

    try {
      setIsLoading(true);
      
      // Archive the list in the service
      await ShoppingListService.archiveList(selectedList.id);
      
      // Update Redux store
      dispatch(archiveList(selectedList.id));
      
      // Close modal and clear shopping state
      setShowArchiveModal(false);
      handleClearShoppingState();
      
      // Show success message (using native alert for success is fine)
      Alert.alert(
        'Shopping Complete! 🎉', 
        `"${selectedList.name}" has been archived successfully!\n\nTotal spent: ${formatCurrency(selectedList.totalSpent, userCurrency)}`,
        [{ text: 'Great!', onPress: () => onListUpdate?.() }]
      );
      
    } catch (error) {
      console.error('Error archiving list:', error);
      setShowArchiveModal(false);
      Alert.alert('Error', 'Failed to archive the list. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchiveCancel = () => {
    setShowArchiveModal(false);
  };

  const handleContinueShopping = () => {
    setShowUnfinishedModal(false);
  };

  const handleFinishAnyway = () => {
    setShowUnfinishedModal(false);
    setShowArchiveModal(true);
  };

  const renderContent = () => {
    if (mode === 'select-list') {
      return renderListSelection();
    } else {
      return renderShoppingMode();
    }
  };

  const renderListSelection = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography
          variant="h2"
          color={Theme.colors.text.primary}
          style={styles.headerTitle}
        >
          🛒 Shopping Mode
        </Typography>
        <Typography
          variant="caption"
          color={Theme.colors.text.secondary}
          style={styles.headerSubtitle}
        >
          Select a list to start shopping
        </Typography>
      </View>

      {/* Lists */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {shoppingLists.filter(list => list.status !== 'archived').length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant="h3" style={styles.emptyTitle}>
              No Active Shopping Lists
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Create a shopping list first to start shopping
            </Typography>
          </View>
        ) : (
          <View style={styles.listsContainer}>
            {shoppingLists.filter(list => list.status !== 'archived').map((list) => (
              <TouchableOpacity
                key={list.id}
                style={styles.listCard}
                onPress={() => handleSelectList(list)}
              >
                <View style={styles.listCardHeader}>
                  <Typography
                    variant="h3"
                    color={Theme.colors.text.primary}
                    style={styles.listTitle}
                  >
                    {list.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={Theme.colors.text.secondary}
                    style={styles.listItemCount}
                  >
                    {list.itemsCount} items
                  </Typography>
                </View>

                <View style={styles.listProgress}>
                  <Typography
                    variant="caption"
                    color={Theme.colors.text.secondary}
                    style={styles.progressText}
                  >
                    {list.completedCount} of {list.itemsCount} completed
                  </Typography>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${list.progress}%` }
                      ]} 
                    />
                  </View>
                </View>

                <View style={styles.listActions}>
                  <Typography
                    variant="body"
                    style={styles.shopButton}
                  >
                    Start Shopping →
                  </Typography>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );

  const renderShoppingMode = () => (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleBackToListSelection}
          style={styles.backButton}
        >
          <Typography variant="body" style={styles.backIcon}>←</Typography>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.headerTitle}
          >
            {selectedList?.name}
          </Typography>
          <Typography
            variant="caption"
            color={Theme.colors.text.secondary}
            style={styles.headerSubtitle}
          >
            {completedItems.size} of {selectedList?.itemsCount || 0} completed
          </Typography>
          {selectedList && selectedList.collaborators && selectedList.collaborators.length > 1 && (
            <View style={styles.avatarStack}>
              {selectedList.collaborators.slice(0, 4).map((collaborator, index) => (
                <View
                  key={collaborator.userId}
                  style={[
                    styles.stackedAvatar,
                    { 
                      zIndex: selectedList.collaborators.length - index,
                      marginLeft: index > 0 ? -8 : 0 
                    }
                  ]}
                >
                  {(() => {
                    // Use the same logic as Lists Screen for consistency
                    const userId = collaborator.userId;
                    let avatar = getUserAvatar(collaborator.email);
                    if (!avatar || avatar === '👤') {
                      avatar = getUserAvatar(userId);
                    }
                    
                    // Check if it's a require() result (number) - treat as local asset
                    if (typeof avatar === 'number') {
                      return (
                        <Image 
                          source={avatar} 
                          style={styles.stackedAvatarImage}
                        />
                      );
                    }
                    
                    // Check if it's an asset (object)
                    if (typeof avatar === 'object') {
                      return (
                        <Image 
                          source={avatar} 
                          style={styles.stackedAvatarImage}
                        />
                      );
                    }
                    
                    // Check if it's a valid avatar identifier
                    if (isValidAvatarIdentifier(avatar)) {
                      return (
                        <Image 
                          source={getAvatarAsset(avatar)} 
                          style={styles.stackedAvatarImage}
                        />
                      );
                    }
                    
                    // Check if it's a custom image URI
                    if (isCustomImageUri(avatar)) {
                      return (
                        <Image 
                          key={`stacked-avatar-${collaborator.userId}-${avatar}`}
                          source={{ uri: avatar }} 
                          style={styles.stackedAvatarImage}
                        />
                      );
                    }
                    
                    // Fallback to emoji/text
                    return (
                      <Typography
                        variant="caption"
                        color={Theme.colors.background.primary}
                        style={styles.stackedAvatarText}
                      >
                        {avatar || '👤'}
                      </Typography>
                    );
                  })()}
                </View>
              ))}
              {selectedList.collaborators.length > 4 && (
                <View style={[styles.stackedAvatar, styles.moreIndicator, { zIndex: 0, marginLeft: -8 }]}>
                  <Typography
                    variant="caption"
                    color={Theme.colors.background.primary}
                    style={styles.stackedAvatarText}
                  >
                    +{selectedList.collaborators.length - 4}
                  </Typography>
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={handleFinishShopping}
          style={styles.finishButton}
        >
          <Typography variant="caption" style={styles.finishButtonText}>
            Finish
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Shopping Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarLarge}>
          <View 
            style={[
              styles.progressFillLarge, 
              { width: `${selectedList ? Math.round((completedItems.size / selectedList.itemsCount) * 100) : 0}%` }
            ]} 
          />
        </View>
      </View>

      {/* Shopping Items */}
      <FlatList
        data={selectedList?.items || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.shoppingItemContainer}>
            <TouchableOpacity
              style={[
                styles.shoppingItem,
                completedItems.has(item.id) && styles.shoppingItemCompleted,
                item.assignedTo && styles.shoppingItemAssigned,
                item.assignedTo && {
                  borderLeftColor: getCollaboratorColor(item.assignedTo),
                  borderLeftWidth: 4,
                },
              ]}
              onPress={() => handleToggleItem(item)}
            >
              <View style={styles.itemLeft}>
                <View style={[
                  styles.checkbox,
                  completedItems.has(item.id) && styles.checkboxCompleted,
                ]}>
                  {completedItems.has(item.id) && (
                    <Typography variant="caption" style={styles.checkmark}>
                      ✓
                    </Typography>
                  )}
                </View>
                <Typography variant="h2" style={styles.itemIcon}>
                  {item.icon}
                </Typography>
                <View style={styles.itemInfo}>
                  <Typography
                    variant="body"
                    color={Theme.colors.text.primary}
                    style={[
                      styles.itemName,
                      completedItems.has(item.id) && styles.itemNameCompleted,
                    ]}
                  >
                    {item.name}
                  </Typography>
                  <View style={styles.itemDetails}>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.secondary}
                      style={styles.itemQuantity}
                    >
                      {item.quantity} {item.unit}
                    </Typography>

                    {item.assignedTo && selectedList && selectedList.collaborators && (
                      <View style={styles.assignmentRow}>
                        <Typography
                          variant="caption"
                          color={getCollaboratorColor(item.assignedTo)}
                          style={styles.assignmentIndicator}
                        >
                          • Assigned to {getUserName(item.assignedTo)}
                        </Typography>
                        <View style={[
                          styles.assignedAvatarInline,
                          { backgroundColor: getCollaboratorColor(item.assignedTo) }
                        ]}>
                          {(() => {
                            const collaborator = selectedList.collaborators.find(c => c.userId === item.assignedTo);
                            if (!collaborator) return null;
                            
                            // Helper function to get avatar by email or userId
                            const getCollaboratorAvatar = (email?: string, userId?: string) => {
                              // First try to find by email in friends list
                              if (email) {
                                const friend = friends.find(f => f.email === email);
                                if (friend) {
                                  const avatarData = friend.avatar;
                                  if (isValidAvatarIdentifier(avatarData)) {
                                    return getAvatarAsset(avatarData);
                                  }
                                  if (isCustomImageUri(avatarData)) {
                                    return avatarData;
                                  }
                                  return avatarData || '👤';
                                }
                                
                                // Look in all lists for a collaborator with this email
                                for (const list of shoppingLists) {
                                  const foundCollaborator = list.collaborators.find(c => c.email === email);
                                  if (foundCollaborator) {
                                    const avatarData = foundCollaborator.avatar;
                                    if (isValidAvatarIdentifier(avatarData)) {
                                      return getAvatarAsset(avatarData);
                                    }
                                    if (isCustomImageUri(avatarData)) {
                                      return avatarData;
                                    }
                                    return avatarData || '👤';
                                  }
                                }
                              }
                              
                              // Then try by userId
                              if (userId) {
                                return getUserAvatar(userId);
                              }
                              
                              return '👤';
                            };
                            
                            const avatar = getCollaboratorAvatar(collaborator.email, collaborator.userId);
                            
                            // Check if it's a require() result (number) - treat as local asset
                            if (typeof avatar === 'number') {
                              return (
                                <Image 
                                  source={avatar} 
                                  style={styles.assignedAvatarImage}
                                />
                              );
                            }
                            
                            // Check if it's an asset (object)
                            if (typeof avatar === 'object') {
                              return (
                                <Image 
                                  source={avatar} 
                                  style={styles.assignedAvatarImage}
                                />
                              );
                            }
                            
                            // Check if it's a valid avatar identifier
                            if (isValidAvatarIdentifier(avatar)) {
                              return (
                                <Image 
                                  source={getAvatarAsset(avatar)} 
                                  style={styles.assignedAvatarImage}
                                />
                              );
                            }
                            
                            // Check if it's a custom image URI
                            if (isCustomImageUri(avatar)) {
                              return (
                                <Image 
                                  key={`assigned-avatar-${item.assignedTo}-${avatar}`}
                                  source={{ uri: avatar }} 
                                  style={styles.assignedAvatarImage}
                                />
                              );
                            }
                            
                            // Fallback to emoji/text
                            return (
                              <Typography
                                variant="caption"
                                color={Theme.colors.background.primary}
                                style={styles.assignedAvatarText}
                              >
                                {avatar || '👤'}
                              </Typography>
                            );
                          })()}
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
            
            {/* Inline Amount Input - Shows when item is tapped but not completed */}
            {expandedItemId === item.id && !completedItems.has(item.id) && (
              <View style={styles.amountInputContainer}>
                <View style={styles.amountInputRow}>
                  <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.amountLabel}>
                    Amount paid:
                  </Typography>
                  <View style={styles.amountInputWrapper}>
                    <Typography variant="body" color={Theme.colors.text.primary} style={styles.currencySymbol}>
                      $
                    </Typography>
                    <TextInput
                      style={styles.amountTextInput}
                      value={amountInput}
                      onChangeText={setAmountInput}
                      placeholder="0.00"
                      placeholderTextColor={Theme.colors.text.tertiary}
                      keyboardType="numeric"
                      autoFocus
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={styles.amountButtonRow}>
                  <TouchableOpacity
                    style={styles.amountCancelButton}
                    onPress={handleAmountCancel}
                  >
                    <Typography variant="caption" color={Theme.colors.text.secondary}>
                      Cancel
                    </Typography>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.amountConfirmButton}
                    onPress={() => handleAmountConfirm(item)}
                  >
                    <Typography variant="caption" color={Theme.colors.background.primary}>
                      Mark as Purchased
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
        style={styles.shoppingList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}
      <BottomNavigation activeTab="shopping" onTabPress={onNavigationTabPress} />
      
      <UnfinishedListModal
        visible={showUnfinishedModal}
        onClose={handleContinueShopping}
        onContinueShopping={handleContinueShopping}
        onFinishAnyway={handleFinishAnyway}
        listName={selectedList?.name || ''}
        remainingItems={selectedList?.items.filter(item => !item.completed).length || 0}
        totalItems={selectedList?.items.length || 0}
        isLoading={isLoading}
      />
      
      <ArchiveConfirmationModal
        visible={showArchiveModal}
        onClose={handleArchiveCancel}
        onConfirm={handleArchiveConfirm}
        listName={selectedList?.name || ''}
        totalSpent={selectedList?.totalSpent || 0}
        currency={userCurrency}
        isLoading={isLoading}
      />
      

    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F4F2',
  } as ViewStyle,

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,

  headerTitle: {
    fontWeight: '700',
    marginBottom: 2,
  } as ViewStyle,

  headerSubtitle: {
    fontSize: 12,
    opacity: 0.7,
  } as ViewStyle,



  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  } as ViewStyle,

  stackedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Theme.colors.background.primary,
  } as ViewStyle,

  stackedAvatarText: {
    fontSize: 10,
    fontWeight: '600',
  } as ViewStyle,
  stackedAvatarImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  } as ViewStyle,

  moreIndicator: {
    backgroundColor: '#6B7280',
  } as ViewStyle,

  backButton: {
    padding: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: '#F9F9F9',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  } as ViewStyle,

  finishButton: {
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: '#4ADE80',
  } as ViewStyle,

  finishButtonText: {
    color: Theme.colors.background.primary,
    fontWeight: '600',
  } as ViewStyle,

  // List selection styles
  listsContainer: {
    padding: Theme.spacing.lg,
  } as ViewStyle,

  listCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F0F4F2',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  } as ViewStyle,

  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  listTitle: {
    fontWeight: '700',
  } as ViewStyle,

  listItemCount: {
    fontSize: 12,
    opacity: 0.7,
  } as ViewStyle,

  listProgress: {
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  progressText: {
    fontSize: 12,
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  progressBar: {
    height: 8,
    backgroundColor: '#F0F4F2',
    borderRadius: 4,
    overflow: 'hidden',
  } as ViewStyle,

  progressFill: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 4,
  } as ViewStyle,

  listActions: {
    alignItems: 'flex-end',
  } as ViewStyle,

  shopButton: {
    color: '#4ADE80',
    fontWeight: '600',
  } as ViewStyle,

  // Shopping mode styles
  progressContainer: {
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    backgroundColor: '#F9F9F9',
  } as ViewStyle,

  progressBarLarge: {
    height: 12,
    backgroundColor: '#E5E5E5',
    borderRadius: 6,
    overflow: 'hidden',
  } as ViewStyle,

  progressFillLarge: {
    height: '100%',
    backgroundColor: '#4ADE80',
    borderRadius: 6,
  } as ViewStyle,

  shoppingList: {
    flex: 1,
    paddingTop: Theme.spacing.sm,
  } as ViewStyle,

  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
    paddingHorizontal: Theme.spacing.md,
    marginHorizontal: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  } as ViewStyle,

  shoppingItemCompleted: {
    opacity: 0.6,
  } as ViewStyle,

  shoppingItemAssigned: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
  } as ViewStyle,

  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  checkmark: {
    color: Theme.colors.background.primary,
    fontSize: 14,
    fontWeight: 'bold',
  } as ViewStyle,

  itemIcon: {
    fontSize: 24,
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  itemInfo: {
    flex: 1,
  } as ViewStyle,

  itemName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,

  itemNameCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  } as ViewStyle,

  itemQuantity: {
    fontSize: 12,
  } as ViewStyle,

  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  } as ViewStyle,

  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Theme.spacing.xs,
  } as ViewStyle,

  assignmentIndicator: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  assignedAvatarInline: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.xs,
  } as ViewStyle,

  assignedAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Theme.colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.sm,
  } as ViewStyle,

  assignedAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,
  assignedAvatarImage: {
    width: 16,
    height: 16,
    borderRadius: 8,
  } as ViewStyle,

  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xl,
  } as ViewStyle,

  emptyTitle: {
    marginBottom: Theme.spacing.sm,
    color: Theme.colors.text.secondary,
  } as ViewStyle,

  emptyText: {
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  } as ViewStyle,

  // Inline amount input styles
  shoppingItemContainer: {
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  amountInputContainer: {
    backgroundColor: Theme.colors.background.secondary,
    marginHorizontal: Theme.spacing.lg,
    marginTop: -Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border.light,
    ...Theme.shadows.small,
  } as ViewStyle,

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  amountLabel: {
    fontWeight: '500',
  } as ViewStyle,

  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    paddingHorizontal: Theme.spacing.sm,
    minWidth: 100,
  } as ViewStyle,

  currencySymbol: {
    marginRight: Theme.spacing.xs,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  } as ViewStyle,

  amountTextInput: {
    flex: 1,
    paddingVertical: Theme.spacing.xs,
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text.primary,
    textAlign: 'right',
  } as ViewStyle,

  amountButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Theme.spacing.sm,
  } as ViewStyle,

  amountCancelButton: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    alignItems: 'center',
    backgroundColor: Theme.colors.background.primary,
  } as ViewStyle,

  amountConfirmButton: {
    flex: 2,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Theme.colors.primary[500],
    ...Theme.shadows.small,
  } as ViewStyle,
};