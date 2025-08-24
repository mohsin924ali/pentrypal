// ========================================
// Authentication & Authorization Types
// ========================================

export interface AuthState {
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly user: AuthUser | null;
  readonly tokens: AuthTokens | null;
  readonly permissions: UserPermissions;
  readonly lastLoginAt?: Date;
  readonly error?: AuthError;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar?: string;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly roles: UserRole[];
  readonly subscription: UserSubscription;
  readonly preferences: AuthUserPreferences;
}

export interface AuthUserPreferences {
  readonly biometricAuth: boolean;
  readonly sessionTimeout: number; // minutes
  readonly allowMultipleSessions: boolean;
  readonly loginNotifications: boolean;
}

export interface UserRole {
  readonly id: string;
  readonly name: string;
  readonly permissions: Permission[];
  readonly isDefault: boolean;
}

export interface Permission {
  readonly id: string;
  readonly resource: string;
  readonly action: string;
  readonly conditions?: PermissionCondition[];
}

export interface PermissionCondition {
  readonly field: string;
  readonly operator: 'eq' | 'ne' | 'in' | 'nin' | 'gt' | 'gte' | 'lt' | 'lte';
  readonly value: string | number | boolean | string[];
}

export interface UserPermissions {
  readonly canCreateLists: boolean;
  readonly canEditOwnLists: boolean;
  readonly canEditSharedLists: boolean;
  readonly canDeleteLists: boolean;
  readonly canInviteCollaborators: boolean;
  readonly canManagePantry: boolean;
  readonly canViewAnalytics: boolean;
  readonly canExportData: boolean;
  readonly canDeleteAccount: boolean;
  readonly maxListsAllowed: number;
  readonly maxCollaboratorsPerList: number;
}

export interface UserSubscription {
  readonly tier: 'free' | 'premium' | 'family' | 'enterprise';
  readonly status: 'active' | 'cancelled' | 'expired' | 'trial';
  readonly startDate: Date;
  readonly endDate?: Date;
  readonly trialEndsAt?: Date;
  readonly autoRenew: boolean;
  readonly paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  readonly id: string;
  readonly type: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  readonly last4?: string;
  readonly brand?: string;
  readonly expiryMonth?: number;
  readonly expiryYear?: number;
  readonly isDefault: boolean;
}

// ========================================
// Authentication Requests/Responses
// ========================================

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceInfo?: DeviceInfo;
}

export interface LoginResponse {
  readonly user: AuthUser;
  readonly tokens: AuthTokens;
  readonly requiresTwoFactor?: boolean;
  readonly twoFactorMethods?: TwoFactorMethod[];
}

export interface RegisterRequest {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly name: string;
  readonly acceptTerms: boolean;
  readonly marketingConsent?: boolean;
  readonly referralCode?: string;
  readonly deviceInfo?: DeviceInfo;
}

export interface RegisterResponse {
  readonly user: AuthUser;
  readonly tokens: AuthTokens;
  readonly verificationEmailSent: boolean;
}

export interface TwoFactorRequest {
  readonly code: string;
  readonly method: 'sms' | 'email' | 'authenticator';
  readonly rememberDevice?: boolean;
}

export interface TwoFactorMethod {
  readonly type: 'sms' | 'email' | 'authenticator';
  readonly enabled: boolean;
  readonly verified: boolean;
  readonly lastUsed?: Date;
}

export interface PasswordResetRequest {
  readonly email: string;
}

export interface PasswordResetResponse {
  readonly message: string;
  readonly emailSent: boolean;
  readonly resetTokenSent: boolean;
}

export interface PasswordChangeRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export interface EmailVerificationRequest {
  readonly token: string;
}

export interface RefreshTokenRequest {
  readonly refreshToken: string;
  readonly deviceInfo?: DeviceInfo;
}

export interface RefreshTokenResponse {
  readonly tokens: AuthTokens;
  readonly user?: AuthUser; // Include if user data changed
}

export interface LogoutRequest {
  readonly deviceId?: string;
  readonly logoutAllDevices?: boolean;
}

