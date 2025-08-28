// ========================================
// Register Use Case - User Registration Business Logic
// ========================================

import type { IUserRepository } from '../../repositories/IUserRepository';
import type { IAuthService } from '../../../infrastructure/services/IAuthService';
import type { ISecurityService } from './LoginUseCase';
import { User } from '../../entities/User';
import type { RegisterFormData } from '@/validation';
import { registerSchema, validateForm } from '@/validation';

export interface RegisterRequest extends RegisterFormData {
  readonly deviceInfo?: DeviceInfo;
  readonly location?: GeographicLocation;
}

export interface RegisterResponse {
  readonly success: boolean;
  readonly user?: User;
  readonly tokens?: AuthTokens;
  readonly message?: string;
  readonly requiresEmailVerification?: boolean;
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

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly scope: string[];
}

/**
 * Register Use Case
 * Handles user registration with comprehensive validation and security
 */
export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: IAuthService,
    private readonly securityService: ISecurityService
  ) {}

  /**
   * Executes user registration
   * @param request - Registration request data
   * @returns Promise resolving to registration response
   */
  async execute(request: RegisterRequest): Promise<RegisterResponse> {
    // Validate input data
    const validation = this.validateRequest(request);
    if (!validation.success) {
      throw new RegisterError('Invalid registration data', 'VALIDATION_ERROR', validation.errors);
    }

    const validData = validation.data;

    try {
      // Log registration attempt
      await this.logRegistrationAttempt(request);

      // Check if email is already taken
      const existingUser = await this.userRepository.findByEmail(validData.email);
      if (existingUser) {
        await this.logRegistrationFailure(request, 'EMAIL_TAKEN');
        return {
          success: false,
          message: 'An account with this email already exists',
        };
      }

      // Check for suspicious activity
      const securityCheck = await this.securityService.checkRegistrationSecurity(request);
      if (securityCheck.isBlocked) {
        await this.logSecurityBlock(request, securityCheck);
        throw new RegisterError(
          securityCheck.reason || 'Registration blocked for security reasons',
          'SECURITY_BLOCK'
        );
      }

      // Hash password
      const hashedPassword = await this.authService.hashPassword(validData.password);

      // Create user entity
      const userId = this.generateUserId();
      const user = User.create({
        id: userId,
        email: validData.email.toLowerCase(),
        name: `${validData.firstName} ${validData.lastName}`,
        preferences: {
          theme: 'system',
          language: 'en',
          currency: 'USD',
          notifications: {
            pushEnabled: true,
            emailEnabled: true,
            listUpdates: true,
            reminders: true,
            promotions: validData.marketingConsent || false,
          },
          privacy: {
            profileVisibility: 'private',
            locationSharing: false,
            analyticsOptIn: true,
          },
        },
      });

      // Save user to repository
      const savedUser = await this.userRepository.create(user);

      // Store password separately (in real implementation, this would be in a separate auth store)
      await this.authService.storeUserCredentials(savedUser.id, hashedPassword);

      // Generate authentication tokens
      const tokens = await this.authService.generateTokens(savedUser);

      // Send verification email (if required)
      const emailVerificationSent = await this.sendVerificationEmail(savedUser);

      // Log successful registration
      await this.logSuccessfulRegistration(savedUser, request);

      // Send welcome notification
      await this.sendWelcomeNotification(savedUser);

      return {
        success: true,
        user: savedUser,
        tokens,
        requiresEmailVerification: emailVerificationSent,
        message: 'Account created successfully',
      };
    } catch (error) {
      if (error instanceof RegisterError) {
        throw error;
      }

      // Log unexpected error
      await this.logRegistrationError(request, error);
      throw new RegisterError('Registration failed', 'INTERNAL_ERROR');
    }
  }

  /**
   * Validates registration request
   */
  private validateRequest(request: RegisterRequest) {
    return validateForm(registerSchema, request);
  }

  /**
   * Generates unique user ID
   */
  private generateUserId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `user_${timestamp}_${random}`;
  }

  /**
   * Sends email verification
   */
  private async sendVerificationEmail(user: User): Promise<boolean> {
    try {
      await this.authService.sendVerificationEmail(user.email, user.name);
      return true;
    } catch (error) {
      console.warn('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Sends welcome notification
   */
  private async sendWelcomeNotification(user: User): Promise<void> {
    try {
      await this.authService.sendWelcomeNotification(user);
    } catch (error) {
      console.warn('Failed to send welcome notification:', error);
    }
  }

  /**
   * Logs registration attempt
   */
  private async logRegistrationAttempt(request: RegisterRequest): Promise<void> {
    const securityEvent = {
      type: 'registration_attempt' as const,
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      location: request.location,
      metadata: {
        email: request.email,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs registration failure
   */
  private async logRegistrationFailure(request: RegisterRequest, reason: string): Promise<void> {
    const securityEvent = {
      type: 'registration_failed' as const,
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      location: request.location,
      metadata: {
        email: request.email,
        reason,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs successful registration
   */
  private async logSuccessfulRegistration(user: User, request: RegisterRequest): Promise<void> {
    const securityEvent = {
      type: 'registration_success' as const,
      userId: user.id,
      deviceInfo: request.deviceInfo,
      location: request.location,
      metadata: {
        email: user.email,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs security block
   */
  private async logSecurityBlock(request: RegisterRequest, securityCheck: any): Promise<void> {
    const securityEvent = {
      type: 'registration_blocked' as const,
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      location: request.location,
      metadata: {
        email: request.email,
        reason: securityCheck.reason,
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }

  /**
   * Logs registration error
   */
  private async logRegistrationError(request: RegisterRequest, error: unknown): Promise<void> {
    const securityEvent = {
      type: 'registration_error' as const,
      userId: 'unknown',
      deviceInfo: request.deviceInfo,
      location: request.location,
      metadata: {
        email: request.email,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    };

    await this.securityService.logSecurityEvent(securityEvent);
  }
}

// ========================================
// Custom Errors
// ========================================

export class RegisterError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly validationErrors?: Record<string, string>;

  constructor(
    message: string,
    code: string,
    validationErrors?: Record<string, string>,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'RegisterError';
    this.code = code;
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

// ========================================
// Use Case Factory
// ========================================

export interface RegisterUseCaseDependencies {
  readonly userRepository: IUserRepository;
  readonly authService: IAuthService;
  readonly securityService: ISecurityService;
}

export function createRegisterUseCase(dependencies: RegisterUseCaseDependencies): RegisterUseCase {
  return new RegisterUseCase(
    dependencies.userRepository,
    dependencies.authService,
    dependencies.securityService
  );
}
