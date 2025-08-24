// ========================================
// Social Slice - Friend Management State
// ========================================

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  SocialState,
  SocialError,
  Friendship,
  FriendRequest,
  FriendSearchResult,
  FriendActivity,
  FriendPrivacySettings,
  SendFriendRequestRequest,
  RespondToFriendRequestRequest,
  SearchFriendsRequest,
} from '../../../shared/types/social';
// Note: RootState import removed to avoid circular dependency

// ========================================
// Initial State
// ========================================

const initialState: SocialState = {
  // Friends data
  friends: [],
  friendRequests: {
    sent: [],
    received: [],
  },
  searchResults: [],
  recentActivity: [],

  // Loading states
  isLoadingFriends: false,
  isLoadingRequests: false,
  isSearching: false,
  isSendingRequest: false,
  isRespondingToRequest: false,

  // UI states
  selectedFriend: null,
  searchQuery: '',
  searchFilters: {},
  showAddFriendModal: false,
  showFriendRequestsModal: false,

  // Privacy settings
  privacySettings: {
    allowFriendRequests: true,
    allowFriendRequestsFromFriendsOfFriends: true,
    showOnlineStatus: true,
    showLastSeen: true,
    showMutualFriends: true,
    showSharedLists: true,
    allowActivitySharing: true,
    blockedUserIds: [],
  },

  // Errors
  error: null,
  lastError: null,
};

// ========================================
// Async Thunks
// ========================================

/**
 * Load friends from API
 */
export const loadFriends = createAsyncThunk(
  'social/loadFriends',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🎯 Redux loadFriends started');

      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      const response = await socialApi.getFriends();
      console.log('🎯 Redux loadFriends received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'LOAD_FRIENDS_FAILED',
          message: response.detail || 'Failed to load friends',
          timestamp: new Date().toISOString(),
        });
      }

      // Convert backend friendships to frontend format
      const friendships: Friendship[] = response.data.map(backendFriendship => {
        console.log('🔍 Converting backend friendship:', backendFriendship);

        // Extract user data from backend response (now includes user objects)
        const user1 = backendFriendship.user1 || {};
        const user2 = backendFriendship.user2 || {};

        return {
          id: backendFriendship.id,
          user1Id: backendFriendship.user1_id,
          user2Id: backendFriendship.user2_id,
          user1: {
            id: backendFriendship.user1_id,
            name: user1.name || 'Unknown Friend',
            email: user1.email || '',
            phone: user1.phone || '',
            avatar: user1.avatar_url,
            createdAt: user1.created_at || '',
            updatedAt: user1.updated_at || '',
          } as any,
          user2: {
            id: backendFriendship.user2_id,
            name: user2.name || 'Unknown Friend',
            email: user2.email || '',
            phone: user2.phone || '',
            avatar: user2.avatar_url,
            createdAt: user2.created_at || '',
            updatedAt: user2.updated_at || '',
          } as any,
          status: backendFriendship.status as any,
          initiatedBy: backendFriendship.initiated_by,
          sharedListsCount: 0, // Will be calculated
          createdAt: backendFriendship.created_at, // Keep as ISO string
          updatedAt: backendFriendship.updated_at, // Keep as ISO string
          lastInteractionAt: undefined,
          mutedUntil: undefined,
        };
      });

      return friendships;
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to load friends',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Load friend requests from API
 */
