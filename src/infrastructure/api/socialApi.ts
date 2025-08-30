// ========================================
// Social API Service
// ========================================

import { apiClient } from './apiClient';
import type {
  ApiResponse,
  BackendFriendRequest,
  BackendFriendRequestCreate,
  BackendFriendRequestUpdate,
  BackendFriendship,
  BackendRelationshipStatus,
  BackendUser,
  BackendUserSearch,
} from '../../shared/types/backend';

// ========================================
// Social API Class
// ========================================

export class SocialApi {
  // ========================================
  // Friends Management Methods
  // ========================================

  /**
   * Get user's friends list
   */
  async getFriends(params?: {
    status?: 'active' | 'blocked';
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<BackendFriendship[]>> {
    return apiClient.get<BackendFriendship[]>('/social/friends', params);
  }

  /**
   * Get friend details
   */
  async getFriend(friendshipId: string): Promise<ApiResponse<BackendFriendship>> {
    return apiClient.get<BackendFriendship>(`/social/friends/${friendshipId}`);
  }

  /**
   * Remove a friend
   */
  async removeFriend(friendshipId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/social/friends/${friendshipId}`);
  }

  /**
   * Block a user
   */
  async blockUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/social/users/${userId}/block`);
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/social/users/${userId}/block`);
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<ApiResponse<BackendUser[]>> {
    return apiClient.get<BackendUser[]>('/social/blocked-users');
  }

  // ========================================
  // Friend Requests Methods
  // ========================================

  /**
   * Get received friend requests
   */
  async getReceivedFriendRequests(params?: {
    status?: 'pending' | 'accepted' | 'declined';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<BackendFriendRequest[]>> {
    return apiClient.get<BackendFriendRequest[]>('/social/friend-requests/received', params);
  }

  /**
   * Get sent friend requests
   */
  async getSentFriendRequests(params?: {
    status?: 'pending' | 'accepted' | 'declined' | 'cancelled';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<BackendFriendRequest[]>> {
    return apiClient.get<BackendFriendRequest[]>('/social/friend-requests/sent', params);
  }

  /**
   * Get all friend requests (sent and received)
   */
  async getAllFriendRequests(): Promise<
    ApiResponse<{
      received: BackendFriendRequest[];
      sent: BackendFriendRequest[];
    }>
  > {
    try {
      // Call both endpoints separately since backend doesn't have a combined endpoint
      const [receivedResponse, sentResponse] = await Promise.all([
        this.getReceivedFriendRequests(),
        this.getSentFriendRequests(),
      ]);

      // Check if both requests were successful
      if (!receivedResponse.data || !sentResponse.data) {
        return {
          data: undefined,
          detail: 'Failed to load friend requests',
          error_code: 'FRIEND_REQUESTS_FAILED',
          timestamp: new Date().toISOString(),
        } as any;
      }

      // Combine the results
      return {
        data: {
          received: receivedResponse.data,
          sent: sentResponse.data,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        data: undefined,
        detail: error.message || 'Failed to load friend requests',
        error_code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
      } as any;
    }
  }

  /**
   * Send a friend request
   */
  async sendFriendRequest(
    data: BackendFriendRequestCreate
  ): Promise<ApiResponse<BackendFriendRequest>> {
    return apiClient.post<BackendFriendRequest>('/social/friend-requests', data);
  }

  /**
   * Respond to a friend request (accept/decline)
   */
  async respondToFriendRequest(
    requestId: string,
    data: BackendFriendRequestUpdate
  ): Promise<ApiResponse<BackendFriendRequest>> {
    return apiClient.put<BackendFriendRequest>(`/social/friend-requests/${requestId}`, data);
  }

  /**
   * Cancel a sent friend request
   */
  async cancelFriendRequest(requestId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/social/friend-requests/${requestId}`);
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(requestId: string): Promise<ApiResponse<BackendFriendRequest>> {
    return this.respondToFriendRequest(requestId, { status: 'accepted' });
  }

  /**
   * Decline a friend request
   */
  async declineFriendRequest(requestId: string): Promise<ApiResponse<BackendFriendRequest>> {
    return this.respondToFriendRequest(requestId, { status: 'rejected' });
  }

  // ========================================
  // User Search and Discovery Methods
  // ========================================

  /**
   * Search for users
   */
  async searchUsers(params: BackendUserSearch): Promise<ApiResponse<BackendUser[]>> {
    // Map 'query' parameter to 'q' as expected by backend
    const backendParams = {
      q: params.query,
      limit: params.limit,
      skip: params.skip,
    };

    return apiClient.get<BackendUser[]>('/social/users/search', backendParams);
  }

  /**
   * Get user suggestions (people you may know)
   */
  async getUserSuggestions(limit: number = 10): Promise<ApiResponse<BackendUser[]>> {
    return apiClient.get<BackendUser[]>('/social/users/suggestions', { limit });
  }

  /**
   * Get mutual friends with a user
   */
  async getMutualFriends(userId: string): Promise<ApiResponse<BackendUser[]>> {
    return apiClient.get<BackendUser[]>(`/social/users/${userId}/mutual-friends`);
  }

  /**
   * Get relationship status with a user
   */
  async getRelationshipStatus(userId: string): Promise<ApiResponse<BackendRelationshipStatus>> {
    return apiClient.get<BackendRelationshipStatus>(`/social/users/${userId}/relationship-status`);
  }

  /**
   * Get user profile (public information)
   */
  async getUserProfile(userId: string): Promise<ApiResponse<BackendUser>> {
    return apiClient.get<BackendUser>(`/social/users/${userId}/profile`);
  }

  // ========================================
  // Activity and Feed Methods
  // ========================================

  /**
   * Get social activity feed
   */
  async getActivityFeed(params?: {
    type?: 'all' | 'friends' | 'lists' | 'achievements';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/social/activity-feed', params);
  }

  /**
   * Get friend's recent activity
   */
  async getFriendActivity(
    friendId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/social/friends/${friendId}/activity`, params);
  }

  /**
   * Get shared lists with a friend
   */
  async getSharedLists(friendId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/social/friends/${friendId}/shared-lists`);
  }

  /**
   * Get collaboration history with a friend
   */
  async getCollaborationHistory(
    friendId: string,
    params?: {
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(`/social/friends/${friendId}/collaboration-history`, params);
  }

  // ========================================
  // Privacy and Settings Methods
  // ========================================

  /**
   * Get social privacy settings
   */
  async getPrivacySettings(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/social/privacy-settings');
  }

  /**
   * Update social privacy settings
   */
  async updatePrivacySettings(settings: {
    profile_visibility?: 'public' | 'friends' | 'private';
    show_online_status?: boolean;
    allow_friend_requests?: boolean;
    allow_friend_requests_from_friends_of_friends?: boolean;
    show_mutual_friends?: boolean;
    show_shared_lists?: boolean;
    allow_activity_sharing?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/social/privacy-settings', settings);
  }

  /**
   * Get notification preferences for social features
   */
  async getSocialNotificationSettings(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/social/notification-settings');
  }

  /**
   * Update social notification preferences
   */
  async updateSocialNotificationSettings(settings: {
    friend_requests?: boolean;
    friend_activity?: boolean;
    list_invitations?: boolean;
    list_updates?: boolean;
    mentions?: boolean;
    achievements?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/social/notification-settings', settings);
  }

  // ========================================
  // Statistics and Analytics Methods
  // ========================================

  /**
   * Get social statistics
   */
  async getSocialStats(): Promise<
    ApiResponse<{
      friends_count: number;
      shared_lists_count: number;
      collaboration_count: number;
      activity_score: number;
    }>
  > {
    return apiClient.get<{
      friends_count: number;
      shared_lists_count: number;
      collaboration_count: number;
      activity_score: number;
    }>('/social/stats');
  }

  /**
   * Get friendship statistics
   */
  async getFriendshipStats(friendId: string): Promise<
    ApiResponse<{
      shared_lists: number;
      collaboration_days: number;
      total_items_shared: number;
      friendship_duration: number;
    }>
  > {
    return apiClient.get<{
      shared_lists: number;
      collaboration_days: number;
      total_items_shared: number;
      friendship_duration: number;
    }>(`/social/friends/${friendId}/stats`);
  }

  // ========================================
  // Leaderboards and Achievements Methods
  // ========================================

  /**
   * Get social leaderboards
   */
  async getLeaderboards(
    type: 'most_collaborative' | 'most_active' | 'best_saver' = 'most_collaborative',
    period: 'week' | 'month' | 'all_time' = 'month'
  ): Promise<
    ApiResponse<
      Array<{
        user: BackendUser;
        score: number;
        rank: number;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        user: BackendUser;
        score: number;
        rank: number;
      }>
    >('/social/leaderboards', { type, period });
  }

  /**
   * Get user achievements
   */
  async getAchievements(userId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = userId ? `/social/users/${userId}/achievements` : '/social/achievements';
    return apiClient.get<any[]>(endpoint);
  }

  /**
   * Get available achievement categories
   */
  async getAchievementCategories(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/social/achievements/categories');
  }

  // ========================================
  // Invitations and Referrals Methods
  // ========================================

  /**
   * Invite friends via email
   */
  async inviteFriendsByEmail(
    emails: string[],
    message?: string
  ): Promise<
    ApiResponse<{
      sent: number;
      failed: string[];
    }>
  > {
    return apiClient.post<{
      sent: number;
      failed: string[];
    }>('/social/invite/email', {
      emails,
      message,
    });
  }

  /**
   * Generate referral link
   */
  async generateReferralLink(): Promise<
    ApiResponse<{ referral_link: string; referral_code: string }>
  > {
    return apiClient.post<{ referral_link: string; referral_code: string }>(
      '/social/referral/generate'
    );
  }

  /**
   * Get referral statistics
   */
  async getReferralStats(): Promise<
    ApiResponse<{
      total_referrals: number;
      successful_referrals: number;
      pending_referrals: number;
      referral_bonus: number;
    }>
  > {
    return apiClient.get<{
      total_referrals: number;
      successful_referrals: number;
      pending_referrals: number;
      referral_bonus: number;
    }>('/social/referral/stats');
  }

  // ========================================
  // Groups and Communities Methods (Future)
  // ========================================

  /**
   * Get user's groups
   */
  async getGroups(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/social/groups');
  }

  /**
   * Create a new group
   */
  async createGroup(data: {
    name: string;
    description?: string;
    is_private?: boolean;
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/social/groups', data);
  }

  /**
   * Join a group
   */
  async joinGroup(groupId: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`/social/groups/${groupId}/join`);
  }

  /**
   * Leave a group
   */
  async leaveGroup(groupId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/social/groups/${groupId}/leave`);
  }
}

// ========================================
// Default Export
// ========================================

export const socialApi = new SocialApi();
