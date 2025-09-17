// ========================================
// Authentication Service - Secure Implementation
// ========================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
const CryptoJS = require('crypto-js');
import { SecureTokenStorage } from '../storage/SecureTokenStorage';
import type {
  AuthTokens,
  DeviceInfo,
  EmailVerificationResult,
  IAuthService,
  SecurityAlertType,
  SessionInfo,
  SessionTokens,
  TokenValidationResult,
  TwoFactorSetup,
} from './IAuthService';
import type { User } from '../../domain/entities/User';
import type {
  BiometricLoginRequest,
  LoginRequest,
  RegisterRequest,
} from '../../application/store/slices/authSlice';
import { authLogger } from '../../shared/utils/logger';

// ========================================
// Configuration
// ========================================

import { API_CONFIG, STORAGE_KEYS } from '../../shared/constants';

const AUTH_CONFIG = {
  API_BASE_URL: API_CONFIG.baseUrl,
  ENCRYPTION_KEY: 'pentrypal_auth_key_2024', // In production, use secure key management
  TOKEN_STORAGE_KEY: STORAGE_KEYS.authTokens,
  USER_STORAGE_KEY: STORAGE_KEYS.userProfile,
  SESSION_STORAGE_KEY: '@pentrypal_session',
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh 5 minutes before expiry
} as const;

// ========================================
// Authentication Response Types
// ========================================

interface AuthResponse<T = any> {
  readonly success: boolean;
  readonly data?: T;
  readonly message?: string;
  readonly errorCode?: string;
  readonly errors?: Record<string, string>;
}

interface LoginResponse {
  readonly success: boolean;
  readonly user?: User;
  readonly tokens?: AuthTokens;
  readonly sessionId?: string;
  readonly requiresTwoFactor?: boolean;
  readonly requiresEmailVerification?: boolean;
  readonly message?: string;
  readonly errorCode?: string;
}

interface RegisterResponse {
  readonly success: boolean;
  readonly user?: User;
  readonly tokens?: AuthTokens;
  readonly sessionId?: string;
  readonly requiresEmailVerification?: boolean;
  readonly message?: string;
  readonly errorCode?: string;
}

// ========================================
// Secure Storage Utilities
// ========================================

class SecureStorage {
  private static encrypt(data: string): string {
    try {
      // In development/Expo Go, use base64 encoding instead of AES encryption
      if (__DEV__) {
        return btoa(data);
      }
      return CryptoJS.AES.encrypt(data, AUTH_CONFIG.ENCRYPTION_KEY).toString();
    } catch (error) {
      authLogger.error('Encryption failed, falling back to base64:', error);
      // Fallback to base64 encoding
      return btoa(data);
    }
  }

  private static decrypt(encryptedData: string): string {
    try {
      // In development/Expo Go, use base64 decoding
      if (__DEV__) {
        return atob(encryptedData);
      }
      const bytes = CryptoJS.AES.decrypt(encryptedData, AUTH_CONFIG.ENCRYPTION_KEY);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      authLogger.error('Decryption failed, falling back to base64:', error);
      // Fallback to base64 decoding
      try {
        return atob(encryptedData);
      } catch (base64Error) {
        authLogger.error('Base64 decoding also failed:', base64Error);
        throw new Error('Failed to decrypt data');
      }
    }
  }

  static async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      const encryptedData = this.encrypt(jsonString);
      await AsyncStorage.setItem(key, encryptedData);
      authLogger.debug(`🔐 Stored data for key: ${key}`);
    } catch (error) {
      authLogger.error('Secure storage setItem failed:', error);
      // Fallback to plain storage in development
      if (__DEV__) {
        authLogger.debug('💾 Falling back to plain storage for development');
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        throw new Error('Failed to store secure data');
      }
    }
  }

  static async getItem<T>(key: string): Promise<T | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(key);
      if (!encryptedData) return null;

      const decryptedData = this.decrypt(encryptedData);
      return JSON.parse(decryptedData) as T;
    } catch (error) {
      authLogger.error('Secure storage getItem failed:', error);
      // Fallback to plain storage in development
      if (__DEV__) {
        try {
          const plainData = await AsyncStorage.getItem(key);
          return plainData ? JSON.parse(plainData) : null;
        } catch (plainError) {
          authLogger.error('Plain storage getItem also failed:', plainError);
        }
      }
      return null;
    }
  }

  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      authLogger.error('Secure storage removeItem failed:', error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const keys = [
        AUTH_CONFIG.TOKEN_STORAGE_KEY,
        AUTH_CONFIG.USER_STORAGE_KEY,
        AUTH_CONFIG.SESSION_STORAGE_KEY,
      ];
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      authLogger.error('Secure storage clear failed:', error);
    }
  }
}

