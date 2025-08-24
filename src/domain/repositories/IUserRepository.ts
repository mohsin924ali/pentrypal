// ========================================
// User Repository Interface - Domain Contract
// ========================================

import type { User } from '../entities/User';
import type { UserPreferences } from '@/types';

/**
 * Repository interface for User aggregate operations
 * This defines the contract that infrastructure layer must implement
 */
export interface IUserRepository {
  /**
   * Finds a user by their unique identifier
   * @param id - User ID
   * @returns Promise resolving to User entity or null if not found
   */
  findById(id: string): Promise<User | null>;

  /**
   * Finds a user by their email address
   * @param email - User email
   * @returns Promise resolving to User entity or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Saves a user entity (create or update)
   * @param user - User entity to save
   * @returns Promise resolving to saved User entity
   */
  save(user: User): Promise<User>;

  /**
   * Creates a new user
   * @param user - User entity to create
   * @returns Promise resolving to created User entity
   */
  create(user: User): Promise<User>;

  /**
   * Updates an existing user
   * @param user - User entity to update
   * @returns Promise resolving to updated User entity
   */
  update(user: User): Promise<User>;

  /**
   * Deletes a user by ID
   * @param id - User ID to delete
   * @returns Promise resolving to boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a user exists by ID
   * @param id - User ID
   * @returns Promise resolving to boolean
   */
  exists(id: string): Promise<boolean>;

  /**
   * Checks if an email is already taken
   * @param email - Email to check
   * @param excludeUserId - Optional user ID to exclude from check
   * @returns Promise resolving to boolean
   */
  isEmailTaken(email: string, excludeUserId?: string): Promise<boolean>;

  /**
   * Finds users by multiple IDs
   * @param ids - Array of user IDs
   * @returns Promise resolving to array of User entities
   */
  findByIds(ids: string[]): Promise<User[]>;

  /**
   * Searches users by name or email
   * @param query - Search query
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise resolving to search results
   */
  search(query: string, limit?: number, offset?: number): Promise<UserSearchResult>;

  /**
   * Updates user preferences
   * @param userId - User ID
   * @param preferences - Preferences to update
   * @returns Promise resolving to updated User entity
   */
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<User>;

  /**
   * Marks user email as verified
   * @param userId - User ID
   * @returns Promise resolving to updated User entity
   */
  verifyEmail(userId: string): Promise<User>;

  /**
   * Marks user phone as verified
   * @param userId - User ID
   * @returns Promise resolving to updated User entity
   */
  verifyPhone(userId: string): Promise<User>;

  /**
   * Updates user's last login timestamp
   * @param userId - User ID
   * @returns Promise resolving to updated User entity
   */
  updateLastLogin(userId: string): Promise<User>;

  /**
   * Gets users with specific status
   * @param status - User status to filter by
   * @param limit - Maximum number of results
   * @param offset - Number of results to skip
   * @returns Promise resolving to filtered users
   */
  findByStatus(status: User['status'], limit?: number, offset?: number): Promise<UserSearchResult>;

  /**
   * Gets recently active users
   * @param days - Number of days to look back
   * @param limit - Maximum number of results
   * @returns Promise resolving to recently active users
   */
  findRecentlyActive(days: number, limit?: number): Promise<User[]>;

  /**
   * Gets user statistics
   * @param userId - User ID
   * @returns Promise resolving to user statistics
   */
  getUserStats(userId: string): Promise<UserStats>;

  /**
   * Bulk operations for performance
   */
  bulkCreate(users: User[]): Promise<User[]>;
  bulkUpdate(users: User[]): Promise<User[]>;
  bulkDelete(userIds: string[]): Promise<number>; // Returns count of deleted users
}

// ========================================
// Supporting Types
// ========================================

export interface UserSearchResult {
  readonly users: User[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly cursor?: string;
}

export interface UserStats {
  readonly totalLists: number;
  readonly totalItems: number;
  readonly completedLists: number;
  readonly sharedLists: number;
  readonly collaboratingLists: number;
  readonly totalSpent: number;
  readonly averageListSize: number;
  readonly joinDate: Date;
  readonly lastActiveDate?: Date;
  readonly streaks: UserStreaks;
  readonly achievements: UserAchievement[];
}

export interface UserStreaks {
  readonly currentLoginStreak: number;
  readonly longestLoginStreak: number;
  readonly currentShoppingStreak: number;
  readonly longestShoppingStreak: number;
}

export interface UserAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly unlockedAt: Date;
  readonly category: AchievementCategory;
  readonly rarity: AchievementRarity;
}

export type AchievementCategory = 
  | 'lists' 
  | 'items' 
  | 'collaboration' 
  | 'spending' 
  | 'streaks' 
  | 'social';

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// ========================================
// Repository Errors
// ========================================

export class UserRepositoryError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'UserRepositoryError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class UserNotFoundError extends UserRepositoryError {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`, 'USER_NOT_FOUND', 404);
  }
}

export class UserEmailTakenError extends UserRepositoryError {
  constructor(email: string) {
    super(`Email ${email} is already taken`, 'EMAIL_TAKEN', 409);
  }
}

export class UserValidationError extends UserRepositoryError {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown, message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
    this.value = value;
  }
}

export class UserConcurrencyError extends UserRepositoryError {
  constructor(userId: string) {
    super(
      `User ${userId} was modified by another process. Please refresh and try again.`,
      'CONCURRENCY_ERROR',
      409
    );
  }
}
