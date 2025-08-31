// ========================================
// API Client - Backend Communication Layer
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../../shared/constants';
import type {
  ApiResponse,
  BackendApiConfig,
  BackendApiMethod,
  BackendError,
  BackendRequestConfig,
  BackendRequestOptions,
  BackendTokens,
  BackendValidationError,
} from '../../shared/types/backend';
import { SecureTokenStorage } from '../storage/SecureTokenStorage';

// ========================================
// API Client Configuration
// ========================================

const DEFAULT_CONFIG: BackendApiConfig = {
  baseUrl: API_CONFIG.baseUrl,
  timeout: API_CONFIG.timeout,
  retryAttempts: API_CONFIG.retryAttempts,
  retryDelay: API_CONFIG.retryDelay,
  websocketUrl: API_CONFIG.websocketUrl,
};

// ========================================
// API Client Class
// ========================================

export class ApiClient {
  private config: BackendApiConfig;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<BackendTokens> | null = null;

  constructor(config: Partial<BackendApiConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    void this.initializeTokens();
  }

  // ========================================
  // Token Management
  // ========================================

  private async initializeTokens(): Promise<void> {
    try {
      const tokens = await SecureTokenStorage.getTokens(STORAGE_KEYS.authTokens);
      if (tokens) {
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        console.log('🔍 DEBUG: Successfully initialized tokens from secure storage');
      }
    } catch (error) {
      console.error('Failed to initialize tokens:', error);
      // Clear corrupted tokens
      await SecureTokenStorage.removeTokens(STORAGE_KEYS.authTokens);
    }
  }

  public setTokens(tokens: BackendTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
  }

