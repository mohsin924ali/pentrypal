// ========================================
// Dashboard Screen - Comprehensive Analytics & Overview
// ========================================

import React, { useEffect, useMemo } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useNetwork } from '../../providers/NetworkProvider';

// Styles
import { baseStyles, createDynamicStyles } from './DashboardScreen.styles';

// Icons
const CreateListIcon = require('../../../assets/images/createList.png');

// Store
import type { AppDispatch, RootState } from '../../../application/store';
import { selectUser } from '../../../application/store/slices/authSlice';
import {
  loadShoppingLists,
  selectFilteredLists,
  selectIsLoadingLists,
} from '../../../application/store/slices/shoppingListSlice';

// Types
export type DashboardScreenProps = Record<string, never>;

const { width: screenWidth } = Dimensions.get('window');

/**
 * Helper function to intelligently categorize items based on their names
 */
const getCategoryFromName = (itemName: string): string => {
  if (!itemName || typeof itemName !== 'string') return 'other';

  const name = itemName.toLowerCase();

  // Fruits and vegetables
  if (
    name.includes('apple') ||
    name.includes('banana') ||
    name.includes('orange') ||
    name.includes('grape') ||
    name.includes('berry') ||
    name.includes('cherry') ||
    name.includes('peach') ||
    name.includes('pear') ||
    name.includes('lemon') ||
    name.includes('lime') ||
    name.includes('mango') ||
    name.includes('pineapple') ||
    name.includes('watermelon') ||
    name.includes('melon') ||
    name.includes('kiwi') ||
    name.includes('strawberry') ||
    name.includes('blueberry') ||
    name.includes('blackberry') ||
    name.includes('raspberry') ||
    name.includes('tomato') ||
    name.includes('cucumber') ||
    name.includes('lettuce') ||
    name.includes('spinach') ||
    name.includes('carrot') ||
    name.includes('potato') ||
    name.includes('onion') ||
    name.includes('garlic') ||
    name.includes('pepper') ||
    name.includes('broccoli') ||
    name.includes('cauliflower') ||
    name.includes('cabbage') ||
    name.includes('celery') ||
    name.includes('avocado')
  ) {
    return 'fruits';
  }

  // Dairy and eggs
  if (
    name.includes('milk') ||
    name.includes('cheese') ||
    name.includes('butter') ||
    name.includes('yogurt') ||
    name.includes('cream') ||
    name.includes('egg')
  ) {
    return 'dairy';
  }

  // Meat and seafood
  if (
    name.includes('chicken') ||
    name.includes('beef') ||
    name.includes('fish') ||
    name.includes('salmon') ||
    name.includes('tuna') ||
    name.includes('shrimp') ||
    name.includes('meat') ||
    name.includes('turkey') ||
    name.includes('lamb')
  ) {
    return 'meat';
  }

  // Beverages
  if (
    name.includes('juice') ||
    name.includes('soda') ||
    name.includes('water') ||
    name.includes('coffee') ||
    name.includes('tea') ||
    name.includes('drink')
  ) {
    return 'beverages';
  }

  // Snacks
  if (
    name.includes('chips') ||
    name.includes('cookie') ||
    name.includes('candy') ||
    name.includes('chocolate') ||
    name.includes('nuts') ||
    name.includes('crackers')
  ) {
    return 'snacks';
  }

  return 'other';
};

