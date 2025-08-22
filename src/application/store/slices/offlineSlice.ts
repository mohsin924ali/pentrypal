/**
 * Offline Slice
 * Manages offline state and queued actions
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  endpoint?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export interface ConflictResolution {
  id: string;
  type: 'list' | 'item' | 'pantry';
  localData: any;
  serverData: any;
  timestamp: string;
  resolved: boolean;
}

export interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  conflictResolutions: ConflictResolution[];
  lastSyncTime: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  queueSize: number;
  maxQueueSize: number;
}

// Initial state
const initialState: OfflineState = {
  isOnline: true,
  pendingActions: [],
  conflictResolutions: [],
  lastSyncTime: null,
  syncInProgress: false,
  syncError: null,
  queueSize: 0,
  maxQueueSize: 100,
};

// Offline slice
const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    // Network status
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      const wasOffline = !state.isOnline;
      state.isOnline = action.payload;

      // If coming back online and have pending actions, trigger sync
      if (wasOffline && action.payload && state.pendingActions.length > 0) {
        // This will be handled by middleware
      }
    },

    // Queue management
    addPendingAction: (
      state,
      action: PayloadAction<
        Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>
      >,
    ) => {
      // Check queue size limit
      if (state.queueSize >= state.maxQueueSize) {
        // Remove oldest action
        state.pendingActions.shift();
        state.queueSize--;
      }

      const pendingAction: OfflineAction = {
        ...action.payload,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      state.pendingActions.push(pendingAction);
      state.queueSize++;
    },

    removePendingAction: (state, action: PayloadAction<string>) => {
      const index = state.pendingActions.findIndex(
        action => action.id === action.payload,
      );
      if (index !== -1) {
        state.pendingActions.splice(index, 1);
        state.queueSize--;
      }
    },

    incrementRetryCount: (state, action: PayloadAction<string>) => {
      const actionItem = state.pendingActions.find(
        item => item.id === action.payload,
      );
      if (actionItem) {
        actionItem.retryCount++;
      }
    },

    clearPendingActions: state => {
      state.pendingActions = [];
      state.queueSize = 0;
    },

    // Sync management
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
      if (action.payload) {
        state.syncError = null;
      }
    },

    setSyncError: (state, action: PayloadAction<string>) => {
      state.syncError = action.payload;
      state.syncInProgress = false;
    },

    setSyncSuccess: state => {
      state.lastSyncTime = new Date().toISOString();
      state.syncInProgress = false;
      state.syncError = null;
    },

    // Conflict resolution
    addConflictResolution: (
      state,
      action: PayloadAction<
        Omit<ConflictResolution, 'id' | 'timestamp' | 'resolved'>
      >,
    ) => {
      const conflict: ConflictResolution = {
        ...action.payload,
        id: `conflict-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        resolved: false,
      };

      state.conflictResolutions.push(conflict);
    },

    resolveConflict: (
      state,
      action: PayloadAction<{
        id: string;
        resolution: 'local' | 'server' | 'merge';
      }>,
    ) => {
      const conflict = state.conflictResolutions.find(
        c => c.id === action.payload.id,
      );
      if (conflict) {
        conflict.resolved = true;
        // The actual resolution logic will be handled by middleware
      }
    },

    removeConflictResolution: (state, action: PayloadAction<string>) => {
      state.conflictResolutions = state.conflictResolutions.filter(
        conflict => conflict.id !== action.payload,
      );
    },

    clearConflictResolutions: state => {
      state.conflictResolutions = [];
    },

    // Queue size management
    setMaxQueueSize: (state, action: PayloadAction<number>) => {
      state.maxQueueSize = Math.max(10, action.payload); // Minimum 10 actions
    },

    // Reset state
    resetOffline: () => initialState,
  },
});

// Export actions
export const {
  setOnlineStatus,
  addPendingAction,
  removePendingAction,
  incrementRetryCount,
  clearPendingActions,
  setSyncInProgress,
  setSyncError,
  setSyncSuccess,
  addConflictResolution,
  resolveConflict,
  removeConflictResolution,
  clearConflictResolutions,
  setMaxQueueSize,
  resetOffline,
} = offlineSlice.actions;

// Selectors
export const selectOffline = (state: { offline: OfflineState }) =>
  state.offline;
export const selectIsOnline = (state: { offline: OfflineState }) =>
  state.offline.isOnline;
export const selectPendingActions = (state: { offline: OfflineState }) =>
  state.offline.pendingActions;
export const selectPendingActionsCount = (state: { offline: OfflineState }) =>
  state.offline.queueSize;
export const selectConflictResolutions = (state: { offline: OfflineState }) =>
  state.offline.conflictResolutions;
export const selectUnresolvedConflicts = (state: { offline: OfflineState }) =>
  state.offline.conflictResolutions.filter(conflict => !conflict.resolved);
export const selectSyncInProgress = (state: { offline: OfflineState }) =>
  state.offline.syncInProgress;
export const selectSyncError = (state: { offline: OfflineState }) =>
  state.offline.syncError;
export const selectLastSyncTime = (state: { offline: OfflineState }) =>
  state.offline.lastSyncTime;

// Export reducer
export default offlineSlice.reducer;
