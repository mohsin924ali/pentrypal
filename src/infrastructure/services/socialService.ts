// ========================================
// Social Service - Friend Management Implementation
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode as base64Decode } from 'base-64';
import type {
  FriendRequest,
  Friendship,
  FriendSearchResult,
  FriendActivity,
  SendFriendRequestRequest,
  SendFriendRequestResponse,
  RespondToFriendRequestRequest,
  RespondToFriendRequestResponse,
  SearchFriendsRequest,
  SearchFriendsResponse,
  FriendPrivacySettings,
} from '../../shared/types/social';
import type { User } from '../../shared/types';
import {
  validateForm,
  sendFriendRequestSchema,
  respondToFriendRequestSchema,
  searchFriendsSchema,
} from '../../shared/validation';
import NotificationService from './notificationService';

// ========================================
// Social Service Interface
// ========================================

export interface ISocialService {
  // Friend Requests
  sendFriendRequest(request: SendFriendRequestRequest): Promise<SendFriendRequestResponse>;
  respondToFriendRequest(
    request: RespondToFriendRequestRequest
  ): Promise<RespondToFriendRequestResponse>;
  cancelFriendRequest(requestId: string): Promise<{ success: boolean; message: string }>;
  getFriendRequests(userId: string): Promise<{ sent: FriendRequest[]; received: FriendRequest[] }>;

  // Friends Management
  getFriends(userId: string): Promise<Friendship[]>;
  unfriend(friendshipId: string): Promise<{ success: boolean; message: string }>;
  blockUser(userId: string, targetUserId: string): Promise<{ success: boolean; message: string }>;
  unblockUser(userId: string, targetUserId: string): Promise<{ success: boolean; message: string }>;

  // Search & Discovery
  searchUsers(request: SearchFriendsRequest): Promise<SearchFriendsResponse>;
  getSuggestedFriends(userId: string, limit?: number): Promise<FriendSearchResult[]>;
  getMutualFriends(userId: string, targetUserId: string): Promise<User[]>;

  // Activity & Privacy
  getFriendActivity(userId: string, limit?: number): Promise<FriendActivity[]>;
  updatePrivacySettings(
    userId: string,
    settings: Partial<FriendPrivacySettings>
  ): Promise<FriendPrivacySettings>;
  getPrivacySettings(userId: string): Promise<FriendPrivacySettings>;
}

// ========================================
// Social Service Implementation
// ========================================

class SocialServiceImpl implements ISocialService {
  private readonly STORAGE_KEYS = {
    FRIENDS: 'social_friends',
    FRIEND_REQUESTS: 'social_friend_requests',
    BLOCKED_USERS: 'social_blocked_users',
    PRIVACY_SETTINGS: 'social_privacy_settings',
    USERS_DB: 'users_database', // Mock user database
  } as const;

  // ========================================
  // Friend Requests
  // ========================================

