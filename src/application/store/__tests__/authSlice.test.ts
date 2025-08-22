/**
 * Auth Slice Tests
 */

import authReducer, {
  setLoading,
  setTokens,
  updateUser,
  updatePreferences,
  setBiometricEnabled,
  setError,
  clearError,
  logout,
  resetAuth,
  AuthState,
  User,
} from '../slices/authSlice';
import { createMockUser } from '@test/mocks';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    biometricEnabled: false,
    lastLoginTime: null,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('setLoading', () => {
    it('should set loading to true and clear error', () => {
      const previousState: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const actual = authReducer(previousState, setLoading(true));

      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBeNull();
    });

    it('should set loading to false', () => {
      const previousState: AuthState = {
        ...initialState,
        isLoading: true,
      };

      const actual = authReducer(previousState, setLoading(false));

      expect(actual.isLoading).toBe(false);
    });
  });

  describe('setTokens', () => {
    it('should set authentication tokens and user', () => {
      const mockUser = createMockUser();
      const tokens = {
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      };

      const actual = authReducer(initialState, setTokens(tokens));

      expect(actual.token).toBe('access-token');
      expect(actual.refreshToken).toBe('refresh-token');
      expect(actual.user).toEqual(mockUser);
      expect(actual.isAuthenticated).toBe(true);
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBeNull();
      expect(actual.lastLoginTime).toBeTruthy();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', () => {
      const mockUser = createMockUser();
      const previousState: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const updates = {
        displayName: 'Updated Name',
        email: 'updated@example.com',
      };

      const actual = authReducer(previousState, updateUser(updates));

      expect(actual.user?.displayName).toBe('Updated Name');
      expect(actual.user?.email).toBe('updated@example.com');
      expect(actual.user?.updatedAt).toBeTruthy();
    });

    it('should not update if user is null', () => {
      const actual = authReducer(
        initialState,
        updateUser({ displayName: 'Test' }),
      );

      expect(actual.user).toBeNull();
    });
  });

  describe('updatePreferences', () => {
    it('should update user preferences', () => {
      const mockUser = createMockUser();
      const previousState: AuthState = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const preferenceUpdates = {
        theme: 'dark' as const,
        notifications: false,
      };

      const actual = authReducer(
        previousState,
        updatePreferences(preferenceUpdates),
      );

      expect(actual.user?.preferences.theme).toBe('dark');
      expect(actual.user?.preferences.notifications).toBe(false);
      expect(actual.user?.updatedAt).toBeTruthy();
    });
  });

  describe('setBiometricEnabled', () => {
    it('should set biometric authentication status', () => {
      const actual = authReducer(initialState, setBiometricEnabled(true));

      expect(actual.biometricEnabled).toBe(true);
    });
  });

  describe('setError', () => {
    it('should set error and stop loading', () => {
      const previousState: AuthState = {
        ...initialState,
        isLoading: true,
      };

      const actual = authReducer(
        previousState,
        setError('Authentication failed'),
      );

      expect(actual.error).toBe('Authentication failed');
      expect(actual.isLoading).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error', () => {
      const previousState: AuthState = {
        ...initialState,
        error: 'Some error',
      };

      const actual = authReducer(previousState, clearError());

      expect(actual.error).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear authentication state but keep biometric preference', () => {
      const mockUser = createMockUser();
      const previousState: AuthState = {
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
        biometricEnabled: true,
        lastLoginTime: '2023-01-01T00:00:00.000Z',
        error: null,
      };

      const actual = authReducer(previousState, logout());

      expect(actual.user).toBeNull();
      expect(actual.token).toBeNull();
      expect(actual.refreshToken).toBeNull();
      expect(actual.isAuthenticated).toBe(false);
      expect(actual.isLoading).toBe(false);
      expect(actual.lastLoginTime).toBeNull();
      expect(actual.error).toBeNull();
      expect(actual.biometricEnabled).toBe(true); // Should be preserved
    });
  });

  describe('resetAuth', () => {
    it('should reset to initial state', () => {
      const mockUser = createMockUser();
      const previousState: AuthState = {
        user: mockUser,
        token: 'token',
        refreshToken: 'refresh-token',
        isAuthenticated: true,
        isLoading: false,
        biometricEnabled: true,
        lastLoginTime: '2023-01-01T00:00:00.000Z',
        error: null,
      };

      const actual = authReducer(previousState, resetAuth());

      expect(actual).toEqual(initialState);
    });
  });
});
