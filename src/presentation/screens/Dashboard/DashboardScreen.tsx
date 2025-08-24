// ========================================
// Dashboard Screen - Main App Overview
// ========================================

import React, { useEffect } from 'react';
import { View, ScrollView, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';
import { useNetwork } from '../../providers/NetworkProvider';

// Icons
import CreateListIcon from '../../../assets/images/createList.png';

// Store
import type { RootState, AppDispatch } from '../../../application/store';
import { selectUser } from '../../../application/store/slices/authSlice';

// Types
export interface DashboardScreenProps {}

/**
 * Dashboard Screen Component
 *
 * Main overview screen with:
 * - Welcome message and user info
 * - Quick stats and overview cards
 * - Recent activity feed
 * - Quick action buttons
 * - Shopping list summaries
 * - Pantry alerts
 */
export const DashboardScreen: React.FC<DashboardScreenProps> = () => {
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => selectUser(state));
  const [refreshing, setRefreshing] = React.useState(false);

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // TODO: Fetch latest data
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Mock data for demo purposes
  const mockStats = {
    activeLists: 3,
    pendingItems: 12,
    pantryAlerts: 5,
    recentActivity: 8,
  };

  const mockRecentActivity = [
    {
      id: '1',
      type: 'list_created',
      title: 'Weekly Groceries',
      time: '2 hours ago',
      user: 'You',
    },
    {
      id: '2',
      type: 'item_added',
      title: 'Added milk to Shopping List',
      time: '5 hours ago',
      user: 'Sarah',
    },
    {
      id: '3',
      type: 'pantry_alert',
      title: 'Low stock: Bread',
      time: '1 day ago',
      user: 'System',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Typography variant='h3' color={theme.colors.text.primary}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}!
          </Typography>

          <Typography variant='body1' color={theme.colors.text.secondary} style={{ marginTop: 4 }}>
            {isConnected ? 'Ready to manage your groceries' : 'Offline mode'}
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
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
              <Typography variant='h4' color={theme.colors.primary[500]}>
                {mockStats.activeLists}
              </Typography>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                Active Lists
              </Typography>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
              <Typography variant='h4' color={theme.colors.secondary[500]}>
                {mockStats.pendingItems}
              </Typography>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                Pending Items
              </Typography>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
              <Typography variant='h4' color={theme.colors.semantic.warning[500]}>
                {mockStats.pantryAlerts}
              </Typography>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                Pantry Alerts
              </Typography>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.colors.surface.card }]}>
              <Typography variant='h4' color={theme.colors.accent[500]}>
                {mockStats.recentActivity}
              </Typography>
              <Typography variant='caption' color={theme.colors.text.secondary}>
                Recent Updates
              </Typography>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Quick Actions
          </Typography>

          <View style={styles.actionsContainer}>
            <Button
              title='New List'
              variant='primary'
              size='md'
              onPress={() => console.log('Create new list')}
              style={styles.actionButton}
              leftIcon={{
                component: ({ size, color }) => (
                  <Image
                    source={CreateListIcon}
                    style={{
                      width: size,
                      height: size,
                      tintColor: color,
                    }}
                    resizeMode='contain'
                  />
                ),
                name: 'add',
                size: 18,
              }}
            />

            <Button
              title='Scan Item'
              variant='outline'
              size='md'
              onPress={() => console.log('Scan barcode')}
              style={styles.actionButton}
              leftIcon={{
                component: ({ size, color }) => (
                  <Typography variant='h6' style={{ fontSize: size, color }}>
                    📷
                  </Typography>
                ),
                name: 'camera',
                size: 18,
              }}
            />
          </View>

          <View style={styles.actionsContainer}>
            <Button
              title='Check Pantry'
              variant='tertiary'
              size='md'
              onPress={() => console.log('Check pantry')}
              style={styles.actionButton}
              leftIcon={{
                component: ({ size, color }) => (
                  <Typography variant='h6' style={{ fontSize: size, color }}>
                    🥫
                  </Typography>
                ),
                name: 'pantry',
                size: 18,
              }}
            />

            <Button
              title='Invite Friends'
              variant='tertiary'
              size='md'
              onPress={() => console.log('Invite friends')}
              style={styles.actionButton}
              leftIcon={{
                component: ({ size, color }) => (
                  <Typography variant='h6' style={{ fontSize: size, color }}>
                    👥
                  </Typography>
                ),
                name: 'people',
                size: 18,
              }}
            />
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Typography
            variant='h5'
            color={theme.colors.text.primary}
            style={{ marginBottom: theme.spacing.md }}>
            Recent Activity
          </Typography>

          {mockRecentActivity.map(activity => (
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

                <Typography variant='caption' color={theme.colors.text.tertiary}>
                  {activity.time} • by {activity.user}
                </Typography>
              </View>

              <View style={styles.activityIcon}>
                <Typography variant='body2'>
                  {activity.type === 'list_created' && '📝'}
                  {activity.type === 'item_added' && '➕'}
                  {activity.type === 'pantry_alert' && '⚠️'}
                </Typography>
              </View>
            </View>
          ))}

          <Button
            title='View All Activity'
            variant='ghost'
            size='sm'
            onPress={() => console.log('View all activity')}
            style={{ marginTop: theme.spacing.md }}
          />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: theme.spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
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
  section: {
    marginBottom: 32,
  },
  actionsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: 12,
  },
  actionButton: {
    flex: 0.48,
  },
  activityItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  activityContent: {
    flex: 1,
  },
  activityIcon: {
    marginLeft: 12,
  },
};
