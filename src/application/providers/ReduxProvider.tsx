/**
 * Redux Provider Component
 * Wraps the app with Redux store and persistence
 */

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store';
import { initializeNetworkListener } from '../store/middleware/offlineMiddleware';

// Loading component for persistence
const PersistenceLoading: React.FC = () => {
  return null; // You can add a loading spinner here if needed
};

interface ReduxProviderProps {
  children: React.ReactNode;
}

export const ReduxProvider: React.FC<ReduxProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize network listener for offline functionality
    const unsubscribe = initializeNetworkListener(store);

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<PersistenceLoading />} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
};
