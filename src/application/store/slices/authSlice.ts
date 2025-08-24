// ========================================
// Auth Slice - Secure Authentication State Management
// ========================================

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser as User } from '../../../shared/types/auth';
import type { AuthTokens, DeviceInfo } from '../../../shared/types/auth';

// Temporary form data types
interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

// ========================================
// State Types
// ========================================

export interface AuthState {
  // User data
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isEmailVerified: boolean;

  // Loading states
  readonly isLoading: boolean;
  readonly isLoggingIn: boolean;
  readonly isRegistering: boolean;
  readonly isRefreshingToken: boolean;
  readonly isLoggingOut: boolean;

  // Token management
  readonly tokens: AuthTokens | null;
  readonly lastTokenRefresh: string | null;
  readonly tokenExpiresAt: string | null;

  // Security features
  readonly isBiometricEnabled: boolean;
  readonly isTwoFactorEnabled: boolean;
  // 2FA state removed as not needed
  readonly sessionId: string | null;

  // Device and session info
  readonly deviceInfo: DeviceInfo | null;
  readonly lastLoginAt: string | null;
  readonly loginAttempts: number;
  readonly isAccountLocked: boolean;
  readonly lockoutExpiresAt: string | null;

  // Errors
  readonly error: string | null;
  readonly lastError: AuthError | null;
}

// Auth error types
export interface AuthError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly timestamp: string;
  readonly attemptCount?: number;
}

// Auth request types
export interface LoginRequest extends LoginFormData {
  readonly deviceInfo: DeviceInfo;
  readonly location?: GeographicLocation;
}

export interface RegisterRequest extends RegisterFormData {
  readonly deviceInfo: DeviceInfo;
  readonly location?: GeographicLocation;
}

export interface BiometricLoginRequest {
  readonly userId: string;
  readonly signature: string;
  readonly deviceInfo: DeviceInfo;
}

// 2FA types removed as not needed

export interface GeographicLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly city: string;
  readonly ipAddress: string;
}

// ========================================
// Initial State
// ========================================

const initialState: AuthState = {
  // User data
  user: null,
  isAuthenticated: false,
  isEmailVerified: false,

  // Loading states
  isLoading: false,
  isLoggingIn: false,
  isRegistering: false,
  isRefreshingToken: false,
  isLoggingOut: false,

  // Token management
  tokens: null,
  lastTokenRefresh: null,
  tokenExpiresAt: null,

  // Security features
  isBiometricEnabled: false,
  isTwoFactorEnabled: false,
  // 2FA state removed
  sessionId: null,

  // Device and session info
  deviceInfo: null,
  lastLoginAt: null,
  loginAttempts: 0,
  isAccountLocked: false,
  lockoutExpiresAt: null,

  // Errors
  error: null,
  lastError: null,
};

// ========================================
// Async Thunks
// ========================================

