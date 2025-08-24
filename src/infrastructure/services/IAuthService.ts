// ========================================
// Auth Service Interface - Infrastructure Contract
// ========================================

import type { User } from '@/domain/entities/User';

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly scope: string[];
}

export interface SessionTokens extends AuthTokens {
  readonly sessionId: string;
  readonly temporary: boolean;
}

export interface DeviceInfo {
  readonly deviceId: string;
  readonly platform: string;
  readonly osVersion: string;
  readonly appVersion: string;
  readonly userAgent?: string;
}

/**
 * Authentication Service Interface
 * Defines all authentication-related operations
 */
export interface IAuthService {
  // ========================================
  // Password Management
  // ========================================

  /**
   * Hashes a password using secure algorithms
   * @param password - Plain text password
   * @returns Promise resolving to hashed password
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Verifies a password against its hash
   * @param password - Plain text password
   * @param hashedPassword - Hashed password
   * @returns Promise resolving to verification result
   */
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;

  /**
   * Stores user credentials securely
   * @param userId - User ID
   * @param hashedPassword - Hashed password
   * @returns Promise resolving when credentials are stored
   */
  storeUserCredentials(userId: string, hashedPassword: string): Promise<void>;

  /**
   * Updates user password
   * @param userId - User ID
   * @param newHashedPassword - New hashed password
   * @returns Promise resolving when password is updated
   */
  updateUserPassword(userId: string, newHashedPassword: string): Promise<void>;

  // ========================================
  // Token Management
  // ========================================

  /**
   * Generates authentication tokens for a user
   * @param user - User entity
   * @param deviceInfo - Optional device information
   * @returns Promise resolving to authentication tokens
   */
  generateTokens(user: User, deviceInfo?: DeviceInfo): Promise<AuthTokens>;

  /**
   * Generates temporary session tokens (for 2FA flow)
   * @param user - User entity
   * @returns Promise resolving to session tokens
   */
  generateSessionTokens(user: User): Promise<SessionTokens>;

  /**
   * Refreshes authentication tokens
   * @param refreshToken - Current refresh token
   * @param deviceInfo - Optional device information
   * @returns Promise resolving to new tokens
   */
  refreshTokens(refreshToken: string, deviceInfo?: DeviceInfo): Promise<AuthTokens>;

  /**
   * Validates an access token
   * @param token - Access token to validate
   * @returns Promise resolving to validation result with user info
   */
  validateToken(token: string): Promise<TokenValidationResult>;

  /**
   * Revokes authentication tokens
   * @param tokens - Tokens to revoke
   * @returns Promise resolving when tokens are revoked
   */
  revokeTokens(tokens: Pick<AuthTokens, 'accessToken' | 'refreshToken'>): Promise<void>;

  /**
   * Revokes all tokens for a user
   * @param userId - User ID
   * @returns Promise resolving when all tokens are revoked
   */
  revokeAllUserTokens(userId: string): Promise<void>;

  // ========================================
  // Session Management
  // ========================================

  /**
   * Creates a new user session
   * @param userId - User ID
   * @param deviceInfo - Device information
   * @returns Promise resolving to session ID
   */
  createSession(userId: string, deviceInfo: DeviceInfo): Promise<string>;

  /**
   * Gets active session for a user
   * @param sessionId - Session ID
   * @returns Promise resolving to session info
   */
  getSession(sessionId: string): Promise<SessionInfo | null>;

  /**
   * Updates session activity
   * @param sessionId - Session ID
   * @returns Promise resolving when session is updated
   */
  updateSessionActivity(sessionId: string): Promise<void>;

  /**
   * Ends a user session
   * @param sessionId - Session ID
   * @returns Promise resolving when session is ended
   */
  endSession(sessionId: string): Promise<void>;

  /**
   * Gets all active sessions for a user
   * @param userId - User ID
   * @returns Promise resolving to array of sessions
   */
  getUserSessions(userId: string): Promise<SessionInfo[]>;

  /**
   * Ends all sessions for a user
   * @param userId - User ID
   * @returns Promise resolving when all sessions are ended
   */
  endAllUserSessions(userId: string): Promise<void>;

  // ========================================
  // Email Verification
  // ========================================

  /**
   * Sends email verification
   * @param email - User email
   * @param name - User name
   * @returns Promise resolving when email is sent
   */
  sendVerificationEmail(email: string, name: string): Promise<void>;

  /**
   * Verifies email with token
   * @param token - Verification token
   * @returns Promise resolving to verification result
   */
  verifyEmail(token: string): Promise<EmailVerificationResult>;

  /**
   * Resends verification email
   * @param email - User email
   * @returns Promise resolving when email is sent
   */
  resendVerificationEmail(email: string): Promise<void>;

