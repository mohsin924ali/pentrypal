// ========================================
// Social Screen - Friends & Collaboration
// ========================================

import React, { useState } from 'react';
import { FlatList, Image, RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Typography } from '../../components/atoms/Typography/Typography';
import { Button } from '../../components/atoms/Button/Button';
import { GradientBackground } from '../../components/atoms/GradientBackground';
import { AddFriendModal } from '../../components/molecules/AddFriendModal';

// Hooks and Utils
import { useTheme } from '../../providers/ThemeProvider';

// Styles
import { baseStyles, createDynamicStyles, createThemedStyles } from './SocialScreen.styles';

// Redux
import { useDispatch, useSelector } from 'react-redux';
import {
  loadFriendRequests,
  loadFriends,
  respondToFriendRequest,
  selectFriendRequests,
  selectFriends,
  selectIsLoadingFriends,
  selectSocialState,
  setShowAddFriendModal,
} from '../../../application/store/slices/socialSlice';
import { selectUser } from '../../../application/store/slices/authSlice';
import type { AppDispatch } from '../../../application/store';

// Icons
const AddFriendIcon = require('../../../assets/images/addFriend.png');

// Types
import type { FriendRequest } from '../../../shared/types/social';

export type SocialScreenProps = Record<string, never>;

interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  sharedLists: number;
  lastActivity: string;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'list_shared' | 'item_added' | 'list_completed';
  title: string;
  description: string;
  time: string;
  from: string;
  read: boolean;
}

/**
 * Social Screen Component
 *
 * Friends and collaboration management with:
 * - Friends list and status
 * - Friend requests
 * - Activity notifications
 * - Shared lists overview
 * - Collaboration invites
 * - Social activity feed
 */
