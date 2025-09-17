// ========================================
// Shop Screen - Shopping Mode for Lists
// ========================================

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Keyboard,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { ConsultButton } from '../../components/atoms/ConsultButton/ConsultButton';
import { ConsultContributorsModal } from '../../components/molecules/ConsultContributorsModal/ConsultContributorsModal';
import type { Contributor } from '../../components/molecules/ConsultContributorsModal/ConsultContributorsModal';
import { GradientBackground } from '../../components/atoms/GradientBackground';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { getAvatarProps, getFallbackAvatar } from '../../../shared/utils/avatarUtils';

// Styles
import {
  baseStyles,
  collaboratorColors,
  createDynamicStyles,
  createFallbackTheme,
  createThemedStyles,
  getCollaboratorColor,
  getListCardColor,
} from './ShopScreen.styles';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  archiveShoppingList,
  loadShoppingList,
  loadShoppingLists,
  selectCurrentList,
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
  const currentList = useSelector(selectCurrentList);
  const isLoadingLists = useSelector(selectIsLoadingLists);
  const error = useSelector(selectShoppingListError);

  // Ensure theme colors are available with clean fallback
  const safeTheme = theme?.colors ? theme : createFallbackTheme();

  // Create styled functions
  const themedStyles = createThemedStyles(safeTheme);
  const dynamicStyles = createDynamicStyles(safeTheme);

  const [mode, setMode] = useState<ShopMode>('select-list');
  const [isLoading, setIsLoading] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState<string>('');
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showUnfinishedModal, setShowUnfinishedModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [animatedHeight] = useState(new Animated.Value(0));
  const [flatListRef, setFlatListRef] = useState<FlatList<ShoppingItem> | null>(null);

  // Load shopping lists on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(loadShoppingLists({ status: 'active', limit: 50 }));
    }
  }, [dispatch, user?.id]);

  // ========================================
  // Consult Contributors Handlers
  // ========================================

  const handleConsultPress = () => {
    const contributors = getContributors();
    setShowConsultModal(true);
  };

  const handleConsultModalClose = () => {
    setShowConsultModal(false);
  };

  // Transform collaborators to contributors format with real phone numbers
  const getContributors = (): Contributor[] => {
    if (!currentList) return [];

    return currentList.collaborators.map(collaborator => {
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
  const hasContributors = currentList && currentList.collaborators.length > 0;

  // Redux will handle list updates automatically through WebSocket

  // Use Redux lists or fallback to provided lists
  const displayLists = lists.length > 0 ? lists : shoppingLists;

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;
    try {
      await dispatch(loadShoppingLists({ status: 'active', limit: 50 })).unwrap();
    } catch (refreshError) {
      Alert.alert('Error', 'Failed to refresh shopping lists');
    }
  }, [dispatch, user?.id]);

  // Mock user functions
  const getUserName = (userId: string): string => {
    if (!currentList) return 'Unknown';

    // Check if it's the current user
    if (userId === currentUser?.id) {
      return 'You';
    }

    // Find in collaborators
    const collaborator = currentList.collaborators.find(collab => collab.userId === userId);
    if (collaborator) {
      return collaborator.name;
    }

    // Fallback
    return 'Unknown User';
  };

  // Collaborator color helper using extracted function
  const getCollaboratorColorForList = (userId: string): string => {
    if (!currentList) return collaboratorColors[0] || '#4F46E5';
    return getCollaboratorColor(userId, currentList.collaborators);
  };

  const getUserAvatar = (userId: string): AvatarType => {
    // First check if it's the current user
    if (user && user.id === userId) {
      return user.avatar || getFallbackAvatar(user.name);
    }

    // Look up in collaborators from the selected list
    if (currentList) {
      const collaborator = currentList.collaborators.find(c => c.userId === userId);
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
                }}
                color={safeTheme.colors.text.secondary}>
                👤
              </Typography>
            </View>
          );
      }
    } catch (avatarError) {
      const fallbackAvatarStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: (safeTheme.colors as any).gray?.['200'] || '#E5E5E5',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };

      return (
        <View style={fallbackAvatarStyle}>
          <Typography
            variant='caption'
            style={{
              fontSize: size * 0.6,
              lineHeight: size,
              textAlign: 'center',
            }}
            color={safeTheme.colors.text.secondary}>
            👤
          </Typography>
        </View>
      );
    }
  };

  useEffect(() => {
    if (currentList) {
      // Initialize completed items based on the list's current state
      const completed = new Set(
        currentList.items.filter(item => item.completed).map(item => item.id)
      );
      setCompletedItems(completed);
    }
  }, [currentList]);

  const handleSelectList = async (list: ShoppingList) => {
    // If selecting a different list, clear previous state
    if (currentList && currentList.id !== list.id) {
      setCompletedItems(new Set());
    }

    // Load the shopping list to set currentList in Redux (for WebSocket room joining)
    try {
      await dispatch(loadShoppingList(list.id)).unwrap();

      setMode('shopping');
    } catch (error) {
      console.error('Failed to load shopping list for WebSocket room:', error);
      // Mode will stay in select-list if loading fails
    }
  };

  const handleBackToListSelection = () => {
    setMode('select-list');
    // Don't clear currentList or completedItems to maintain state
    // This allows returning to the same shopping session
  };

  const handleClearShoppingState = () => {
    // Use this function when completely exiting shopping or switching lists
    // Redux currentList will be cleared when needed
    setCompletedItems(new Set());
    setMode('select-list');
  };

  // Helper function to check if item is read-only for current user
  const isItemReadOnly = (item: ShoppingItem): boolean => {
    if (!currentList || !user?.id) return true;
    // Owner can interact with all items, contributors only with assigned items
    return !(currentList.ownerId === user.id || item.assignedTo === user.id);
  };

  const handleToggleItem = async (item: ShoppingItem) => {
    if (!currentList || !user?.id) return;

    // Check permissions - only assigned user or owner can interact with items
    const canInteractWithItem = currentList.ownerId === user.id || item.assignedTo === user.id;
    if (!canInteractWithItem) {
      Alert.alert(
        'Permission Denied',
        'Only the list owner or assigned contributor can interact with this item.'
      );
      return;
    }

    const isCurrentlyCompleted = completedItems.has(item.id);

    if (isCurrentlyCompleted) {
      // If item is currently completed, just uncheck it
      handleItemCompletionWithAmount(item, undefined);
      setExpandedItemId(null);
      setAmountInput('');
    } else {
      // If item is not completed, show inline amount input with animation
      if (expandedItemId === item.id) {
        // Collapse
        Animated.timing(animatedHeight, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start(() => {
          setExpandedItemId(null);
        });
      } else {
        // Expand
        setExpandedItemId(item.id);
        setAmountInput(item.price?.toString() || '');

        // Scroll to item to ensure it's visible when expanded
        if (flatListRef && currentList?.items) {
          const itemIndex = currentList.items.findIndex(listItem => listItem.id === item.id);
          if (itemIndex !== -1) {
            setTimeout(() => {
              flatListRef.scrollToIndex({
                index: itemIndex,
                animated: true,
                viewPosition: 0.5, // Center the item
              });
            }, 100); // Small delay to ensure state is updated
          }
        }

        Animated.timing(animatedHeight, {
          toValue: 40, // Even more compact height for single row
          duration: 200,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleItemCompletionWithAmount = async (item: ShoppingItem, purchasedAmount?: number) => {
    if (!currentList || !user?.id) return;

    // Check permissions - only assigned user or owner can update items
    const canUpdateItem = currentList.ownerId === user.id || item.assignedTo === user.id;
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
          listId: currentList.id,
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
      const updatedItems = currentList.items.map(listItem => {
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

      // Redux will update the currentList automatically through WebSocket

      if (onListUpdate) {
        onListUpdate();
      }
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

    // Dismiss keyboard immediately
    Keyboard.dismiss();

    // Clear the expanded state immediately so input disappears
    setExpandedItemId(null);
    setAmountInput('');

    // Save the item with amount
    handleItemCompletionWithAmount(item, finalAmount);
  };

  const handleAmountCancel = () => {
    // Dismiss keyboard immediately
    Keyboard.dismiss();

    // Clear state immediately
    setExpandedItemId(null);
    setAmountInput('');
  };

  const handleFinishShopping = () => {
    if (!currentList) return;

    // Check if all items are completed
    const remainingItems = currentList.items.filter(item => !item.completed);
    const currentCompletedItems = currentList.items.filter(item => item.completed);

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
              showArchiveConfirmation(totalSpent, completedItems.size, currentList.items.length),
          },
        ]
      );
    } else {
      // All items completed - show archive confirmation
      showArchiveConfirmation(totalSpent, completedItems.size, currentList.items.length);
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
    if (!currentList) return;

    try {
      setIsLoading(true);

      // Archive the list via Redux
      await dispatch(archiveShoppingList(currentList.id)).unwrap();

      // Clear shopping state and go back to list selection
      handleClearShoppingState();

      // Show success message
      Alert.alert(
        'List Archived Successfully! ✅',
        `"${currentList.name}" has been moved to your archived lists.\n\nYou can view the complete purchase history in the Lists section.`,
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
    <SafeAreaView style={[baseStyles.container, themedStyles.container]}>
      {/* Header */}
      <View style={baseStyles.header}>
        <Typography variant='h3' color={safeTheme.colors.text.primary}>
          Shop
        </Typography>
      </View>

      {/* Lists */}
      <ScrollView
        style={baseStyles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingLists}
            onRefresh={onRefresh}
            colors={[safeTheme?.colors?.primary?.['500'] || '#3b82f6']}
            tintColor={safeTheme?.colors?.primary?.['500'] || '#3b82f6'}
          />
        }>
        {error ? (
          <View style={baseStyles.emptyContainer}>
            <Typography variant='h3' style={[baseStyles.emptyTitle, themedStyles.emptyTitle]}>
              Error Loading Lists
            </Typography>
            <Typography variant='body1' style={[baseStyles.emptyText, themedStyles.emptyText]}>
              {error}
            </Typography>
          </View>
        ) : displayLists.filter(list => list.status !== 'archived').length === 0 ? (
          <View style={baseStyles.emptyContainer}>
            <Typography variant='h3' style={[baseStyles.emptyTitle, themedStyles.emptyTitle]}>
              {isLoadingLists ? 'Loading...' : 'No Active Shopping Lists'}
            </Typography>
            <Typography variant='body1' style={[baseStyles.emptyText, themedStyles.emptyText]}>
              {isLoadingLists
                ? 'Please wait while we load your lists'
                : 'Create a shopping list first to start shopping'}
            </Typography>
          </View>
        ) : (
          <View style={{ paddingVertical: 4 }}>
            {displayLists
              .filter(list => list.status !== 'archived')
              .map((list, index) => (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    baseStyles.listCard,
                    themedStyles.listCard,
                    { borderLeftColor: getListCardColor(index) },
                  ]}
                  onPress={() => handleSelectList(list)}>
                  {/* Card Header */}
                  <View style={baseStyles.listHeader}>
                    <View style={baseStyles.listMeta}>
                      <Typography
                        variant='body1'
                        color={safeTheme.colors.text.primary}
                        style={baseStyles.listTitle}>
                        {list.name}
                      </Typography>
                      <View style={baseStyles.listStats}>
                        <View style={baseStyles.listStatItem}>
                          <Typography
                            variant='caption'
                            color={safeTheme.colors.text.secondary}
                            style={baseStyles.listStatText}>
                            📦 {list.itemsCount || 0} items
                          </Typography>
                        </View>
                        <View style={baseStyles.listStatItem}>
                          <Typography
                            variant='caption'
                            color={safeTheme.colors.text.secondary}
                            style={baseStyles.listStatText}>
                            ✅ {list.completedCount || 0} done
                          </Typography>
                        </View>
                      </View>
                    </View>

                    <View style={baseStyles.listProgress}>
                      <Typography
                        variant='caption'
                        color={safeTheme.colors.text.secondary}
                        style={baseStyles.progressText}>
                        {Math.round(list.progress || 0)}%
                      </Typography>
                      <View style={[baseStyles.progressBar, themedStyles.progressBar]}>
                        <View
                          style={[
                            baseStyles.progressFill,
                            themedStyles.progressFill,
                            dynamicStyles.createProgressFillStyle(Math.round(list.progress || 0)),
                            dynamicStyles.createColorStripStyle(getListCardColor(index)),
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  {/* Card Footer */}
                  <View style={baseStyles.listCardFooter}>
                    <View style={baseStyles.listStats}>
                      {list.totalSpent > 0 && (
                        <Typography
                          variant='caption'
                          color={safeTheme.colors.text.secondary}
                          style={baseStyles.listStatText}>
                          💰 ${list.totalSpent.toFixed(2)} spent
                        </Typography>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[baseStyles.startShoppingButton, themedStyles.startShoppingButton]}
                      onPress={() => handleSelectList(list)}>
                      <Typography
                        variant='caption'
                        style={[
                          baseStyles.startShoppingButtonText,
                          themedStyles.startShoppingButtonText,
                        ]}>
                        Start Shopping
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );

  const renderShoppingMode = () => (
    <SafeAreaView style={[baseStyles.container, themedStyles.container]}>
      {/* Header */}
      <View style={baseStyles.header}>
        <TouchableOpacity
          onPress={handleBackToListSelection}
          style={[baseStyles.backButton, themedStyles.backButton]}>
          <Typography variant='body1' style={{ fontSize: 20 }}>
            ←
          </Typography>
        </TouchableOpacity>
        <View style={baseStyles.headerCenter}>
          <Typography variant='h3' color={safeTheme.colors.text.primary}>
            {currentList?.name}
          </Typography>
          <Typography
            variant='caption'
            color={safeTheme.colors.text.secondary}
            style={baseStyles.headerSubtitleInShopping}>
            {completedItems.size} of {currentList?.itemsCount || 0} completed
          </Typography>
          {currentList && currentList.collaborators && currentList.collaborators.length > 1 && (
            <View style={baseStyles.avatarStack}>
              {currentList.collaborators.slice(0, 4).map((collaborator, index) => (
                <View
                  key={collaborator.userId}
                  style={[
                    baseStyles.stackedAvatar,
                    {
                      zIndex: currentList.collaborators.length - index,
                      marginLeft: index > 0 ? -8 : 0,
                      backgroundColor: 'transparent',
                    },
                  ]}>
                  {renderAvatar(getUserAvatar(collaborator.userId), 24)}
                </View>
              ))}
              {currentList.collaborators.length > 4 && (
                <View
                  style={[
                    baseStyles.stackedAvatar,
                    themedStyles.moreIndicator,
                    { zIndex: 0, marginLeft: -8 },
                  ]}>
                  <Typography
                    variant='caption'
                    color={(safeTheme?.colors as any)?.background?.primary || '#ffffff'}
                    style={baseStyles.stackedAvatarText}>
                    +{currentList.collaborators.length - 4}
                  </Typography>
                </View>
              )}
            </View>
          )}
        </View>
        {/* Finish button - only visible to list owner */}
        {currentList && currentList.ownerId === user?.id && (
          <TouchableOpacity
            onPress={handleFinishShopping}
            style={[baseStyles.finishButton, themedStyles.finishButton]}>
            <Typography
              variant='caption'
              style={[baseStyles.finishButtonText, themedStyles.finishButtonText]}>
              Finish
            </Typography>
          </TouchableOpacity>
        )}

        {/* Integrated Progress Bar */}
        <View
          style={[
            baseStyles.progressBarLarge,
            themedStyles.progressBarLarge,
            baseStyles.integratedProgressBar,
          ]}>
          <View
            style={[
              baseStyles.progressFillLarge,
              themedStyles.progressFillLarge,
              {
                width: `${currentList ? Math.round((completedItems.size / currentList.itemsCount) * 100) : 0}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Shopping Items */}
      <FlatList
        ref={setFlatListRef}
        style={{ marginTop: 16 }}
        data={currentList?.items || []}
        keyExtractor={item => item.id}
        extraData={currentList?.id} // Force re-render when currentList changes
        onScrollToIndexFailed={info => {
          // Fallback scroll for when scrollToIndex fails
          const wait = new Promise(resolve => setTimeout(resolve, 500));
          wait.then(() => {
            if (flatListRef) {
              flatListRef.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }
          });
        }}
        renderItem={({ item }) => {
          return (
            <View style={baseStyles.shoppingItemContainer}>
              <TouchableOpacity
                style={
                  [
                    baseStyles.shoppingItem,
                    themedStyles.shoppingItem,
                    completedItems.has(item.id) && baseStyles.shoppingItemCompleted,
                    item.assignedTo && [
                      baseStyles.shoppingItemAssigned,
                      themedStyles.shoppingItemAssigned,
                    ],
                    item.assignedTo && {
                      borderLeftColor: getCollaboratorColor(
                        item.assignedTo,
                        currentList?.collaborators
                      ),
                      borderLeftWidth: 4,
                    },
                    isItemReadOnly(item) && [
                      baseStyles.shoppingItemReadOnly,
                      themedStyles.shoppingItemReadOnly,
                    ],
                    expandedItemId === item.id &&
                      !completedItems.has(item.id) && {
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                        marginBottom: 0,
                      },
                  ] as any
                }
                onPress={() => handleToggleItem(item)}>
                <View style={baseStyles.itemLeft}>
                  <View
                    style={[
                      baseStyles.checkbox,
                      themedStyles.checkbox,
                      completedItems.has(item.id) && [
                        baseStyles.checkboxCompleted,
                        themedStyles.checkboxCompleted,
                      ],
                    ]}>
                    {completedItems.has(item.id) && (
                      <Typography
                        variant='caption'
                        style={[baseStyles.checkmark, themedStyles.checkmark]}>
                        ✓
                      </Typography>
                    )}
                  </View>
                  <Typography variant='h2' style={baseStyles.itemIcon}>
                    {item.icon}
                  </Typography>
                  <View style={baseStyles.itemInfo}>
                    <Typography
                      variant='body1'
                      color={safeTheme.colors.text.primary}
                      style={[
                        baseStyles.itemName,
                        completedItems.has(item.id) && baseStyles.itemNameCompleted,
                      ]}>
                      {item.name}
                    </Typography>
                    <View style={baseStyles.itemDetails}>
                      <Typography
                        variant='caption'
                        color={safeTheme.colors.text.secondary}
                        style={baseStyles.itemQuantity}>
                        {item.quantity} {item.unit}
                      </Typography>

                      {item.assignedTo && currentList && currentList.collaborators && (
                        <View style={baseStyles.assignmentRow}>
                          <Typography
                            variant='caption'
                            color={getCollaboratorColor(
                              item.assignedTo,
                              currentList?.collaborators
                            )}
                            style={baseStyles.assignmentIndicator}>
                            • Assigned to {getUserName(item.assignedTo)}
                          </Typography>
                          <View
                            style={[
                              baseStyles.assignedAvatarInline,
                              themedStyles.assignedAvatarInline,
                              dynamicStyles.transparentAvatarStyle,
                            ]}>
                            {renderAvatar(getUserAvatar(item.assignedTo), 20)}
                          </View>
                        </View>
                      )}

                      {/* Permission indicator */}
                      {item.assignedTo &&
                        item.assignedTo !== user?.id &&
                        currentList!.ownerId !== user?.id && (
                          <Typography
                            variant='caption'
                            color={safeTheme.colors.text.tertiary}
                            style={baseStyles.permissionIndicator}>
                            Only {getUserName(item.assignedTo)} can update this item
                          </Typography>
                        )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Inline Amount Input - Shows when item is tapped but not completed */}
              {expandedItemId === item.id && !completedItems.has(item.id) && (
                <Animated.View
                  style={[
                    baseStyles.amountInputContainer,
                    themedStyles.amountInputContainer,
                    { height: animatedHeight, overflow: 'hidden' },
                  ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Typography
                      variant='caption'
                      color={safeTheme.colors.text.secondary}
                      style={{ fontSize: 11, width: 35 }}>
                      $
                    </Typography>
                    <View
                      style={[
                        baseStyles.amountInputField,
                        themedStyles.amountInputField,
                        { flex: 1, minWidth: 60 },
                      ]}>
                      <TextInput
                        style={{ flex: 1, fontSize: 14, paddingVertical: 4, textAlign: 'center' }}
                        value={amountInput}
                        onChangeText={setAmountInput}
                        placeholder='0.00'
                        placeholderTextColor={safeTheme.colors.text.tertiary}
                        keyboardType='numeric'
                        autoFocus
                        selectTextOnFocus
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        baseStyles.amountCancelButton,
                        themedStyles.amountCancelButton,
                        { paddingVertical: 4, paddingHorizontal: 8, minWidth: 45 },
                      ]}
                      onPress={handleAmountCancel}>
                      <Typography
                        variant='caption'
                        color={safeTheme.colors.text.secondary}
                        style={{ fontSize: 11 }}>
                        ✕
                      </Typography>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        baseStyles.amountConfirmButton,
                        themedStyles.amountConfirmButton,
                        { paddingVertical: 4, paddingHorizontal: 8, minWidth: 45 },
                      ]}
                      onPress={() => handleAmountConfirm(item)}>
                      <Typography
                        variant='caption'
                        color={(safeTheme?.colors as any)?.background?.primary || '#ffffff'}
                        style={{ fontSize: 11 }}>
                        ✓
                      </Typography>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: hasContributors ? 160 : 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps='handled'
      />

      {/* Floating Consult Contributors Button */}
      {hasContributors && (
        <View style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 1000 }}>
          <ConsultButton
            onPress={handleConsultPress}
            testID='consult-contributors-button'
            accessibilityLabel='Consult contributors'
            accessibilityHint='Contact list contributors for questions or confirmations'
          />
        </View>
      )}
    </SafeAreaView>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={[baseStyles.container, themedStyles.container]}>
        {renderContent()}

        {/* Consult Contributors Modal */}
        <ConsultContributorsModal
          visible={showConsultModal}
          contributors={getContributors()}
          listName={currentList?.name || 'Shopping List'}
          onDismiss={handleConsultModalClose}
          testID='shop-consult-modal'
        />

        {/* TODO: Add modals when molecular components are created */}
        {/* UnfinishedListModal and ArchiveConfirmationModal will be added later */}
      </SafeAreaView>
    </GradientBackground>
  );
};

// All styles are now extracted to ShopScreen.styles.ts - no local styles needed!
