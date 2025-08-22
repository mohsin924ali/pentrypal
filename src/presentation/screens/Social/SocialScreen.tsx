/**
 * Social Screen
 * Friend and family management with privacy-focused email search
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  Modal,
  Animated,
  Image,
} from 'react-native';
import { Theme } from '@/shared/theme';
import { Typography } from '@/presentation/components/atoms/Typography';
import { Button } from '@/presentation/components/atoms/Button';
import { BottomNavigation } from '@/presentation/components/organisms';
import type { NavigationTab } from '@/presentation/components/organisms';
import SocialService from '@/infrastructure/services/socialService';
import type { Friend, FriendRequest, SentInvite, User } from '@/shared/types';
import NotificationService, { type Notification } from '@/infrastructure/services/notificationService';
import { getAvatarAsset, isValidAvatarIdentifier, isCustomImageUri } from '@/shared/utils/avatarUtils';

export interface SocialScreenProps {
  onBackPress: () => void;
  onNavigationTabPress: (tab: NavigationTab) => void;
  currentUser?: any;
}

export const SocialScreen: React.FC<SocialScreenProps> = ({
  onBackPress,
  onNavigationTabPress,
  currentUser,
}) => {
  // Avatar display function
  const renderAvatar = (avatar: string, friendId?: string) => {
    const uniqueKey = friendId ? `avatar-${friendId}-${avatar}` : `avatar-${avatar}`;
    
    if (isValidAvatarIdentifier(avatar)) {
      return (
        <Image
          key={uniqueKey}
          source={getAvatarAsset(avatar)}
          style={styles.avatarImage}
        />
      );
    }
    if (isCustomImageUri(avatar)) {
      return (
        <Image
          key={uniqueKey}
          source={{ uri: avatar }}
          style={styles.avatarImage}
        />
      );
    }
    return (
      <Typography variant="h2" color={Theme.colors.text.primary}>
        {avatar || '👤'}
      </Typography>
    );
  };

  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<User | null>(null);
  const [selectedTab, setSelectedTab] = useState<'friends' | 'requests' | 'invites'>('friends');
  const [isLoading, setIsLoading] = useState(false);

  // Data from service
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Custom pop-up states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [successFadeAnim] = useState(new Animated.Value(0));
  const [successScaleAnim] = useState(new Animated.Value(0.3));

  // Load data when component mounts or tab changes
  useEffect(() => {
    loadSocialData();
  }, []);

  // Refresh social data when current user changes (e.g., after profile updates)
  useEffect(() => {
    if (currentUser) {
      // Force a fresh load of social data to ensure updated avatars are displayed
      console.log('Refreshing social data due to current user change');
      loadSocialData();
    }
  }, [currentUser]);

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

  // Sync current user with social service
  useEffect(() => {
    const syncCurrentUser = async () => {
      if (currentUser) {
        try {
          await SocialService.setCurrentUser(currentUser.id);
          console.log('Current user synced with social service:', currentUser.email);
        } catch (error) {
          console.error('Error syncing current user with social service:', error);
        }
      }
    };
    
    syncCurrentUser();
  }, [currentUser]);

  // Auto-search when email changes and is valid
  useEffect(() => {
    const autoSearch = async () => {
      if (searchEmail.trim() && isValidEmail(searchEmail)) {
        await performSearch(searchEmail);
      } else {
        // Clear search result if email is not valid
        setSearchResult(null);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(autoSearch, 500);
    return () => clearTimeout(timeoutId);
  }, [searchEmail]);

  const loadSocialData = async () => {
    try {
      setIsLoading(true);
      console.log('Loading fresh social data...');
      
      const [friendsData, requestsData, invitesData, sentRequestsData] = await Promise.all([
        SocialService.getFriends(),
        SocialService.getFriendRequests(),
        SocialService.getSentInvites(),
        SocialService.getSentFriendRequests(),
      ]);

      console.log('Fresh friends data loaded:', friendsData.length, 'friends');
      friendsData.forEach(friend => {
        console.log(`Friend: ${friend.name} (${friend.email}) - Avatar: ${friend.avatar}`);
      });

      setFriends(friendsData);
      setFriendRequests(requestsData);
      setSentInvites(invitesData);
      setSentRequests(sentRequestsData);
    } catch (error) {
      console.error('Error loading social data:', error);
      Alert.alert('Error', 'Failed to load social data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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

  // Search for user using the service - privacy-focused
  const searchUser = async (email: string): Promise<User | null> => {
    if (!isValidEmail(email)) {
      return null;
    }

    try {
      setIsSearching(true);
      const user = await SocialService.searchUserByEmail(email);
      return user;
    } catch (error) {
      console.error('Error searching user:', error);
      return null;
    } finally {
      setIsSearching(false);
    }
  };

  // Core search logic that can be reused
  const performSearch = async (email: string, showAlerts: boolean = false) => {
    if (!isValidEmail(email)) {
      return;
    }

    try {
      // Check existing relationships using service
      const [isAlreadyFriend, hasRequestPending, hasInviteSent] = await Promise.all([
        SocialService.areFriends(email),
        SocialService.hasRequestPending(email),
        SocialService.hasInviteSent(email),
      ]);

      // Search for user first
      const user = await searchUser(email);
      
      if (user) {
        // Add relationship status to user object for display
        const userWithStatus = {
          ...user,
          relationshipStatus: isAlreadyFriend ? 'friend' : 
                             hasRequestPending ? 'pending' : 
                             hasInviteSent ? 'invited' : 'none'
        };
        setSearchResult(userWithStatus);

        // Show alerts only for manual search
        if (showAlerts) {
          if (isAlreadyFriend) {
            Alert.alert('Already Friends', 'This person is already in your friends list.');
          } else if (hasRequestPending) {
            Alert.alert('Request Pending', 'There is already a pending friend request with this person.');
          } else if (hasInviteSent) {
            Alert.alert('Invite Sent', 'You have already sent an invite to this email address.');
          }
        }
      } else {
        setSearchResult(null);
        if (showAlerts) {
          // User not found - this is normal for privacy protection
          console.log('User not found for email:', email);
        }
      }
    } catch (error) {
      console.error('Error during search:', error);
      setSearchResult(null);
      if (showAlerts) {
        Alert.alert('Error', 'Failed to search. Please try again.');
      }
    }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) {
      return;
    }

    if (!isValidEmail(searchEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    await performSearch(searchEmail, true);
  };

  const handleSendInvite = async (user: User) => {
    try {
      if (user.id) {
        // User exists in system - send friend request
        await SocialService.sendFriendRequest(user.id);
        setSuccessTitle('Request Sent! 🎉');
        setSuccessMessage(`Friend request sent to ${user.name}`);
        showSuccessModalWithAnimation();
      } else {
        // User doesn't exist - send email invite
        await SocialService.sendEmailInvite(user.email);
        setSuccessTitle('Invite Sent! 📧');
        setSuccessMessage(`Email invite sent to ${user.email}`);
        showSuccessModalWithAnimation();
      }
      
      // Refresh data to show in Sent tab
      await loadSocialData();
      
      // Update search result to show new status
      if (searchEmail === user.email) {
        await performSearch(user.email, false);
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      Alert.alert('Error', 'Failed to send invite. Please try again.');
    }
  };

  const handleAcceptRequest = async (request: FriendRequest) => {
    try {
      await SocialService.acceptFriendRequest(request.id);
      setSuccessTitle('Friend Added! 👥');
      setSuccessMessage(`${request.fromUser.name} is now your friend.`);
      showSuccessModalWithAnimation();
      await loadSocialData(); // Refresh data
    } catch (error) {
      console.error('Error accepting request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineRequest = async (request: FriendRequest) => {
    try {
      await SocialService.declineFriendRequest(request.id);
      setSuccessTitle('Request Declined ❌');
      setSuccessMessage(`Friend request from ${request.fromUser.name} was declined.`);
      showSuccessModalWithAnimation();
      await loadSocialData(); // Refresh data
    } catch (error) {
      console.error('Error declining request:', error);
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    }
  };

  const handleRemoveFriend = (friend: Friend) => {
    Alert.alert(
      'Remove Friend',
      `Are you sure you want to remove ${friend.name} from your friends?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await SocialService.removeFriend(friend.id);
              setSuccessTitle('Friend Removed 💔');
              setSuccessMessage(`${friend.name} has been removed from your friends.`);
              showSuccessModalWithAnimation();
              await loadSocialData(); // Refresh data
            } catch (error) {
              console.error('Error removing friend:', error);
              Alert.alert('Error', 'Failed to remove friend. Please try again.');
            }
          },
        },
      ]
    );
  };

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
        tension: 100,
        friction: 8,
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
    });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.headerButton}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Typography variant="h3" color={Theme.colors.text.primary}>
          ←
        </Typography>
      </TouchableOpacity>

      <Typography
        variant="h2"
        color={Theme.colors.text.primary}
        style={styles.headerTitle}
      >
        Social
      </Typography>

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
    </View>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <Typography
        variant="h3"
        color={Theme.colors.text.primary}
        style={styles.sectionTitle}
      >
        Add Friends & Family
      </Typography>
      
      <Typography
        variant="body"
        color={Theme.colors.text.secondary}
        style={styles.searchDescription}
      >
        Enter the complete email address to find and invite friends or family members.
      </Typography>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchEmail}
          onChangeText={setSearchEmail}
          placeholder="Enter complete email address"
          placeholderTextColor={Theme.colors.text.secondary}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Button
          title={isSearching ? "..." : "Search"}
          variant="primary"
          size="medium"
          onPress={handleSearch}
          disabled={isSearching || !searchEmail.trim()}
          style={styles.searchButton}
        />
      </View>

      {/* Search Result */}
      {searchResult && (
        <View style={styles.searchResultCard}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {renderAvatar(searchResult.avatar)}
            </View>
            <View style={styles.userDetails}>
              <Typography
                variant="h3"
                color={Theme.colors.text.primary}
                style={styles.userName}
              >
                {searchResult.name}
              </Typography>
              <Typography
                variant="body"
                color={Theme.colors.text.secondary}
              >
                {searchResult.email}
              </Typography>
              {/* Show relationship status */}
              {(searchResult as any).relationshipStatus && (searchResult as any).relationshipStatus !== 'none' && (
                <Typography
                  variant="caption"
                  color={
                    (searchResult as any).relationshipStatus === 'friend' ? Theme.colors.success : 
                    (searchResult as any).relationshipStatus === 'pending' ? Theme.colors.warning : 
                    Theme.colors.primary[500]
                  }
                  style={styles.statusText}
                >
                  {(searchResult as any).relationshipStatus === 'friend' ? '✓ Already friends' :
                   (searchResult as any).relationshipStatus === 'pending' ? '⏳ Request pending' :
                   (searchResult as any).relationshipStatus === 'invited' ? '📧 Invite sent' : ''}
                </Typography>
              )}
            </View>
          </View>
          {/* Show button based on relationship status */}
          {!(searchResult as any).relationshipStatus || (searchResult as any).relationshipStatus === 'none' ? (
            <Button
              title="Send Invite"
              variant="primary"
              size="small"
              onPress={() => handleSendInvite(searchResult)}
            />
          ) : (
            <View style={styles.statusButton}>
              <Typography
                variant="caption"
                color={Theme.colors.text.secondary}
                style={styles.statusButtonText}
              >
                {(searchResult as any).relationshipStatus === 'friend' ? 'Friends' :
                 (searchResult as any).relationshipStatus === 'pending' ? 'Pending' :
                 (searchResult as any).relationshipStatus === 'invited' ? 'Invited' : ''}
              </Typography>
            </View>
          )}
        </View>
      )}

      {searchEmail && !searchResult && !isSearching && isValidEmail(searchEmail) && (
        <View style={styles.noResultCard}>
          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            style={styles.noResultText}
          >
            No user found with email "{searchEmail}". Make sure the email address is correct.
          </Typography>
        </View>
      )}
    </View>
  );

  // Render functions for different types of cards
  const renderFriendCard = (friend: Friend) => (
    <View key={friend.id} style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {renderAvatar(friend.avatar, friend.id)}
        </View>
        <View style={styles.userDetails}>
          <Typography variant="h3" color={Theme.colors.text.primary} style={styles.userName}>
            {friend.name}
          </Typography>
          <Typography variant="body" color={Theme.colors.text.secondary}>
            {friend.email}
          </Typography>
          <Typography variant="caption" color={Theme.colors.text.secondary}>
            Friends since {new Date(friend.addedAt).toLocaleDateString()}
          </Typography>
        </View>
      </View>
    </View>
  );

  const renderRequestCard = (request: FriendRequest) => (
    <View key={request.id} style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {renderAvatar(request.fromUser.avatar, request.fromUser.id)}
        </View>
        <View style={styles.userDetails}>
          <Typography variant="h3" color={Theme.colors.text.primary} style={styles.userName}>
            {request.fromUser.name}
          </Typography>
          <Typography variant="body" color={Theme.colors.text.secondary}>
            {request.fromUser.email}
          </Typography>
          <Typography variant="caption" color={Theme.colors.text.secondary}>
            Sent {getTimeAgo(request.sentAt)}
          </Typography>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(request)}
        >
          <Typography variant="caption" color="#ffffff">Accept</Typography>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => handleDeclineRequest(request)}
        >
          <Typography variant="caption" color="#ffffff">Decline</Typography>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentRequestCard = (request: FriendRequest) => (
    <View key={request.id} style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          {renderAvatar(request.toUser.avatar, request.toUser.id)}
        </View>
        <View style={styles.userDetails}>
          <Typography variant="h3" color={Theme.colors.text.primary} style={styles.userName}>
            {request.toUser.name}
          </Typography>
          <Typography variant="body" color={Theme.colors.text.secondary}>
            {request.toUser.email}
          </Typography>
          <Typography variant="caption" color={Theme.colors.text.secondary}>
            Request sent {getTimeAgo(request.sentAt)}
          </Typography>
        </View>
      </View>
      <View style={styles.statusButton}>
        <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.statusButtonText}>
          Pending
        </Typography>
      </View>
    </View>
  );

  const renderInviteCard = (invite: SentInvite) => (
    <View key={invite.id} style={styles.card}>
      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Typography variant="h2" color={Theme.colors.text.primary}>
            📧
          </Typography>
        </View>
        <View style={styles.userDetails}>
          <Typography variant="h3" color={Theme.colors.text.primary} style={styles.userName}>
            {invite.email}
          </Typography>
          <Typography variant="body" color={Theme.colors.text.secondary}>
            Email invitation
          </Typography>
          <Typography variant="caption" color={Theme.colors.text.secondary}>
            Sent {getTimeAgo(invite.sentAt)}
          </Typography>
        </View>
      </View>
      <View style={styles.statusButton}>
        <Typography variant="caption" color={Theme.colors.text.secondary} style={styles.statusButtonText}>
          Pending
        </Typography>
      </View>
    </View>
  );

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {[
        { key: 'friends', label: `Friends (${friends.length})`, count: friends.length },
        { key: 'requests', label: `Requests (${friendRequests.length})`, count: friendRequests.length },
        { key: 'invites', label: `Sent (${sentInvites.length + sentRequests.length})`, count: sentInvites.length + sentRequests.length },
      ].map((tab) => (
        <TouchableOpacity
          key={tab.key}
          style={[
            styles.tabItem,
            selectedTab === tab.key && styles.tabItemActive
          ]}
          onPress={() => setSelectedTab(tab.key as any)}
        >
          <Typography
            variant="body"
            color={selectedTab === tab.key ? Theme.colors.primary[500] : Theme.colors.text.secondary}
            style={styles.tabLabel}
          >
            {tab.label}
          </Typography>
          {tab.count > 0 && (
            <View style={styles.tabBadge}>
              <Typography
                variant="caption"
                color={Theme.colors.background.primary}
                style={styles.tabBadgeText}
              >
                {tab.count}
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );



  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.listContent}>
          <View style={styles.emptyState}>
            <Typography
              variant="body"
              color={Theme.colors.text.secondary}
              style={styles.emptyText}
            >
              Loading...
            </Typography>
          </View>
        </View>
      );
    }

    switch (selectedTab) {
      case 'friends':
        return (
          <View style={styles.listContent}>
            {friends.length > 0 ? (
              friends.map(renderFriendCard)
            ) : (
              <View style={styles.emptyState}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyTitle}
                >
                  No Friends Yet
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyText}
                >
                  Search for friends by their email address to start collaborating on shopping lists!
                </Typography>
              </View>
            )}
          </View>
        );

      case 'requests':
        return (
          <View style={styles.listContent}>
            {friendRequests.length > 0 ? (
              friendRequests.map(renderRequestCard)
            ) : (
              <View style={styles.emptyState}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyTitle}
                >
                  No Pending Requests
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyText}
                >
                  Friend requests from others will appear here.
                </Typography>
              </View>
            )}
          </View>
        );

      case 'invites':
        const totalSentItems = sentInvites.length + sentRequests.length;
        return (
          <View style={styles.listContent}>
            {totalSentItems > 0 ? (
              <>
                {sentRequests.map(renderSentRequestCard)}
                {sentInvites.map(renderInviteCard)}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Typography
                  variant="h3"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyTitle}
                >
                  No Sent Invites
                </Typography>
                <Typography
                  variant="body"
                  color={Theme.colors.text.secondary}
                  style={styles.emptyText}
                >
                  Friend requests and invites you send will be tracked here.
                </Typography>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
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
              ✅
            </Typography>
          </View>

          {/* Success Title */}
          <Typography
            variant="h3"
            color={Theme.colors.text.primary}
            style={styles.successTitle}
          >
            {successTitle}
          </Typography>

          {/* Success Message */}
          <Typography
            variant="body"
            color={Theme.colors.text.secondary}
            style={styles.successSubtitle}
          >
            {successMessage}
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
        {renderSearchSection()}
        {renderTabBar()}
        {renderContent()}
      </ScrollView>

      <BottomNavigation
        activeTab="community"
        onTabPress={onNavigationTabPress}
      />

      {renderSuccessModal()}
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
    fontWeight: '600',
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

  // Success Modal Styles
  successModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  successModalContainer: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius['2xl'],
    paddingVertical: Theme.spacing['2xl'],
    paddingHorizontal: Theme.spacing.lg,
    alignItems: 'center',
    maxWidth: 300,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  } as ViewStyle,

  successIconContainer: {
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  successIcon: {
    fontSize: 64,
    textAlign: 'center',
  } as ViewStyle,

  successTitle: {
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
  } as ViewStyle,

  successSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Theme.spacing['2xl'],
    lineHeight: 22,
  } as ViewStyle,

  successButton: {
    backgroundColor: Theme.colors.primary[500],
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
    paddingBottom: Theme.spacing['2xl'],
  } as ViewStyle,

  searchSection: {
    backgroundColor: Theme.colors.background.primary,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.lg,
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  sectionTitle: {
    marginBottom: Theme.spacing.sm,
    fontWeight: '600',
  } as ViewStyle,

  searchDescription: {
    marginBottom: Theme.spacing.lg,
    lineHeight: 20,
  } as ViewStyle,

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  } as ViewStyle,

  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#F3F4F6',
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    fontSize: 16,
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  } as ViewStyle,

  searchButton: {
    minWidth: 80,
  } as ViewStyle,

  searchResultCard: {
    backgroundColor: Theme.colors.background.secondary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Theme.colors.primary[200],
  } as ViewStyle,

  noResultCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    borderWidth: 1,
    borderColor: '#F59E0B',
  } as ViewStyle,

  noResultText: {
    textAlign: 'center',
    fontStyle: 'italic',
  } as ViewStyle,

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  } as ViewStyle,

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  } as ViewStyle,

  userDetails: {
    flex: 1,
  } as ViewStyle,

  userName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,

  statusText: {
    marginTop: 4,
    fontWeight: '500',
  } as ViewStyle,

  statusButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  statusButtonText: {
    fontSize: 12,
    fontWeight: '500',
  } as ViewStyle,

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    shadowRadius: 4,
  } as ViewStyle,



  tabBar: {
    backgroundColor: Theme.colors.background.primary,
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  } as ViewStyle,

  tabItem: {
    flex: 1,
    paddingVertical: Theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    position: 'relative',
  } as ViewStyle,

  tabItemActive: {
    borderBottomColor: Theme.colors.primary[500],
  } as ViewStyle,

  tabLabel: {
    fontWeight: '500',
    textAlign: 'center',
  } as ViewStyle,

  tabBadge: {
    position: 'absolute',
    top: -4,
    right: 8,
    backgroundColor: Theme.colors.primary[500],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  } as ViewStyle,

  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  } as ViewStyle,

  listContent: {
    paddingHorizontal: Theme.spacing.lg,
  } as ViewStyle,

  friendCard: {
    backgroundColor: Theme.colors.background.primary,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  } as ViewStyle,

  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  } as ViewStyle,

  friendDetails: {
    flex: 1,
  } as ViewStyle,

  friendName: {
    fontWeight: '600',
    marginBottom: 2,
  } as ViewStyle,

  friendEmail: {
    marginBottom: 4,
  } as ViewStyle,

  friendActions: {
    marginLeft: Theme.spacing.md,
  } as ViewStyle,

  requestActions: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  } as ViewStyle,

  acceptButton: {
    backgroundColor: Theme.colors.primary[500],
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  } as ViewStyle,

  declineButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  } as ViewStyle,

  removeButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  } as ViewStyle,

  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.md,
  } as ViewStyle,

  emptyState: {
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
    lineHeight: 20,
  } as ViewStyle,
};
