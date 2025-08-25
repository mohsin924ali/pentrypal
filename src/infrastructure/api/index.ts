// ========================================
// API Services - Centralized Export
// ========================================

// Core API Client
import { apiClient } from './apiClient';
export { apiClient, handleApiError, isValidationError, isBackendError } from './apiClient';

// Domain-specific API Services
export { authApi } from './authApi';
export { shoppingListApi } from './shoppingListApi';
export { socialApi } from './socialApi';
export { pantryApi } from './pantryApi';

// Real-time Communication
import { webSocketService } from './websocketService';
export {
  webSocketService,
  connectWebSocket,
  disconnectWebSocket,
  joinListRoom,
  leaveListRoom,
  sendTypingIndicator,
  requestOnlineStatus,
  type WebSocketEventType,
  type WebSocketEvent,
  type WebSocketEventHandler,
} from './websocketService';

// Type exports temporarily removed for debugging

// ========================================
// API Service Configuration
// ========================================

import { API_CONFIG } from '../../shared/constants';

export const API_BASE_URL = API_CONFIG.baseUrl;
export const WEBSOCKET_URL = API_CONFIG.websocketUrl;

// ========================================
// Utility Functions
// ========================================

/**
 * Initialize all API services with authentication token
 */
export const initializeApiServices = (tokens: any): void => {
  apiClient.setTokens(tokens);
  webSocketService.setAccessToken(tokens.access_token);
};

/**
 * Clear authentication from all API services
 */
export const clearApiAuthentication = (): void => {
  apiClient.clearTokens();
  webSocketService.clearAccessToken();
};

/**
 * Force clear all stored authentication data (for debugging corrupted tokens)
 */
export const forceResetAuthentication = async (): Promise<void> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const { STORAGE_KEYS } = await import('../../shared/constants');
    const { SecureTokenStorage } = await import('../storage/SecureTokenStorage');

    console.log('🔄 DEBUG: Force clearing all authentication data...');

    // Clear tokens using both methods to ensure complete cleanup
    await SecureTokenStorage.clearAllTokens();
    await AsyncStorage.default.removeItem(STORAGE_KEYS.authTokens);
    await AsyncStorage.default.removeItem(STORAGE_KEYS.user);
    await AsyncStorage.default.removeItem('@pentrypal_session');

    // Clear from API services
    clearApiAuthentication();

    console.log('✅ DEBUG: All authentication data cleared - both encrypted and plain');
  } catch (error) {
    console.error('❌ DEBUG: Failed to force reset authentication:', error);
  }
};

/**
 * Detect and handle corrupted tokens automatically
 */
export const detectAndHandleCorruptedTokens = async (): Promise<boolean> => {
  try {
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const { STORAGE_KEYS } = await import('../../shared/constants');

    const tokens = await AsyncStorage.default.getItem(STORAGE_KEYS.authTokens);

    if (tokens) {
      // Check if tokens look corrupted (not JSON format)
      if (!tokens.startsWith('{') || !tokens.endsWith('}')) {
        console.warn('🚨 Corrupted tokens detected, clearing automatically...');
        await forceResetAuthentication();
        return true; // Tokens were corrupted and cleared
      }

      // Try to parse tokens
      try {
        const parsedTokens = JSON.parse(tokens);
        if (!parsedTokens.access_token || !parsedTokens.refresh_token) {
          console.warn('🚨 Invalid token structure detected, clearing...');
          await forceResetAuthentication();
          return true; // Tokens were invalid and cleared
        }
      } catch (parseError) {
        console.warn('🚨 Token parsing failed, clearing...', parseError);
        await forceResetAuthentication();
        return true; // Tokens were unparseable and cleared
      }
    }

    return false; // No corruption detected
  } catch (error) {
    console.error('❌ Failed to detect corrupted tokens:', error);
    return false;
  }
};

/**
 * Check if API services are healthy
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    return await apiClient.healthCheck();
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

/**
 * Get API connection status
 */
export const getApiStatus = () => ({
  websocket: webSocketService.getConnectionStatus(),
  baseUrl: API_BASE_URL,
  websocketUrl: WEBSOCKET_URL,
});

// ========================================
// Error Handling Utilities
// ========================================

/**
 * Extract user-friendly error message from API response
 */
export const getErrorMessage = (error: any): string => {
  return handleApiError(error);
};

/**
 * Check if error is a network/connectivity issue
 */
export const isNetworkError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  return (
    message.includes('network') ||
    message.includes('timeout') ||
    message.includes('connection') ||
    message.includes('fetch')
  );
};

/**
 * Check if error requires re-authentication
 */
export const isAuthError = (error: any): boolean => {
  const message = error?.message?.toLowerCase() || '';
  const statusCode = error?.statusCode || error?.status;

  return (
    statusCode === 401 ||
    message.includes('unauthorized') ||
    message.includes('token') ||
    message.includes('authentication')
  );
};

// ========================================
// Development Utilities
// ========================================

// Development utilities removed - they were causing circular reference issues
// that prevented proper named exports