/**
 * Login user with email and password
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (request: LoginRequest, { rejectWithValue }) => {
    try {
      // Import auth service dynamically to avoid circular dependencies
      const { authService } = await import('../../../infrastructure/services/authService');

      const response = await authService.login(request);

      if (!response.success) {
        return rejectWithValue({
          code: response.errorCode || 'LOGIN_FAILED',
          message: response.message || 'Login failed',
          timestamp: new Date().toISOString(),
        });
      }

      // Initialize API services with tokens
      if (response.tokens) {
        const { initializeApiServices } = await import('../../../infrastructure/api');
        const backendTokens = {
          access_token: response.tokens.accessToken,
          refresh_token: response.tokens.refreshToken,
          token_type: 'bearer' as const,
          expires_in: response.tokens.expiresIn,
        };
        initializeApiServices(backendTokens);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Register new user
 */
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (request: RegisterRequest, { rejectWithValue }) => {
    try {
      const { authService } = await import('../../../infrastructure/services/authService');

      const response = await authService.register(request);

      if (!response.success) {
        return rejectWithValue({
          code: response.errorCode || 'REGISTRATION_FAILED',
          message: response.message || 'Registration failed',
          timestamp: new Date().toISOString(),
        });
      }

      // Initialize API services with tokens
      if (response.tokens) {
        const { initializeApiServices } = await import('../../../infrastructure/api');
        const backendTokens = {
          access_token: response.tokens.accessToken,
          refresh_token: response.tokens.refreshToken,
          token_type: 'bearer' as const,
          expires_in: response.tokens.expiresIn,
        };
        initializeApiServices(backendTokens);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Login with biometric authentication
 */
export const loginWithBiometric = createAsyncThunk(
  'auth/loginWithBiometric',
  async (request: BiometricLoginRequest, { rejectWithValue }) => {
    try {
      const { authService } = await import('../../../infrastructure/services/authService');

      const response = await authService.loginWithBiometric(request);

      if (!response.success) {
        return rejectWithValue({
          code: response.errorCode || 'BIOMETRIC_LOGIN_FAILED',
          message: response.message || 'Biometric login failed',
          timestamp: new Date().toISOString(),
        });
      }

      // Initialize API services with tokens
      if (response.tokens) {
        const { initializeApiServices } = await import('../../../infrastructure/api');
        const backendTokens = {
          access_token: response.tokens.accessToken,
          refresh_token: response.tokens.refreshToken,
          token_type: 'bearer' as const,
          expires_in: response.tokens.expiresIn,
        };
        initializeApiServices(backendTokens);
      }

      return response;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'BIOMETRIC_ERROR',
        message: error.message || 'Biometric authentication error',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// 2FA functionality removed as not needed

/**
 * Refresh authentication tokens
 */
export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { tokens, deviceInfo } = state.auth;

      if (!tokens?.refreshToken) {
        return rejectWithValue({
          code: 'NO_REFRESH_TOKEN',
          message: 'No refresh token available',
          timestamp: new Date().toISOString(),
        });
      }

      const { authService } = await import('../../../infrastructure/services/authService');

      const newTokens = await authService.refreshTokens(
        tokens.refreshToken,
        deviceInfo || undefined
      );

      return newTokens;
    } catch (error: any) {
      return rejectWithValue({
        code: error.code || 'NETWORK_ERROR',
        message: error.message || 'Network error occurred',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Logout user
 */
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const { tokens } = state.auth;

      console.log('🔄 Starting logout process...');

      // Always attempt logout, even with potentially corrupted tokens
      const { authService } = await import('../../../infrastructure/services/authService');
      await authService.logout(tokens as any); // Cast to handle potential null/corrupted tokens

      // Clear API authentication
      const { clearApiAuthentication } = await import('../../../infrastructure/api');
      clearApiAuthentication();

      console.log('✅ Logout process completed successfully');
      return { success: true };
    } catch (error: any) {
      // Even if logout fails on server, clear local state
      console.warn('⚠️ Logout error (will still clear local state):', error);

      // Ensure API authentication is cleared even on error
      try {
        const { clearApiAuthentication } = await import('../../../infrastructure/api');
        clearApiAuthentication();
      } catch (clearError) {
        console.warn('Failed to clear API authentication:', clearError);
      }

      return { success: true }; // Always return success to clear local state
    }
  }
);

// ========================================
// Profile Photo Actions
// ========================================

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file: File | Blob | { uri: string; type: string; name: string }, { rejectWithValue }) => {
    try {
      console.log('📸 Starting avatar upload...');

      const { authApi } = await import('../../../infrastructure/api');
      const response = await authApi.uploadAvatar(file);

      if (!response.data) {
        throw new Error(response.detail || 'Failed to upload avatar');
      }

      console.log('✅ Avatar uploaded successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Avatar upload failed:', error);
      return rejectWithValue({
        code: 'AVATAR_UPLOAD_ERROR',
        message: error.message || 'Failed to upload avatar',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

export const removeAvatar = createAsyncThunk(
  'auth/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🗑️ Starting avatar removal...');

      const { authApi } = await import('../../../infrastructure/api');
      const response = await authApi.removeAvatar();

      if (!response.data) {
        throw new Error(response.detail || 'Failed to remove avatar');
      }

      console.log('✅ Avatar removed successfully');
      return response.data;
    } catch (error: any) {
      console.error('❌ Avatar removal failed:', error);
      return rejectWithValue({
        code: 'AVATAR_REMOVE_ERROR',
        message: error.message || 'Failed to remove avatar',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// ========================================
// Auth Slice
// ========================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clear errors
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    // Clear authentication state (for force logout)
    clearAuth: state => {
      state.user = null;
      state.isAuthenticated = false;
      state.tokens = null;
      state.sessionId = null;
      state.lastTokenRefresh = null;
      state.tokenExpiresAt = null;
      // 2FA state removed
    },

    // Force logout (for corrupted tokens or emergency logout)
    forceLogout: state => {
      console.log('🚨 Force logout triggered - clearing all auth state');
      Object.assign(state, initialState);
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set device info
    setDeviceInfo: (state, action: PayloadAction<DeviceInfo>) => {
      state.deviceInfo = action.payload;
    },

    // Update security settings
    updateSecuritySettings: (
      state,
      action: PayloadAction<{
        isBiometricEnabled?: boolean;
        isTwoFactorEnabled?: boolean;
      }>
    ) => {
      const { isBiometricEnabled, isTwoFactorEnabled } = action.payload;
      if (isBiometricEnabled !== undefined) {
        state.isBiometricEnabled = isBiometricEnabled;
      }
      if (isTwoFactorEnabled !== undefined) {
        state.isTwoFactorEnabled = isTwoFactorEnabled;
      }
    },

    // Reset login attempts
    resetLoginAttempts: state => {
      state.loginAttempts = 0;
      state.isAccountLocked = false;
      state.lockoutExpiresAt = null;
    },

    // Set email verification status
    setEmailVerified: (state, action: PayloadAction<boolean>) => {
      state.isEmailVerified = action.payload;
    },

    // Hydrate auth state (from persistent storage)
    hydrateAuth: (state, action: PayloadAction<Partial<AuthState>>) => {
      const { user, tokens, isAuthenticated, sessionId, lastTokenRefresh, tokenExpiresAt } =
        action.payload;

      // Only restore if we have valid user and tokens
      if (user && tokens && isAuthenticated) {
        state.user = user;
        state.tokens = tokens;
        state.isAuthenticated = isAuthenticated;
        state.sessionId = sessionId || null;
        state.lastTokenRefresh = lastTokenRefresh || null;
        state.tokenExpiresAt = tokenExpiresAt || null;
      }
    },
  },
  extraReducers: builder => {
    // Login User
    builder
      .addCase(loginUser.pending, state => {
        state.isLoggingIn = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { user, tokens, sessionId, requiresTwoFactor } = action.payload;

        state.isLoggingIn = false;
        state.loginAttempts = 0;
        state.isAccountLocked = false;
        state.lockoutExpiresAt = null;
        state.lastLoginAt = new Date().toISOString();

        // 2FA removed - always proceed with full login
        {
          state.user = (user as unknown as User) || null;
          state.tokens = (tokens as AuthTokens) || null;
          state.sessionId = sessionId || null;
          state.isAuthenticated = true;
          state.tokenExpiresAt = tokens
            ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
            : null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.lastError = action.payload as AuthError;
        state.error = (action.payload as AuthError)?.message || 'Login failed';
        state.loginAttempts += 1;

        // Lock account after 5 failed attempts
        if (state.loginAttempts >= 5) {
          state.isAccountLocked = true;
          state.lockoutExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
        }
      });

    // Register User
    builder
      .addCase(registerUser.pending, state => {
        state.isRegistering = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        const { user, tokens, sessionId, requiresEmailVerification } = action.payload;

        state.isRegistering = false;
        // Don't automatically log in after registration
        // User should be redirected to login screen
        state.user = null;
        state.tokens = null;
        state.sessionId = null;
        state.isAuthenticated = false;
        state.isEmailVerified = false;
        state.tokenExpiresAt = null;
        state.lastLoginAt = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isRegistering = false;
        state.lastError = action.payload as AuthError;
        state.error = (action.payload as AuthError)?.message || 'Registration failed';
      });

    // Biometric Login
    builder
      .addCase(loginWithBiometric.pending, state => {
        state.isLoggingIn = true;
        state.error = null;
      })
      .addCase(loginWithBiometric.fulfilled, (state, action) => {
        const { user, tokens, sessionId } = action.payload;

        state.isLoggingIn = false;
        state.user = (user as unknown as User) || null;
        state.tokens = (tokens as AuthTokens) || null;
        state.sessionId = sessionId || null;
        state.isAuthenticated = true;
        state.tokenExpiresAt = tokens
          ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString()
          : null;
        state.lastLoginAt = new Date().toISOString();
        state.loginAttempts = 0;
      })
      .addCase(loginWithBiometric.rejected, (state, action) => {
        state.isLoggingIn = false;
        state.lastError = action.payload as AuthError;
        state.error = (action.payload as AuthError)?.message || 'Biometric login failed';
      });

    // 2FA handlers removed as not needed

    // Refresh Tokens
    builder
      .addCase(refreshTokens.pending, state => {
        state.isRefreshingToken = true;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        const tokens = action.payload;

        state.isRefreshingToken = false;
        state.tokens = tokens as AuthTokens;
        state.lastTokenRefresh = new Date().toISOString();
        state.tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.isRefreshingToken = false;
        state.lastError = action.payload as AuthError;

        // If refresh fails, clear auth state
        state.user = null;
        state.isAuthenticated = false;
        state.tokens = null;
        state.sessionId = null;
      });

    // Logout User
    builder
      .addCase(logoutUser.pending, state => {
        state.isLoggingOut = true;
      })
      .addCase(logoutUser.fulfilled, state => {
        // Clear all auth state
        Object.assign(state, initialState);
      })
      .addCase(logoutUser.rejected, state => {
        // Even if logout fails, clear local state
        Object.assign(state, initialState);
      })

      // Avatar Upload
      .addCase(uploadAvatar.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload) {
          // Update user with the full updated user data from backend
          state.user = {
            ...state.user,
            avatar: action.payload.avatar_url,
            updatedAt: action.payload.updated_at,
          };
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
        state.lastError = action.payload as AuthError;
      })

      // Avatar Remove
      .addCase(removeAvatar.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeAvatar.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user && action.payload) {
          // Update user with the full updated user data from backend
          state.user = {
            ...state.user,
            avatar: action.payload.avatar_url, // Should be null after removal
            updatedAt: action.payload.updated_at,
          };
        }
      })
      .addCase(removeAvatar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as AuthError;
        state.lastError = action.payload as AuthError;
      });
  },
});

// ========================================
// Actions and Selectors
// ========================================

export const {
  clearError,
  clearAuth,
  forceLogout,
  updateUserProfile,
  setDeviceInfo,
  updateSecuritySettings,
  resetLoginAttempts,
  setEmailVerified,
  hydrateAuth,
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading || state.auth.isLoggingIn || state.auth.isRegistering;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectTokens = (state: { auth: AuthState }) => state.auth.tokens;
export const selectSecuritySettings = (state: { auth: AuthState }) => ({
  isBiometricEnabled: state.auth.isBiometricEnabled,
  isTwoFactorEnabled: state.auth.isTwoFactorEnabled,
});

export default authSlice.reducer;
