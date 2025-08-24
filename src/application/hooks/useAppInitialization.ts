// ========================================
// App Initialization Hook
// ========================================

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectUser, selectIsAuthenticated } from '../store/slices/authSlice';
import {
  initializeWebSocket,
  connectWebSocket,
  disconnectWebSocket,
  cleanupWebSocket,
} from '../../infrastructure/services/websocketIntegration';

/**
 * Hook to initialize app services and integrations
 */
export const useAppInitialization = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  // Initialize WebSocket integration
  useEffect(() => {
    console.log('🚀 Initializing app services...');

    // Initialize WebSocket integration
    initializeWebSocket();

    return () => {
      console.log('🧹 Cleaning up app services...');
      cleanupWebSocket();
    };
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('🔐 User authenticated, connecting WebSocket...');
      connectWebSocket();
    } else {
      console.log('🔐 User not authenticated, disconnecting WebSocket...');
      disconnectWebSocket();
    }
  }, [isAuthenticated, user]);

  return {
    isInitialized: true, // For now, always return true
  };
};
