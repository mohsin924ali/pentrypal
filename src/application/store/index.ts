// ========================================
// Redux Store - Production Configuration
// ========================================

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Reducers
import authReducer from './slices/authSlice';
import socialReducer from './slices/socialSlice';
import shoppingListReducer from './slices/shoppingListSlice';

// ========================================
// Persist Configuration
// ========================================

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'social'], // Persist auth and social slices
  blacklist: ['shoppingList'], // Don't persist shopping list (real-time data)
};

// ========================================
// Root Reducer
// ========================================

const rootReducer = combineReducers({
  auth: authReducer,
  social: socialReducer,
  shoppingList: shoppingListReducer,
  // Add more reducers here as needed
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ========================================
// Store Configuration
// ========================================

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/FLUSH',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PERSIST',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
      immutableCheck: {
        ignoredPaths: ['ignoredPath'],
      },
    }),
  devTools: __DEV__ && {
    name: 'PentryPal Store',
    trace: true,
    traceLimit: 25,
  },
});

// ========================================
// Persistor
// ========================================

export const persistor = persistStore(store);

// ========================================
// Type Definitions
// ========================================

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ========================================
// Store Utilities
// ========================================

/**
 * Reset store to initial state
 */
export const resetStore = () => {
  persistor.purge();
  store.dispatch({ type: 'RESET_STORE' });
};

/**
 * Get current auth state
 */
export const getAuthState = () => store.getState().auth;