/**
 * Dashboard Screen Component
 *
 * Comprehensive overview screen with:
 * - Real-time statistics from Redux store
 * - Beautiful spending analytics and charts
 * - Professional spending breakdown by user
 * - Recent activity and list summaries
 * - Quick action buttons
 * - Budget tracking and alerts
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const dispatch = useDispatch<AppDispatch>();

  // Create dynamic styles
  const dynamicStyles = createDynamicStyles(theme);

  const user = useSelector(selectUser);
  const lists = useSelector(selectFilteredLists);
  const isLoadingLists = useSelector(selectIsLoadingLists);
  const [refreshing, setRefreshing] = React.useState(false);

  // Budget Management State
  const [monthlyBudget, setMonthlyBudget] = React.useState<number>(0);
  const [showBudgetModal, setShowBudgetModal] = React.useState(false);
  const [budgetInput, setBudgetInput] = React.useState('');

  // Load monthly budget from storage
  const loadMonthlyBudget = React.useCallback(async () => {
    try {
      if (!user?.id || typeof user.id !== 'string' || user.id.trim() === '') {
        console.log('💰 No valid user ID available, skipping budget load');
        return;
      }

      console.log('💰 Loading budget for user:', user.id);
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const budgetKey = `@pentrypal/monthly-budget-${user.id}`;

      if (!budgetKey || budgetKey.includes('undefined') || budgetKey.includes('null')) {
        console.error('💰 Invalid budget key generated:', budgetKey);
        return;
      }

      const savedBudget = await AsyncStorage.getItem(budgetKey);
      if (savedBudget) {
        const budgetValue = parseFloat(savedBudget);
        console.log('💰 Loaded budget:', budgetValue);
        setMonthlyBudget(budgetValue);
      } else {
        console.log('💰 No saved budget found');
      }
    } catch (error) {
      console.error('💰 Failed to load monthly budget:', error);
    }
  }, [user?.id]);

  // Load data on mount and focus
  useFocusEffect(
    React.useCallback(() => {
      dispatch(loadShoppingLists({ limit: 100 }));
      if (user?.id) {
        loadMonthlyBudget();
      }
    }, [dispatch, loadMonthlyBudget, user?.id])
  );

  // Load budget when user becomes available
  useEffect(() => {
    if (user?.id && typeof user.id === 'string' && user.id.trim() !== '') {
      loadMonthlyBudget();
    }
  }, [user?.id, loadMonthlyBudget]);

  // Save monthly budget to storage
  const saveMonthlyBudget = React.useCallback(
    async (budget: number) => {
      try {
        if (!user?.id || typeof user.id !== 'string' || user.id.trim() === '') {
          console.error('💰 No valid user ID available, cannot save budget');
          return;
        }

        console.log('💰 Saving budget for user:', user.id, 'amount:', budget);
        const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
        const budgetKey = `@pentrypal/monthly-budget-${user.id}`;

        if (!budgetKey || budgetKey.includes('undefined') || budgetKey.includes('null')) {
          console.error('💰 Invalid budget key for save:', budgetKey);
          return;
        }

        await AsyncStorage.setItem(budgetKey, budget.toString());
        setMonthlyBudget(budget);
        console.log('💰 Budget saved successfully');
      } catch (error) {
        console.error('💰 Failed to save monthly budget:', error);
      }
    },
    [user?.id]
  );

  // Handle budget setting
  const handleSetBudget = () => {
    const budget = parseFloat(budgetInput);
    if (isNaN(budget) || budget < 0) {
      Alert.alert(
        'Invalid Budget',
        'Please enter a valid budget amount greater than or equal to 0.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (budget > 10000) {
      Alert.alert('Budget Too High', 'Please enter a budget amount less than $10,000.', [
        { text: 'OK' },
      ]);
      return;
    }
    saveMonthlyBudget(budget);
    setBudgetInput('');
    setShowBudgetModal(false);

    // Show success message
    if (budget > 0) {
      Alert.alert(
        'Budget Set Successfully',
        `Your monthly budget has been set to $${isNaN(budget) ? '0.00' : budget.toFixed(2)}. You'll receive alerts when you approach your limit.`,
        [{ text: 'OK' }]
      );
    }
  };

  // Handle budget modal
  const openBudgetModal = () => {
    setBudgetInput(monthlyBudget > 0 ? monthlyBudget.toString() : '');
    setShowBudgetModal(true);
  };

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadShoppingLists({ limit: 100 })).unwrap();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Helper function to get user display name
  const getUserName = (userId: string): string => {
    if (!userId || typeof userId !== 'string') return 'Unknown User';
    if (userId === user?.id) return 'You';

    // Look up in collaborators from all lists
    for (const list of lists) {
      if (list.collaborators && Array.isArray(list.collaborators)) {
        const collaborator = list.collaborators.find(c => c.userId === userId);
        if (collaborator && collaborator.name && typeof collaborator.name === 'string') {
          return collaborator.name;
        }
      }
    }

    return 'Unknown User';
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString: string): string => {
    if (!dateString || typeof dateString !== 'string') return 'Unknown time';

    try {
      const date = new Date(dateString);
      const now = new Date();

      if (isNaN(date.getTime())) return 'Unknown time';

      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;
      const diffInWeeks = Math.floor(diffInDays / 7);
      return `${diffInWeeks}w ago`;
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    const activeLists = lists.filter(list => list.status === 'active');
    const completedLists = lists.filter(list => list.status === 'completed');
    const archivedLists = lists.filter(list => list.status === 'archived');

    const totalItems = lists.reduce((sum, list) => sum + list.itemsCount, 0);
    const completedItems = lists.reduce((sum, list) => sum + list.completedCount, 0);
    const pendingItems = totalItems - completedItems;

    // Calculate current user's spending only
    let userTotalSpent = 0;
    let userThisMonthSpent = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    lists.forEach(list => {
      list.items.forEach(item => {
        if (item.completed && item.purchasedAmount) {
          const userId = item.assignedTo || list.ownerId;
          if (userId === user?.id) {
            const amount =
              (typeof item.purchasedAmount === 'number'
                ? item.purchasedAmount
                : parseFloat(String(item.purchasedAmount))) || 0;
            userTotalSpent += amount;

            // Check if this item was purchased this month
            const itemDate = new Date(item.updatedAt || list.updatedAt);
            if (itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear) {
              userThisMonthSpent += amount;
            }
          }
        }
      });
    });

    const totalSpent = lists.reduce((sum, list) => sum + (list.totalSpent || 0), 0);
    const totalBudget = lists.reduce((sum, list) => sum + (list.budget?.total || 0), 0);

    // Budget calculations
    const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - userThisMonthSpent : 0;
    const budgetPercentage = monthlyBudget > 0 ? (userThisMonthSpent / monthlyBudget) * 100 : 0;
    const isOverBudget = monthlyBudget > 0 && userThisMonthSpent > monthlyBudget;
    const overBudgetAmount = isOverBudget ? userThisMonthSpent - monthlyBudget : 0;
    const isNearBudgetLimit = monthlyBudget > 0 && budgetPercentage >= 80 && !isOverBudget;

    return {
      activeLists: activeLists.length,
      completedLists: completedLists.length,
      archivedLists: archivedLists.length,
      totalLists: lists.length,
      totalItems,
      completedItems,
      pendingItems,
      totalSpent, // Keep for "Who Spent How Much" section
      totalBudget,
      userTotalSpent, // Current user's total spending
      userThisMonthSpent, // Current user's this month spending
      averageSpentPerList: lists.length > 0 ? totalSpent / lists.length : 0,
      completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
      // Budget tracking
      monthlyBudget,
      budgetRemaining,
      budgetPercentage,
      isOverBudget,
      overBudgetAmount,
      isNearBudgetLimit,
    };
  }, [lists, user?.id, monthlyBudget]);

  // Calculate spending by user
  const spendingByUser = useMemo(() => {
    const userSpending: Record<string, { name: string; amount: number; itemCount: number }> = {};

    lists.forEach(list => {
      list.items.forEach(item => {
        if (item.completed && item.purchasedAmount) {
          const userId = item.assignedTo || list.ownerId;
          const userName = item.assignedTo
            ? getUserName(item.assignedTo)
            : getUserName(list.ownerId);

          if (!userSpending[userId]) {
            userSpending[userId] = {
              name: userName || 'Unknown User',
              amount: 0,
              itemCount: 0,
            };
          }

          userSpending[userId]!.amount +=
            (typeof item.purchasedAmount === 'number'
              ? item.purchasedAmount
              : parseFloat(String(item.purchasedAmount))) || 0;
          userSpending[userId]!.itemCount += 1;
        }
      });
    });

    return Object.entries(userSpending)
      .map(([userId, data]) => ({
        userId: userId || 'unknown',
        name: data.name || 'Unknown User',
        amount: data.amount || 0,
        itemCount: data.itemCount || 0,
        percentage:
          statistics.totalSpent > 0 && data.amount
            ? (data.amount / statistics.totalSpent) * 100
            : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [lists, statistics.totalSpent, user?.id]);

  // Calculate category-wise spending for current user
  const categorySpending = useMemo(() => {
    const categoryMap: Record<
      string,
      { name: string; icon: string; amount: number; itemCount: number }
    > = {};

    // Define category mappings (based on groceryItemsService categories)
    const categoryInfo = {
      fruits: { name: 'Fruits & Vegetables', icon: '🍎' },
      dairy: { name: 'Dairy & Eggs', icon: '🥛' },
      meat: { name: 'Halal Meat & Seafood', icon: '🥩' },
      pantry: { name: 'Pantry Staples', icon: '🏺' },
      beverages: { name: 'Beverages', icon: '🥤' },
      snacks: { name: 'Halal Snacks & Treats', icon: '🍿' },
      frozen: { name: 'Frozen Foods', icon: '🧊' },
      household: { name: 'Household Items', icon: '🧽' },
      spices: { name: 'Spices & Seasonings', icon: '🌶️' },
      other: { name: 'Other', icon: '📦' },
    };

    lists.forEach(list => {
      if (list && list.items && Array.isArray(list.items)) {
        list.items.forEach(item => {
          if (item && item.completed && item.purchasedAmount && item.name) {
            const userId = item.assignedTo || list.ownerId;
            if (userId === user?.id) {
              const amount =
                (typeof item.purchasedAmount === 'number'
                  ? item.purchasedAmount
                  : parseFloat(String(item.purchasedAmount))) || 0;

              // Get category ID - try item.category.id first, then intelligent categorization
              let categoryId: string;
              if (item.category && item.category.id && item.category.id !== 'other') {
                categoryId = item.category.id;
              } else {
                // Intelligently categorize based on item name
                categoryId = getCategoryFromName(item.name);
              }

              // Ensure categoryId is safe
              categoryId = categoryId || 'other';

              const categoryData =
                categoryInfo[categoryId as keyof typeof categoryInfo] || categoryInfo.other;

              if (!categoryMap[categoryId]) {
                categoryMap[categoryId] = {
                  name: categoryData.name || 'Unknown Category',
                  icon: categoryData.icon || '📦',
                  amount: 0,
                  itemCount: 0,
                };
              }

              categoryMap[categoryId]!.amount += amount;
              categoryMap[categoryId]!.itemCount += 1;
            }
          }
        });
      }
    });

    return Object.entries(categoryMap)
      .map(([categoryId, data]) => {
        // Ensure all values are safe for rendering
        if (!data || typeof data !== 'object') return null;

        return {
          categoryId: categoryId && typeof categoryId === 'string' ? categoryId : 'unknown',
          name: data.name && typeof data.name === 'string' ? data.name : 'Unknown Category',
          icon: data.icon && typeof data.icon === 'string' ? data.icon : '📦',
          amount: typeof data.amount === 'number' && !isNaN(data.amount) ? data.amount : 0,
          itemCount:
            typeof data.itemCount === 'number' && !isNaN(data.itemCount) ? data.itemCount : 0,
          percentage:
            statistics.userTotalSpent > 0 && typeof data.amount === 'number' && data.amount > 0
              ? (data.amount / statistics.userTotalSpent) * 100
              : 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) // Remove any null entries
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6); // Show top 6 categories
  }, [lists, statistics.userTotalSpent, user?.id]);

  // Recent activity from lists
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      type: string;
      title: string;
      time: string;
      user: string;
      amount?: number;
    }> = [];

    [...lists]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
      .forEach(list => {
        const timeAgo = getTimeAgo(list.updatedAt);

        if (list.status === 'archived') {
          const baseActivity = {
            id: `${list.id || 'unknown'}_archived`,
            type: 'list_completed' as const,
            title: `Completed "${(list.name || 'Unknown List').toString()}"`,
            time: getTimeAgo(list.updatedAt) || 'Unknown time',
            user: getUserName(list.ownerId) || 'Unknown',
          };

          const activity =
            typeof list.totalSpent === 'number' && !isNaN(list.totalSpent)
              ? { ...baseActivity, amount: list.totalSpent }
              : baseActivity;

          activities.push(activity);
        } else if (list.completedCount > 0) {
          activities.push({
            id: `${list.id || 'unknown'}_progress`,
            type: 'items_completed' as const,
            title: `${list.completedCount || 0}/${list.itemsCount || 0} items completed in "${(list.name || 'Unknown List').toString()}"`,
            time: getTimeAgo(list.updatedAt) || 'Unknown time',
            user: getUserName(list.ownerId) || 'Unknown',
          });
        } else {
          activities.push({
            id: `${list.id || 'unknown'}_created`,
            type: 'list_created' as const,
            title: `Created "${(list.name || 'Unknown List').toString()}"`,
            time: getTimeAgo(list.updatedAt) || 'Unknown time',
            user: getUserName(list.ownerId) || 'Unknown',
          });
        }
      });

    return activities.slice(0, 6);
  }, [lists, user?.id]);

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        {/* Header */}
        <View style={baseStyles.header}>
          <View style={baseStyles.headerContent}>
            <Typography variant='h3' color={theme.colors.text.primary}>
              {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'User'}!
            </Typography>

            <Typography
              variant='body1'
              color={theme.colors.text.secondary}
              style={baseStyles.headerGreetingSubtitle}>
              {isConnected ? "Here's your grocery overview" : 'Offline mode - showing cached data'}
            </Typography>
          </View>

          {/* Connection Status */}
          {!isConnected && (
            <View
              style={[
                baseStyles.statusBadge,
                { backgroundColor: theme.colors.semantic.warning[100] },
              ]}>
              <Typography variant='caption' color={theme.colors.semantic.warning[700]}>
                Offline
              </Typography>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={baseStyles.content}
          contentContainerStyle={baseStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoadingLists}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
            />
          }>
          {/* Overview Stats Cards */}
          <View style={baseStyles.statsContainer}>
            <View style={baseStyles.statsRow}>
              <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.primary[500]}>
                  {statistics.activeLists || 0}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Active Lists
                </Typography>
              </View>

              <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.secondary[500]}>
                  {statistics.pendingItems || 0}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Pending Items
                </Typography>
              </View>
            </View>

            <View style={baseStyles.statsRow}>
              <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.semantic.success[500]}>
                  {isNaN(statistics.completionRate) ? '0' : statistics.completionRate.toFixed(0)}%
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Completion Rate
                </Typography>
              </View>

              <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.accent[500]}>
                  {statistics.archivedLists || 0}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Completed Lists
                </Typography>
              </View>
            </View>
          </View>

          {/* Spending Overview - User's Personal Spending */}
          <View style={baseStyles.section}>
            <View style={baseStyles.spendingHeader}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={baseStyles.sectionTitle}>
                💰 Your Spending Overview
              </Typography>
              <TouchableOpacity onPress={openBudgetModal} style={baseStyles.budgetButton}>
                <Typography variant='caption' color={theme.colors.primary[500]}>
                  {monthlyBudget > 0 ? 'Edit Budget' : 'Set Budget'}
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Budget Alert */}
            {statistics.isOverBudget && (
              <View
                style={[
                  baseStyles.alertCard,
                  {
                    backgroundColor: theme.colors.semantic.error[50],
                    borderColor: theme.colors.semantic.error[200],
                  },
                ]}>
                <Typography variant='body2' color={theme.colors.semantic.error[700]}>
                  ⚠️ You've exceeded your monthly budget by $
                  {isNaN(statistics.overBudgetAmount)
                    ? '0.00'
                    : statistics.overBudgetAmount.toFixed(2)}
                </Typography>
              </View>
            )}

            {statistics.isNearBudgetLimit && (
              <View
                style={[
                  baseStyles.alertCard,
                  {
                    backgroundColor: theme.colors.semantic.warning[50],
                    borderColor: theme.colors.semantic.warning[200],
                  },
                ]}>
                <Typography variant='body2' color={theme.colors.semantic.warning[700]}>
                  🔔 You've used{' '}
                  {isNaN(statistics.budgetPercentage)
                    ? '0'
                    : statistics.budgetPercentage.toFixed(0)}
                  % of your monthly budget
                </Typography>
              </View>
            )}

            <View style={baseStyles.spendingOverview}>
              <View
                style={[baseStyles.spendingCard, { backgroundColor: theme.colors.surface.card }]}>
                <View style={baseStyles.spendingCardHeader}>
                  <Typography variant='caption' color={theme.colors.text.secondary}>
                    Your Total Spent
                  </Typography>
                  <Typography variant='h3' color={theme.colors.primary[500]}>
                    $
                    {isNaN(statistics.userTotalSpent)
                      ? '0.00'
                      : statistics.userTotalSpent.toFixed(2)}
                  </Typography>
                </View>

                <View style={baseStyles.spendingCardDetails}>
                  <View style={baseStyles.spendingDetail}>
                    <Typography variant='caption' color={theme.colors.text.tertiary}>
                      This Month
                    </Typography>
                    <Typography
                      variant='body2'
                      color={
                        statistics.isOverBudget
                          ? theme.colors.semantic.error[500]
                          : theme.colors.text.primary
                      }>
                      $
                      {isNaN(statistics.userThisMonthSpent)
                        ? '0.00'
                        : statistics.userThisMonthSpent.toFixed(2)}
                    </Typography>
                  </View>
                  <View style={baseStyles.spendingDetail}>
                    <Typography variant='caption' color={theme.colors.text.tertiary}>
                      {monthlyBudget > 0 ? 'Remaining' : 'Avg per List'}
                    </Typography>
                    <Typography variant='body2' color={theme.colors.text.primary}>
                      {monthlyBudget > 0
                        ? `$${isNaN(statistics.budgetRemaining) ? '0.00' : Math.max(0, statistics.budgetRemaining).toFixed(2)}`
                        : `$${isNaN(statistics.userTotalSpent) || isNaN(statistics.totalLists) ? '0.00' : (statistics.userTotalSpent / Math.max(1, statistics.totalLists)).toFixed(2)}`}
                    </Typography>
                  </View>
                </View>
              </View>

              {monthlyBudget > 0 && (
                <View
                  style={[baseStyles.budgetCard, { backgroundColor: theme.colors.surface.card }]}>
                  <View style={baseStyles.budgetCardHeader}>
                    <Typography variant='caption' color={theme.colors.text.secondary}>
                      Monthly Budget Progress
                    </Typography>
                    <Typography variant='body2' color={theme.colors.text.primary}>
                      {isNaN(statistics.budgetPercentage)
                        ? '0'
                        : statistics.budgetPercentage.toFixed(0)}
                      %
                    </Typography>
                  </View>
                  <View style={baseStyles.budgetProgress}>
                    <View
                      style={[
                        baseStyles.budgetProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={[
                          baseStyles.budgetProgressFill,
                          dynamicStyles.budgetProgressFillDynamic(
                            statistics.budgetPercentage,
                            statistics.isOverBudget
                              ? theme.colors.semantic.error[500]
                              : statistics.isNearBudgetLimit
                                ? theme.colors.semantic.warning[500]
                                : theme.colors.semantic.success[500]
                          ),
                        ]}
                      />
                    </View>
                    <Typography variant='caption' color={theme.colors.text.secondary}>
                      $
                      {isNaN(statistics.userThisMonthSpent)
                        ? '0.00'
                        : statistics.userThisMonthSpent.toFixed(2)}{' '}
                      / ${isNaN(monthlyBudget) ? '0.00' : monthlyBudget.toFixed(2)}
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Spending by User */}
          {spendingByUser.length > 0 && (
            <View style={baseStyles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={baseStyles.sectionTitle}>
                👥 Who Spent How Much
              </Typography>

              {spendingByUser.map((userSpending, index) => (
                <View
                  key={userSpending.userId}
                  style={[
                    baseStyles.userSpendingCard,
                    { backgroundColor: theme.colors.surface.card },
                  ]}>
                  <View style={baseStyles.userSpendingHeader}>
                    <View style={baseStyles.userSpendingInfo}>
                      <Typography variant='body1' color={theme.colors.text.primary}>
                        {userSpending.name || 'Unknown User'}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {userSpending.itemCount || 0} items purchased
                      </Typography>
                    </View>
                    <View style={baseStyles.userSpendingAmount}>
                      <Typography variant='h6' color={theme.colors.primary[500]}>
                        ${isNaN(userSpending.amount) ? '0.00' : userSpending.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {isNaN(userSpending.percentage)
                          ? '0.0'
                          : userSpending.percentage.toFixed(1)}
                        %
                      </Typography>
                    </View>
                  </View>

                  <View style={baseStyles.userSpendingProgress}>
                    <View
                      style={[
                        baseStyles.userProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={[
                          baseStyles.userProgressFill,
                          dynamicStyles.userProgressFillDynamic(
                            userSpending.percentage,
                            index === 0 ? theme.colors.primary[500] : theme.colors.secondary[400]
                          ),
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Category-wise Spending */}
          {categorySpending.length > 0 && (
            <View style={baseStyles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={baseStyles.sectionTitle}>
                📊 Spending by Category
              </Typography>

              {categorySpending.map((category, index) => (
                <View
                  key={category.categoryId}
                  style={[
                    baseStyles.categorySpendingCard,
                    { backgroundColor: theme.colors.surface.card },
                  ]}>
                  <View style={baseStyles.categorySpendingHeader}>
                    <View style={baseStyles.categorySpendingInfo}>
                      <View style={baseStyles.categorySpendingTitleRow}>
                        <Typography variant='h6' style={baseStyles.categoryIcon}>
                          {category.icon || '📦'}
                        </Typography>
                        <Typography variant='body1' color={theme.colors.text.primary}>
                          {category.name || 'Unknown Category'}
                        </Typography>
                      </View>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {category.itemCount || 0} items purchased
                      </Typography>
                    </View>
                    <View style={baseStyles.categorySpendingAmount}>
                      <Typography variant='h6' color={theme.colors.primary[500]}>
                        ${isNaN(category.amount) ? '0.00' : category.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {isNaN(category.percentage) ? '0.0' : category.percentage.toFixed(1)}%
                      </Typography>
                    </View>
                  </View>

                  <View style={baseStyles.categorySpendingProgress}>
                    <View
                      style={[
                        baseStyles.categoryProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={[
                          baseStyles.categoryProgressFill,
                          dynamicStyles.categoryProgressFillDynamic(
                            category.percentage,
                            index === 0
                              ? theme.colors.primary[500]
                              : index === 1
                                ? theme.colors.secondary[400]
                                : theme.colors.accent[400]
                          ),
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {statistics.userTotalSpent > 0 && categorySpending.length > 0 && (
                <View
                  style={[
                    baseStyles.categoryInsightCard,
                    { backgroundColor: theme.colors.surface.card },
                  ]}>
                  <View style={baseStyles.categoryInsightTextContainer}>
                    <Typography
                      variant='body2'
                      color={theme.colors.text.secondary}
                      style={baseStyles.categoryInsightText}>
                      💡 Your top spending category is{' '}
                    </Typography>
                    <Typography
                      variant='body2'
                      color={theme.colors.primary[500]}
                      style={baseStyles.categoryInsightHighlight}>
                      {categorySpending[0]?.name || 'Unknown Category'}
                    </Typography>
                    <Typography
                      variant='body2'
                      color={theme.colors.text.secondary}
                      style={baseStyles.categoryInsightText}>
                      {categorySpending[0]
                        ? ` at $${isNaN(categorySpending[0].amount) ? '0.00' : categorySpending[0].amount.toFixed(2)} (${isNaN(categorySpending[0].percentage) ? '0' : categorySpending[0].percentage.toFixed(0)}% of total)`
                        : ' (no data available)'}
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={baseStyles.section}>
            <Typography
              variant='h5'
              color={theme.colors.text.primary}
              style={baseStyles.sectionTitle}>
              🚀 Quick Actions
            </Typography>

            <View style={baseStyles.actionsContainer}>
              <Button
                title='New List'
                variant='primary'
                size='md'
                onPress={() => console.log('Navigate to create list')}
                style={baseStyles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Image
                        source={CreateListIcon}
                        style={dynamicStyles.actionIconImageDynamic(size, color)}
                        resizeMode='contain'
                      />
                    ),
                    name: 'add',
                    size: 18,
                  } as any
                }
              />

              <Button
                title='View Lists'
                variant='outline'
                size='md'
                onPress={() => console.log('Navigate to lists')}
                style={baseStyles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography
                        variant='h6'
                        style={dynamicStyles.actionIconTextDynamic(size, color)}>
                        📋
                      </Typography>
                    ),
                    name: 'list',
                    size: 18,
                  } as any
                }
              />
            </View>

            <View style={baseStyles.actionsContainer}>
              <Button
                title='Start Shopping'
                variant='secondary'
                size='md'
                onPress={() => console.log('Navigate to shop')}
                style={baseStyles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography
                        variant='h6'
                        style={dynamicStyles.actionIconTextDynamic(size, color)}>
                        🛒
                      </Typography>
                    ),
                    name: 'shop',
                    size: 18,
                  } as any
                }
              />

              <Button
                title='Add Friends'
                variant='tertiary'
                size='md'
                onPress={() => console.log('Navigate to social')}
                style={baseStyles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography
                        variant='h6'
                        style={dynamicStyles.actionIconTextDynamic(size, color)}>
                        👥
                      </Typography>
                    ),
                    name: 'people',
                    size: 18,
                  } as any
                }
              />
            </View>
          </View>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <View style={baseStyles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={baseStyles.sectionTitle}>
                📈 Recent Activity
              </Typography>

              {recentActivity.map(activity => (
                <View
                  key={activity.id}
                  style={[
                    baseStyles.activityItem,
                    {
                      backgroundColor: theme.colors.surface.card,
                      borderColor: theme.colors.border.primary,
                    },
                  ]}>
                  <View style={baseStyles.activityContent}>
                    <Typography variant='body1' color={theme.colors.text.primary}>
                      {(activity.title || 'Unknown activity').toString()}
                    </Typography>

                    <View style={baseStyles.activityMeta}>
                      <Typography variant='caption' color={theme.colors.text.tertiary}>
                        {(activity.time || 'Unknown time').toString()} • by{' '}
                        {(activity.user || 'Unknown').toString()}
                      </Typography>
                      {activity.amount &&
                        typeof activity.amount === 'number' &&
                        !isNaN(activity.amount) && (
                          <Typography variant='caption' color={theme.colors.primary[500]}>
                            ${activity.amount.toFixed(2)}
                          </Typography>
                        )}
                    </View>
                  </View>

                  <View style={baseStyles.activityIcon}>
                    <Typography variant='body2'>
                      {activity.type === 'list_created'
                        ? '📝'
                        : activity.type === 'items_completed'
                          ? '✅'
                          : activity.type === 'list_completed'
                            ? '🎉'
                            : '📄'}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {lists.length === 0 && !isLoadingLists && (
            <View style={baseStyles.emptyState}>
              <Typography
                variant='h6'
                color={theme.colors.text.secondary}
                style={baseStyles.emptyStateTitle}>
                🛒 Welcome to PentryPal!
              </Typography>
              <Typography
                variant='body1'
                color={theme.colors.text.tertiary}
                style={baseStyles.emptyStateDescription}>
                Create your first shopping list to get started with collaborative grocery shopping.
              </Typography>
              <Button
                title='Create Your First List'
                variant='primary'
                size='lg'
                onPress={() => console.log('Navigate to create list')}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Image
                        source={CreateListIcon}
                        style={dynamicStyles.actionIconImageDynamic(size, color)}
                        resizeMode='contain'
                      />
                    ),
                    name: 'add',
                    size: 20,
                  } as any
                }
              />
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={dynamicStyles.bottomSpacingDynamic(theme.spacing.xl)} />
        </ScrollView>

        {/* Budget Setting Modal */}
        <Modal
          visible={showBudgetModal}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setShowBudgetModal(false)}>
          <View style={baseStyles.modalOverlay}>
            <View
              style={
                [baseStyles.modalContent, { backgroundColor: theme.colors.surface.card }] as any
              }>
              <Typography
                variant='h4'
                color={theme.colors.text.primary}
                style={baseStyles.modalTitle}>
                Set Monthly Budget
              </Typography>

              <Typography
                variant='body2'
                color={theme.colors.text.secondary}
                style={baseStyles.modalDescription}>
                Set your monthly grocery budget to track your spending and get alerts when you're
                approaching your limit.
              </Typography>

              <View style={baseStyles.inputContainer}>
                <Typography
                  variant='body2'
                  color={theme.colors.text.primary}
                  style={baseStyles.inputLabel}>
                  Monthly Budget ($)
                </Typography>
                <TextInput
                  style={[
                    baseStyles.budgetInput,
                    {
                      backgroundColor: theme.colors.surface.background,
                      borderColor: theme.colors.border.primary,
                      color: theme.colors.text.primary,
                    },
                  ]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder='Enter amount (e.g., 500)'
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType='numeric'
                  autoFocus
                />
              </View>

              <View style={baseStyles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowBudgetModal(false)}
                  style={[
                    baseStyles.modalButton,
                    baseStyles.cancelButton,
                    { borderColor: theme.colors.border.primary },
                  ]}>
                  <Typography variant='body2' color={theme.colors.text.secondary}>
                    Cancel
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSetBudget}
                  style={[
                    baseStyles.modalButton,
                    baseStyles.confirmButton,
                    { backgroundColor: theme.colors.primary[500] },
                  ]}>
                  <Typography variant='body2' color={theme.colors.surface.card}>
                    {monthlyBudget > 0 ? 'Update Budget' : 'Set Budget'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
};
