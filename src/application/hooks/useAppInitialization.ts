// ========================================
// App Initialization Hook
// ========================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../store/slices/authSlice';
import {
  cleanupWebSocket,
  connectWebSocket,
  disconnectWebSocket,
  initializeWebSocket,
} from '../../infrastructure/services/websocketIntegration';

/**
 * Hook to initialize app services and integrations
 */
export const useAppInitialization = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Initialize WebSocket integration
  useEffect(() => {
    if (__DEV__) {
      console.log('🚀 Initializing app services...');
    }

    // Initialize WebSocket integration
    initializeWebSocket();

    return () => {
      if (__DEV__) {
        console.log('🧹 Cleaning up app services...');
      }
      cleanupWebSocket();
    };
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      if (__DEV__) {
        console.log('🔐 User authenticated, connecting WebSocket...');
      }
      connectWebSocket().catch(error => {
        if (__DEV__) {
          console.error('Failed to connect WebSocket:', error);
        }
      });
    } else {
      if (__DEV__) {
        console.log('🔐 User not authenticated, disconnecting WebSocket...');
      }
      disconnectWebSocket().catch(error => {
        if (__DEV__) {
          console.error('Failed to disconnect WebSocket:', error);
        }
      });
    }
  }, [isAuthenticated, user]);

  return {
    isInitialized: true, // For now, always return true
  };
};