  public clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
  }

  private async clearAllAuthenticationData(): Promise<void> {
    try {
      // Clear secure storage
      const { SecureTokenStorage } = await import('../storage/SecureTokenStorage');
      await SecureTokenStorage.removeTokens(STORAGE_KEYS.authTokens);

      // Clear AsyncStorage
      await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);

      // Force logout in Redux store
      const { forceResetAuthentication } = await import('./index');
      await forceResetAuthentication();

      // eslint-disable-next-line no-console
      console.log('🗑️ All authentication data cleared - user needs to log in again');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to clear authentication data:', error);
    }
  }

  private async refreshAccessToken(): Promise<BackendTokens> {
    if (!this.refreshToken) {
      // eslint-disable-next-line no-console
      console.error('❌ No refresh token available for token refresh');
      throw new Error('No refresh token available');
    }

    if (this.isRefreshing && this.refreshPromise) {
      // eslint-disable-next-line no-console
      console.log('⏳ Token refresh already in progress, waiting...');
      return this.refreshPromise;
    }

    // eslint-disable-next-line no-console
    console.log('🔄 Starting token refresh process...');
    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      const newTokens = await this.refreshPromise;
      this.setTokens(newTokens);

      // Store new tokens
      await AsyncStorage.setItem(STORAGE_KEYS.authTokens, JSON.stringify(newTokens));
      // eslint-disable-next-line no-console
      console.log('✅ New tokens stored successfully');

      // Trigger WebSocket reconnection with fresh tokens
      try {
        const { reconnectWebSocketWithFreshTokens } = await import(
          '../services/websocketIntegration'
        );
        await reconnectWebSocketWithFreshTokens();
        // eslint-disable-next-line no-console
        console.log('🔄 WebSocket reconnected with fresh tokens');
      } catch (wsError) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Failed to reconnect WebSocket after token refresh:', wsError);
      }

      return newTokens;
    } catch (refreshError) {
      // eslint-disable-next-line no-console
      console.error('❌ Token refresh failed completely:', refreshError);
      throw refreshError;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<BackendTokens> {
    // eslint-disable-next-line no-console
    console.log('🔄 Sending refresh token request to backend...');

    const response = await fetch(`${this.config.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: this.refreshToken,
      }),
    });

    // eslint-disable-next-line no-console
    console.log(`📡 Refresh response status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      // eslint-disable-next-line no-console
      console.error(`❌ Token refresh failed with ${response.status}: ${errorText}`);

      if (response.status === 422) {
        throw new Error('Refresh token is invalid or expired. Please log in again.');
      }
      throw new Error(`Token refresh failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    // eslint-disable-next-line no-console
    console.log('✅ Token refresh successful, received new tokens');
    return data.tokens || data;
  }

  // ========================================
  // HTTP Request Methods
  // ========================================

  private async makeRequest<T>(
    config: BackendRequestConfig,
    options: BackendRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = this.config.timeout,
      retries = this.config.retryAttempts,
      retryDelay = this.config.retryDelay,
      skipErrorHandling = false,
    } = options;

    // Don't retry authentication endpoints to prevent multiple login attempts
    const isAuthEndpoint = this.isAuthenticationEndpoint(config.url);
    const actualRetries = isAuthEndpoint ? 0 : retries;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= actualRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(config, timeout);

        if (!skipErrorHandling && !this.isSuccessResponse(response)) {
          throw new Error(response.detail || 'Request failed');
        }

        return response;
      } catch (error) {
        lastError = error as Error;

        // Handle token expiration (but not for auth endpoints)
        if (!isAuthEndpoint && this.isTokenExpiredError(error) && config.requiresAuth !== false) {
          try {
            // eslint-disable-next-line no-console
            console.log('🔄 Attempting token refresh due to expired token...');
            await this.refreshAccessToken();
            // eslint-disable-next-line no-console
            console.log('✅ Token refresh successful, retrying request...');
            // Retry the request with new token
            continue;
          } catch (refreshError) {
            // eslint-disable-next-line no-console
            console.error('❌ Token refresh failed:', refreshError);
            // Token refresh failed, clear tokens and force re-authentication
            this.clearTokens();
            await AsyncStorage.removeItem(STORAGE_KEYS.authTokens);
            await this.clearAllAuthenticationData();
            throw new Error('Authentication failed');
          }
        }

        // Don't retry on client errors (4xx) or auth endpoints
        if (this.isClientError(error) || isAuthEndpoint) {
          break;
        }

        // Wait before retrying
        if (attempt < actualRetries) {
          await this.delay(retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private async executeRequest<T>(
    config: BackendRequestConfig,
    timeout: number
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(config.url, config.params);
    const headers = this.buildHeaders(config.headers, config.requiresAuth);

    // Debug: Log the full URL being called
    console.log('🔍 DEBUG: API Request URL:', url);
    console.log('🔍 DEBUG: API Request method:', config.method);
    console.log('🔍 DEBUG: API Request data:', config.data);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: config.method,
        headers,
        body: config.data ? JSON.stringify(config.data) : undefined,
        signal: controller.signal,
      } as any);

      clearTimeout(timeoutId);

      const responseData = await response.json();

      if (!response.ok) {
        return {
          data: undefined,
          detail: responseData.detail || `HTTP ${response.status}`,
          error_code: responseData.error_code,
          timestamp: new Date().toISOString(),
        } as any;
      }

      return {
        data: responseData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    // Debug: Log base URL and endpoint
    console.log('🔍 DEBUG: Base URL:', this.config.baseUrl);
    console.log('🔍 DEBUG: Endpoint:', endpoint);

    // Ensure base URL ends with / and endpoint doesn't start with /
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl
      : `${this.config.baseUrl}/`;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

    const url = new URL(cleanEndpoint, baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private buildHeaders(
    customHeaders?: Record<string, string>,
    requiresAuth: boolean = true
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    };

    if (requiresAuth && this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // ========================================
  // Helper Methods
  // ========================================

  private isSuccessResponse<T>(response: ApiResponse<T>): boolean {
    return response.data !== undefined && !response.detail;
  }

  private isTokenExpiredError(error: any): boolean {
    const errorMessage = error?.message?.toLowerCase() || '';
    return (
      errorMessage.includes('token') ||
      errorMessage.includes('401') ||
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('not authenticated') ||
      errorMessage.includes('authentication failed') ||
      errorMessage.includes('403') ||
      errorMessage.includes('forbidden') ||
      errorMessage.includes('expired')
    );
  }

  private isClientError(error: any): boolean {
    const message = error?.message?.toLowerCase() || '';
    return (
      message.includes('400') ||
      message.includes('401') ||
      message.includes('403') ||
      message.includes('404') ||
      message.includes('422')
    );
  }

  private isAuthenticationEndpoint(url: string): boolean {
    const authEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
      '/auth/verify-email',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/biometric-login',
    ];

    return authEndpoints.some(endpoint => url.includes(endpoint));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // Public API Methods
  // ========================================

  public async get<T>(
    url: string,
    params?: Record<string, any>,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'GET',
        url,
        params,
        requiresAuth: true,
      } as any,
      options
    );
  }

  public async post<T>(
    url: string,
    data?: any,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'POST',
        url,
        data,
        requiresAuth: true,
      },
      options
    );
  }

  public async put<T>(
    url: string,
    data?: any,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'PUT',
        url,
        data,
        requiresAuth: true,
      },
      options
    );
  }

  public async patch<T>(
    url: string,
    data?: any,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'PATCH',
        url,
        data,
        requiresAuth: true,
      },
      options
    );
  }

  public async delete<T>(url: string, options?: BackendRequestOptions): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'DELETE',
        url,
        requiresAuth: true,
      },
      options
    );
  }

  // ========================================
  // Unauthenticated Requests
  // ========================================

  public async postPublic<T>(
    url: string,
    data?: any,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'POST',
        url,
        data,
        requiresAuth: false,
      },
      options
    );
  }

  public async getPublic<T>(
    url: string,
    params?: Record<string, any>,
    options?: BackendRequestOptions
  ): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(
      {
        method: 'GET',
        url,
        params,
        requiresAuth: false,
      } as any,
      options
    );
  }

  // ========================================
  // File Upload
  // ========================================

  public async uploadFile<T>(
    url: string,
    file: File | Blob | { uri: string; type: string; name: string },
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();

    // Handle React Native file format
    if (file && typeof file === 'object' && 'uri' in file) {
      formData.append(fieldName, file as any);
    } else {
      formData.append(fieldName, file as any);
    }

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = this.buildHeaders({}, true);
    delete headers['Content-Type']; // Let the system set it for FormData

    console.log('🔍 DEBUG: Upload URL:', `${this.config.baseUrl}${url}`);
    console.log('🔍 DEBUG: Upload headers:', headers);

    const response = await fetch(`${this.config.baseUrl}${url}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    let responseData;
    try {
      responseData = await response.json();
    } catch (error) {
      console.error('Failed to parse response as JSON:', error);
      responseData = { detail: 'Invalid response format' };
    }

    console.log('🔍 DEBUG: Upload response status:', response.status);
    console.log('🔍 DEBUG: Upload response data:', responseData);

    if (!response.ok) {
      return {
        data: undefined,
        detail: responseData.detail || `HTTP ${response.status}`,
        error_code: responseData.error_code,
        timestamp: new Date().toISOString(),
      } as any;
    }

    return {
      data: responseData,
      timestamp: new Date().toISOString(),
    };
  }

  // ========================================
  // WebSocket Connection
  // ========================================

  public createWebSocket(token?: string): WebSocket {
    const wsUrl = token
      ? `${this.config.websocketUrl}/${token}`
      : `${this.config.websocketUrl}/${this.accessToken}`;

    return new WebSocket(wsUrl);
  }

  // ========================================
  // Health Check
  // ========================================

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.getPublic('/health', undefined, {
        timeout: 5000,
        retries: 0,
      });
      return response.data !== undefined;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }
}

// ========================================
// Default Export
// ========================================

export const apiClient = new ApiClient();

// ========================================
// Error Handling Utilities
// ========================================

export const handleApiError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.detail) {
    // Handle FastAPI validation errors
    if (Array.isArray(error.detail)) {
      const validationError = error as BackendValidationError;
      return validationError.detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
    }
    return error.detail;
  }

  if (error?.message) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const isValidationError = (error: any): error is BackendValidationError => {
  return error?.detail && Array.isArray(error.detail);
};

export const isBackendError = (error: any): error is BackendError => {
  return error?.detail && typeof error.detail === 'string';
};
