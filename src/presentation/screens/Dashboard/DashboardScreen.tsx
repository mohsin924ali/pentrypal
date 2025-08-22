/**
 * Dashboard Screen
 * Expense tracking dashboard with spending analytics and category breakdown
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Animated,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { BottomNavigation } from '@/presentation/components/organisms';
import type { NavigationTab } from '@/presentation/components/organisms';
import NotificationService, { type Notification } from '@/infrastructure/services/notificationService';
import AuthService from '@/infrastructure/services/authService';
import { formatCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/shared/utils/currencyUtils';

export interface DashboardScreenProps {
  onFilterPress: () => void;
  onNavigationTabPress: (tab: NavigationTab) => void;
}

interface SpendingData {
  totalSpent: number;
  transactions: number;
  avgTransaction: number;
  percentageChange: number;
  period: string;
  listName: string;
}

interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

interface WeeklyData {
  day: string;
  amount: number;
  percentage: number;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onFilterPress,
  onNavigationTabPress,
}) => {
  const [selectedList, setSelectedList] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [summaryViewType, setSummaryViewType] = useState<'summary' | 'chart'>('summary');

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userCurrency, setUserCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);

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
  }, []);

  // Mock data - in real app this would come from props or store
  const spendingData: SpendingData = {
    totalSpent: 230.50,
    transactions: 5,
    avgTransaction: 46.10,
    percentageChange: -15,
    period: 'Monthly',
    listName: 'Weekly Groceries',
  };

  // Budget data for circular chart
  const budgetData = {
    totalBudget: 350.00,
    totalSpent: spendingData.totalSpent,
    remaining: 350.00 - spendingData.totalSpent,
  };

  const weeklyData: WeeklyData[] = [
    { day: 'Mon', amount: 32.50, percentage: 70 },
    { day: 'Tue', amount: 46.20, percentage: 100 },
    { day: 'Wed', amount: 41.80, percentage: 90 },
    { day: 'Thu', amount: 37.20, percentage: 80 },
    { day: 'Fri', amount: 38.40, percentage: 80 },
    { day: 'Sat', amount: 4.60, percentage: 10 },
    { day: 'Sun', amount: 13.80, percentage: 30 },
  ];

  const categoryData: CategoryData[] = [
    { name: 'Dairy', amount: 92.20, percentage: 40, color: '#EF4444', icon: '🥛' },
    { name: 'Vegetables', amount: 69.15, percentage: 30, color: '#F97316', icon: '🥕' },
    { name: 'Cleaning', amount: 46.10, percentage: 20, color: '#10B981', icon: '🧽' },
    { name: 'Snacks', amount: 23.05, percentage: 10, color: '#3B82F6', icon: '🍿' },
  ];

  // Notification helper functions
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return '👥';
      case 'list_shared': return '📋';
      case 'list_activity': return '✅';
      case 'social': return '👋';
      case 'auth': return '🔐';
      case 'system': return '⚙️';
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Typography
        variant="h2"
        color={Theme.colors.text.primary}
        style={styles.headerTitle}
      >
        Expenses Dashboard
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
              <Typography variant="caption" color={Theme.colors.background.primary} style={styles.notificationBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount.toString()}
              </Typography>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onFilterPress}
          style={styles.headerButton}
          accessibilityRole="button"
          accessibilityLabel="Filter expenses"
        >
          <Typography variant="h3" color={Theme.colors.text.primary}>
            ⚙️
          </Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <View style={styles.filterDropdown}>
        <Typography variant="body" color={Theme.colors.text.primary}>
          All Lists
        </Typography>
      </View>
      <View style={styles.filterDropdown}>
        <Typography variant="body" color={Theme.colors.text.primary}>
          Monthly
        </Typography>
      </View>
    </View>
  );

  const renderCircularChart = () => {
    const spentPercentage = Math.min((budgetData.totalSpent / budgetData.totalBudget) * 100, 100);
    
    return (
      <View style={styles.chartViewContainer}>
        <View style={styles.circularChartContainer}>
          <View style={styles.circularChart}>
            {/* Background circle border */}
            <View style={styles.chartBackground} />
            
            {/* Progress circle border */}
            <View style={[
              styles.progressCircle,
              {
                transform: [{ rotate: '-90deg' }], // Start from top
              }
            ]}>
              <View style={[
                styles.progressRing,
                {
                  borderTopColor: spentPercentage > 0 ? '#4ADE80' : 'transparent',
                  borderRightColor: spentPercentage > 25 ? '#4ADE80' : 'transparent',
                  borderBottomColor: spentPercentage > 50 ? '#4ADE80' : 'transparent',
                  borderLeftColor: spentPercentage > 75 ? '#4ADE80' : 'transparent',
                }
              ]} />
            </View>

            {/* Center content */}
            <View style={styles.chartCenter}>
              <Typography
                variant="h1"
                color={Theme.colors.text.primary}
                style={styles.chartCenterAmount}
              >
                ${budgetData.totalSpent.toFixed(0)}
              </Typography>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
              >
                of ${budgetData.totalBudget.toFixed(0)}
              </Typography>
              <Typography
                variant="caption"
                color={spentPercentage > 90 ? '#EF4444' : '#4ADE80'}
                style={styles.percentageText}
              >
                {spentPercentage.toFixed(0)}%
              </Typography>
            </View>
          </View>
        </View>

        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4ADE80' }]} />
            <Typography variant="caption" color={Theme.colors.text.secondary}>
              Spent: {formatCurrency(budgetData.totalSpent, userCurrency)}
            </Typography>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F0F4F2' }]} />
            <Typography variant="caption" color={Theme.colors.text.secondary}>
              Remaining: {formatCurrency(budgetData.remaining, userCurrency)}
            </Typography>
          </View>
        </View>
      </View>
    );
  };

  const renderSpendingSummary = () => (
    <View style={styles.card}>
      <View style={styles.summaryHeader}>
        <View style={styles.headerLeft}>
          <Typography
            variant="h2"
            color={Theme.colors.text.primary}
            style={styles.cardTitle}
          >
            Spending Summary
          </Typography>
          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            style={styles.cardSubtitle}
          >
            {spendingData.listName}, {spendingData.period}
          </Typography>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setSummaryViewType(summaryViewType === 'summary' ? 'chart' : 'summary')}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${summaryViewType === 'summary' ? 'chart' : 'summary'} view`}
          >
            <Typography
              variant="caption"
              color={Theme.colors.primary[500]}
              style={styles.toggleButtonText}
            >
              {summaryViewType === 'summary' ? '📊' : '📋'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {summaryViewType === 'summary' ? (
        <>
          <View style={styles.totalAmountSection}>
            <Typography
              variant="h1"
              color={Theme.colors.text.primary}
              style={styles.totalAmount}
            >
              {formatCurrency(spendingData.totalSpent, userCurrency)}
            </Typography>
            <Typography
              variant="caption"
              color={Theme.colors.text.secondary}
            >
              Total Spent
            </Typography>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Typography
                variant="h3"
                color={Theme.colors.text.primary}
                style={styles.statValue}
              >
                {spendingData.transactions}
              </Typography>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
              >
                Transactions
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography
                variant="h3"
                color={Theme.colors.text.primary}
                style={styles.statValue}
              >
                {formatCurrency(spendingData.avgTransaction, userCurrency)}
              </Typography>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
              >
                Avg. Transaction
              </Typography>
            </View>

            <View style={styles.statItem}>
              <Typography
                variant="h3"
                color="#EF4444"
                style={styles.statValue}
              >
                {spendingData.percentageChange}%
              </Typography>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
              >
                vs Last Month
              </Typography>
            </View>
          </View>
        </>
      ) : (
        renderCircularChart()
      )}
    </View>
  );

  const renderWeeklyChart = () => (
    <View style={styles.card}>
      <Typography
        variant="h3"
        color={Theme.colors.text.primary}
        style={styles.cardTitle}
      >
        Weekly Spending
      </Typography>

      <View style={styles.chartContainer}>
        {weeklyData.map((data, index) => (
          <View key={index} style={styles.chartBarContainer}>
            <View style={styles.chartBar}>
              <View
                style={[
                  styles.chartBarFill,
                  { height: `${data.percentage}%` }
                ]}
              />
            </View>
            <Typography
              variant="caption"
              color={Theme.colors.text.secondary}
              style={styles.chartLabel}
            >
              {data.day}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCategoryBreakdown = () => (
    <View style={styles.card}>
      <Typography
        variant="h3"
        color={Theme.colors.text.primary}
        style={styles.cardTitle}
      >
        Spending by Category
      </Typography>

      <View style={styles.categoriesContainer}>
        {categoryData.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
              <Typography variant="h3" style={styles.categoryEmoji}>
                {category.icon}
              </Typography>
            </View>

            <View style={styles.categoryInfo}>
              <View style={styles.categoryHeader}>
                <Typography
                  variant="body"
                  color={Theme.colors.text.primary}
                  style={styles.categoryName}
                >
                  {category.name}
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.primary}
                  style={styles.categoryAmount}
                >
                  {formatCurrency(category.amount, userCurrency)}
                </Typography>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${category.percentage}%`,
                        backgroundColor: category.color,
                      }
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  const renderNotificationsBanner = () => {
    if (!showNotificationsModal) return null;

    return (
      <>
        {/* Overlay to close banner when clicking outside */}
        <TouchableOpacity
          style={styles.notificationOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        />
        
        {/* Notification Banner */}
        <View style={styles.notificationBanner}>
          {/* Banner Header */}
          <View style={styles.notificationBannerHeader}>
            <Typography
              variant="body"
              color={Theme.colors.text.primary}
              style={styles.notificationBannerTitle}
            >
              Notifications ({unreadCount} new)
            </Typography>
            <TouchableOpacity
              onPress={() => {
                NotificationService.clearAll();
                setShowNotificationsModal(false);
              }}
              style={styles.clearAllBannerButton}
            >
              <Typography
                variant="caption"
                color="#ef4444"
                style={styles.clearAllBannerText}
              >
                Clear All
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Notifications List */}
          <ScrollView 
            style={styles.notificationBannerContent}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {notifications.length > 0 ? (
              notifications.slice(0, 5).map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={[
                    styles.notificationBannerItem,
                    !notification.isRead && styles.notificationBannerItemUnread
                  ]}
                  onPress={() => {
                    NotificationService.markAsRead(notification.id);
                    // You can add navigation logic here based on notification type
                  }}
                >
                  <View style={styles.notificationBannerIconContainer}>
                    <Typography variant="body" style={styles.notificationBannerIcon}>
                      {getNotificationIcon(notification.type)}
                    </Typography>
                    {notification.priority === 'high' && (
                      <View style={styles.notificationBannerPriorityIndicator} />
                    )}
                  </View>

                  <View style={styles.notificationBannerTextContent}>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.primary}
                      style={styles.notificationBannerItemTitle}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.secondary}
                      style={styles.notificationBannerItemMessage}
                      numberOfLines={2}
                    >
                      {notification.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={Theme.colors.text.tertiary}
                      style={styles.notificationBannerItemTime}
                    >
                      {getTimeAgoFromTimestamp(notification.timestamp)}
                    </Typography>
                  </View>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      NotificationService.deleteNotification(notification.id);
                    }}
                    style={styles.notificationBannerDeleteButton}
                  >
                    <Typography variant="caption" color={Theme.colors.text.secondary}>
                      ✕
                    </Typography>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.notificationBannerEmpty}>
                <Typography
                  variant="caption"
                  color={Theme.colors.text.secondary}
                  style={styles.notificationBannerEmptyText}
                >
                  No notifications
                </Typography>
              </View>
            )}
          </ScrollView>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderFilters()}
        {renderSpendingSummary()}
        {renderWeeklyChart()}
        {renderCategoryBreakdown()}
      </ScrollView>

      <BottomNavigation
        activeTab="dashboard"
        onTabPress={onNavigationTabPress}
      />

      {renderNotificationsBanner()}
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
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  } as ViewStyle,

  notificationBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  } as ViewStyle,

  // Notification Banner Styles (Facebook-style dropdown)
  notificationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  } as ViewStyle,

  notificationBanner: {
    position: 'absolute',
    top: 60, // Below header
    right: Theme.spacing.lg,
    width: 300,
    maxHeight: 400,
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: Theme.colors.background.secondary,
  } as ViewStyle,

  notificationBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.secondary,
  } as ViewStyle,

  notificationBannerTitle: {
    fontWeight: '600',
    fontSize: 14,
  } as ViewStyle,

  clearAllBannerButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  } as ViewStyle,

  clearAllBannerText: {
    fontSize: 11,
    fontWeight: '600',
  } as ViewStyle,

  notificationBannerContent: {
    maxHeight: 320,
  } as ViewStyle,

  notificationBannerItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.background.secondary,
  } as ViewStyle,

  notificationBannerItemUnread: {
    backgroundColor: '#f0f9ff',
  } as ViewStyle,

  notificationBannerIconContainer: {
    position: 'relative',
    marginRight: Theme.spacing.sm,
    width: 24,
    alignItems: 'center',
  } as ViewStyle,

  notificationBannerIcon: {
    fontSize: 16,
  } as ViewStyle,

  notificationBannerPriorityIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
  } as ViewStyle,

  notificationBannerTextContent: {
    flex: 1,
    gap: 2,
  } as ViewStyle,

  notificationBannerItemTitle: {
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 14,
  } as ViewStyle,

  notificationBannerItemMessage: {
    fontSize: 11,
    lineHeight: 13,
    opacity: 0.8,
  } as ViewStyle,

  notificationBannerItemTime: {
    fontSize: 10,
    lineHeight: 12,
    opacity: 0.6,
  } as ViewStyle,

  notificationBannerDeleteButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Theme.spacing.xs,
  } as ViewStyle,

  notificationBannerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.lg,
  } as ViewStyle,

  notificationBannerEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  } as ViewStyle,

  scrollView: {
    flex: 1,
  } as ViewStyle,

  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  filtersContainer: {
    flexDirection: 'row',
    marginBottom: Theme.spacing['2xl'],
    gap: Theme.spacing.sm,
  } as ViewStyle,

  filterDropdown: {
    flex: 1,
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  card: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    padding: Theme.spacing['2xl'],
    marginBottom: Theme.spacing['2xl'],
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  } as ViewStyle,

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  headerLeft: {
    flex: 1,
  } as ViewStyle,

  headerRight: {
    alignItems: 'flex-end',
  } as ViewStyle,

  toggleButton: {
    backgroundColor: Theme.colors.background.secondary,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  } as ViewStyle,

  toggleButtonText: {
    fontSize: 16,
  } as ViewStyle,

  cardTitle: {
    fontWeight: '700',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  cardSubtitle: {
    fontSize: 14,
  } as ViewStyle,

  totalAmountSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  } as ViewStyle,

  // Circular Chart Styles
  chartViewContainer: {
    alignItems: 'center',
  } as ViewStyle,

  circularChartContainer: {
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  circularChart: {
    width: 140,
    height: 140,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  chartBackground: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#F0F4F2',
  } as ViewStyle,

  progressCircle: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  } as ViewStyle,

  progressRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: 'transparent',
  } as ViewStyle,

  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  chartCenterAmount: {
    fontSize: 20,
    fontWeight: '700',
  } as ViewStyle,

  percentageText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  } as ViewStyle,

  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  } as ViewStyle,

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.xs,
  } as ViewStyle,

  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  } as ViewStyle,

  statItem: {
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  statValue: {
    fontWeight: '600',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    marginTop: Theme.spacing.lg,
  } as ViewStyle,

  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  chartBar: {
    width: 24,
    height: 140,
    backgroundColor: '#F0F4F2',
    borderRadius: 4,
    justifyContent: 'flex-end',
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  chartBarFill: {
    backgroundColor: '#4ADE80',
    borderRadius: 4,
    width: '100%',
  } as ViewStyle,

  chartLabel: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  categoriesContainer: {
    marginTop: Theme.spacing.lg,
  } as ViewStyle,

  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.lg,
  } as ViewStyle,

  categoryEmoji: {
    fontSize: 20,
  } as ViewStyle,

  categoryInfo: {
    flex: 1,
  } as ViewStyle,

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  } as ViewStyle,

  categoryName: {
    fontWeight: '500',
  } as ViewStyle,

  categoryAmount: {
    fontWeight: '600',
  } as ViewStyle,

  progressBarContainer: {
    marginTop: Theme.spacing.xs,
  } as ViewStyle,

  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  } as ViewStyle,

  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  } as ViewStyle,
};
