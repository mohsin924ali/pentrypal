// ========================================
// User Entity - Domain Model
// ========================================

import type { BaseEntity, UserPreferences, UserStatus } from '@/types';

export class User implements BaseEntity {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly avatar?: string;
  public readonly mobile?: string;
  public readonly preferences: UserPreferences;
  public readonly status: UserStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly emailVerified: boolean;
  public readonly phoneVerified: boolean;
  public readonly lastLoginAt?: Date;

  constructor(data: UserConstructorData) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.avatar = data.avatar;
    this.mobile = data.mobile;
    this.preferences = data.preferences;
    this.status = data.status ?? 'active';
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.emailVerified = data.emailVerified ?? false;
    this.phoneVerified = data.phoneVerified ?? false;
    this.lastLoginAt = data.lastLoginAt;

    this.validate();
  }

  /**
   * Validates the user entity
   */
  private validate(): void {
    if (!this.id.trim()) {
      throw new Error('User ID is required');
    }

    if (!this.email.trim()) {
      throw new Error('Email is required');
    }

    if (!this.isValidEmail(this.email)) {
      throw new Error('Invalid email format');
    }

    if (!this.name.trim()) {
      throw new Error('Name is required');
    }

    if (this.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (this.name.length > 100) {
      throw new Error('Name must be less than 100 characters');
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
   * Updates user preferences
   */
  public updatePreferences(newPreferences: Partial<UserPreferences>): User {
    return new User({
      ...this,
      preferences: {
        ...this.preferences,
        ...newPreferences,
      },
      updatedAt: new Date(),
    });
  }

  /**
   * Updates user profile information
   */
  public updateProfile(updates: UserProfileUpdates): User {
    return new User({
      ...this,
      ...updates,
      updatedAt: new Date(),
    });
  }

  /**
   * Marks email as verified
   */
  public verifyEmail(): User {
    return new User({
      ...this,
      emailVerified: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Marks phone as verified
   */
  public verifyPhone(): User {
    return new User({
      ...this,
      phoneVerified: true,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates last login timestamp
   */
  public updateLastLogin(): User {
    return new User({
      ...this,
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Deactivates the user account
   */
  public deactivate(): User {
    return new User({
      ...this,
      status: 'inactive',
      updatedAt: new Date(),
    });
  }

  /**
   * Reactivates the user account
   */
  public reactivate(): User {
    return new User({
      ...this,
      status: 'active',
      updatedAt: new Date(),
    });
  }

  /**
   * Suspends the user account
   */
  public suspend(): User {
    return new User({
      ...this,
      status: 'suspended',
      updatedAt: new Date(),
    });
  }

  /**
   * Checks if user is active
   */
  public get isActive(): boolean {
    return this.status === 'active';
  }

  /**
   * Checks if user is verified (both email and phone)
   */
  public get isFullyVerified(): boolean {
    return this.emailVerified && this.phoneVerified;
  }

  /**
   * Gets display name
   */
  public get displayName(): string {
    return this.name;
  }

  /**
   * Gets initials for avatar
   */
  public get initials(): string {
    return this.name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }

  /**
   * Converts to plain object for serialization
   */
  public toJSON(): UserJSON {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      avatar: this.avatar,
      mobile: this.mobile,
      preferences: this.preferences,
      status: this.status,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      emailVerified: this.emailVerified,
      phoneVerified: this.phoneVerified,
      lastLoginAt: this.lastLoginAt?.toISOString(),
    };
  }

  /**
   * Creates User from JSON
   */
  public static fromJSON(json: UserJSON): User {
    return new User({
      id: json.id,
      email: json.email,
      name: json.name,
      avatar: json.avatar,
      mobile: json.mobile,
      preferences: json.preferences,
      status: json.status,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
      emailVerified: json.emailVerified,
      phoneVerified: json.phoneVerified,
      lastLoginAt: json.lastLoginAt ? new Date(json.lastLoginAt) : undefined,
    });
  }

  /**
   * Creates a new user with default preferences
   */
  public static create(data: CreateUserData): User {
    const now = new Date();

    return new User({
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
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
        ...data.preferences,
      },
      status: 'active',
      createdAt: now,
      updatedAt: now,
      emailVerified: false,
      phoneVerified: false,
    });
  }
}

// ========================================
// Supporting Types
// ========================================

export interface UserConstructorData {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar?: string;
  readonly mobile?: string;
  readonly preferences: UserPreferences;
  readonly status?: UserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly emailVerified?: boolean;
  readonly phoneVerified?: boolean;
  readonly lastLoginAt?: Date;
}

export interface CreateUserData {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar?: string;
  readonly preferences?: Partial<UserPreferences>;
}

export interface UserProfileUpdates {
  readonly name?: string;
  readonly avatar?: string;
}

export interface UserJSON {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatar?: string;
  readonly mobile?: string;
  readonly preferences: UserPreferences;
  readonly status: UserStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly emailVerified: boolean;
  readonly phoneVerified: boolean;
  readonly lastLoginAt?: string;
}

// ========================================
// Domain Events
// ========================================

export abstract class UserDomainEvent {
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly version: number;

  constructor(aggregateId: string, version: number = 1) {
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
    this.version = version;
  }
}

export class UserCreatedEvent extends UserDomainEvent {
  public readonly email: string;
  public readonly name: string;

  constructor(aggregateId: string, email: string, name: string) {
    super(aggregateId);
    this.email = email;
    this.name = name;
  }
}

export class UserEmailVerifiedEvent extends UserDomainEvent {
  public readonly email: string;

  constructor(aggregateId: string, email: string) {
    super(aggregateId);
    this.email = email;
  }
}

export class UserProfileUpdatedEvent extends UserDomainEvent {
  public readonly changes: UserProfileUpdates;

  constructor(aggregateId: string, changes: UserProfileUpdates) {
    super(aggregateId);
    this.changes = changes;
  }
}

export class UserDeactivatedEvent extends UserDomainEvent {
  public readonly reason?: string;

  constructor(aggregateId: string, reason?: string) {
    super(aggregateId);
    this.reason = reason;
  }
}

export class UserPreferencesUpdatedEvent extends UserDomainEvent {
  public readonly changes: Partial<UserPreferences>;

  constructor(aggregateId: string, changes: Partial<UserPreferences>) {
    super(aggregateId);
    this.changes = changes;
  }
}
