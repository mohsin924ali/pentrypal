/**
 * Offline Middleware
 * Handles offline action queuing and synchronization
 */

import { Middleware } from '@reduxjs/toolkit';
import NetInfo from '@react-native-community/netinfo';
import {
  setOnlineStatus,
  addPendingAction,
  removePendingAction,
  incrementRetryCount,
  setSyncInProgress,
  setSyncError,
  setSyncSuccess,
} from '../slices/offlineSlice';

// Actions that should be queued when offline
const QUEUEABLE_ACTIONS = [
  'shoppingLists/addList',
  'shoppingLists/updateList',
  'shoppingLists/removeList',
  'shoppingLists/addItem',
  'shoppingLists/updateItem',
  'shoppingLists/removeItem',
  'shoppingLists/toggleItemCompleted',
  'pantry/addItem',
  'pantry/updateItem',
  'pantry/removeItem',
  'pantry/updateQuantity',
  'auth/updateUser',
  'auth/updatePreferences',
];

// Create offline middleware
export const offlineMiddleware: Middleware = store => next => action => {
  const state = store.getState();
  const isOnline = state.offline?.isOnline ?? true;

  // Handle network status changes
  if (action.type === 'offline/setOnlineStatus') {
    const wasOffline = !isOnline;
    const isNowOnline = action.payload;

    // If coming back online, start sync process
    if (wasOffline && isNowOnline) {
      setTimeout(() => {
        syncPendingActions(store);
      }, 1000); // Small delay to ensure connection is stable
    }
  }

  // Queue actions when offline
  if (!isOnline && QUEUEABLE_ACTIONS.includes(action.type)) {
    store.dispatch(
      addPendingAction({
        type: action.type,
        payload: action.payload,
        maxRetries: 3,
      }),
    );

    // Still process the action locally for optimistic updates
    return next(action);
  }

  return next(action);
};

// Sync pending actions when coming back online
const syncPendingActions = async (store: any) => {
  const state = store.getState();
  const pendingActions = state.offline.pendingActions;

  if (pendingActions.length === 0) {
    return;
  }

  store.dispatch(setSyncInProgress(true));

  try {
    for (const pendingAction of pendingActions) {
      try {
        // Convert Redux action to API call
        await processOfflineAction(pendingAction, store);

        // Remove successful action from queue
        store.dispatch(removePendingAction(pendingAction.id));
      } catch (error) {
        console.error('Failed to sync action:', pendingAction.type, error);

        // Increment retry count
        store.dispatch(incrementRetryCount(pendingAction.id));

        // Remove action if max retries exceeded
        if (pendingAction.retryCount >= pendingAction.maxRetries) {
          store.dispatch(removePendingAction(pendingAction.id));
          console.warn('Max retries exceeded for action:', pendingAction.type);
        }
      }
    }

    store.dispatch(setSyncSuccess());
  } catch (error) {
    store.dispatch(setSyncError('Failed to sync offline actions'));
  }
};

// Process individual offline action
const processOfflineAction = async (action: any, store: any): Promise<void> => {
  // This would typically make API calls based on the action type
  // For now, we'll simulate the API calls

  switch (action.type) {
    case 'shoppingLists/addList':
      // await api.post('/shopping-lists', action.payload);
      console.log('Syncing add list:', action.payload);
      break;

    case 'shoppingLists/updateList':
      // await api.put(`/shopping-lists/${action.payload.id}`, action.payload.updates);
      console.log('Syncing update list:', action.payload);
      break;

    case 'shoppingLists/addItem':
      // await api.post(`/shopping-lists/${action.payload.listId}/items`, action.payload.item);
      console.log('Syncing add item:', action.payload);
      break;

    case 'pantry/addItem':
      // await api.post('/pantry-items', action.payload);
      console.log('Syncing add pantry item:', action.payload);
      break;

    default:
      console.log('Unknown action type for sync:', action.type);
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));
};

// Initialize network listener
export const initializeNetworkListener = (store: any) => {
  // Listen for network changes
  const unsubscribe = NetInfo.addEventListener(state => {
    const isOnline = state.isConnected && state.isInternetReachable;
    store.dispatch(setOnlineStatus(isOnline));
  });

  // Get initial network state
  NetInfo.fetch().then(state => {
    const isOnline = state.isConnected && state.isInternetReachable;
    store.dispatch(setOnlineStatus(isOnline));
  });

  return unsubscribe;
};