export const loadFriendRequests = createAsyncThunk(
  'social/loadFriendRequests',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🎯 Redux loadFriendRequests started');

      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      const response = await socialApi.getAllFriendRequests();
      console.log('🎯 Redux loadFriendRequests received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'LOAD_REQUESTS_FAILED',
          message: response.detail || 'Failed to load friend requests',
          timestamp: new Date().toISOString(),
        });
      }

      // Convert backend requests to frontend format
      const convertRequest = (backendRequest: any): FriendRequest => {
        console.log('🔍 Converting backend request:', backendRequest);

        // Extract user data from backend response (now includes user objects)
        const fromUser = backendRequest.from_user || {};
        const toUser = backendRequest.to_user || {};

        return {
          id: backendRequest.id,
          fromUserId: backendRequest.from_user_id,
          toUserId: backendRequest.to_user_id,
          fromUser: {
            id: backendRequest.from_user_id,
            name: fromUser.name || 'Unknown User',
            email: fromUser.email || '',
            phone: fromUser.phone || '',
            avatar: fromUser.avatar_url,
            createdAt: fromUser.created_at || '',
            updatedAt: fromUser.updated_at || '',
          } as any,
          toUser: {
            id: backendRequest.to_user_id,
            name: toUser.name || 'You',
            email: toUser.email || '',
            phone: toUser.phone || '',
            avatar: toUser.avatar_url,
            createdAt: toUser.created_at || '',
            updatedAt: toUser.updated_at || '',
          } as any,
          status: backendRequest.status as any,
          message: backendRequest.message,
          createdAt: backendRequest.created_at, // Keep as ISO string
          updatedAt: backendRequest.updated_at, // Keep as ISO string
          respondedAt: undefined,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Convert to ISO string
        };
      };

      return {
        received: response.data.received.map(convertRequest),
        sent: response.data.sent.map(convertRequest),
      };
    } catch (error: any) {
      console.error('🎯 Redux loadFriendRequests error:', error);

      // Check if it's an authentication error
      if (
        error.message?.includes('Not authenticated') ||
        error.message?.includes('Invalid access token')
      ) {
        console.warn('🚨 Authentication error detected - tokens may be corrupted');

        // Force clear authentication data
        try {
          const { forceResetAuthentication } = await import('../../../infrastructure/api');
          await forceResetAuthentication();
        } catch (resetError) {
          console.error('Failed to reset authentication:', resetError);
        }
      }

      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to load friend requests',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Search users
 */
export const searchUsers = createAsyncThunk(
  'social/searchUsers',
  async (request: SearchFriendsRequest, { rejectWithValue }) => {
    try {
      console.log('🎯 Redux searchUsers started with request:', request);

      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      const response = await socialApi.searchUsers({
        query: request.filters.query || '',
        limit: request.filters.limit,
      });

      console.log('🎯 Redux searchUsers received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'SEARCH_FAILED',
          message: response.detail || 'Failed to search users',
          timestamp: new Date().toISOString(),
        });
      }

      // Convert backend users to frontend search results
      const searchResults: FriendSearchResult[] = response.data.map(backendUser => ({
        user: {
          id: backendUser.id,
          email: backendUser.email || '',
          name: backendUser.name,
          avatar: backendUser.avatar_url,
          createdAt: backendUser.created_at,
          updatedAt: backendUser.updated_at,
        } as any,
        mutualFriendsCount: 0, // Will be calculated
        mutualFriends: [],
        relationshipStatus: 'none' as any, // Will be determined by other calls
        canSendRequest: true,
        lastSeen: undefined,
      }));

      return {
        success: true,
        results: searchResults,
        totalCount: searchResults.length,
        hasMore: false,
      };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to search users',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Send friend request
 */
export const sendFriendRequest = createAsyncThunk(
  'social/sendFriendRequest',
  async (request: SendFriendRequestRequest, { rejectWithValue }) => {
    try {
      console.log('🎯 Redux sendFriendRequest started with request:', request);

      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      const response = await socialApi.sendFriendRequest({
        to_user_id: request.toUserId,
        message: request.message,
      });

      console.log('🎯 Redux sendFriendRequest received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'SEND_REQUEST_FAILED',
          message: response.detail || 'Failed to send friend request',
          timestamp: new Date().toISOString(),
        });
      }

      // Convert backend response to frontend format
      const backendRequest = response.data;
      const frontendRequest: FriendRequest = {
        id: backendRequest.id,
        fromUserId: backendRequest.from_user_id,
        toUserId: backendRequest.to_user_id,
        fromUser: { id: backendRequest.from_user_id, name: 'You', email: '' } as any, // Will be populated by other calls
        toUser: { id: backendRequest.to_user_id, name: 'Friend', email: '' } as any,
        status: backendRequest.status as any,
        message: backendRequest.message,
        createdAt: backendRequest.created_at, // Keep as ISO string
        updatedAt: backendRequest.updated_at, // Keep as ISO string
        respondedAt: undefined,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Convert to ISO string
      };

      return {
        success: true,
        friendRequest: frontendRequest,
        message: 'Friend request sent successfully',
      };
    } catch (error: any) {
      console.error('🎯 Redux sendFriendRequest error:', error);

      // Check if it's an authentication error
      if (
        error.message?.includes('Not authenticated') ||
        error.message?.includes('Invalid access token')
      ) {
        console.warn('🚨 Authentication error detected - tokens may be corrupted');

        // Force clear authentication data
        try {
          const { forceResetAuthentication } = await import('../../../infrastructure/api');
          await forceResetAuthentication();
        } catch (resetError) {
          console.error('Failed to reset authentication:', resetError);
        }
      }

      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to send friend request',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Respond to friend request
 */
export const respondToFriendRequest = createAsyncThunk(
  'social/respondToFriendRequest',
  async (request: RespondToFriendRequestRequest, { rejectWithValue }) => {
    try {
      console.log('🔍 Redux respondToFriendRequest called with:', request);
      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      // Map frontend action to backend status
      const backendStatus = request.action === 'accept' ? 'accepted' : 'rejected';

      const response = await socialApi.respondToFriendRequest(request.requestId, {
        status: backendStatus,
      });
      console.log('🔍 Redux respondToFriendRequest response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'RESPOND_REQUEST_FAILED',
          message: response.detail || 'Failed to respond to friend request',
          timestamp: new Date().toISOString(),
        });
      }

      return {
        success: true,
        message: 'Friend request response successful',
      };
    } catch (error: any) {
      console.error('🔍 Redux respondToFriendRequest error:', error);

      // Check if it's an authentication error
      if (
        error.message?.includes('Not authenticated') ||
        error.message?.includes('Invalid access token')
      ) {
        console.warn('🚨 Authentication error detected - tokens may be corrupted');

        // Force clear authentication data
        try {
          const { forceResetAuthentication } = await import('../../../infrastructure/api');
          await forceResetAuthentication();
        } catch (resetError) {
          console.error('Failed to reset authentication:', resetError);
        }
      }

      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to respond to friend request',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Cancel friend request
 */
export const cancelFriendRequest = createAsyncThunk(
  'social/cancelFriendRequest',
  async (requestId: string, { rejectWithValue }) => {
    try {
      // Import social API
      const { socialApi } = await import('../../../infrastructure/api');

      const response = await socialApi.cancelFriendRequest(requestId);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'CANCEL_REQUEST_FAILED',
          message: response.detail || 'Failed to cancel friend request',
          timestamp: new Date().toISOString(),
        });
      }

      return { requestId, message: 'Friend request cancelled successfully' };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to cancel friend request',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// Old duplicate thunks removed - using new API-based thunks above

// Additional thunks (unfriend, block, privacy) can be implemented later using the new API pattern

// ========================================
// Social Slice
// ========================================

const socialSlice = createSlice({
  name: 'social',
  initialState,
  reducers: {
    // Clear errors
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    // UI state management
    setShowAddFriendModal: (state, action: PayloadAction<boolean>) => {
      state.showAddFriendModal = action.payload;
    },

    setShowFriendRequestsModal: (state, action: PayloadAction<boolean>) => {
      state.showFriendRequestsModal = action.payload;
    },

    setSelectedFriend: (state, action: PayloadAction<Friendship | null>) => {
      state.selectedFriend = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSearchFilters: (state, action: PayloadAction<any>) => {
      state.searchFilters = action.payload;
    },

    // Clear search results
    clearSearchResults: state => {
      state.searchResults = [];
      state.searchQuery = '';
      state.isSearching = false;
    },

    // Reset sending request state
    resetSendingState: state => {
      state.isSendingRequest = false;
      state.isRespondingToRequest = false;
    },

    // Add friend request to received list (for real-time updates)
    addReceivedFriendRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.friendRequests.received.unshift(action.payload);
    },

    // Remove friend request from lists
    removeFriendRequest: (state, action: PayloadAction<string>) => {
      const requestId = action.payload;
      state.friendRequests.sent = state.friendRequests.sent.filter(req => req.id !== requestId);
      state.friendRequests.received = state.friendRequests.received.filter(
        req => req.id !== requestId
      );
    },

    // Add new friendship (for real-time updates)
    addFriendship: (state, action: PayloadAction<Friendship>) => {
      state.friends.push(action.payload);
    },

    // Remove friendship
    removeFriendship: (state, action: PayloadAction<string>) => {
      const friendshipId = action.payload;
      state.friends = state.friends.filter(f => f.id !== friendshipId);
    },

    // Update friendship
    updateFriendship: (state, action: PayloadAction<Friendship>) => {
      const index = state.friends.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.friends[index] = action.payload;
      }
    },
  },
  extraReducers: builder => {
    // Load Friends
    builder
      .addCase(loadFriends.pending, state => {
        state.isLoadingFriends = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(loadFriends.fulfilled, (state, action) => {
        state.isLoadingFriends = false;
        state.friends = action.payload;
      })
      .addCase(loadFriends.rejected, (state, action) => {
        state.isLoadingFriends = false;
        state.error = action.payload?.message || 'Failed to load friends';
        state.lastError = action.payload as SocialError;
      });

    // Load Friend Requests
    builder
      .addCase(loadFriendRequests.pending, state => {
        state.isLoadingRequests = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(loadFriendRequests.fulfilled, (state, action) => {
        state.isLoadingRequests = false;
        state.friendRequests = action.payload;
      })
      .addCase(loadFriendRequests.rejected, (state, action) => {
        state.isLoadingRequests = false;
        state.error = action.payload?.message || 'Failed to load friend requests';
        state.lastError = action.payload as SocialError;
      });

    // Search Users
    builder
      .addCase(searchUsers.pending, state => {
        state.isSearching = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults = action.payload.results;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload?.message || 'Failed to search users';
        state.lastError = action.payload as SocialError;
      });

    // Send Friend Request
    builder
      .addCase(sendFriendRequest.pending, state => {
        state.isSendingRequest = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(sendFriendRequest.fulfilled, (state, action) => {
        state.isSendingRequest = false;
        if (action.payload.friendRequest) {
          state.friendRequests.sent.push(action.payload.friendRequest);
        }
      })
      .addCase(sendFriendRequest.rejected, (state, action) => {
        state.isSendingRequest = false;
        state.error = action.payload?.message || 'Failed to send friend request';
        state.lastError = action.payload as SocialError;
      });

    // Respond to Friend Request
    builder
      .addCase(respondToFriendRequest.pending, state => {
        state.isRespondingToRequest = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(respondToFriendRequest.fulfilled, (state, action) => {
        state.isRespondingToRequest = false;

        // Remove the request from received list
        const requestId = action.meta.arg.requestId;
        state.friendRequests.received = state.friendRequests.received.filter(
          req => req.id !== requestId
        );

        // If accepted, add to friends list
        if (action.payload.friendship) {
          state.friends.push(action.payload.friendship);
        }
      })
      .addCase(respondToFriendRequest.rejected, (state, action) => {
        state.isRespondingToRequest = false;
        state.error = action.payload?.message || 'Failed to respond to friend request';
        state.lastError = action.payload as SocialError;
      });

    // Cancel Friend Request
    builder.addCase(cancelFriendRequest.fulfilled, (state, action) => {
      const requestId = action.payload.requestId;
      state.friendRequests.sent = state.friendRequests.sent.filter(req => req.id !== requestId);
    });

    // Additional thunk handlers (unfriend, block, privacy) can be added later
  },
});

// ========================================
// Actions
// ========================================

export const {
  clearError,
  setShowAddFriendModal,
  setShowFriendRequestsModal,
  setSelectedFriend,
  setSearchQuery,
  setSearchFilters,
  clearSearchResults,
  resetSendingState,
  addReceivedFriendRequest,
  removeFriendRequest,
  addFriendship,
  removeFriendship,
  updateFriendship,
} = socialSlice.actions;

// ========================================
// Selectors
// ========================================

export const selectSocialState = (state: { social: SocialState }) => state.social;
export const selectFriends = (state: { social: SocialState }) => state.social.friends;
export const selectFriendRequests = (state: { social: SocialState }) => state.social.friendRequests;
export const selectSearchResults = (state: { social: SocialState }) => state.social.searchResults;
export const selectIsLoadingFriends = (state: { social: SocialState }) =>
  state.social.isLoadingFriends;
export const selectIsSearching = (state: { social: SocialState }) => state.social.isSearching;
export const selectIsSendingRequest = (state: { social: SocialState }) =>
  state.social.isSendingRequest;
export const selectSocialError = (state: { social: SocialState }) => state.social.error;
export const selectPrivacySettings = (state: { social: SocialState }) =>
  state.social.privacySettings;

// ========================================
// Export
// ========================================

export default socialSlice.reducer;
