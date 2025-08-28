// ========================================
// Redux Provider - State Management Provider
// ========================================

import React, { type FC, type PropsWithChildren } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Store
import { persistor, store } from '@/store';

// Components
import { LoadingScreen } from '@/components/atoms/LoadingScreen/LoadingScreen';

/**
 * Redux Provider Component
 *
 * Provides Redux store and persistence throughout the application
 * Handles store rehydration with loading state
 */
export const ReduxProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
