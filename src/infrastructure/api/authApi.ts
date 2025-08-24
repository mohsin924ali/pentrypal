// ========================================
// Authentication API Service
// ========================================

import { apiClient } from './apiClient';
import type {
  BackendLoginRequest,
  BackendLoginResponse,
  BackendRegisterRequest,
  BackendRegisterResponse,
  BackendBiometricLoginRequest,
  BackendRefreshTokenRequest,
  BackendTokens,
  BackendUser,
  BackendUserUpdate,
  BackendPasswordChangeRequest,
  BackendSecuritySettings,
  BackendBiometricAuthRequest,
  ApiResponse,
} from '../../shared/types/backend';

// ========================================
// Authentication API Class
// ========================================

export class AuthApi {
  // ========================================
  // Authentication Methods
  // ========================================

  /**
   * User login with email or phone
   */
  async login(request: BackendLoginRequest): Promise<ApiResponse<BackendLoginResponse>> {
    return apiClient.postPublic<BackendLoginResponse>('/auth/login', request);
  }

  /**
   * User registration
   */
  async register(request: BackendRegisterRequest): Promise<ApiResponse<BackendRegisterResponse>> {
    return apiClient.postPublic<BackendRegisterResponse>('/auth/register', request);
  }

  /**
   * Biometric authentication
   */
  async biometricLogin(
    request: BackendBiometricLoginRequest
  ): Promise<ApiResponse<BackendLoginResponse>> {
    return apiClient.postPublic<BackendLoginResponse>('/auth/biometric', request);
  }

  /**
   * Refresh access token
   */
  async refreshToken(request: BackendRefreshTokenRequest): Promise<ApiResponse<BackendTokens>> {
    return apiClient.postPublic<BackendTokens>('/auth/refresh', request);
  }

  /**
   * Logout (revoke tokens)
   */
  async logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/logout');
  }

  // ========================================
  // User Profile Methods
  // ========================================

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<ApiResponse<BackendUser>> {
    return apiClient.get<BackendUser>('/users/me');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: BackendUserUpdate): Promise<ApiResponse<BackendUser>> {
    return apiClient.put<BackendUser>('/users/me', data);
  }

  /**
   * Change password
   */
  async changePassword(request: BackendPasswordChangeRequest): Promise<ApiResponse<void>> {
    return apiClient.put<void>('/users/me/password', request);
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(
    file: File | Blob | { uri: string; type: string; name: string }
  ): Promise<ApiResponse<BackendUser>> {
    return apiClient.uploadFile<BackendUser>('/users/me/avatar', file, 'file');
  }

  /**
   * Remove user avatar
   */
  async removeAvatar(): Promise<ApiResponse<BackendUser>> {
    return apiClient.delete<BackendUser>('/users/me/avatar');
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/users/me/deactivate', { password });
  }

  /**
   * Delete account permanently
   */
  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me', {
      skipErrorHandling: false,
    });
  }

  // ========================================
  // User Preferences Methods
  // ========================================

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/users/me/preferences');
  }

  /**
   * Update user preferences
   */
  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return apiClient.put<any>('/users/me/preferences', preferences);
  }

  // ========================================
  // Security Settings Methods
  // ========================================

  /**
   * Get security settings
   */
  async getSecuritySettings(): Promise<ApiResponse<BackendSecuritySettings>> {
    return apiClient.get<BackendSecuritySettings>('/users/me/security');
  }

  /**
   * Update security settings
   */
  async updateSecuritySettings(
    settings: Partial<BackendSecuritySettings>
  ): Promise<ApiResponse<BackendSecuritySettings>> {
    return apiClient.put<BackendSecuritySettings>('/users/me/security', settings);
  }

  /**
   * Enable biometric authentication
   */
  async enableBiometric(request: BackendBiometricAuthRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/users/me/biometric/enable', request);
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometric(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me/biometric');
  }

  // ========================================
  // Session Management Methods
  // ========================================

  /**
   * Get active sessions
   */
  async getSessions(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users/me/sessions');
  }

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/me/sessions/${sessionId}`);
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/users/me/sessions');
  }

  // ========================================
  // Account Recovery Methods
  // ========================================

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return apiClient.postPublic<void>('/auth/password-reset/request', { email });
  }

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(token: string): Promise<ApiResponse<{ valid: boolean }>> {
    return apiClient.postPublic<{ valid: boolean }>('/auth/password-reset/verify', { token });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return apiClient.postPublic<void>('/auth/password-reset/confirm', {
      token,
      new_password: newPassword,
    });
  }

  /**
   * Request email verification
   */
  async requestEmailVerification(): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/auth/email-verification/request');
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.postPublic<void>('/auth/email-verification/verify', { token });
  }

  // ========================================
  // Device Management Methods
  // ========================================

  /**
   * Register device for push notifications
   */
  async registerDevice(deviceToken: string, platform: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/users/me/devices', {
      device_token: deviceToken,
      platform,
    });
  }

  /**
   * Unregister device
   */
  async unregisterDevice(deviceToken: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/users/me/devices/${deviceToken}`);
  }

  /**
   * Get registered devices
   */
  async getDevices(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users/me/devices');
  }

  // ========================================
  // Account Activity Methods
  // ========================================

  /**
   * Get account activity log
   */
  async getActivityLog(limit: number = 50, offset: number = 0): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users/me/activity', {
      limit,
      offset,
    });
  }

  /**
   * Get login history
   */
  async getLoginHistory(limit: number = 20): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/users/me/login-history', { limit });
  }

  // ========================================
  // Data Export Methods
  // ========================================

  /**
   * Request data export
   */
  async requestDataExport(): Promise<ApiResponse<{ export_id: string }>> {
    return apiClient.post<{ export_id: string }>('/users/me/export');
  }

  /**
   * Get data export status
   */
  async getDataExportStatus(exportId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/users/me/export/${exportId}`);
  }

  /**
   * Download data export
   */
  async downloadDataExport(exportId: string): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(`/users/me/export/${exportId}/download`);
  }
}

// ========================================
// Default Export
// ========================================

export const authApi = new AuthApi();
