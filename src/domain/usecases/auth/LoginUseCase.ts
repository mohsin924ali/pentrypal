// ========================================
// Login Use Case - Domain Business Logic
// ========================================

import type { IUserRepository } from '../../repositories/IUserRepository';
import type { AuthTokens, LoginRequest, LoginResponse } from '@/types/auth';
import type { User } from '../../entities/User';

export interface IAuthService {
  validateCredentials(email: string, password: string): Promise<boolean>;
  generateTokens(user: User): Promise<AuthTokens>;
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
}

export interface ISecurityService {
  checkAccountSecurity(user: User): Promise<SecurityCheckResult>;
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  isDeviceTrusted(deviceId: string, userId: string): Promise<boolean>;
  requiresTwoFactor(user: User): boolean;
}

export interface SecurityCheckResult {
  readonly isBlocked: boolean;
  readonly reason?: string;
  readonly blockedUntil?: Date;
  readonly requiresTwoFactor: boolean;
  readonly suspiciousActivity: boolean;
}

export interface SecurityEvent {
  readonly type: 'login_attempt' | 'login_success' | 'login_failed' | 'suspicious_activity';
  readonly userId: string;
  readonly deviceInfo?: DeviceInfo;
  readonly location?: GeographicLocation;
  readonly metadata?: Record<string, unknown>;
}

export interface DeviceInfo {
  readonly deviceId: string;
  readonly platform: string;
  readonly osVersion: string;
  readonly appVersion: string;
  readonly userAgent?: string;
}

export interface GeographicLocation {
  readonly latitude: number;
  readonly longitude: number;
  readonly country: string;
  readonly city: string;
  readonly ipAddress: string;
}

/**
 * Login Use Case
 * Handles user authentication with security checks and business rules
 */