// ========================================
// HTTP Client
// ========================================

class HttpClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AuthResponse<T>> {
    try {
      const url = `${AUTH_CONFIG.API_BASE_URL}${endpoint}`;

      const defaultHeaders = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'PentryPal/1.0.0',
      };

      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Request failed',
          errorCode: data.code || 'UNKNOWN_ERROR',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      authLogger.error('HTTP request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
        errorCode: 'NETWORK_ERROR',
      };
    }
  }

  static async post<T>(endpoint: string, body: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    } as any);
  }

  static async get<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'GET',
      headers,
    } as any);
  }

  static async put<T>(endpoint: string, body: any, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers,
    } as any);
  }

  static async delete<T>(endpoint: string, headers?: Record<string, string>) {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers,
    } as any);
  }
}

// ========================================
// Authentication Service Implementation
// ========================================

class AuthServiceImpl implements IAuthService {
  // ========================================
  // Password Management
  // ========================================

  async hashPassword(password: string): Promise<string> {
    // In development/Expo Go, use simple hash
    if (__DEV__) {
      // Simple base64 encoding for development
      return btoa(`dev_hash_${password}_${Date.now()}`);
    }

    try {
      // In production, use a proper hashing library like bcrypt
      // This is a simplified implementation for demo purposes
      const salt = CryptoJS.lib.WordArray.random(128 / 8);
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      return `${salt.toString()}:${hash.toString()}`;
    } catch (error) {
      authLogger.error('Crypto hashing failed, using fallback:', error);
      // Fallback to simple hash
      return btoa(`fallback_hash_${password}_${Date.now()}`);
    }
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // In development, handle simple hash
      if (__DEV__ && hashedPassword.startsWith('ZGV2X2hhc2g')) {
        // base64 for "dev_hash"
        const decoded = atob(hashedPassword);
        return decoded.includes(password);
      }

      // Handle fallback hash
      if (hashedPassword.startsWith('ZmFsbGJhY2tf')) {
        // base64 for "fallback_"
        const decoded = atob(hashedPassword);
        return decoded.includes(password);
      }

      const [saltHex, hashHex] = hashedPassword.split(':');
      const salt = CryptoJS.enc.Hex.parse(saltHex);

      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256 / 32,
        iterations: 10000,
      });

      return hash.toString() === hashHex;
    } catch (error) {
      authLogger.error('Password verification failed:', error);
      return false;
    }
  }

  async storeUserCredentials(userId: string, hashedPassword: string): Promise<void> {
    // In production, this would be stored securely on the server
    // For demo purposes, we'll simulate this
    authLogger.debug('Storing credentials for user:', userId);
  }

  async updateUserPassword(userId: string, newHashedPassword: string): Promise<void> {
    const response = await HttpClient.put(`/auth/password`, {
      userId,
      hashedPassword: newHashedPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to update password');
    }
  }

  // ========================================
  // Authentication Methods
  // ========================================

  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      // Import the auth API
      const { authApi } = await import('../api');

      // Make real API call
      const response = await authApi.login({
        email_or_phone: request.email,
        password: request.password,
      });

      // Debug: Log the full response structure
      console.log('🔍 DEBUG: Full API Response:', JSON.stringify(response, null, 2));
      console.log('🔍 DEBUG: Response.data exists:', !!response.data);
      console.log('🔍 DEBUG: Response.data structure:', response.data);

      if (response.data) {
        const { user, tokens } = response.data;

        // Convert backend user to frontend user format
        const frontendUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          mobile: user.phone,
          avatar: user.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          preferences: {
            theme: 'system',
            language: 'en',
            currency: 'USD',
            notifications: {
              pushEnabled: true,
              emailEnabled: true,
              listUpdates: true,
              reminders: true,
              promotions: false,
            },
            privacy: {
              profileVisibility: 'private',
              locationSharing: false,
              analyticsOptIn: true,
            },
          },
        };

        // Convert backend tokens to frontend format
        const frontendTokens: AuthTokens = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: 'Bearer',
          expiresIn: tokens.expires_in,
          scope: ['read', 'write'],
        };

        // Store tokens securely
        await SecureTokenStorage.storeTokens(AUTH_CONFIG.TOKEN_STORAGE_KEY, frontendTokens);
        await SecureStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, frontendUser);

        return {
          success: true,
          user: frontendUser as unknown as User,
          tokens: frontendTokens,
          sessionId: this.generateSecureToken('session', frontendUser.id),
          requiresTwoFactor: false,
          requiresEmailVerification: false,
        };
      } else {
        // Debug: Log why response.data is falsy
        console.log('🔍 DEBUG: Response.data is falsy');
        console.log('🔍 DEBUG: Response.detail:', response.detail);
        console.log('🔍 DEBUG: Response.error_code:', response.error_code);

        return {
          success: false,
          message: response.detail || 'Login failed',
          errorCode: response.error_code || 'LOGIN_FAILED',
        };
      }
    } catch (error) {
      // Debug: Log the caught error
      console.log('🔍 DEBUG: Exception caught in login:', error);
      console.log('🔍 DEBUG: Error type:', typeof error);
      console.log(
        '🔍 DEBUG: Error message:',
        error instanceof Error ? error.message : String(error)
      );

      authLogger.error('Login failed:', error);
      return {
        success: false,
        message: 'Login failed',
        errorCode: 'INTERNAL_ERROR',
      };
    }
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    try {
      // Import the auth API
      const { authApi, checkApiHealth } = await import('../api');

      // Debug: Test API connectivity first
      console.log('🔍 DEBUG: Testing API connectivity...');
      const isHealthy = await checkApiHealth();
      console.log('🔍 DEBUG: API health check result:', isHealthy);

      // Make real API call
      // Debug: Log what we're receiving
      authLogger.debug('🔍 DEBUG: Registration request data:', request);

      // Format data for the backend with the new structure
      const registrationData = {
        email: request.email,
        phone: request.phoneNumber,
        country_code: request.countryCode,
        name: `${request.firstName} ${request.lastName}`,
        password: request.password,
      };

      authLogger.debug('🔍 DEBUG: Sending to backend:', registrationData);

      const response = await authApi.register(registrationData);

      // Debug: Log the full response structure
      console.log('🔍 DEBUG: Full Registration API Response:', JSON.stringify(response, null, 2));
      console.log('🔍 DEBUG: Response.data exists:', !!response.data);
      console.log('🔍 DEBUG: Response.data structure:', response.data);
      console.log('🔍 DEBUG: Response.detail:', response.detail);
      console.log('🔍 DEBUG: Response.error_code:', response.error_code);

      if (response.data) {
        const { user, tokens } = response.data;

        // Convert backend user to frontend user format
        const frontendUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          mobile: user.phone,
          avatar: user.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          preferences: {
            theme: 'system',
            language: 'en',
            currency: 'USD',
            notifications: {
              pushEnabled: true,
              emailEnabled: true,
              listUpdates: true,
              reminders: true,
              promotions: request.marketingConsent || false,
            },
            privacy: {
              profileVisibility: 'private',
              locationSharing: false,
              analyticsOptIn: true,
            },
          },
        };

        // Convert backend tokens to frontend format
        const frontendTokens: AuthTokens = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: 'Bearer',
          expiresIn: tokens.expires_in,
          scope: ['read', 'write'],
        };

        // Store tokens securely
        await SecureTokenStorage.storeTokens(AUTH_CONFIG.TOKEN_STORAGE_KEY, frontendTokens);
        await SecureStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, frontendUser);

        return {
          success: true,
          user: frontendUser as unknown as User,
          tokens: frontendTokens,
          sessionId: this.generateSecureToken('session', frontendUser.id),
          requiresEmailVerification: false, // Backend doesn't require email verification per requirements
        };
      } else {
        // Debug: Log why response.data is falsy
        console.log('🔍 DEBUG: Registration response.data is falsy');
        console.log('🔍 DEBUG: Registration response.detail:', response.detail);
        console.log('🔍 DEBUG: Registration response.error_code:', response.error_code);

        return {
          success: false,
          message: response.detail || 'Registration failed',
          errorCode: response.error_code || 'REGISTRATION_FAILED',
        };
      }
    } catch (error) {
      // Debug: Log the caught error
      console.log('🔍 DEBUG: Exception caught in registration:', error);
      console.log('🔍 DEBUG: Error type:', typeof error);
      console.log(
        '🔍 DEBUG: Error message:',
        error instanceof Error ? error.message : String(error)
      );

      authLogger.error('Registration failed:', error);
      return {
        success: false,
        message: 'Registration failed',
        errorCode: 'INTERNAL_ERROR',
      };
    }
  }

  async loginWithBiometric(request: BiometricLoginRequest): Promise<LoginResponse> {
    try {
      // Import the auth API
      const { authApi } = await import('../api');

      // Make real API call
      const response = await authApi.biometricLogin({
        user_id: request.userId,
        signature: request.signature,
        device_id: (request as any).deviceId,
      });

      if (response.data) {
        const { user, tokens } = response.data;

        // Convert backend user to frontend user format
        const frontendUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          mobile: user.phone,
          avatar: user.avatar_url,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          preferences: {
            theme: 'system',
            language: 'en',
            currency: 'USD',
            notifications: {
              pushEnabled: true,
              emailEnabled: true,
              listUpdates: true,
              reminders: true,
              promotions: false,
            },
            privacy: {
              profileVisibility: 'private',
              locationSharing: false,
              analyticsOptIn: true,
            },
          },
        };

        // Convert backend tokens to frontend format
        const frontendTokens: AuthTokens = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: 'Bearer',
          expiresIn: tokens.expires_in,
          scope: ['read', 'write'],
        };

        // Store tokens securely
        await SecureTokenStorage.storeTokens(AUTH_CONFIG.TOKEN_STORAGE_KEY, frontendTokens);
        await SecureStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, frontendUser);

        return {
          success: true,
          user: frontendUser as unknown as User,
          tokens: frontendTokens,
          sessionId: this.generateSecureToken('session', frontendUser.id),
        };
      } else {
        return {
          success: false,
          message: response.detail || 'Biometric login failed',
          errorCode: response.error_code || 'BIOMETRIC_FAILED',
        };
      }
    } catch (error) {
      authLogger.error('Biometric login failed:', error);
      return {
        success: false,
        message: 'Biometric login failed',
        errorCode: 'INTERNAL_ERROR',
      };
    }
  }

  async logout(tokens: AuthTokens): Promise<void> {
    try {
      // Import the auth API
      const { authApi, clearApiAuthentication } = await import('../api');

      // Only attempt server logout if we have valid tokens
      if (tokens && tokens.accessToken && tokens.refreshToken) {
        try {
          // Revoke tokens on server
          await authApi.logout();
          authLogger.debug('✅ Server logout successful');
        } catch (serverError: any) {
          // If server logout fails due to authentication, it's likely tokens are already invalid
          if (
            serverError.message?.includes('Not authenticated') ||
            serverError.message?.includes('Unauthorized') ||
            serverError.status === 401
          ) {
            authLogger.debug('ℹ️ Server logout skipped - tokens already invalid');
          } else {
            console.warn('⚠️ Server logout failed:', serverError);
          }
        }
      } else {
        authLogger.debug('ℹ️ Server logout skipped - no valid tokens available');
      }

      // Clear API authentication
      clearApiAuthentication();
    } catch (error) {
      console.warn('Logout process failed:', error);
    } finally {
      // Always clear local storage regardless of server response
      await SecureStorage.clear();
      authLogger.debug('✅ Local storage cleared');
    }
  }

  // ========================================
  // Token Management
  // ========================================

  async generateTokens(user: User, deviceInfo?: DeviceInfo): Promise<AuthTokens> {
    // In production, this would be handled by the server
    const now = Date.now();
    const expiresIn = 60 * 60; // 1 hour

    return {
      accessToken: this.generateSecureToken('access', user.id),
      refreshToken: this.generateSecureToken('refresh', user.id),
      tokenType: 'Bearer',
      expiresIn,
      scope: ['read', 'write'],
    };
  }

  async generateSessionTokens(user: User): Promise<SessionTokens> {
    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      sessionId: this.generateSecureToken('session', user.id),
      temporary: true,
    };
  }

  async refreshTokens(refreshToken: string, deviceInfo?: DeviceInfo): Promise<AuthTokens> {
    try {
      // Import the auth API
      const { authApi } = await import('../api');

      // Make real API call
      const response = await authApi.refreshToken({
        refresh_token: refreshToken,
      });

      if (response.data) {
        const tokens = response.data;

        // Convert backend tokens to frontend format
        const frontendTokens: AuthTokens = {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenType: 'Bearer',
          expiresIn: tokens.expires_in,
          scope: ['read', 'write'],
        };

        // Store new tokens securely
        await SecureTokenStorage.storeTokens(AUTH_CONFIG.TOKEN_STORAGE_KEY, frontendTokens);

        return frontendTokens;
      } else {
        throw new Error(response.detail || 'Token refresh failed');
      }
    } catch (error) {
      authLogger.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const response = await HttpClient.post('/auth/validate', { token });

      if (!response.success) {
        return {
          valid: false,
          error: response.message || 'Token validation failed',
        };
      }

      return {
        valid: true,
        user: (response.data as any).user,
        permissions: (response.data as any).permissions,
        expiresAt: new Date((response.data as any).expiresAt),
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Token validation error',
      };
    }
  }

  async revokeTokens(tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>): Promise<void> {
    await HttpClient.post('/auth/revoke', tokens);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await HttpClient.post('/auth/revoke-all', { userId });
  }

  // ========================================
  // Session Management
  // ========================================

  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    const response = await HttpClient.post('/auth/session', {
      userId,
      deviceInfo,
    });

    if (!response.success) {
      throw new Error(response.message || 'Session creation failed');
    }

    return (response.data as any).sessionId;
  }

  async getSession(sessionId: string): Promise<SessionInfo | null> {
    const response = await HttpClient.get(`/auth/session/${sessionId}`);

    if (!response.success) {
      return null;
    }

    return response.data as SessionInfo;
  }

  async updateSessionActivity(sessionId: string): Promise<void> {
    await HttpClient.put(`/auth/session/${sessionId}/activity`, {});
  }

  async endSession(sessionId: string): Promise<void> {
    await HttpClient.delete(`/auth/session/${sessionId}`);
  }

  async getUserSessions(userId: string): Promise<SessionInfo[]> {
    const response = await HttpClient.get(`/auth/sessions/${userId}`);

    if (!response.success) {
      return [];
    }

    return (response.data as SessionInfo[]) || [];
  }

  async endAllUserSessions(userId: string): Promise<void> {
    await HttpClient.delete(`/auth/sessions/${userId}`);
  }

  // ========================================
  // Email Verification
  // ========================================

  async sendVerificationEmail(email: string, name: string): Promise<void> {
    const response = await HttpClient.post('/auth/verify-email/send', {
      email,
      name,
    });

    if (!response.success) {
      throw new Error(response.message || 'Failed to send verification email');
    }
  }

  async verifyEmail(token: string): Promise<EmailVerificationResult> {
    const response = await HttpClient.post('/auth/verify-email', { token });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Email verification failed',
      };
    }

    return {
      success: true,
      user: (response.data as any).user,
    };
  }

  async resendVerificationEmail(email: string): Promise<void> {
    await this.sendVerificationEmail(email, '');
  }

  // ========================================
  // Password Reset
  // ========================================

  async sendPasswordResetEmail(email: string): Promise<void> {
    const response = await HttpClient.post('/auth/password-reset/send', { email });

    if (!response.success) {
      throw new Error(response.message || 'Failed to send password reset email');
    }
  }

  async validatePasswordResetToken(token: string): Promise<boolean> {
    const response = await HttpClient.post('/auth/password-reset/validate', { token });
    return response.success;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedPassword = await this.hashPassword(newPassword);

    const response = await HttpClient.post('/auth/password-reset', {
      token,
      hashedPassword,
    });

    if (!response.success) {
      throw new Error(response.message || 'Password reset failed');
    }
  }

  // ========================================
  // Two-Factor Authentication
  // ========================================

  async generateTwoFactorSetup(userId: string): Promise<TwoFactorSetup> {
    const response = await HttpClient.post('/auth/2fa/setup', { userId });

    if (!response.success) {
      throw new Error(response.message || '2FA setup failed');
    }

    return response.data as TwoFactorSetup;
  }

  async enableTwoFactor(userId: string, verificationCode: string): Promise<string[]> {
    const response = await HttpClient.post('/auth/2fa/enable', {
      userId,
      verificationCode,
    });

    if (!response.success) {
      throw new Error(response.message || '2FA enable failed');
    }

    return (response.data as any).backupCodes;
  }

  async disableTwoFactor(userId: string, verificationCode: string): Promise<void> {
    const response = await HttpClient.post('/auth/2fa/disable', {
      userId,
      verificationCode,
    });

    if (!response.success) {
      throw new Error(response.message || '2FA disable failed');
    }
  }

  async verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
    const response = await HttpClient.post('/auth/2fa/verify', {
      userId,
      code,
    });

    return response.success;
  }

  async generateBackupCodes(userId: string): Promise<string[]> {
    const response = await HttpClient.post('/auth/2fa/backup-codes', { userId });

    if (!response.success) {
      throw new Error(response.message || 'Backup codes generation failed');
    }

    return (response.data as any).backupCodes;
  }

  // ========================================
  // Biometric Authentication
  // ========================================

  async enableBiometricAuth(userId: string, publicKey: string): Promise<void> {
    const response = await HttpClient.post('/auth/biometric/enable', {
      userId,
      publicKey,
    });

    if (!response.success) {
      throw new Error(response.message || 'Biometric enable failed');
    }
  }

  async disableBiometricAuth(userId: string): Promise<void> {
    const response = await HttpClient.post('/auth/biometric/disable', { userId });

    if (!response.success) {
      throw new Error(response.message || 'Biometric disable failed');
    }
  }

  async verifyBiometricAuth(userId: string, signature: string): Promise<boolean> {
    const response = await HttpClient.post('/auth/biometric/verify', {
      userId,
      signature,
    });

    return response.success;
  }

  // ========================================
  // Notifications
  // ========================================

  async sendWelcomeNotification(user: User): Promise<void> {
    await HttpClient.post('/notifications/welcome', { userId: user.id });
  }

  async sendLoginNotification(user: User, deviceInfo: DeviceInfo): Promise<void> {
    await HttpClient.post('/notifications/login', {
      userId: user.id,
      deviceInfo,
    });
  }

  async sendSecurityAlert(
    user: User,
    alertType: SecurityAlertType,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await HttpClient.post('/notifications/security-alert', {
      userId: user.id,
      alertType,
      metadata,
    });
  }

  // ========================================
  // Helper Methods
  // ========================================

  private generateSecureToken(type: string, userId: string): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    const payload = `${type}_${userId}_${timestamp}_${random}`;

    return CryptoJS.SHA256(payload).toString();
  }

  private async simulateLogin(request: LoginRequest): Promise<LoginResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Map emails and mobile numbers to correct user data (case-insensitive)
    const userMap: Record<string, { id: string; name: string }> = {
      // Email mappings
      'john@example.com': { id: 'user1', name: 'John Doe' },
      'sarah@example.com': { id: 'user2', name: 'Sarah Johnson' },
      'mike@example.com': { id: 'user3', name: 'Mike Chen' },
      'emma@example.com': { id: 'user4', name: 'Emma Davis' },
      'alex@example.com': { id: 'user5', name: 'Alex Wilson' },
      'lisa@example.com': { id: 'user6', name: 'Lisa Thompson' },
      // Mobile number mappings
      '03016933184': { id: 'user1', name: 'John Doe' },
      '+923016933184': { id: 'user1', name: 'John Doe' },
      '03451234567': { id: 'user2', name: 'Sarah Johnson' },
      '+923451234567': { id: 'user2', name: 'Sarah Johnson' },
      '03009876543': { id: 'user3', name: 'Mike Chen' },
      '+923009876543': { id: 'user3', name: 'Mike Chen' },
    };

    const userData = userMap[request.email.toLowerCase()] || {
      id: `user_${Date.now()}`,
      name: 'Unknown User',
    };
    authLogger.debug('🔍 Auth simulateLogin - Email:', request.email, '-> User:', userData);

    // Mock user data
    const mockUser = {
      id: userData.id,
      email: request.email,
      name: userData.name,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'system',
        language: 'en',
        currency: 'USD',
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          listUpdates: true,
          reminders: true,
          promotions: false,
        },
        privacy: {
          profileVisibility: 'private',
          locationSharing: false,
          analyticsOptIn: true,
        },
      },
    };

    const tokens = await this.generateTokens(mockUser as unknown as User, request.deviceInfo);

    return {
      success: true,
      user: mockUser as unknown as User,
      tokens,
      sessionId: this.generateSecureToken('session', mockUser.id),
      requiresTwoFactor: false,
      requiresEmailVerification: false,
    };
  }

  private async simulateRegister(request: RegisterRequest): Promise<RegisterResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock user data
    const mockUser = {
      id: `user_${Date.now()}`,
      email: request.email,
      name: `${request.firstName} ${request.lastName}`,
      mobile: request.email.includes('@') ? undefined : request.email, // If email is actually a mobile number
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        theme: 'system',
        language: 'en',
        currency: 'USD',
        notifications: {
          pushEnabled: true,
          emailEnabled: true,
          listUpdates: true,
          reminders: true,
          promotions: request.marketingConsent || false,
        },
        privacy: {
          profileVisibility: 'private',
          locationSharing: false,
          analyticsOptIn: true,
        },
      },
    };

    const tokens = await this.generateTokens(mockUser as unknown as User, request.deviceInfo);

    // Add the new user to the single source of truth
    try {
      await this.addUserToDatabase(mockUser as unknown as User);
      authLogger.debug('✅ Added new user to database:', mockUser.name);
    } catch (error) {
      authLogger.error('❌ Failed to add user to database:', error);
    }

    return {
      success: true,
      user: mockUser as unknown as User,
      tokens,
      sessionId: this.generateSecureToken('session', mockUser.id),
      requiresEmailVerification: true,
    };
  }

  /**
   * Add a newly registered user to the social service database
   */
  private async addUserToDatabase(user: User): Promise<void> {
    try {
      const USERS_KEY = 'registered_users'; // Single source of truth

      // Get existing users
      const stored = await AsyncStorage.getItem(USERS_KEY);
      const existingUsers: User[] = stored ? JSON.parse(stored) : [];

      authLogger.debug('🔍 Auth addUserToDatabase - Key:', USERS_KEY);
      authLogger.debug('🔍 Auth addUserToDatabase - Raw stored:', stored);
      authLogger.debug('🔍 Auth addUserToDatabase - Existing users:', existingUsers.length);

      // Check if user already exists
      const userExists = existingUsers.some(existingUser => existingUser.id === user.id);
      if (userExists) {
        authLogger.debug('🔄 User already exists in database:', user.name);
        return;
      }

      // Add the new user
      existingUsers.push(user);

      // Save back to storage
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existingUsers));
      authLogger.debug('💾 Saved user to database. Total users:', existingUsers.length);
    } catch (error) {
      authLogger.error('❌ Error adding user to database:', error);
      throw error;
    }
  }
}

// ========================================
// Export
// ========================================

export const authService = new AuthServiceImpl();
