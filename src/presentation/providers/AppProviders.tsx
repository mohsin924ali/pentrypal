// ========================================
// Application Providers - Wraps the app with all necessary providers
// ========================================

import React, { type PropsWithChildren, type FC } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Store
import { store, persistor } from '../../application/store';

// Theme Provider
import { ThemeProvider } from './ThemeProvider';

// Error Boundary
import { ErrorBoundary } from './ErrorBoundary';

// Loading Component
import { LoadingScreen } from '../components/atoms/LoadingScreen/LoadingScreen';

// Network Provider
import { NetworkProvider } from './NetworkProvider';

// Authentication Provider
import { AuthProvider } from './AuthProvider';

// Notification Provider
import { NotificationProvider } from './NotificationProvider';

// Performance Provider
import { PerformanceProvider } from './PerformanceProvider';

/**
 * Application Providers Component
 *
 * Wraps the application with all necessary providers in the correct order:
 * 1. Theme (outermost - needed by ErrorBoundary)
 * 2. Error Boundary
 * 3. Performance Monitoring
 * 4. Redux Store
 * 5. Redux Persist
 * 6. Network State
 * 7. Authentication
 * 8. Notifications (innermost)
 */
export const AppProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <PerformanceProvider>
          <ReduxProvider store={store}>
            <PersistGate loading={<LoadingScreen />} persistor={persistor}>
              <NetworkProvider>
                <AuthProvider>
                  <NotificationProvider>{children}</NotificationProvider>
                </AuthProvider>
              </NetworkProvider>
            </PersistGate>
          </ReduxProvider>
        </PerformanceProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};
