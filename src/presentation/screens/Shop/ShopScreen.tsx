// ========================================
// Shop Screen - Shopping Mode for Lists
// ========================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { ConsultButton } from '../../components/atoms/ConsultButton/ConsultButton';
import { ConsultContributorsModal } from '../../components/molecules/ConsultContributorsModal/ConsultContributorsModal';
import type { Contributor } from '../../components/molecules/ConsultContributorsModal/ConsultContributorsModal';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { getAvatarProps, getFallbackAvatar } from '../../../shared/utils/avatarUtils';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  archiveShoppingList,
  loadShoppingLists,
  selectFilteredLists,
  selectIsLoadingLists,
  selectShoppingListError,
  updateShoppingItem,
} from '../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../application/store/slices/authSlice';
import type { AppDispatch } from '../../../application/store';

// Types
import type {
  AvatarType,
  Collaborator,
  ShoppingItem,
  ShoppingList,
} from '../../../shared/types/lists';

export interface ShopScreenProps {
  onBackPress: () => void;
  onNavigationTabPress: (tab: string) => void;
  currentUser?: any;
  shoppingLists?: ShoppingList[];
  onListUpdate?: () => void;
}

// Note: Using imported types from shared/types/lists instead of local definitions

type ShopMode = 'select-list' | 'shopping';

/**
 * Shop Screen Component
 *
 * Allows users to shop for items from their shopping lists and mark them as completed.
 *
 * Features from original:
 * - Two modes: select-list and shopping
 * - List selection with progress indicators
 * - Shopping mode with item checkboxes
 * - Inline amount input for purchased items
 * - Collaborator avatars and assignments
 * - Archive confirmation when shopping is complete
 * - Unfinished list modal for incomplete shopping
 */
