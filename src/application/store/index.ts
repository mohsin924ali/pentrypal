/**
 * Redux Store Configuration
 * Main store setup with middleware and persistence
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import slices
import authSlice from './slices/authSlice';
import uiSlice from './slices/uiSlice';
import shoppingListsSlice from './slices/shoppingListsSlice';
import pantrySlice from './slices/pantrySlice';
import offlineSlice from './slices/offlineSlice';

// Import API slice
import { apiSlice } from './api/apiSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'shoppingLists', 'pantry', 'ui'], // Only persist these slices
  blacklist: ['api', 'offline'], // Don't persist API cache and offline queue
};

// Root reducer
const rootReducer = combineReducers({
  auth: authSlice,
  ui: uiSlice,
  shoppingLists: shoppingListsSlice,
  pantry: pantrySlice,
  offline: offlineSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Import middleware
import { offlineMiddleware } from './middleware/offlineMiddleware';

// Store configuration
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
      },
    })
      .concat(apiSlice.middleware)
      .concat(offlineMiddleware),
  devTools: __DEV__,
});

// Persistor
export const persistor = persistStore(store);

// Setup listeners for RTK Query
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export { useAppDispatch, useAppSelector } from './hooks';
