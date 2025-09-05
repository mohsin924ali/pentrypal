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
        `Your monthly budget has been set to $${budget.toFixed(2)}. You'll receive alerts when you approach your limit.`,
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
    if (userId === user?.id) return 'You';

    // Look up in collaborators from all lists
    for (const list of lists) {
      const collaborator = list.collaborators.find(c => c.userId === userId);
      if (collaborator) return collaborator.name;
    }

    return 'Unknown';
  };

  // Helper function to get time ago
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
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
            userSpending[userId] = { name: userName, amount: 0, itemCount: 0 };
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
        userId,
        name: data.name,
        amount: data.amount,
        itemCount: data.itemCount,
        percentage: statistics.totalSpent > 0 ? (data.amount / statistics.totalSpent) * 100 : 0,
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
      list.items.forEach(item => {
        if (item.completed && item.purchasedAmount) {
          const userId = item.assignedTo || list.ownerId;
          if (userId === user?.id) {
            const amount =
              (typeof item.purchasedAmount === 'number'
                ? item.purchasedAmount
                : parseFloat(String(item.purchasedAmount))) || 0;
            // Get category from item or default to 'other'
            const categoryId = item.category?.id || 'other';
            const categoryData =
              categoryInfo[categoryId as keyof typeof categoryInfo] || categoryInfo.other;

            if (!categoryMap[categoryId]) {
              categoryMap[categoryId] = {
                name: categoryData.name,
                icon: categoryData.icon,
                amount: 0,
                itemCount: 0,
              };
            }

            categoryMap[categoryId]!.amount += amount;
            categoryMap[categoryId]!.itemCount += 1;
          }
        }
      });
    });

    return Object.entries(categoryMap)
      .map(([categoryId, data]) => ({
        categoryId,
        name: data.name,
        icon: data.icon,
        amount: data.amount,
        itemCount: data.itemCount,
        percentage:
          statistics.userTotalSpent > 0 ? (data.amount / statistics.userTotalSpent) * 100 : 0,
      }))
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
          activities.push({
            id: `${list.id}_archived`,
            type: 'list_completed',
            title: `Completed "${list.name}"`,
            time: timeAgo,
            user: getUserName(list.ownerId),
            amount: list.totalSpent,
          });
        } else if (list.completedCount > 0) {
          activities.push({
            id: `${list.id}_progress`,
            type: 'items_completed',
            title: `${list.completedCount}/${list.itemsCount} items completed in "${list.name}"`,
            time: timeAgo,
            user: getUserName(list.ownerId),
          });
        } else {
          activities.push({
            id: `${list.id}_created`,
            type: 'list_created',
            title: `Created "${list.name}"`,
            time: timeAgo,
            user: getUserName(list.ownerId),
          });
        }
      });

    return activities.slice(0, 6);
  }, [lists, user?.id]);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Typography variant='h3' color={theme.colors.text.primary}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
            </Typography>

            <Typography
              variant='body1'
              color={theme.colors.text.secondary}
              style={{ marginTop: 4 }}>
              {isConnected ? "Here's your grocery overview" : 'Offline mode - showing cached data'}
            </Typography>
          </View>

          {/* Connection Status */}
          {!isConnected && (
            <View
              style={[styles.statusBadge, { backgroundColor: theme.colors.semantic.warning[100] }]}>
              <Typography variant='caption' color={theme.colors.semantic.warning[700]}>
                Offline
              </Typography>
            </View>
          )}
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isLoadingLists}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary[500]}
            />
          }>
          {/* Overview Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.primary[500]}>
                  {statistics.activeLists}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Active Lists
                </Typography>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.secondary[500]}>
                  {statistics.pendingItems}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Pending Items
                </Typography>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.semantic.success[500]}>
                  {statistics.completionRate.toFixed(0)}%
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Completion Rate
                </Typography>
              </View>

              <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
                <Typography variant='h4' color={theme.colors.accent[500]}>
                  {statistics.archivedLists}
                </Typography>
                <Typography variant='caption' color={theme.colors.text.secondary}>
                  Completed Lists
                </Typography>
              </View>
            </View>
          </View>

          {/* Spending Overview - User's Personal Spending */}
          <View style={styles.section}>
            <View style={styles.spendingHeader}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={styles.sectionTitle}>
                💰 Your Spending Overview
              </Typography>
              <TouchableOpacity onPress={openBudgetModal} style={styles.budgetButton}>
                <Typography variant='caption' color={theme.colors.primary[500]}>
                  {monthlyBudget > 0 ? 'Edit Budget' : 'Set Budget'}
                </Typography>
              </TouchableOpacity>
            </View>

            {/* Budget Alert */}
            {statistics.isOverBudget && (
              <View
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: theme.colors.semantic.error[50],
                    borderColor: theme.colors.semantic.error[200],
                  },
                ]}>
                <Typography variant='body2' color={theme.colors.semantic.error[700]}>
                  ⚠️ You've exceeded your monthly budget by $
                  {statistics.overBudgetAmount.toFixed(2)}
                </Typography>
              </View>
            )}

            {statistics.isNearBudgetLimit && (
              <View
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: theme.colors.semantic.warning[50],
                    borderColor: theme.colors.semantic.warning[200],
                  },
                ]}>
                <Typography variant='body2' color={theme.colors.semantic.warning[700]}>
                  🔔 You've used {statistics.budgetPercentage.toFixed(0)}% of your monthly budget
                </Typography>
              </View>
            )}

            <View style={styles.spendingOverview}>
              <View style={[styles.spendingCard, { backgroundColor: theme.colors.surface.card }]}>
                <View style={styles.spendingCardHeader}>
                  <Typography variant='caption' color={theme.colors.text.secondary}>
                    Your Total Spent
                  </Typography>
                  <Typography variant='h3' color={theme.colors.primary[500]}>
                    ${statistics.userTotalSpent.toFixed(2)}
                  </Typography>
                </View>

                <View style={styles.spendingCardDetails}>
                  <View style={styles.spendingDetail}>
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
                      ${statistics.userThisMonthSpent.toFixed(2)}
                    </Typography>
                  </View>
                  <View style={styles.spendingDetail}>
                    <Typography variant='caption' color={theme.colors.text.tertiary}>
                      {monthlyBudget > 0 ? 'Remaining' : 'Avg per List'}
                    </Typography>
                    <Typography variant='body2' color={theme.colors.text.primary}>
                      {monthlyBudget > 0
                        ? `$${Math.max(0, statistics.budgetRemaining).toFixed(2)}`
                        : `$${(statistics.userTotalSpent / Math.max(1, statistics.totalLists)).toFixed(2)}`}
                    </Typography>
                  </View>
                </View>
              </View>

              {monthlyBudget > 0 && (
                <View style={[styles.budgetCard, { backgroundColor: theme.colors.surface.card }]}>
                  <View style={styles.budgetCardHeader}>
                    <Typography variant='caption' color={theme.colors.text.secondary}>
                      Monthly Budget Progress
                    </Typography>
                    <Typography variant='body2' color={theme.colors.text.primary}>
                      {statistics.budgetPercentage.toFixed(0)}%
                    </Typography>
                  </View>
                  <View style={styles.budgetProgress}>
                    <View
                      style={[
                        styles.budgetProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={
                          [
                            styles.budgetProgressFill,
                            {
                              backgroundColor: statistics.isOverBudget
                                ? theme.colors.semantic.error[500]
                                : statistics.isNearBudgetLimit
                                  ? theme.colors.semantic.warning[500]
                                  : theme.colors.semantic.success[500],
                              width: `${Math.min(statistics.budgetPercentage, 100)}%` as any,
                            },
                          ] as any
                        }
                      />
                    </View>
                    <Typography variant='caption' color={theme.colors.text.secondary}>
                      ${statistics.userThisMonthSpent.toFixed(2)} / ${monthlyBudget.toFixed(2)}
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Spending by User */}
          {spendingByUser.length > 0 && (
            <View style={styles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={styles.sectionTitle}>
                👥 Who Spent How Much
              </Typography>

              {spendingByUser.map((userSpending, index) => (
                <View
                  key={userSpending.userId}
                  style={[styles.userSpendingCard, { backgroundColor: theme.colors.surface.card }]}>
                  <View style={styles.userSpendingHeader}>
                    <View style={styles.userSpendingInfo}>
                      <Typography variant='body1' color={theme.colors.text.primary}>
                        {userSpending.name}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {userSpending.itemCount} items purchased
                      </Typography>
                    </View>
                    <View style={styles.userSpendingAmount}>
                      <Typography variant='h6' color={theme.colors.primary[500]}>
                        ${userSpending.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {userSpending.percentage.toFixed(1)}%
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.userSpendingProgress}>
                    <View
                      style={[
                        styles.userProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={
                          [
                            styles.userProgressFill,
                            {
                              backgroundColor:
                                index === 0
                                  ? theme.colors.primary[500]
                                  : theme.colors.secondary[400],
                              width: `${userSpending.percentage}%` as any,
                            },
                          ] as any
                        }
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Category-wise Spending */}
          {categorySpending.length > 0 && (
            <View style={styles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={styles.sectionTitle}>
                📊 Spending by Category
              </Typography>

              {categorySpending.map((category, index) => (
                <View
                  key={category.categoryId}
                  style={[
                    styles.categorySpendingCard,
                    { backgroundColor: theme.colors.surface.card },
                  ]}>
                  <View style={styles.categorySpendingHeader}>
                    <View style={styles.categorySpendingInfo}>
                      <View style={styles.categorySpendingTitleRow}>
                        <Typography variant='h6' style={styles.categoryIcon}>
                          {category.icon}
                        </Typography>
                        <Typography variant='body1' color={theme.colors.text.primary}>
                          {category.name}
                        </Typography>
                      </View>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {category.itemCount} items purchased
                      </Typography>
                    </View>
                    <View style={styles.categorySpendingAmount}>
                      <Typography variant='h6' color={theme.colors.primary[500]}>
                        ${category.amount.toFixed(2)}
                      </Typography>
                      <Typography variant='caption' color={theme.colors.text.secondary}>
                        {category.percentage.toFixed(1)}%
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.categorySpendingProgress}>
                    <View
                      style={[
                        styles.categoryProgressBar,
                        { backgroundColor: theme.colors.border.primary },
                      ]}>
                      <View
                        style={
                          [
                            styles.categoryProgressFill,
                            {
                              backgroundColor:
                                index === 0
                                  ? theme.colors.primary[500]
                                  : index === 1
                                    ? theme.colors.secondary[400]
                                    : theme.colors.accent[400],
                              width: `${category.percentage}%` as any,
                            },
                          ] as any
                        }
                      />
                    </View>
                  </View>
                </View>
              ))}

              {statistics.userTotalSpent > 0 && categorySpending.length > 0 && (
                <View
                  style={[
                    styles.categoryInsightCard,
                    { backgroundColor: theme.colors.surface.card },
                  ]}>
                  <Typography
                    variant='body2'
                    color={theme.colors.text.secondary}
                    style={styles.categoryInsightText}>
                    💡 Your top spending category is{' '}
                    <Typography
                      variant='body2'
                      color={theme.colors.primary[500]}
                      style={{ fontWeight: '600' }}>
                      {typeof categorySpending[0]?.name === 'string'
                        ? categorySpending[0]?.name
                        : categorySpending[0]?.name?.name || 'Unknown Category'}
                    </Typography>
                    <Typography variant='body2' color={theme.colors.text.secondary}>
                      {` at $${categorySpending[0]?.amount.toFixed(2)} (${categorySpending[0]?.percentage.toFixed(0)}% of total)`}
                    </Typography>
                  </Typography>
                </View>
              )}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Typography variant='h5' color={theme.colors.text.primary} style={styles.sectionTitle}>
              🚀 Quick Actions
            </Typography>

            <View style={styles.actionsContainer}>
              <Button
                title='New List'
                variant='primary'
                size='md'
                onPress={() => console.log('Navigate to create list')}
                style={styles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Image
                        source={CreateListIcon}
                        style={{ width: size, height: size, tintColor: color }}
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
                style={styles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography variant='h6' style={{ fontSize: size, color }}>
                        📋
                      </Typography>
                    ),
                    name: 'list',
                    size: 18,
                  } as any
                }
              />
            </View>

            <View style={styles.actionsContainer}>
              <Button
                title='Start Shopping'
                variant='secondary'
                size='md'
                onPress={() => console.log('Navigate to shop')}
                style={styles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography variant='h6' style={{ fontSize: size, color }}>
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
                style={styles.actionButton}
                leftIcon={
                  {
                    component: ({ size, color }: { size: number; color: string }) => (
                      <Typography variant='h6' style={{ fontSize: size, color }}>
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
            <View style={styles.section}>
              <Typography
                variant='h5'
                color={theme.colors.text.primary}
                style={styles.sectionTitle}>
                📈 Recent Activity
              </Typography>

              {recentActivity.map(activity => (
                <View
                  key={activity.id}
                  style={[
                    styles.activityItem,
                    {
                      backgroundColor: theme.colors.surface.card,
                      borderColor: theme.colors.border.primary,
                    },
                  ]}>
                  <View style={styles.activityContent}>
                    <Typography variant='body1' color={theme.colors.text.primary}>
                      {activity.title}
                    </Typography>

                    <View style={styles.activityMeta}>
                      <Typography variant='caption' color={theme.colors.text.tertiary}>
                        {activity.time} • by {activity.user}
                      </Typography>
                      {activity.amount && (
                        <Typography variant='caption' color={theme.colors.primary[500]}>
                          ${activity.amount.toFixed(2)}
                        </Typography>
                      )}
                    </View>
                  </View>

                  <View style={styles.activityIcon}>
                    <Typography variant='body2'>
                      {activity.type === 'list_created' && '📝'}
                      {activity.type === 'items_completed' && '✅'}
                      {activity.type === 'list_completed' && '🎉'}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Empty State */}
          {lists.length === 0 && !isLoadingLists && (
            <View style={styles.emptyState}>
              <Typography
                variant='h6'
                color={theme.colors.text.secondary}
                style={{ textAlign: 'center', marginBottom: 16 }}>
                🛒 Welcome to PentryPal!
              </Typography>
              <Typography
                variant='body1'
                color={theme.colors.text.tertiary}
                style={{ textAlign: 'center', marginBottom: 24 }}>
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
                        style={{ width: size, height: size, tintColor: color }}
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
          <View style={{ height: theme.spacing.xl }} />
        </ScrollView>

        {/* Budget Setting Modal */}
        <Modal
          visible={showBudgetModal}
          transparent={true}
          animationType='fade'
          onRequestClose={() => setShowBudgetModal(false)}>
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: theme.colors.surface.card }] as any}>
              <Typography variant='h4' color={theme.colors.text.primary} style={styles.modalTitle}>
                Set Monthly Budget
              </Typography>

              <Typography
                variant='body2'
                color={theme.colors.text.secondary}
                style={styles.modalDescription}>
                Set your monthly grocery budget to track your spending and get alerts when you're
                approaching your limit.
              </Typography>

              <View style={styles.inputContainer}>
                <Typography
                  variant='body2'
                  color={theme.colors.text.primary}
                  style={styles.inputLabel}>
                  Monthly Budget ($)
                </Typography>
                <TextInput
                  style={[
                    styles.budgetInput,
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

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => setShowBudgetModal(false)}
                  style={[
                    styles.modalButton,
                    styles.cancelButton,
                    { borderColor: theme.colors.border.primary },
                  ]}>
                  <Typography variant='body2' color={theme.colors.text.secondary}>
                    Cancel
                  </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSetBudget}
                  style={[
                    styles.modalButton,
                    styles.confirmButton,
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

// ========================================
// Styles
// ========================================

const styles = {
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerContent: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Stats Section
  statsContainer: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 16,
  },
  statCard: {
    flex: 0.48,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Section Styling
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: '600' as const,
  },

  // Spending Header
  spendingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 16,
  },
  budgetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },

  // Alert Cards
  alertCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },

  // Spending Overview
  spendingOverview: {
    gap: 16,
  },
  spendingCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  spendingCardHeader: {
    marginBottom: 12,
  },
  spendingCardDetails: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
  },
  spendingDetail: {
    alignItems: 'center' as const,
  },

  // Budget Card
  budgetCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  budgetCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 8,
  },
  budgetProgress: {
    marginTop: 8,
  },
  budgetProgressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // User Spending
  userSpendingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userSpendingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  userSpendingInfo: {
    flex: 1,
  },
  userSpendingAmount: {
    alignItems: 'flex-end' as const,
  },
  userSpendingProgress: {
    marginTop: 8,
  },
  userProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  userProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Category Spending
  categorySpendingCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categorySpendingHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
  },
  categorySpendingInfo: {
    flex: 1,
  },
  categorySpendingTitleRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 4,
  },
  categoryIcon: {
    marginRight: 8,
    fontSize: 18,
  },
  categorySpendingAmount: {
    alignItems: 'flex-end' as const,
  },
  categorySpendingProgress: {
    marginTop: 8,
  },
  categoryProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  categoryProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  categoryInsightCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryInsightText: {
    lineHeight: 20,
    textAlign: 'center' as const,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  actionButton: {
    flex: 0.48,
  },

  // Activity
  activityItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityContent: {
    flex: 1,
  },
  activityMeta: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 4,
  },
  activityIcon: {
    marginLeft: 12,
  },

  // Empty State
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 48,
    paddingHorizontal: 24,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  modalDescription: {
    marginBottom: 24,
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '500' as const,
  },
  budgetInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center' as const,
  },
  modalButtons: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cancelButton: {
    borderWidth: 1,
  },
  confirmButton: {
    // backgroundColor set dynamically
  },
};
