// ========================================
// Shopping Lists Screen - List Management
// ========================================

import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';
import {
  type CreateListFormData,
  CreateListModal,
} from '../../components/molecules/CreateListModal';
import { ListCreationSuccessAnimation } from '../../components/molecules/ListCreationSuccessAnimation';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  createShoppingList,
  loadShoppingList,
  loadShoppingLists,
  selectFilteredLists,
  selectIsCreatingList,
  selectIsLoadingLists,
  selectShoppingListError,
  selectShoppingListStats,
  selectShoppingLists,
  selectShowCreateListModal,
  setShowCreateListModal,
} from '../../../application/store/slices/shoppingListSlice';
import { selectUser } from '../../../application/store/slices/authSlice';
import type { AppDispatch } from '../../../application/store';

// Types
import type { ShoppingList } from '../../../shared/types/lists';

export interface ShoppingListsScreenProps {
  onListPress?: (list: ShoppingList) => void;
  onCreateList?: () => void;
}

export const ShoppingListsScreen: React.FC<ShoppingListsScreenProps> = ({
  onListPress,
  onCreateList,
}) => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Redux selectors
  const user = useSelector(selectUser);
  const lists = useSelector(selectFilteredLists);
  const isLoading = useSelector(selectIsLoadingLists);
  const isCreatingList = useSelector(selectIsCreatingList);
  const error = useSelector(selectShoppingListError);
  const stats = useSelector(selectShoppingListStats);
  const showCreateListModal = useSelector(selectShowCreateListModal);

  // Local state for success animation
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  // Debug: Log modal state changes
  useEffect(() => {
    console.log('🔍 DEBUG: showCreateListModal state changed:', showCreateListModal);
  }, [showCreateListModal]);

  // Load shopping lists on mount
  useEffect(() => {
    if (user?.id) {
      console.log('🛒 Loading shopping lists for user:', user.id);
      dispatch(loadShoppingLists({ status: 'active', limit: 50 }));
    }
  }, [dispatch, user?.id]);

  // Handle pull to refresh
  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    console.log('🔄 Refreshing shopping lists...');
    try {
      await dispatch(loadShoppingLists({ status: 'active', limit: 50 })).unwrap();
    } catch (error) {
      console.error('Failed to refresh shopping lists:', error);
      Alert.alert('Error', 'Failed to refresh shopping lists');
    }
  }, [dispatch, user?.id]);

  // Handle create list button press
  const handleCreateList = useCallback(() => {
    console.log('🔍 DEBUG: Create list button pressed');
    console.log('🔍 DEBUG: onCreateList prop:', onCreateList);

    if (onCreateList) {
      console.log('🔍 DEBUG: Using onCreateList prop');
      onCreateList();
      return;
    }

    console.log('🔍 DEBUG: Dispatching setShowCreateListModal(true)');
    dispatch(setShowCreateListModal(true));
  }, [dispatch, onCreateList]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    dispatch(setShowCreateListModal(false));
  }, [dispatch]);

  // Handle list creation from modal
  const handleCreateListFromModal = useCallback(
    async (formData: CreateListFormData) => {
      try {
        console.log('➕ Creating new shopping list with data:', formData);

        await dispatch(createShoppingList(formData)).unwrap();

        console.log('✅ Shopping list created successfully');

        // Close the create modal first
        dispatch(setShowCreateListModal(false));

        // Show success animation
        setShowSuccessAnimation(true);
      } catch (error: any) {
        console.error('❌ Failed to create shopping list:', error);

        // Let the modal handle the error display
        throw error;
      }
    },
    [dispatch]
  );

  // Handle success animation completion
  const handleSuccessAnimationComplete = useCallback(() => {
    setShowSuccessAnimation(false);
  }, []);

  // Handle list press
  const handleListPress = useCallback(
    async (list: ShoppingList) => {
      // Load the shopping list to set currentList in Redux (for WebSocket room joining)
      try {
        await dispatch(loadShoppingList(list.id)).unwrap();
      } catch (error) {
        console.error('Failed to load shopping list for WebSocket room:', error);
      }

      if (onListPress) {
        onListPress(list);
      } else {
        console.log('📝 Selected list:', list.name);
        Alert.alert('List Selected', `You selected: ${list.name}`);
      }
    },
    [dispatch, onListPress]
  );

  // Render list item
  const renderListItem = useCallback(
    ({ item }: { item: ShoppingList }) => (
      <View
        style={{
          backgroundColor: theme.colors.surface.card,
          padding: theme.spacing.md,
          marginHorizontal: theme.spacing.md,
          marginVertical: theme.spacing.xs,
          borderRadius: (theme as any).borderRadius.md,
          shadowColor: (theme.colors as any).shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}>
          <View style={{ flex: 1 }}>
            <Typography
              variant='h3'
              style={{ color: theme.colors.text.primary, marginBottom: theme.spacing.xs }}>
              {item.name}
            </Typography>

            {item.description && (
              <Typography
                variant='body2'
                style={{
                  color: theme.colors.text.secondary,
                  marginBottom: theme.spacing.xs,
                }}>
                {item.description}
              </Typography>
            )}

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: theme.spacing.xs,
              }}>
              <Typography
                variant='caption'
                style={{
                  color: theme.colors.text.secondary,
                  marginRight: theme.spacing.md,
                }}>
                {item.itemsCount} items
              </Typography>
              <Typography
                variant='caption'
                style={{
                  color: theme.colors.text.secondary,
                  marginRight: theme.spacing.md,
                }}>
                {item.completedCount} completed
              </Typography>
              <Typography variant='caption' style={{ color: theme.colors.primary[500] }}>
                {Math.round(item.progress)}% done
              </Typography>
            </View>

            {item.budget && (
              <Typography variant='caption' style={{ color: theme.colors.text.secondary }}>
                Budget: {item.budget.currency} {item.budget.total} • Spent: {item.budget.currency}{' '}
                {item.totalSpent}
              </Typography>
            )}
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <View
              style={{
                backgroundColor:
                  item.status === 'active'
                    ? theme.colors.semantic.success[500]
                    : theme.colors.text.secondary,
                paddingHorizontal: theme.spacing.sm,
                paddingVertical: theme.spacing.xs,
                borderRadius: (theme as any).borderRadius.sm,
                marginBottom: theme.spacing.xs,
              }}>
              <Typography
                variant='caption'
                style={{ color: theme.colors.surface.background, textTransform: 'capitalize' }}>
                {item.status}
              </Typography>
            </View>

            <Button
              title='Open'
              variant='outline'
              onPress={() => handleListPress(item)}
              style={{ minWidth: 60 }}
            />
          </View>
        </View>
      </View>
    ),
    [theme, handleListPress]
  );

  // Render empty state
  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.xl,
      }}>
      <Typography
        variant='h2'
        style={{
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.md,
          textAlign: 'center',
        }}>
        No Shopping Lists
      </Typography>
      <Typography
        variant='body1'
        style={{
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.xl,
          textAlign: 'center',
        }}>
        Create your first shopping list to get started with collaborative shopping!
      </Typography>
      <Button title='Create List' onPress={handleCreateList} />
    </View>
  );

  // Render error state
  if (error) {
    return (
      <GradientBackground>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              padding: theme.spacing.xl,
            }}>
            <Typography
              variant='h2'
              style={{
                color: theme.colors.semantic.error[500],
                marginBottom: theme.spacing.md,
                textAlign: 'center',
              }}>
              Error Loading Lists
            </Typography>
            <Typography
              variant='body1'
              style={{
                color: theme.colors.text.secondary,
                marginBottom: theme.spacing.xl,
                textAlign: 'center',
              }}>
              {error}
            </Typography>
            <Button title='Try Again' onPress={onRefresh} variant='outline' />
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            padding: theme.spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border.primary,
          }}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Typography variant='h1' style={{ color: theme.colors.text.primary }}>
                Shopping Lists
              </Typography>
              <Typography variant='body2' style={{ color: theme.colors.text.secondary }}>
                {stats.totalLists} lists • {stats.activeLists} active
              </Typography>
            </View>

            <Button title='New List' onPress={handleCreateList} />
          </View>
        </View>

        {/* Lists */}
        <FlatList
          data={lists}
          renderItem={renderListItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: theme.spacing.md,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={onRefresh}
              colors={[theme.colors.primary[500]]}
              tintColor={theme.colors.primary[500]}
            />
          }
          ListEmptyComponent={!isLoading ? renderEmptyState : null}
          showsVerticalScrollIndicator={false}
        />

        {/* Create List Modal */}
        <CreateListModal
          visible={showCreateListModal}
          onClose={handleCloseModal}
          onCreateList={handleCreateListFromModal}
          isLoading={isCreatingList}
          error={error}
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