  async sendFriendRequest(request: SendFriendRequestRequest): Promise<SendFriendRequestResponse> {
    try {
      console.log('🎯 Service sendFriendRequest started with request:', request);

      // Validate input
      const validation = validateForm(sendFriendRequestSchema, request);
      if (!validation.success) {
        console.log('❌ Validation failed:', validation.errors);
        return {
          success: false,
          message: Object.values(validation.errors)[0],
          errorCode: 'VALIDATION_ERROR',
        };
      }

      const validRequest = validation.data;
      console.log('✅ Validation passed:', validRequest);

      // Get current user (in real app, this would come from auth context)
      const currentUserId = await this.getCurrentUserId();
      console.log('👤 Current user ID:', currentUserId);
      if (!currentUserId) {
        console.log('❌ No current user ID');
        return {
          success: false,
          message: 'User not authenticated',
          errorCode: 'NOT_AUTHENTICATED',
        };
      }

      // Check if trying to add self
      if (currentUserId === validRequest.toUserId) {
        return {
          success: false,
          message: 'You cannot send a friend request to yourself',
          errorCode: 'INVALID_TARGET',
        };
      }

      // Check if target user exists
      console.log('🔍 Checking if target user exists...');
      const targetUser = await this.getUserById(validRequest.toUserId);
      console.log('👤 Target user:', targetUser ? targetUser.name : 'not found');
      if (!targetUser) {
        return {
          success: false,
          message: 'User not found',
          errorCode: 'USER_NOT_FOUND',
        };
      }

      // Check if already friends
      console.log('🔍 Checking if already friends...');
      const existingFriendship = await this.getFriendshipBetweenUsers(
        currentUserId,
        validRequest.toUserId
      );
      console.log('👫 Existing friendship:', existingFriendship ? 'found' : 'none');
      if (existingFriendship) {
        return {
          success: false,
          message: 'You are already friends with this user',
          errorCode: 'ALREADY_FRIENDS',
        };
      }

      // Check if request already exists
      console.log('🔍 Checking if request already exists...');
      const existingRequest = await this.getExistingFriendRequest(
        currentUserId,
        validRequest.toUserId
      );
      console.log('📨 Existing request:', existingRequest ? existingRequest.status : 'none');
      if (existingRequest) {
        if (existingRequest.status === 'pending') {
          return {
            success: false,
            message: 'Friend request already sent',
            errorCode: 'REQUEST_ALREADY_EXISTS',
          };
        }
      }

      // Check privacy settings
      console.log('🔍 Checking privacy settings...');
      const targetPrivacySettings = await this.getPrivacySettings(validRequest.toUserId);
      console.log(
        '🔒 Privacy settings:',
        targetPrivacySettings.allowFriendRequests ? 'allows requests' : 'blocks requests'
      );
      if (!targetPrivacySettings.allowFriendRequests) {
        return {
          success: false,
          message: 'This user is not accepting friend requests',
          errorCode: 'REQUESTS_DISABLED',
        };
      }

      // Check if user is blocked
      console.log('🔍 Checking if user is blocked...');
      if (targetPrivacySettings.blockedUserIds.includes(currentUserId)) {
        console.log('❌ User is blocked');
        return {
          success: false,
          message: 'Unable to send friend request',
          errorCode: 'USER_BLOCKED',
        };
      }
      console.log('✅ User is not blocked');

      // Create friend request
      const currentUser = await this.getUserById(currentUserId);
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

      const friendRequest: FriendRequest = {
        id: this.generateId(),
        fromUserId: currentUserId,
        toUserId: validRequest.toUserId,
        fromUser: currentUser!,
        toUser: targetUser,
        status: 'pending',
        message: validRequest.message,
        expiresAt: expiresAt,
        createdAt: now,
        updatedAt: now,
      };

      // Save friend request
      await this.saveFriendRequest(friendRequest);

      // Send notification to target user
      NotificationService.addNotification({
        type: 'friend_request',
        title: 'New Friend Request',
        message: `${currentUser!.name} sent you a friend request`,
        priority: 'medium',
        metadata: {
          fromUserId: currentUserId,
          fromUserName: currentUser!.name,
          requestId: friendRequest.id,
        },
      });

      return {
        success: true,
        friendRequest,
        message: 'Friend request sent successfully',
      };
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      return {
        success: false,
        message: 'Failed to send friend request',
        errorCode: 'INTERNAL_ERROR',
      };
    }
  }

