// ========================================
// Social Types - Friend Management System
// ========================================

import type { BaseEntity, User } from './index';

// ========================================
// Friend Request Types
// ========================================

export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface FriendRequest extends BaseEntity {
  readonly fromUserId: string;
  readonly toUserId: string;
  readonly fromUser: User;
  readonly toUser: User;
  readonly status: FriendRequestStatus;
  readonly message?: string;
  readonly respondedAt?: string; // ISO string for Redux serialization
  readonly expiresAt: string; // ISO string for Redux serialization
}

// ========================================
// Friendship Types
// ========================================

export type FriendshipStatus = 'active' | 'blocked' | 'muted';

export interface Friendship extends BaseEntity {
  readonly user1Id: string;
  readonly user2Id: string;
  readonly user1: User;
  readonly user2: User;
  readonly status: FriendshipStatus;
  readonly initiatedBy: string; // userId who sent the original request
  readonly sharedListsCount: number;
  readonly lastInteractionAt?: string; // ISO string for Redux serialization
  readonly mutedUntil?: string; // ISO string for Redux serialization
}

// ========================================
// Friend Search & Discovery
// ========================================

export interface FriendSearchResult {
  readonly user: User;
  readonly mutualFriendsCount: number;
  readonly mutualFriends: User[];
  readonly relationshipStatus: 'none' | 'friend' | 'request_sent' | 'request_received' | 'blocked';
  readonly canSendRequest: boolean;
  readonly lastSeen?: string; // ISO string for Redux serialization
}

export interface FriendSearchFilters {
  readonly query?: string;
  readonly location?: string;
  readonly mutualFriendsOnly?: boolean;
  readonly excludeBlocked?: boolean;
  readonly limit?: number;
  readonly offset?: number;
}

// ========================================
// Friend Activity & Interactions
// ========================================

export type FriendActivityType =
  | 'list_shared'
  | 'item_added'
  | 'item_completed'
  | 'list_completed'
  | 'joined_app'
  | 'profile_updated';

export interface FriendActivity extends BaseEntity {
  readonly userId: string;
  readonly user: User;
  readonly type: FriendActivityType;
  readonly title: string;
  readonly description: string;
  readonly metadata?: Record<string, any>;
  readonly relatedEntityId?: string; // listId, itemId, etc.
  readonly isPublic: boolean;
}

// ========================================
// Privacy & Settings
// ========================================

export interface FriendPrivacySettings {
  readonly allowFriendRequests: boolean;
  readonly allowFriendRequestsFromFriendsOfFriends: boolean;
  readonly showOnlineStatus: boolean;
  readonly showLastSeen: boolean;
  readonly showMutualFriends: boolean;
  readonly showSharedLists: boolean;
  readonly allowActivitySharing: boolean;
  readonly blockedUserIds: string[];
}

// ========================================
// API Request/Response Types
// ========================================

export interface SendFriendRequestRequest {
  readonly toUserId: string;
  readonly message?: string;
}

export interface SendFriendRequestResponse {
  readonly success: boolean;
  readonly friendRequest?: FriendRequest;
  readonly message: string;
  readonly errorCode?: string;
}

export interface RespondToFriendRequestRequest {
  readonly requestId: string;
  readonly action: 'accept' | 'reject';
  readonly message?: string;
}

export interface RespondToFriendRequestResponse {
  readonly success: boolean;
  readonly friendship?: Friendship;
  readonly message: string;
  readonly errorCode?: string;
}

export interface SearchFriendsRequest {
  readonly filters: FriendSearchFilters;
}

export interface SearchFriendsResponse {
  readonly success: boolean;
  readonly results: FriendSearchResult[];
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly message?: string;
}

// ========================================
// Redux State Types
// ========================================

export interface SocialState {
  // Friends data
  readonly friends: Friendship[];
  readonly friendRequests: {
    readonly sent: FriendRequest[];
    readonly received: FriendRequest[];
  };
  readonly searchResults: FriendSearchResult[];
  readonly recentActivity: FriendActivity[];

  // Loading states
  readonly isLoadingFriends: boolean;
  readonly isLoadingRequests: boolean;
  readonly isSearching: boolean;
  readonly isSendingRequest: boolean;
  readonly isRespondingToRequest: boolean;

  // UI states
  readonly selectedFriend: Friendship | null;
  readonly searchQuery: string;
  readonly searchFilters: FriendSearchFilters;
  readonly showAddFriendModal: boolean;
  readonly showFriendRequestsModal: boolean;

  // Privacy settings
  readonly privacySettings: FriendPrivacySettings;

  // Errors
  readonly error: string | null;
  readonly lastError: SocialError | null;
}

export interface SocialError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
  readonly context?: Record<string, any>;
}

// ========================================
// Component Props Types
// ========================================

export interface AddFriendModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSendRequest: (request: SendFriendRequestRequest) => Promise<void>;
  readonly isLoading?: boolean;
  readonly error?: string | null;
}

export interface FriendRequestsModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly requests: FriendRequest[];
  readonly onRespond: (request: RespondToFriendRequestRequest) => Promise<void>;
  readonly isLoading?: boolean;
}

export interface FriendListItemProps {
  readonly friendship: Friendship;
  readonly currentUserId: string;
  readonly onPress?: (friendship: Friendship) => void;
  readonly onBlock?: (userId: string) => void;
  readonly onUnfriend?: (friendshipId: string) => void;
  readonly showActions?: boolean;
}

export interface FriendSearchItemProps {
  readonly result: FriendSearchResult;
  readonly onSendRequest: (userId: string, message?: string) => void;
  readonly onCancelRequest?: (userId: string) => void;
  readonly isLoading?: boolean;
}