  // ========================================
  // Password Reset
  // ========================================

  /**
   * Sends password reset email
   * @param email - User email
   * @returns Promise resolving when email is sent
   */
  sendPasswordResetEmail(email: string): Promise<void>;

  /**
   * Validates password reset token
   * @param token - Reset token
   * @returns Promise resolving to validation result
   */
  validatePasswordResetToken(token: string): Promise<boolean>;

  /**
   * Resets password with token
   * @param token - Reset token
   * @param newPassword - New password (plain text)
   * @returns Promise resolving when password is reset
   */
  resetPassword(token: string, newPassword: string): Promise<void>;

  // ========================================
  // Two-Factor Authentication
  // ========================================

  /**
   * Generates 2FA setup data
   * @param userId - User ID
   * @returns Promise resolving to 2FA setup data
   */
  generateTwoFactorSetup(userId: string): Promise<TwoFactorSetup>;

  /**
   * Enables 2FA for a user
   * @param userId - User ID
   * @param verificationCode - Verification code
   * @returns Promise resolving to backup codes
   */
  enableTwoFactor(userId: string, verificationCode: string): Promise<string[]>;

  /**
   * Disables 2FA for a user
   * @param userId - User ID
   * @param verificationCode - Verification code
   * @returns Promise resolving when 2FA is disabled
   */
  disableTwoFactor(userId: string, verificationCode: string): Promise<void>;

  /**
   * Verifies 2FA code
   * @param userId - User ID
   * @param code - 2FA code
   * @returns Promise resolving to verification result
   */
  verifyTwoFactorCode(userId: string, code: string): Promise<boolean>;

  /**
   * Generates backup codes
   * @param userId - User ID
   * @returns Promise resolving to backup codes
   */
  generateBackupCodes(userId: string): Promise<string[]>;

  // ========================================
  // Biometric Authentication
  // ========================================

  /**
   * Enables biometric authentication
   * @param userId - User ID
   * @param publicKey - Biometric public key
   * @returns Promise resolving when biometric auth is enabled
   */
  enableBiometricAuth(userId: string, publicKey: string): Promise<void>;

  /**
   * Disables biometric authentication
   * @param userId - User ID
   * @returns Promise resolving when biometric auth is disabled
   */
  disableBiometricAuth(userId: string): Promise<void>;

  /**
   * Verifies biometric authentication
   * @param userId - User ID
   * @param signature - Biometric signature
   * @returns Promise resolving to verification result
   */
  verifyBiometricAuth(userId: string, signature: string): Promise<boolean>;

  // ========================================
  // Notifications
  // ========================================

  /**
   * Sends welcome notification
   * @param user - User entity
   * @returns Promise resolving when notification is sent
   */
  sendWelcomeNotification(user: User): Promise<void>;

  /**
   * Sends login notification
   * @param user - User entity
   * @param deviceInfo - Device information
   * @returns Promise resolving when notification is sent
   */
  sendLoginNotification(user: User, deviceInfo: DeviceInfo): Promise<void>;

  /**
   * Sends security alert
   * @param user - User entity
   * @param alertType - Type of security alert
   * @param metadata - Additional metadata
   * @returns Promise resolving when alert is sent
   */
  sendSecurityAlert(
    user: User,
    alertType: SecurityAlertType,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}

// ========================================
// Supporting Types
// ========================================

export interface TokenValidationResult {
  readonly valid: boolean;
  readonly user?: User;
  readonly permissions?: string[];
  readonly expiresAt?: Date;
  readonly error?: string;
}

export interface SessionInfo {
  readonly id: string;
  readonly userId: string;
  readonly deviceInfo: DeviceInfo;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly lastAccessAt: Date;
  readonly expiresAt: Date;
  readonly ipAddress?: string;
  readonly userAgent?: string;
}

export interface EmailVerificationResult {
  readonly success: boolean;
  readonly user?: User;
  readonly error?: string;
}

export interface TwoFactorSetup {
  readonly qrCode: string;
  readonly secret: string;
  readonly backupCodes: string[];
}

export type SecurityAlertType =
  | 'new_login'
  | 'password_changed'
  | 'email_changed'
  | 'suspicious_activity'
  | 'account_locked'
  | 'failed_login_attempts';

// ========================================
// Auth Service Errors
// ========================================

export class AuthServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class TokenExpiredError extends AuthServiceError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED', 401);
  }
}

export class InvalidTokenError extends AuthServiceError {
  constructor() {
    super('Token is invalid', 'INVALID_TOKEN', 401);
  }
}

export class InvalidCredentialsError extends AuthServiceError {
  constructor() {
    super('Invalid credentials provided', 'INVALID_CREDENTIALS', 401);
  }
}