  async respondToFriendRequest(
    request: RespondToFriendRequestRequest
  ): Promise<RespondToFriendRequestResponse> {
    try {
      // Validate input
      const validation = validateForm(respondToFriendRequestSchema, request);
      if (!validation.success) {
        return {
          success: false,
          message: Object.values(validation.errors)[0],
          errorCode: 'VALIDATION_ERROR',
        };
      }

      const validRequest = validation.data;

      // Get current user
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        return {
          success: false,
          message: 'User not authenticated',
          errorCode: 'NOT_AUTHENTICATED',
        };
      }

      // Get friend request
      const friendRequest = await this.getFriendRequestById(validRequest.requestId);
      if (!friendRequest) {
        return {
          success: false,
          message: 'Friend request not found',
          errorCode: 'REQUEST_NOT_FOUND',
        };
      }

      // Verify user can respond to this request
      console.log(
        '🔍 Respond validation - Request toUserId:',
        friendRequest.toUserId,
        'Current userId:',
        currentUserId
      );
      if (friendRequest.toUserId !== currentUserId) {
        console.log('❌ User cannot respond - not the recipient');
        return {
          success: false,
          message: 'You can only respond to requests sent to you',
          errorCode: 'UNAUTHORIZED',
        };
      }
      console.log('✅ User can respond to this request');

      // Check if request is still pending
      if (friendRequest.status !== 'pending') {
        return {
          success: false,
          message: 'This friend request has already been responded to',
          errorCode: 'REQUEST_ALREADY_RESPONDED',
        };
      }

      // Check if request has expired
      if (new Date() > friendRequest.expiresAt) {
        return {
          success: false,
          message: 'This friend request has expired',
          errorCode: 'REQUEST_EXPIRED',
        };
      }

      // Update friend request status
      const updatedRequest: FriendRequest = {
        ...friendRequest,
        status: validRequest.action === 'accept' ? 'accepted' : 'rejected',
        respondedAt: new Date(),
        updatedAt: new Date(),
      };

      await this.updateFriendRequest(updatedRequest);

      let friendship: Friendship | undefined;

      if (validRequest.action === 'accept') {
        // Create friendship
        const now = new Date().toISOString();
        friendship = {
          id: this.generateId(),
          user1Id: friendRequest.fromUserId,
          user2Id: friendRequest.toUserId,
          user1: friendRequest.fromUser,
          user2: friendRequest.toUser,
          status: 'active',
          initiatedBy: friendRequest.fromUserId,
          sharedListsCount: 0,
          createdAt: now,
          updatedAt: now,
        };

        await this.saveFriendship(friendship);

        // Send notification to requester
        NotificationService.addNotification({
          type: 'friend_request_accepted',
          title: 'Friend Request Accepted',
          message: `${friendRequest.toUser.name} accepted your friend request`,
          priority: 'medium',
          metadata: {
            friendshipId: friendship.id,
            friendUserId: currentUserId,
            friendUserName: friendRequest.toUser.name,
          },
        });
      } else {
        // Send notification to requester about rejection
        NotificationService.addNotification({
          type: 'friend_request_rejected',
          title: 'Friend Request Update',
          message: 'Your friend request was not accepted',
          priority: 'low',
          metadata: {
            requestId: friendRequest.id,
          },
        });
      }

      return {
        success: true,
        friendship,
        message:
          validRequest.action === 'accept' ? 'Friend request accepted' : 'Friend request rejected',
      };
    } catch (error: any) {
      console.error('Error responding to friend request:', error);
      return {
        success: false,
        message: 'Failed to respond to friend request',
        errorCode: 'INTERNAL_ERROR',
      };
    }
  }

  async cancelFriendRequest(requestId: string): Promise<{ success: boolean; message: string }> {
    try {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId) {
        return { success: false, message: 'User not authenticated' };
      }

      const friendRequest = await this.getFriendRequestById(requestId);
      if (!friendRequest) {
        return { success: false, message: 'Friend request not found' };
      }

      if (friendRequest.fromUserId !== currentUserId) {
        return { success: false, message: 'You can only cancel requests you sent' };
      }

      if (friendRequest.status !== 'pending') {
        return { success: false, message: 'This request cannot be cancelled' };
      }

      const updatedRequest: FriendRequest = {
        ...friendRequest,
        status: 'cancelled',
        updatedAt: new Date(),
      };

      await this.updateFriendRequest(updatedRequest);

      return { success: true, message: 'Friend request cancelled' };
    } catch (error: any) {
      console.error('Error cancelling friend request:', error);
      return { success: false, message: 'Failed to cancel friend request' };
    }
  }

  async getFriendRequests(
    userId: string
  ): Promise<{ sent: FriendRequest[]; received: FriendRequest[] }> {
    try {
      const allRequests = await this.getAllFriendRequests();

      const sent = allRequests.filter(req => req.fromUserId === userId && req.status === 'pending');

      const received = allRequests.filter(
        req => req.toUserId === userId && req.status === 'pending'
      );

      return { sent, received };
    } catch (error: any) {
      console.error('Error getting friend requests:', error);
      return { sent: [], received: [] };
    }
  }

  // ========================================
  // Friends Management
  // ========================================

  async getFriends(userId: string): Promise<Friendship[]> {
    try {
      const allFriendships = await this.getAllFriendships();
      return allFriendships.filter(
        friendship =>
          (friendship.user1Id === userId || friendship.user2Id === userId) &&
          friendship.status === 'active'
      );
    } catch (error: any) {
      console.error('Error getting friends:', error);
      return [];
    }
  }

  async unfriend(friendshipId: string): Promise<{ success: boolean; message: string }> {
    try {
      const friendship = await this.getFriendshipById(friendshipId);
      if (!friendship) {
        return { success: false, message: 'Friendship not found' };
      }

      await this.deleteFriendship(friendshipId);

      return { success: true, message: 'Friend removed successfully' };
    } catch (error: any) {
      console.error('Error unfriending user:', error);
      return { success: false, message: 'Failed to remove friend' };
    }
  }

  async blockUser(
    userId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const privacySettings = await this.getPrivacySettings(userId);
      const updatedSettings: FriendPrivacySettings = {
        ...privacySettings,
        blockedUserIds: [...privacySettings.blockedUserIds, targetUserId],
      };

      await this.updatePrivacySettings(userId, updatedSettings);

      // Remove any existing friendship
      const friendship = await this.getFriendshipBetweenUsers(userId, targetUserId);
      if (friendship) {
        await this.deleteFriendship(friendship.id);
      }

      return { success: true, message: 'User blocked successfully' };
    } catch (error: any) {
      console.error('Error blocking user:', error);
      return { success: false, message: 'Failed to block user' };
    }
  }

  async unblockUser(
    userId: string,
    targetUserId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const privacySettings = await this.getPrivacySettings(userId);
      const updatedSettings: FriendPrivacySettings = {
        ...privacySettings,
        blockedUserIds: privacySettings.blockedUserIds.filter(id => id !== targetUserId),
      };

      await this.updatePrivacySettings(userId, updatedSettings);

      return { success: true, message: 'User unblocked successfully' };
    } catch (error: any) {
      console.error('Error unblocking user:', error);
      return { success: false, message: 'Failed to unblock user' };
    }
  }

  // ========================================
  // Search & Discovery
  // ========================================

  async searchUsers(request: SearchFriendsRequest): Promise<SearchFriendsResponse> {
    try {
      console.log('🔍 SearchUsers called with request:', request);

      // Validate input
      const validation = validateForm(searchFriendsSchema, request.filters);
      if (!validation.success) {
        console.log('❌ Validation failed:', validation.errors);
        return {
          success: false,
          results: [],
          totalCount: 0,
          hasMore: false,
          message: Object.values(validation.errors)[0],
        };
      }

      const filters = validation.data;
      console.log('✅ Validation passed, filters:', filters);

      const currentUserId = await this.getCurrentUserId();
      console.log('👤 Current user ID:', currentUserId);

      if (!currentUserId) {
        console.log('❌ No current user ID');
        return {
          success: false,
          results: [],
          totalCount: 0,
          hasMore: false,
          message: 'User not authenticated',
        };
      }

      // Get all users (in real app, this would be a database query)
      const allUsers = await this.getAllUsers();
      console.log('👥 All users loaded:', allUsers.length, 'users');
      console.log(
        '👥 User names:',
        allUsers.map(u => u.name)
      );

      const currentUserFriends = await this.getFriends(currentUserId);
      const friendIds = currentUserFriends.map(f =>
        f.user1Id === currentUserId ? f.user2Id : f.user1Id
      );
      console.log('👫 Current user friends:', friendIds);

      // Filter users based on search criteria
      let filteredUsers = allUsers.filter(user => {
        console.log(
          `🔍 Checking user: ${user.name} (${user.email}) mobile: ${user.mobile || 'undefined'}`
        );

        // Exclude self
        if (user.id === currentUserId) {
          console.log(`❌ Excluding self: ${user.name}`);
          return false;
        }

        // Exclude already friends
        if (friendIds.includes(user.id)) {
          console.log(`❌ Already friends: ${user.name}`);
          return false;
        }

        // Apply search query
        if (filters.query) {
          const query = filters.query.toLowerCase();
          const matchesName = user.name.toLowerCase().includes(query);
          const matchesEmail = user.email.toLowerCase().includes(query);
          const matchesMobile = user.mobile?.includes(query) || false;
          console.log(
            `🔍 Query: "${query}", Name match: ${matchesName}, Email match: ${matchesEmail}, Mobile match: ${matchesMobile}, User mobile: "${user.mobile}"`
          );
          if (!matchesName && !matchesEmail && !matchesMobile) {
            console.log(`❌ No match for query: ${user.name}`);
            return false;
          }
        }

        console.log(`✅ User passed all filters: ${user.name}`);
        return true;
      });

      console.log('🎯 Filtered users:', filteredUsers.length, 'users found');
      console.log(
        '🎯 Filtered user names:',
        filteredUsers.map(u => u.name)
      );

      // Apply pagination
      const offset = filters.offset || 0;
      const limit = filters.limit || 20;
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);

      // Convert to search results (simplified to avoid Promise.all hanging)
      const results: FriendSearchResult[] = paginatedUsers.map(user => {
        return {
          user,
          mutualFriendsCount: 0, // Simplified for now
          mutualFriends: [], // Simplified for now
          relationshipStatus: 'none' as const, // Simplified for now
          canSendRequest: true, // Simplified for now
        };
      });

      const response = {
        success: true,
        results,
        totalCount: filteredUsers.length,
        hasMore: offset + limit < filteredUsers.length,
      };

      console.log('🎉 Search completed successfully:', response);
      console.log('🎉 About to return response from service');
      return response;
    } catch (error: any) {
      console.error('Error searching users:', error);
      return {
        success: false,
        results: [],
        totalCount: 0,
        hasMore: false,
        message: 'Search failed',
      };
    }
  }

  async getSuggestedFriends(userId: string, limit: number = 10): Promise<FriendSearchResult[]> {
    // Implementation for friend suggestions based on mutual friends, location, etc.
    // For now, return empty array
    return [];
  }

  async getMutualFriends(userId: string, targetUserId: string): Promise<User[]> {
    try {
      const userFriends = await this.getFriends(userId);
      const targetFriends = await this.getFriends(targetUserId);

      const userFriendIds = userFriends.map(f => (f.user1Id === userId ? f.user2Id : f.user1Id));
      const targetFriendIds = targetFriends.map(f =>
        f.user1Id === targetUserId ? f.user2Id : f.user1Id
      );

      const mutualFriendIds = userFriendIds.filter(id => targetFriendIds.includes(id));

      const mutualFriends: User[] = [];
      for (const friendId of mutualFriendIds) {
        const user = await this.getUserById(friendId);
        if (user) mutualFriends.push(user);
      }

      return mutualFriends;
    } catch (error: any) {
      console.error('Error getting mutual friends:', error);
      return [];
    }
  }

  // ========================================
  // Activity & Privacy
  // ========================================

  async getFriendActivity(userId: string, limit: number = 20): Promise<FriendActivity[]> {
    // Implementation for friend activity feed
    // For now, return empty array
    return [];
  }

  async updatePrivacySettings(
    userId: string,
    settings: Partial<FriendPrivacySettings>
  ): Promise<FriendPrivacySettings> {
    try {
      const currentSettings = await this.getPrivacySettings(userId);
      const updatedSettings: FriendPrivacySettings = {
        ...currentSettings,
        ...settings,
      };

      await AsyncStorage.setItem(
        `${this.STORAGE_KEYS.PRIVACY_SETTINGS}_${userId}`,
        JSON.stringify(updatedSettings)
      );

      return updatedSettings;
    } catch (error: any) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  async getPrivacySettings(userId: string): Promise<FriendPrivacySettings> {
    try {
      const stored = await AsyncStorage.getItem(`${this.STORAGE_KEYS.PRIVACY_SETTINGS}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return default settings
      const defaultSettings: FriendPrivacySettings = {
        allowFriendRequests: true,
        allowFriendRequestsFromFriendsOfFriends: true,
        showOnlineStatus: true,
        showLastSeen: true,
        showMutualFriends: true,
        showSharedLists: true,
        allowActivitySharing: true,
        blockedUserIds: [],
      };

      // Save default settings directly to avoid circular dependency
      await AsyncStorage.setItem(
        `${this.STORAGE_KEYS.PRIVACY_SETTINGS}_${userId}`,
        JSON.stringify(defaultSettings)
      );
      return defaultSettings;
    } catch (error: any) {
      console.error('Error getting privacy settings:', error);
      // Return safe defaults
      return {
        allowFriendRequests: true,
        allowFriendRequestsFromFriendsOfFriends: false,
        showOnlineStatus: false,
        showLastSeen: false,
        showMutualFriends: false,
        showSharedLists: false,
        allowActivitySharing: false,
        blockedUserIds: [],
      };
    }
  }

  // ========================================
  // Private Helper Methods
  // ========================================

  private async getCurrentUserId(): Promise<string | null> {
    try {
      // Get current user from secure storage (same as auth service)
      const user = await this.getStoredUser();
      console.log('🔍 getCurrentUserId - stored user:', user);
      const userId = user?.id || null;
      console.log('🔍 getCurrentUserId - returning userId:', userId);
      return userId;
    } catch (error) {
      console.log('🔍 getCurrentUserId - error:', error);
      return null;
    }
  }

  private async getStoredUser(): Promise<any | null> {
    try {
      // Use the same storage method as auth service
      const userStr = await AsyncStorage.getItem('@pentrypal_user');
      console.log('🔍 getStoredUser - raw userStr:', userStr);
      if (!userStr) {
        console.log('🔍 getStoredUser - no userStr found');
        return null;
      }

      // The auth service stores data as base64 encoded in development fallback
      try {
        // First try to decode from base64 (using base-64 library)
        const decodedStr = base64Decode(userStr);
        console.log('🔍 getStoredUser - decoded string:', decodedStr);
        const parsed = JSON.parse(decodedStr);
        console.log('🔍 getStoredUser - parsed user:', parsed);
        return parsed;
      } catch (base64Error) {
        console.log('🔍 getStoredUser - base64 decode failed, trying plain JSON:', base64Error);
        // Fallback to plain JSON parsing
        try {
          const parsed = JSON.parse(userStr);
          console.log('🔍 getStoredUser - parsed user (plain JSON):', parsed);
          return parsed;
        } catch (jsonError) {
          console.log('🔍 getStoredUser - JSON parse error:', jsonError);
          return null;
        }
      }
    } catch (storageError) {
      console.log('🔍 getStoredUser - storage error:', storageError);
      return null;
    }
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserById(userId: string): Promise<User | null> {
    try {
      const users = await this.getAllUsers();
      return users.find(user => user.id === userId) || null;
    } catch {
      return null;
    }
  }

  private async getAllUsers(): Promise<User[]> {
    try {
      // Single source of truth: Use the same storage key as auth service
      const AUTH_USERS_KEY = 'registered_users'; // Single source of truth

      const stored = await AsyncStorage.getItem(AUTH_USERS_KEY);
      let users: User[] = stored ? JSON.parse(stored) : [];

      console.log('👥 Users from single source:', users.length);
      console.log('🔍 Raw stored data:', stored);
      console.log(
        '🔍 Parsed users:',
        users.map(u => `${u.name} (${u.email}) mobile: ${u.mobile || 'none'}`)
      );

      // TEMPORARY: Clear storage to force fresh start with single source of truth
      if (users.length <= 3) {
        console.log('🔄 Clearing old storage and rebuilding with current user...');
        await AsyncStorage.removeItem(AUTH_USERS_KEY);
        users = [];
      }

      // Add mock users if no users exist (for demo purposes)
      if (users.length === 0) {
        console.log('🔄 Adding initial mock users...');

        // First, add the current logged-in user if they exist
        const currentUserStr = await AsyncStorage.getItem('@pentrypal_user');
        if (currentUserStr) {
          try {
            const currentUserData = JSON.parse(base64Decode(currentUserStr));
            console.log('🔄 Adding current user to database:', currentUserData.name);
            users.push({
              id: currentUserData.id,
              email: currentUserData.email,
              name: currentUserData.name,
              mobile: currentUserData.email.includes('@') ? undefined : currentUserData.email,
              avatar: '👤',
              status: 'active',
              preferences: currentUserData.preferences,
              createdAt: currentUserData.createdAt,
              updatedAt: currentUserData.updatedAt,
            });
          } catch (error) {
            console.error('❌ Failed to add current user:', error);
          }
        }
        const mockUsers: User[] = [
          {
            id: 'user1',
            email: 'john@example.com',
            name: 'John Doe',
            avatar: '👤',
            status: 'active',
            mobile: '03016933184',
            preferences: {
              theme: 'light',
              language: 'en',
              currency: 'USD',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user2',
            email: 'sarah@example.com',
            name: 'Sarah Johnson',
            avatar: '👩',
            status: 'active',
            mobile: '03451234567',
            preferences: {
              theme: 'light',
              language: 'en',
              currency: 'USD',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user3',
            email: 'mike@example.com',
            name: 'Mike Chen',
            avatar: '👨',
            status: 'active',
            mobile: '03009876543',
            preferences: {
              theme: 'dark',
              language: 'en',
              currency: 'USD',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user4',
            email: 'emma@example.com',
            name: 'Emma Davis',
            avatar: '👩‍💼',
            status: 'active',
            mobile: '03211234567',
            preferences: {
              theme: 'light',
              language: 'en',
              currency: 'USD',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user5',
            email: 'alex@example.com',
            name: 'Alex Wilson',
            avatar: '🧑‍💻',
            status: 'active',
            mobile: '03331234567',
            preferences: {
              theme: 'dark',
              language: 'en',
              currency: 'EUR',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user6',
            email: 'lisa@example.com',
            name: 'Lisa Thompson',
            avatar: '👩‍🎨',
            status: 'active',
            mobile: '03441234567',
            preferences: {
              theme: 'light',
              language: 'en',
              currency: 'USD',
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];

        // Save mock users to single source
        users = mockUsers;
        await AsyncStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
      }

      console.log(
        '📋 All users:',
        users.map(u => `${u.name} (${u.email}) mobile: ${u.mobile || 'none'}`)
      );
      return users;
    } catch (error) {
      console.error('❌ Error getting users:', error);
      return [];
    }
  }

  private async getAllFriendRequests(): Promise<FriendRequest[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.FRIEND_REQUESTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveFriendRequest(request: FriendRequest): Promise<void> {
    const requests = await this.getAllFriendRequests();
    requests.push(request);
    await AsyncStorage.setItem(this.STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
  }

  private async updateFriendRequest(updatedRequest: FriendRequest): Promise<void> {
    const requests = await this.getAllFriendRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
      requests[index] = updatedRequest;
      await AsyncStorage.setItem(this.STORAGE_KEYS.FRIEND_REQUESTS, JSON.stringify(requests));
    }
  }

  private async getFriendRequestById(requestId: string): Promise<FriendRequest | null> {
    const requests = await this.getAllFriendRequests();
    return requests.find(req => req.id === requestId) || null;
  }

  private async getExistingFriendRequest(
    fromUserId: string,
    toUserId: string
  ): Promise<FriendRequest | null> {
    const requests = await this.getAllFriendRequests();
    return (
      requests.find(
        req =>
          req.fromUserId === fromUserId && req.toUserId === toUserId && req.status === 'pending'
      ) || null
    );
  }

  private async getAllFriendships(): Promise<Friendship[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.FRIENDS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async saveFriendship(friendship: Friendship): Promise<void> {
    const friendships = await this.getAllFriendships();
    friendships.push(friendship);
    await AsyncStorage.setItem(this.STORAGE_KEYS.FRIENDS, JSON.stringify(friendships));
  }

  private async getFriendshipById(friendshipId: string): Promise<Friendship | null> {
    const friendships = await this.getAllFriendships();
    return friendships.find(f => f.id === friendshipId) || null;
  }

  private async getFriendshipBetweenUsers(
    userId1: string,
    userId2: string
  ): Promise<Friendship | null> {
    const friendships = await this.getAllFriendships();
    return (
      friendships.find(
        f =>
          (f.user1Id === userId1 && f.user2Id === userId2) ||
          (f.user1Id === userId2 && f.user2Id === userId1)
      ) || null
    );
  }

  private async deleteFriendship(friendshipId: string): Promise<void> {
    const friendships = await this.getAllFriendships();
    const filtered = friendships.filter(f => f.id !== friendshipId);
    await AsyncStorage.setItem(this.STORAGE_KEYS.FRIENDS, JSON.stringify(filtered));
  }

  private async getRelationshipStatus(
    userId: string,
    targetUserId: string
  ): Promise<'none' | 'friend' | 'request_sent' | 'request_received' | 'blocked'> {
    // Check if blocked
    const privacySettings = await this.getPrivacySettings(userId);
    if (privacySettings.blockedUserIds.includes(targetUserId)) {
      return 'blocked';
    }

    // Check if friends
    const friendship = await this.getFriendshipBetweenUsers(userId, targetUserId);
    if (friendship && friendship.status === 'active') {
      return 'friend';
    }

    // Check for pending requests
    const requests = await this.getAllFriendRequests();
    const sentRequest = requests.find(
      req => req.fromUserId === userId && req.toUserId === targetUserId && req.status === 'pending'
    );
    if (sentRequest) return 'request_sent';

    const receivedRequest = requests.find(
      req => req.fromUserId === targetUserId && req.toUserId === userId && req.status === 'pending'
    );
    if (receivedRequest) return 'request_received';

    return 'none';
  }
}

// ========================================
// Export Service Instance
// ========================================

export const socialService = new SocialServiceImpl();
export default socialService;