export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly securityService: ISecurityService
  ) {}

  /**
   * Executes the login use case
   * @param request - Login request data
   * @returns Promise resolving to login response
   */
  async execute(request: LoginRequest): Promise<LoginResponse> {
    // Validate input
    this.validateRequest(request);

    // Log login attempt
    await this.logLoginAttempt(request);

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(request.email);

      if (!user) {
        await this.handleFailedLogin(request, 'USER_NOT_FOUND');
        throw new LoginError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Check account status
      this.validateAccountStatus(user);

      // Perform security checks
      const securityCheck = await this.securityService.checkAccountSecurity(user);

      if (securityCheck.isBlocked) {
        await this.handleBlockedAccount(user, securityCheck);
        throw new LoginError(
          securityCheck.reason ?? 'Account is temporarily blocked',
          'ACCOUNT_BLOCKED'
        );
      }

      // Validate credentials
      const isValidPassword = await this.authService.verifyPassword(
        request.password,
        user.password // This would be stored in a separate auth entity
      );

      if (!isValidPassword) {
        await this.handleFailedLogin(request, 'INVALID_PASSWORD', user.id);
        throw new LoginError('Invalid email or password', 'INVALID_CREDENTIALS');
      }

      // Check if two-factor authentication is required
      const requiresTwoFactor =
        this.securityService.requiresTwoFactor(user) || securityCheck.requiresTwoFactor;

      if (requiresTwoFactor) {
        return await this.handleTwoFactorRequired(user, request);
      }

      // Generate authentication tokens
      const tokens = await this.authService.generateTokens(user);

      // Update user's last login
      const updatedUser = await this.userRepository.updateLastLogin(user.id);

      // Log successful login
      await this.logSuccessfulLogin(updatedUser, request);

      return {
        user: this.sanitizeUserForResponse(updatedUser),
        tokens,
        requiresTwoFactor: false,
      };
    } catch (error) {
      if (error instanceof LoginError) {
        throw error;
      }

      // Log unexpected error
      await this.logLoginError(request, error);
      throw new LoginError('An unexpected error occurred', 'INTERNAL_ERROR');
    }
  }

  /**
   * Validates the login request
   */
  private validateRequest(request: LoginRequest): void {
    if (!request.email?.trim()) {
      throw new LoginError('Email is required', 'VALIDATION_ERROR');
    }

    if (!request.password?.trim()) {
      throw new LoginError('Password is required', 'VALIDATION_ERROR');
    }

    if (!this.isValidEmail(request.email)) {
      throw new LoginError('Invalid email format', 'VALIDATION_ERROR');
    }

    if (request.password.length < 8) {
      throw new LoginError('Password must be at least 8 characters', 'VALIDATION_ERROR');
    }
  }

  /**
   * Validates email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates account status
   */
  private validateAccountStatus(user: User): void {
    switch (user.status) {
      case 'inactive':
        throw new LoginError('Account is inactive', 'ACCOUNT_INACTIVE');
      case 'suspended':
        throw new LoginError('Account is suspended', 'ACCOUNT_SUSPENDED');
      case 'active':
        // Account is valid
        break;
      default:
        throw new LoginError('Invalid account status', 'INVALID_ACCOUNT_STATUS');
    }
  }

  /**
   * Handles two-factor authentication requirement
   */
  private async handleTwoFactorRequired(user: User, request: LoginRequest): Promise<LoginResponse> {
    // Generate session token for two-factor flow
    const sessionTokens = await this.authService.generateSessionTokens(user);

    // Get available two-factor methods
    const twoFactorMethods = await this.getTwoFactorMethods(user);

    return {
      user: this.sanitizeUserForResponse(user),
      tokens: sessionTokens,
      requiresTwoFactor: true,
      twoFactorMethods,
    };
  }

  /**
   * Gets available two-factor methods for user
   */
  private async getTwoFactorMethods(user: User): Promise<TwoFactorMethod[]> {
    // This would typically check user's enabled 2FA methods
    const methods: TwoFactorMethod[] = [];

    if (user.emailVerified) {
      methods.push({
        type: 'email',
        enabled: true,
        verified: true,
      });
    }

    if (user.phoneVerified) {
      methods.push({
        type: 'sms',
        enabled: true,
        verified: true,
      });
    }

    // Check for authenticator app
    if (user.preferences.twoFactorAuth?.authenticatorEnabled) {
      methods.push({
        type: 'authenticator',
        enabled: true,
        verified: true,
      });
    }

    return methods;
  }

  /**
   * Handles failed login attempts
   */
  private async handleFailedLogin(
    request: LoginRequest,
    reason: string,
    userId?: string
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: 'login_failed',
      userId: userId ?? 'unknown',
      deviceInfo: request.deviceInfo,
      metadata: {
        reason,
        email: request.email,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Handles blocked account scenarios
   */
  private async handleBlockedAccount(
    user: User,
    securityCheck: SecurityCheckResult
  ): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: 'login_attempt',
      userId: user.id,
      metadata: {
        blocked: true,
        reason: securityCheck.reason,
        blockedUntil: securityCheck.blockedUntil?.toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs successful login
   */
  private async logSuccessfulLogin(user: User, request: LoginRequest): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: 'login_success',
      userId: user.id,
      deviceInfo: request.deviceInfo,
      metadata: {
        timestamp: new Date().toISOString(),
        rememberMe: request.rememberMe,
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs login attempt
   */
  private async logLoginAttempt(request: LoginRequest): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: 'login_attempt',
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      metadata: {
        email: request.email,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs login errors
   */
  private async logLoginError(request: LoginRequest, error: unknown): Promise<void> {
    const securityEvent: SecurityEvent = {
      type: 'login_failed',
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      metadata: {
        email: request.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Sanitizes user data for response
   */
  private sanitizeUserForResponse(user: User): Omit<User, 'password'> {
    // Remove sensitive data from user object
    const { password, ...sanitizedUser } = user as User & { password?: string };
    return sanitizedUser as Omit<User, 'password'>;
  }
}

// ========================================
// Supporting Types and Extensions
// ========================================

export interface TwoFactorMethod {
  readonly type: 'sms' | 'email' | 'authenticator';
  readonly enabled: boolean;
  readonly verified: boolean;
  readonly lastUsed?: Date;
}

// Extend auth service interface
declare module './IAuthService' {
  interface IAuthService {
    generateSessionTokens(user: User): Promise<AuthTokens>;
  }
}

// Extend user preferences
declare module '@/types' {
  interface UserPreferences {
    readonly twoFactorAuth?: {
      readonly enabled: boolean;
      readonly authenticatorEnabled: boolean;
      readonly smsEnabled: boolean;
      readonly emailEnabled: boolean;
    };
  }
}

// ========================================
// Custom Errors
// ========================================

export class LoginError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 401) {
    super(message);
    this.name = 'LoginError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class TwoFactorRequiredError extends LoginError {
  public readonly sessionToken: string;
  public readonly methods: TwoFactorMethod[];

  constructor(sessionToken: string, methods: TwoFactorMethod[]) {
    super('Two-factor authentication required', 'TWO_FACTOR_REQUIRED', 200);
    this.sessionToken = sessionToken;
    this.methods = methods;
  }
}

// ========================================
// Use Case Factory
// ========================================

export interface LoginUseCaseDependencies {
  readonly userRepository: IUserRepository;
  readonly authService: IAuthService;
  readonly securityService: ISecurityService;
}

export function createLoginUseCase(dependencies: LoginUseCaseDependencies): LoginUseCase {
  return new LoginUseCase(
    dependencies.userRepository,
    dependencies.authService,
    dependencies.securityService
  );
}
