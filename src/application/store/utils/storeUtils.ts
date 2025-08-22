/**
 * Store Utilities
 * Helper functions for working with Redux store
 */

import { store } from '../index';
import type { RootState } from '../index';

// Get current state
export const getCurrentState = (): RootState => {
  return store.getState();
};

// Get specific slice state
export const getAuthState = () => getCurrentState().auth;
export const getUIState = () => getCurrentState().ui;
export const getShoppingListsState = () => getCurrentState().shoppingLists;
export const getPantryState = () => getCurrentState().pantry;
export const getOfflineState = () => getCurrentState().offline;

// Dispatch helpers
export const dispatch = store.dispatch;

// Store subscription helper
export const subscribeToStore = (callback: () => void) => {
  return store.subscribe(callback);
};

// Wait for specific state condition
export const waitForState = <T>(
  selector: (state: RootState) => T,
  condition: (value: T) => boolean,
  timeout: number = 5000,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      unsubscribe();
      reject(new Error('Timeout waiting for state condition'));
    }, timeout);

    const checkCondition = () => {
      const value = selector(getCurrentState());
      if (condition(value)) {
        clearTimeout(timeoutId);
        unsubscribe();
        resolve(value);
      }
    };

    const unsubscribe = subscribeToStore(checkCondition);

    // Check immediately in case condition is already met
    checkCondition();
  });
};

// Reset all state (useful for logout)
export const resetAllState = () => {
  dispatch({ type: 'auth/resetAuth' });
  dispatch({ type: 'ui/resetUI' });
  dispatch({ type: 'shoppingLists/resetShoppingLists' });
  dispatch({ type: 'pantry/resetPantry' });
  dispatch({ type: 'offline/resetOffline' });
};

// Debug helpers (development only)
export const logCurrentState = () => {
  if (__DEV__) {
    console.log('Current Redux State:', getCurrentState());
  }
};

export const logStateSlice = (sliceName: keyof RootState) => {
  if (__DEV__) {
    console.log(`${sliceName} State:`, getCurrentState()[sliceName]);
  }
};