export const SocialScreen: React.FC<SocialScreenProps> = () => {
  const { theme } = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  // Styles
  const themedStyles = createThemedStyles(theme);
  const dynamicStyles = createDynamicStyles({ theme });

  // Redux state
  const socialState = useSelector(selectSocialState);
  const friends = useSelector(selectFriends);
  const friendRequests = useSelector(selectFriendRequests);
  const isLoadingFriends = useSelector(selectIsLoadingFriends);
  const currentUser = useSelector(selectUser);

  // Local state
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'activity' | 'invites'>('friends');

  // Calculate pending requests count
  const pendingRequestsCount = friendRequests.received.length;

  // Use real data from Redux store

  // Load data on mount
  React.useEffect(() => {
    if (currentUser?.id) {
      dispatch(loadFriends());
      dispatch(loadFriendRequests());
    }
  }, [dispatch, currentUser?.id]);

  // Handle pull to refresh
  const onRefresh = React.useCallback(async () => {
    if (!currentUser?.id) return;

    setRefreshing(true);

    try {
      await Promise.all([dispatch(loadFriends()), dispatch(loadFriendRequests())]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, currentUser?.id]);

  // Handle add friend button press
  const handleAddFriendPress = React.useCallback(() => {
    dispatch(setShowAddFriendModal(true));
  }, [dispatch]);

  // Handle friend request response
  const handleFriendRequestResponse = React.useCallback(
    async (requestId: string, action: 'accept' | 'reject') => {
      if (!currentUser?.id) return;

      try {
        console.log('🎯 SocialScreen - Responding to friend request:', {
          requestId,
          action,
          responderId: currentUser.id,
        });

        const result = await dispatch(
          respondToFriendRequest({
            requestId,
            action,
          })
        ).unwrap();

        console.log('🎯 SocialScreen - Friend request response successful:', result);

        // Refresh both friends and friend requests after successful response
        await Promise.all([dispatch(loadFriends()), dispatch(loadFriendRequests())]);

        console.log('🎯 SocialScreen - Refreshed friends and requests after response');
      } catch (error) {
        console.error('❌ SocialScreen - Failed to respond to friend request:', error);
      }
    },
    [dispatch, currentUser?.id]
  );

  // Handle close add friend modal
  const handleCloseAddFriendModal = React.useCallback(() => {
    dispatch(setShowAddFriendModal(false));
  }, [dispatch]);

  // Get status color
  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online':
        return theme.colors.semantic.success[500];
      case 'away':
        return theme.colors.semantic.warning[500];
      case 'offline':
        return theme.colors.neutral[400];
      default:
        return theme.colors.neutral[400];
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return '👋';
      case 'list_shared':
        return '📝';
      case 'item_added':
        return '➕';
      case 'list_completed':
        return '✅';
      default:
        return '📢';
    }
  };

  // Render friend request item
  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View
      style={[
        baseStyles.friendRequestCard,
        {
          backgroundColor: theme.colors.surface.card,
          borderColor: theme.colors.border.primary,
        },
      ]}>
      <View style={baseStyles.friendRequestInfo}>
        {/* Avatar */}
        <View style={[baseStyles.avatar, { backgroundColor: theme.colors.primary[100] }]}>
          {item.fromUser?.avatar ? (
            <Image
              source={{ uri: item.fromUser.avatar }}
              style={baseStyles.avatarImage as any}
              resizeMode='cover'
            />
          ) : (
            <Typography variant='h6' color={theme.colors.primary[600]}>
              {item.fromUser?.name?.charAt(0) || '?'}
            </Typography>
          )}
        </View>

        {/* Info */}
        <View style={baseStyles.friendRequestDetails}>
          <Typography variant='h6' color={theme.colors.text.primary}>
            {item.fromUser?.name || 'Unknown User'}
          </Typography>
          <Typography variant='body2' color={theme.colors.text.secondary}>
            {item.fromUser?.email || item.fromUser?.phone || 'No contact info'}
          </Typography>
          {item.message && (
            <Typography
              variant='caption'
              color={theme.colors.text.tertiary}
              style={{ marginTop: 4 }}>
              "{item.message}"
            </Typography>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={baseStyles.friendRequestActions}>
        <Button
          title='Accept'
          variant='primary'
          size='sm'
          onPress={() => handleFriendRequestResponse(item.id, 'accept')}
          style={baseStyles.friendRequestButton}
        />
        <Button
          title='Decline'
          variant='outline'
          size='sm'
          onPress={() => handleFriendRequestResponse(item.id, 'reject')}
          style={[baseStyles.friendRequestButton, { marginLeft: 8 }]}
        />
      </View>
    </View>
  );

  // Render friend item
  const renderFriend = ({ item }: { item: any }) => {
    // Determine which user is the friend (not the current user)
    const isCurrentUserUser1 = item.user1Id === currentUser?.id;
    const friendUser = isCurrentUserUser1 ? item.user2 : item.user1;

    console.log('🔍 Rendering friend:', { item, friendUser, currentUserId: currentUser?.id });

    return (
      <View
        style={[
          baseStyles.friendCard,
          {
            backgroundColor: theme.colors.surface.card,
            borderColor: theme.colors.border.primary,
          },
        ]}>
        <View style={baseStyles.friendInfo}>
          {/* Avatar */}
          <View style={[baseStyles.avatar, { backgroundColor: theme.colors.primary[100] }]}>
            {friendUser?.avatar ? (
              <Image
                source={{ uri: friendUser.avatar }}
                style={baseStyles.avatarImage as any}
                resizeMode='cover'
              />
            ) : (
              <Typography variant='h6' color={theme.colors.primary[600]}>
                {friendUser?.name?.charAt(0) || '?'}
              </Typography>
            )}
          </View>

          {/* Info */}
          <View style={baseStyles.friendDetails}>
            <View style={baseStyles.friendHeader}>
              <Typography variant='h6' color={theme.colors.text.primary}>
                {friendUser?.name || 'Unknown Friend'}
              </Typography>

              <View
                style={[baseStyles.statusDot, { backgroundColor: getStatusColor('offline') }]}
              />
            </View>

            <Typography variant='body2' color={theme.colors.text.secondary}>
              {friendUser?.email || friendUser?.phone || 'No contact info'}
            </Typography>

            <Typography variant='caption' color={theme.colors.text.tertiary}>
              {item.sharedListsCount || 0} shared lists • No recent activity
            </Typography>
          </View>
        </View>

        {/* Actions */}
        <View style={baseStyles.friendActions}>
          <Button
            title='💬'
            variant='ghost'
            size='sm'
            onPress={() => console.log('Message friend', friendUser?.id)}
          />

          <Button
            title='📝'
            variant='ghost'
            size='sm'
            onPress={() => console.log('Share list with friend', friendUser?.id)}
          />
        </View>
      </View>
    );
  };

  // Render notification item
  const renderNotification = ({ item }: { item: Notification }) => (
    <View
      style={[
        baseStyles.notificationCard,
        {
          backgroundColor: item.read ? theme.colors.surface.card : theme.colors.primary[50],
          borderColor: theme.colors.border.primary,
        },
      ]}>
      <View style={baseStyles.notificationContent}>
        <View style={baseStyles.notificationHeader}>
          <Typography variant='h6' style={{ fontSize: 20 }}>
            {getNotificationIcon(item.type)}
          </Typography>

          <View style={baseStyles.notificationInfo}>
            <Typography variant='h6' color={theme.colors.text.primary}>
              {item.title}
            </Typography>

            <Typography variant='caption' color={theme.colors.text.tertiary}>
              {item.time}
            </Typography>
          </View>

          {!item.read && (
            <View style={[baseStyles.unreadDot, { backgroundColor: theme.colors.primary[500] }]} />
          )}
        </View>

        <Typography variant='body2' color={theme.colors.text.secondary} style={{ marginTop: 4 }}>
          {item.description}
        </Typography>

        {/* Actions for friend requests */}
        {item.type === 'friend_request' && (
          <View style={baseStyles.notificationActions}>
            <Button
              title='Accept'
              variant='primary'
              size='sm'
              onPress={() => console.log('Accept friend request', item.id)}
              style={baseStyles.notificationButton}
            />

            <Button
              title='Decline'
              variant='outline'
              size='sm'
              onPress={() => console.log('Decline friend request', item.id)}
              style={baseStyles.notificationButton}
            />
          </View>
        )}
      </View>
    </View>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={baseStyles.container}>
        {/* Header */}
        <View style={baseStyles.header}>
          <Typography variant='h3' color={theme.colors.text.primary}>
            Social
          </Typography>

          <Button
            title='Add Friend'
            variant='primary'
            size='sm'
            onPress={handleAddFriendPress}
            leftIcon={
              {
                component: ({ size, color }: { size: number; color: string }) => (
                  <Image
                    source={AddFriendIcon}
                    style={{
                      width: size,
                      height: size,
                      tintColor: '#FFFFFF', // White color for visibility on primary button
                    }}
                    resizeMode='contain'
                  />
                ),
                name: 'add-friend',
                size: 16,
              } as any
            }
          />
        </View>

        {/* Stats */}
        <View style={baseStyles.statsContainer}>
          <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
            <Typography variant='h5' color={theme.colors.primary[500]}>
              {friends.length}
            </Typography>
            <Typography variant='caption' color={theme.colors.text.secondary}>
              Friends
            </Typography>
          </View>

          <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
            <Typography variant='h5' color={theme.colors.secondary[500]}>
              0
            </Typography>
            <Typography variant='caption' color={theme.colors.text.secondary}>
              Shared Lists
            </Typography>
          </View>

          <View style={[baseStyles.statCard, { backgroundColor: theme.colors.surface.card }]}>
            <Typography variant='h5' color={theme.colors.semantic.warning[500]}>
              {pendingRequestsCount}
            </Typography>
            <Typography variant='caption' color={theme.colors.text.secondary}>
              Unread
            </Typography>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={baseStyles.tabContainer}>
          <Button
            title='Friends'
            variant={activeTab === 'friends' ? 'primary' : 'outline'}
            size='sm'
            onPress={() => setActiveTab('friends')}
            style={baseStyles.tabButton}
          />

          <Button
            title='Activity'
            variant={activeTab === 'activity' ? 'primary' : 'outline'}
            size='sm'
            onPress={() => setActiveTab('activity')}
            style={baseStyles.tabButton}
          />

          <View style={baseStyles.tabButtonContainer}>
            <Button
              title='Invites'
              variant={activeTab === 'invites' ? 'primary' : 'outline'}
              size='sm'
              onPress={() => setActiveTab('invites')}
              style={baseStyles.tabButton}
            />
            {pendingRequestsCount > 0 && (
              <View
                style={[baseStyles.badge, { backgroundColor: theme.colors.semantic.error['500'] }]}>
                <Typography variant='caption' color='#FFFFFF' style={baseStyles.badgeText}>
                  {pendingRequestsCount}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        {activeTab === 'friends' && (
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={item => item.id}
            style={baseStyles.content}
            contentContainerStyle={baseStyles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View style={baseStyles.emptyContainer}>
                <Typography variant='h5' color={theme.colors.text.secondary} align='center'>
                  👥
                </Typography>
                <Typography
                  variant='h6'
                  color={theme.colors.text.secondary}
                  align='center'
                  style={{ marginTop: theme.spacing.md }}>
                  No friends yet
                </Typography>
                <Typography
                  variant='body2'
                  color={theme.colors.text.tertiary}
                  align='center'
                  style={{ marginTop: theme.spacing.sm }}>
                  Invite friends to collaborate on lists
                </Typography>
                <Button
                  title='Invite Friends'
                  variant='primary'
                  size='md'
                  onPress={handleAddFriendPress}
                  style={{ marginTop: theme.spacing.lg }}
                />
              </View>
            }
          />
        )}

        {activeTab === 'activity' && (
          <FlatList
            data={[]}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            style={baseStyles.content}
            contentContainerStyle={baseStyles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary[500]}
              />
            }
          />
        )}

        {activeTab === 'invites' && (
          <FlatList
            data={friendRequests.received}
            renderItem={renderFriendRequest}
            keyExtractor={item => item.id}
            style={baseStyles.content}
            contentContainerStyle={baseStyles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary[500]}
              />
            }
            ListEmptyComponent={
              <View style={baseStyles.emptyContainer}>
                <Typography variant='h5' color={theme.colors.text.secondary} align='center'>
                  📧
                </Typography>
                <Typography
                  variant='h6'
                  color={theme.colors.text.secondary}
                  align='center'
                  style={{ marginTop: theme.spacing.md }}>
                  No pending invites
                </Typography>
                <Typography
                  variant='body2'
                  color={theme.colors.text.tertiary}
                  align='center'
                  style={{ marginTop: theme.spacing.sm }}>
                  Friend requests will appear here
                </Typography>
              </View>
            }
          />
        )}

        {/* Add Friend Modal */}
        <AddFriendModal
          visible={socialState.showAddFriendModal}
          onClose={handleCloseAddFriendModal}
          onSendRequest={async request => {
            // This is handled by the modal internally via Redux
            console.log('Send friend request:', request);
          }}
          isLoading={socialState.isSendingRequest}
          error={socialState.error}
        />
      </SafeAreaView>
    </GradientBackground>
  );
};