// ========================================
// Authentication Tokens
// ========================================

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number; // seconds
  readonly refreshExpiresIn: number; // seconds
  readonly scope: string[];
  readonly issuedAt: Date;
}

export interface TokenClaims {
  readonly sub: string; // user id
  readonly email: string;
  readonly name: string;
  readonly roles: string[];
  readonly permissions: string[];
  readonly iat: number;
  readonly exp: number;
  readonly iss: string;
  readonly aud: string;
  readonly jti: string;
  readonly deviceId?: string;
  readonly sessionId?: string;
}

// ========================================
// Device & Session Management
// ========================================

export interface DeviceInfo {
  readonly deviceId: string;
  readonly deviceName: string;
  readonly platform: 'ios' | 'android' | 'web';
  readonly osVersion: string;
  readonly appVersion: string;
  readonly pushToken?: string;
  readonly biometricCapable: boolean;
  readonly location?: DeviceLocation;
}

export interface DeviceLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly accuracy: number;
  readonly timestamp: Date;
}

export interface UserSession {
  readonly id: string;
  readonly userId: string;
  readonly deviceInfo: DeviceInfo;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly lastAccessAt: Date;
  readonly expiresAt: Date;
  readonly ipAddress: string;
  readonly userAgent: string;
}

// ========================================
// Biometric Authentication
// ========================================

export interface BiometricAuthConfig {
  readonly enabled: boolean;
  readonly availableTypes: BiometricType[];
  readonly enrolledTypes: BiometricType[];
  readonly fallbackToPassword: boolean;
  readonly maxAttempts: number;
}

export type BiometricType = 'fingerprint' | 'face' | 'iris' | 'voice';

export interface BiometricAuthRequest {
  readonly promptMessage: string;
  readonly fallbackTitle?: string;
  readonly cancelTitle?: string;
  readonly disableDeviceFallback?: boolean;
}

export interface BiometricAuthResult {
  readonly success: boolean;
  readonly error?: BiometricError;
  readonly warning?: string;
}

export interface BiometricError {
  readonly code: BiometricErrorCode;
  readonly message: string;
  readonly isRetryable: boolean;
}

export type BiometricErrorCode =
  | 'BiometricKeyInvalidated'
  | 'BiometricNotAvailable'
  | 'BiometricNotEnrolled'
  | 'BiometricUserCancel'
  | 'BiometricSystemCancel'
  | 'BiometricLockout'
  | 'BiometricLockoutPermanent'
  | 'BiometricUserFallback'
  | 'BiometricTooManyAttempts'
  | 'BiometricPasscodeNotSet'
  | 'BiometricAuthenticationFailed';

// ========================================
// Security Events
// ========================================

export interface SecurityEvent {
  readonly id: string;
  readonly userId: string;
  readonly type: SecurityEventType;
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  readonly description: string;
  readonly metadata: Record<string, unknown>;
  readonly deviceInfo?: DeviceInfo;
  readonly location?: DeviceLocation;
  readonly timestamp: Date;
  readonly resolved: boolean;
  readonly resolvedAt?: Date;
  readonly resolvedBy?: string;
}

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'login_suspicious'
  | 'password_changed'
  | 'email_changed'
  | 'two_factor_enabled'
  | 'two_factor_disabled'
  | 'account_locked'
  | 'account_unlocked'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'session_expired'
  | 'unauthorized_access_attempt'
  | 'data_export_requested'
  | 'account_deleted';

// ========================================
// Authentication Errors
// ========================================

export interface AuthError {
  readonly code: AuthErrorCode;
  readonly message: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;
  readonly retryable: boolean;
  readonly timestamp: Date;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_NOT_FOUND'
  | 'ACCOUNT_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'EMAIL_NOT_VERIFIED'
  | 'PASSWORD_EXPIRED'
  | 'TWO_FACTOR_REQUIRED'
  | 'INVALID_TWO_FACTOR_CODE'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'REFRESH_TOKEN_EXPIRED'
  | 'SESSION_EXPIRED'
  | 'INSUFFICIENT_PERMISSIONS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DEVICE_NOT_TRUSTED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'NETWORK_ERROR'
  | 'BIOMETRIC_ERROR'
  | 'UNKNOWN_ERROR';