export const ShopScreen: React.FC<ShopScreenProps> = ({
  onBackPress,
  onNavigationTabPress,
  currentUser,
  shoppingLists = [],
  onListUpdate,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const user = useSelector(selectUser);
  const lists = useSelector(selectFilteredLists);
  const isLoadingLists = useSelector(selectIsLoadingLists);
  const error = useSelector(selectShoppingListError);

  // Ensure theme colors are available with robust fallback
  const safeTheme = theme?.colors
    ? theme
    : {
        colors: {
          primary: { '500': '#22c55e' },
          text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
          background: { primary: '#ffffff' },
          surface: { background: '#ffffff', secondary: '#f5f5f5' },
          border: { primary: '#e5e5e5' },
        },
      };

  const [mode, setMode] = useState<ShopMode>('select-list');
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnfinishedModal, setShowUnfinishedModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);

  // Load shopping lists on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🛒 Loading shopping lists for shopping mode...');
      dispatch(loadShoppingLists({ status: 'active', limit: 50 }));
    }
  }, [dispatch, user?.id]);

  // ========================================
  // Consult Contributors Handlers
  // ========================================

  const handleConsultPress = () => {
    console.log('🔥🔥🔥 CONSULT BUTTON PRESSED - NEW VERSION');
    console.log('🔥 Selected list:', selectedList?.name);
    console.log('🔥 Collaborators count:', selectedList?.collaborators?.length || 0);

    // Debug raw collaborator data
    console.log(
      '🔥 Raw collaborators:',
      selectedList?.collaborators?.map(c => ({
        name: c.name,
        email: c.email,
        user: c.user
          ? {
              name: c.user.name,
              phone: c.user.phone,
              country_code: c.user.country_code,
            }
          : 'NO USER DATA',
      }))
    );

    const contributors = getContributors();
    console.log('🔥🔥🔥 Contributors for modal (NEW):', contributors);

    // DEBUG: Our new code is working with contributors count: ${contributors.length}

    setShowConsultModal(true);
    console.log('🔥 Modal state set to true');
  };

  const handleConsultModalClose = () => {
    setShowConsultModal(false);
  };

  // Transform collaborators to contributors format with real phone numbers
  const getContributors = (): Contributor[] => {
    if (!selectedList) return [];

    return selectedList.collaborators.map(collaborator => {
      console.log('🔥 Processing collaborator:', {
        name: collaborator.name,
        hasUser: !!collaborator.user,
        userPhone: collaborator.user?.phone,
        userCountry: collaborator.user?.country_code,
      });

      // Construct international phone number if user data exists
      let phone: string | undefined;
      if (collaborator.user?.phone) {
        const countryCode = collaborator.user.country_code || 'PK';
        // Map country codes to international dialing codes
        const dialingCode = countryCode === 'PK' ? '92' : '1'; // Default to US for unknown
        phone = `+${dialingCode}${collaborator.user.phone}`;
      }

      return {
        id: collaborator.id,
        userId: collaborator.userId,
        name: collaborator.name,
        email: collaborator.email,
        phone,
        avatar: collaborator.avatar,
        role: collaborator.role,
      };
    }) as any;
  };

  // Check if list has contributors (excluding current user)
  const hasContributors = selectedList && selectedList.collaborators.length > 0;

  // Update selected list when lists change (for real-time updates)
  useEffect(() => {
    if (selectedList && lists.length > 0) {
      const updatedList = lists.find(list => list.id === selectedList.id);
      if (updatedList) {
        console.log('🔄 Updating selected list with real-time data');
        setSelectedList(updatedList);

        // Update completed items state to match the updated list
        const completedItemIds = new Set(
          updatedList.items.filter(item => item.completed).map(item => item.id)
        );
        setCompletedItems(completedItemIds);
      }
    }
  }, [lists, selectedList]);

  // Use Redux lists or fallback to provided lists
  const displayLists = lists.length > 0 ? lists : shoppingLists;

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    console.log('🔄 Refreshing shopping lists...');
    try {
      await dispatch(loadShoppingLists({ status: 'active', limit: 50 })).unwrap();
    } catch (refreshError) {
      console.error('Failed to refresh shopping lists:', refreshError);
      Alert.alert('Error', 'Failed to refresh shopping lists');
    }
  }, [dispatch, user?.id]);

  // Mock user functions
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
    '#3B82F6',
    '#EF4444',
    '#10B981',
    '#F59E0B',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#6366F1',
  ];

  const getCollaboratorColor = (userId: string): string => {
    if (!selectedList) return collaboratorColors[0] || '#4F46E5';

    const collaboratorIndex = selectedList.collaborators.findIndex(c => c.userId === userId);
    if (collaboratorIndex === -1) return collaboratorColors[0] || '#4F46E5';

    return collaboratorColors[collaboratorIndex % collaboratorColors.length] || '#4F46E5';
  };

  const getUserAvatar = (userId: string): AvatarType => {
    // First check if it's the current user
    if (user && user.id === userId) {
      return user.avatar || getFallbackAvatar(user.name);
    }

    // Look up in collaborators from the selected list
    if (selectedList) {
      const collaborator = selectedList.collaborators.find(c => c.userId === userId);
      if (collaborator) {
        return collaborator.avatar || getFallbackAvatar(collaborator.name);
      }
    }

    // Look up in all display lists
    for (const list of displayLists) {
      const collaborator = list.collaborators.find(c => c.userId === userId);
      if (collaborator) {
        return collaborator.avatar || getFallbackAvatar(collaborator.name);
      }
    }

    return '👤';
  };

  // Avatar rendering helper
  const renderAvatar = (avatar: AvatarType, size: number = 20) => {
    try {
      const avatarProps = getAvatarProps(avatar);

      const containerStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#f0f0f0',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        overflow: 'hidden' as const,
      };

      const imageStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
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
              <Typography
                variant='caption'
                style={{
                  fontSize: size * 0.6,
                  lineHeight: size,
                  textAlign: 'center',
                }}>
                {avatarProps.emoji}
              </Typography>
            </View>
          );

        default:
          return (
            <View style={containerStyle}>
              <Typography
                variant='caption'
                style={{
                  fontSize: size * 0.6,
                  lineHeight: size,
                  textAlign: 'center',
                  color: '#666',
                }}>
                👤
              </Typography>
            </View>
          );
      }
    } catch (avatarError) {
      console.error('Error rendering avatar:', avatarError);
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#f0f0f0',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Typography
            variant='caption'
            style={{
              fontSize: size * 0.6,
              lineHeight: size,
              textAlign: 'center',
              color: '#666',
            }}>
            👤
          </Typography>
        </View>
      );
    }
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

  const handleSelectList = async (list: ShoppingList) => {
    // If selecting a different list, clear previous state
    if (selectedList && selectedList.id !== list.id) {
      setCompletedItems(new Set());
    }

    setSelectedList(list);
    const completed = new Set(list.items.filter(item => item.completed).map(item => item.id));
    setCompletedItems(completed);
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
    if (!selectedList || !user?.id) return;

    // Check permissions - only assigned user or owner can update items
    const canUpdateItem = selectedList.ownerId === user.id || item.assignedTo === user.id;
    if (!canUpdateItem) {
      Alert.alert(
        'Permission Denied',
        'Only the list owner or assigned contributor can update this item.'
      );
      return;
    }

    try {
      setIsLoading(true);

      const isCurrentlyCompleted = completedItems.has(item.id);
      const newCompleted = !isCurrentlyCompleted;

      // Update item via Redux
      await dispatch(
        updateShoppingItem({
          listId: selectedList.id,
          itemId: item.id,
          updates: {
            completed: newCompleted,
            actual_price: newCompleted ? purchasedAmount : undefined,
          } as any,
        })
      ).unwrap();

      // Update local state
      const newCompletedSet = new Set(completedItems);
      if (newCompleted) {
        newCompletedSet.add(item.id);
      } else {
        newCompletedSet.delete(item.id);
      }
      setCompletedItems(newCompletedSet);

      // Update selected list locally for immediate UI feedback
      const updatedItems = selectedList.items.map(listItem => {
        if (listItem.id === item.id) {
          return {
            ...listItem,
            completed: newCompleted,
            purchasedAmount: newCompleted ? purchasedAmount : undefined,
          };
        }
        return listItem;
      });

      const completedCount = updatedItems.filter(listItem => listItem.completed).length;
      const progress = Math.round((completedCount / updatedItems.length) * 100);

      // Calculate total spent from all completed items with purchasedAmount
      const totalSpent = updatedItems.reduce((total, listItem) => {
        return (
          total + (listItem.completed && listItem.purchasedAmount ? listItem.purchasedAmount : 0)
        );
      }, 0);

      const updatedList = {
        ...selectedList,
        items: updatedItems,
        completedCount,
        progress,
        totalSpent,
      } as any;

      setSelectedList(updatedList);

      if (onListUpdate) {
        onListUpdate();
      }

      console.log('✅ Item updated successfully:', item.name);
    } catch (updateError: unknown) {
      console.error('❌ Error updating item:', updateError);
      const errorMessage =
        updateError instanceof Error
          ? updateError.message
          : 'Failed to update item. Please try again.';
      Alert.alert('Error', errorMessage);
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
    const remainingItems = selectedList.items.filter(item => !item.completed);
    const currentCompletedItems = selectedList.items.filter(item => item.completed);

    // Calculate total spent from completed items
    const totalSpent = currentCompletedItems.reduce((total, item) => {
      const amount = item.purchasedAmount || 0;
      return total + (typeof amount === 'number' ? amount : 0);
    }, 0);

    if (remainingItems.length > 0) {
      // Show graceful message about incomplete items
      Alert.alert(
        'Shopping Not Complete',
        `You still have ${remainingItems.length} item${remainingItems.length > 1 ? 's' : ''} left to purchase:\n\n${remainingItems.map(item => `• ${item.name}`).join('\n')}\n\nWould you like to continue shopping or finish anyway?`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          {
            text: 'Finish Anyway',
            style: 'destructive',
            onPress: () =>
              showArchiveConfirmation(totalSpent, completedItems.size, selectedList.items.length),
          },
        ]
      );
    } else {
      // All items completed - show archive confirmation
      showArchiveConfirmation(totalSpent, completedItems.size, selectedList.items.length);
    }
  };

  const showArchiveConfirmation = (
    totalSpent: number,
    completedCount: number,
    totalCount: number
  ) => {
    Alert.alert(
      'Shopping Complete! 🎉',
      `Great job! Here's your shopping summary:\n\n` +
        `📦 Items purchased: ${completedCount}/${totalCount}\n` +
        `💰 Total spent: $${(totalSpent || 0).toFixed(2)}\n\n` +
        `This list will be archived and moved to your completed lists. You can view the purchase history anytime in the Lists section.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive List',
          style: 'default',
          onPress: handleArchiveConfirm,
        },
      ]
    );
  };

  const handleArchiveConfirm = async () => {
    if (!selectedList) return;

    try {
      setIsLoading(true);

      // Archive the list via Redux
      await dispatch(archiveShoppingList(selectedList.id)).unwrap();

      // Clear shopping state and go back to list selection
      handleClearShoppingState();

      // Show success message
      Alert.alert(
        'List Archived Successfully! ✅',
        `"${selectedList.name}" has been moved to your archived lists.\n\nYou can view the complete purchase history in the Lists section.`,
        [
          {
            text: 'Great!',
            onPress: () => {
              onListUpdate?.();
              // Refresh lists to remove archived list from active lists
              dispatch(loadShoppingLists({ status: 'active', limit: 50 }));
            },
          },
        ]
      );

      console.log('✅ List archived successfully:', selectedList.name);
    } catch (archiveError: unknown) {
      console.error('❌ Error archiving list:', archiveError);
      const errorMessage =
        archiveError instanceof Error
          ? archiveError.message
          : 'Failed to archive the list. Please try again.';
      Alert.alert('Archive Failed', errorMessage);
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
          variant='h2'
          color={safeTheme?.colors?.text?.primary || '#000000'}
          style={styles.headerTitle}>
          🛒 Shopping Mode
        </Typography>
        <Typography
          variant='caption'
          color={safeTheme?.colors?.text?.secondary || '#666666'}
          style={styles.headerSubtitle}>
          Select a list to start shopping
        </Typography>
      </View>

      {/* Lists */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingLists}
            onRefresh={onRefresh}
            colors={[safeTheme?.colors?.primary?.['500'] || '#22c55e']}
            tintColor={safeTheme?.colors?.primary?.['500'] || '#22c55e'}
          />
        }>
        {error ? (
          <View style={styles.emptyContainer}>
            <Typography variant='h3' style={styles.emptyTitle}>
              Error Loading Lists
            </Typography>
            <Typography variant='body1' style={styles.emptyText}>
              {error}
            </Typography>
          </View>
        ) : displayLists.filter(list => list.status !== 'archived').length === 0 ? (
          <View style={styles.emptyContainer}>
            <Typography variant='h3' style={styles.emptyTitle}>
              {isLoadingLists ? 'Loading...' : 'No Active Shopping Lists'}
            </Typography>
            <Typography variant='body1' style={styles.emptyText}>
              {isLoadingLists
                ? 'Please wait while we load your lists'
                : 'Create a shopping list first to start shopping'}
            </Typography>
          </View>
        ) : (
          <View style={styles.listsContainer}>
            {displayLists
              .filter(list => list.status !== 'archived')
              .map(list => (
                <TouchableOpacity
                  key={list.id}
                  style={styles.listCard}
                  onPress={() => handleSelectList(list)}>
                  <View style={styles.listCardHeader}>
                    <Typography
                      variant='h3'
                      color={safeTheme?.colors?.text?.primary || '#000000'}
                      style={styles.listTitle}>
                      {list.name}
                    </Typography>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={styles.listItemCount}>
                      {list.itemsCount} items
                    </Typography>
                  </View>

                  <View style={styles.listProgress}>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={styles.progressText}>
                      {list.completedCount} of {list.itemsCount} completed
                    </Typography>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${list.progress}%` }]} />
                    </View>
                  </View>

                  <View style={styles.listActions}>
                    <Typography variant='body1' style={styles.shopButton}>
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
        <TouchableOpacity onPress={handleBackToListSelection} style={styles.backButton}>
          <Typography variant='body1' style={styles.backIcon}>
            ←
          </Typography>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Typography
            variant='h3'
            color={safeTheme?.colors?.text?.primary || '#000000'}
            style={styles.headerTitle}>
            {selectedList?.name}
          </Typography>
          <Typography
            variant='caption'
            color={safeTheme?.colors?.text?.secondary || '#666666'}
            style={styles.headerSubtitle}>
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
                      marginLeft: index > 0 ? -8 : 0,
                      backgroundColor: 'transparent',
                    },
                  ]}>
                  {renderAvatar(getUserAvatar(collaborator.userId), 24)}
                </View>
              ))}
              {selectedList.collaborators.length > 4 && (
                <View
                  style={[
                    styles.stackedAvatar,
                    styles.moreIndicator,
                    { zIndex: 0, marginLeft: -8 },
                  ]}>
                  <Typography
                    variant='caption'
                    color={(safeTheme?.colors as any)?.background?.primary || '#ffffff'}
                    style={styles.stackedAvatarText}>
                    +{selectedList.collaborators.length - 4}
                  </Typography>
                </View>
              )}
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleFinishShopping} style={styles.finishButton}>
          <Typography variant='caption' style={styles.finishButtonText}>
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
              {
                width: `${selectedList ? Math.round((completedItems.size / selectedList.itemsCount) * 100) : 0}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Shopping Items */}
      <FlatList
        data={selectedList?.items || []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.shoppingItemContainer}>
            <TouchableOpacity
              style={
                [
                  styles.shoppingItem,
                  completedItems.has(item.id) && styles.shoppingItemCompleted,
                  item.assignedTo && styles.shoppingItemAssigned,
                  item.assignedTo && {
                    borderLeftColor: getCollaboratorColor(item.assignedTo),
                    borderLeftWidth: 4,
                  },
                ] as any
              }
              onPress={() => handleToggleItem(item)}>
              <View style={styles.itemLeft}>
                <View
                  style={[
                    styles.checkbox,
                    completedItems.has(item.id) && styles.checkboxCompleted,
                  ]}>
                  {completedItems.has(item.id) && (
                    <Typography variant='caption' style={styles.checkmark}>
                      ✓
                    </Typography>
                  )}
                </View>
                <Typography variant='h2' style={styles.itemIcon}>
                  {item.icon}
                </Typography>
                <View style={styles.itemInfo}>
                  <Typography
                    variant='body1'
                    color={safeTheme?.colors?.text?.primary || '#000000'}
                    style={[
                      styles.itemName,
                      completedItems.has(item.id) && styles.itemNameCompleted,
                    ]}>
                    {item.name}
                  </Typography>
                  <View style={styles.itemDetails}>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}
                      style={styles.itemQuantity}>
                      {item.quantity} {item.unit}
                    </Typography>

                    {item.assignedTo && selectedList && selectedList.collaborators && (
                      <View style={styles.assignmentRow}>
                        <Typography
                          variant='caption'
                          color={getCollaboratorColor(item.assignedTo)}
                          style={styles.assignmentIndicator}>
                          • Assigned to {getUserName(item.assignedTo)}
                        </Typography>
                        <View
                          style={[styles.assignedAvatarInline, { backgroundColor: 'transparent' }]}>
                          {renderAvatar(getUserAvatar(item.assignedTo), 20)}
                        </View>
                      </View>
                    )}

                    {/* Permission indicator */}
                    {item.assignedTo &&
                      item.assignedTo !== user?.id &&
                      selectedList!.ownerId !== user?.id && (
                        <Typography
                          variant='caption'
                          color={safeTheme?.colors?.text?.tertiary || '#999999'}
                          style={styles.permissionIndicator}>
                          Only {getUserName(item.assignedTo)} can update this item
                        </Typography>
                      )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Inline Amount Input - Shows when item is tapped but not completed */}
            {expandedItemId === item.id && !completedItems.has(item.id) && (
              <View style={styles.amountInputContainer}>
                <View style={styles.amountInputRow}>
                  <Typography
                    variant='caption'
                    color={safeTheme?.colors?.text?.secondary || '#666666'}
                    style={styles.amountLabel}>
                    Amount paid:
                  </Typography>
                  <View style={styles.amountInputWrapper}>
                    <Typography
                      variant='body1'
                      color={safeTheme?.colors?.text?.primary || '#000000'}
                      style={styles.currencySymbol}>
                      $
                    </Typography>
                    <TextInput
                      style={styles.amountTextInput}
                      value={amountInput}
                      onChangeText={setAmountInput}
                      placeholder='0.00'
                      placeholderTextColor={safeTheme?.colors?.text?.tertiary || '#999999'}
                      keyboardType='numeric'
                      autoFocus
                      selectTextOnFocus
                    />
                  </View>
                </View>
                <View style={styles.amountButtonRow}>
                  <TouchableOpacity style={styles.amountCancelButton} onPress={handleAmountCancel}>
                    <Typography
                      variant='caption'
                      color={safeTheme?.colors?.text?.secondary || '#666666'}>
                      Cancel
                    </Typography>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.amountConfirmButton}
                    onPress={() => handleAmountConfirm(item)}>
                    <Typography
                      variant='caption'
                      color={(safeTheme?.colors as any)?.background?.primary || '#ffffff'}>
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

      {/* Floating Consult Contributors Button */}
      {hasContributors && (
        <View style={styles.consultButtonContainer}>
          <ConsultButton
            onPress={handleConsultPress}
            testID='consult-contributors-button'
            accessibilityLabel='Consult contributors'
            accessibilityHint='Contact list contributors for questions or confirmations'
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderContent()}

      {/* Consult Contributors Modal */}
      <ConsultContributorsModal
        visible={showConsultModal}
        contributors={getContributors()}
        listName={selectedList?.name || 'Shopping List'}
        onDismiss={handleConsultModalClose}
        testID='shop-consult-modal'
      />

      {/* TODO: Add modals when molecular components are created */}
      {/* UnfinishedListModal and ArchiveConfirmationModal will be added later */}
    </SafeAreaView>
  );
};

// ========================================
// Styles - Copied from Original Shop Screen
// ========================================

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  } as ViewStyle,

  stackedAvatarText: {
    fontSize: 10,
    fontWeight: '600',
  } as ViewStyle,

  moreIndicator: {
    backgroundColor: '#6B7280',
  } as ViewStyle,

  backButton: {
    padding: 12,
    borderRadius: 50,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#4ADE80',
  } as ViewStyle,

  finishButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  } as ViewStyle,

  // List selection styles
  listsContainer: {
    padding: 20,
  } as ViewStyle,

  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 16,
  } as ViewStyle,

  listTitle: {
    fontWeight: '700',
  } as ViewStyle,

  listItemCount: {
    fontSize: 12,
    opacity: 0.7,
  } as ViewStyle,

  listProgress: {
    marginBottom: 16,
  } as ViewStyle,

  progressText: {
    fontSize: 12,
    marginBottom: 8,
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
    paddingHorizontal: 20,
    paddingVertical: 12,
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
    paddingTop: 12,
  } as ViewStyle,

  shoppingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
    marginRight: 16,
    backgroundColor: '#FFFFFF',
  } as ViewStyle,

  checkboxCompleted: {
    backgroundColor: '#4ADE80',
    borderColor: '#4ADE80',
  } as ViewStyle,

  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  } as ViewStyle,

  itemIcon: {
    fontSize: 24,
    marginRight: 16,
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
    marginLeft: 8,
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
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  } as ViewStyle,

  assignedAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  permissionIndicator: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  } as ViewStyle,

  // Empty state styles
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  } as ViewStyle,

  emptyTitle: {
    marginBottom: 12,
    color: '#6B7280',
  } as ViewStyle,

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  } as ViewStyle,

  // Inline amount input styles
  shoppingItemContainer: {
    marginBottom: 8,
  } as ViewStyle,

  amountInputContainer: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginTop: -8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  } as ViewStyle,

  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  } as ViewStyle,

  amountLabel: {
    fontWeight: '500',
  } as ViewStyle,

  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    minWidth: 100,
  } as ViewStyle,

  currencySymbol: {
    marginRight: 8,
    fontWeight: '600',
    color: '#374151',
  } as ViewStyle,

  amountTextInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'right',
  } as ViewStyle,

  amountButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  } as ViewStyle,

  amountCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  } as ViewStyle,

  amountConfirmButton: {
    flex: 2,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#22c55e',
  } as ViewStyle,

  // Consult Contributors Button Container
  consultButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 1000,
  } as ViewStyle,
};
