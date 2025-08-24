// ========================================
// Shopping List Repository Interface - Domain Contract
// ========================================

import type { ShoppingList } from '../entities/ShoppingList';
import type { ShoppingListItem, ShoppingListStatus, User } from '@/types';

/**
 * Repository interface for ShoppingList aggregate operations
 * This defines the contract that infrastructure layer must implement
 */
export interface IShoppingListRepository {
  /**
   * Finds a shopping list by its unique identifier
   * @param id - Shopping list ID
   * @returns Promise resolving to ShoppingList entity or null if not found
   */
  findById(id: string): Promise<ShoppingList | null>;

  /**
   * Finds shopping lists by owner ID
   * @param ownerId - Owner user ID
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  findByOwnerId(ownerId: string, options?: ListQueryOptions): Promise<ShoppingListSearchResult>;

  /**
   * Finds shopping lists where user is a collaborator
   * @param userId - Collaborator user ID
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  findByCollaboratorId(userId: string, options?: ListQueryOptions): Promise<ShoppingListSearchResult>;

  /**
   * Finds all shopping lists accessible to a user (owned + collaborating)
   * @param userId - User ID
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  findByUserId(userId: string, options?: ListQueryOptions): Promise<ShoppingListSearchResult>;

  /**
   * Saves a shopping list entity (create or update)
   * @param list - ShoppingList entity to save
   * @returns Promise resolving to saved ShoppingList entity
   */
  save(list: ShoppingList): Promise<ShoppingList>;

  /**
   * Creates a new shopping list
   * @param list - ShoppingList entity to create
   * @returns Promise resolving to created ShoppingList entity
   */
  create(list: ShoppingList): Promise<ShoppingList>;

  /**
   * Updates an existing shopping list
   * @param list - ShoppingList entity to update
   * @returns Promise resolving to updated ShoppingList entity
   */
  update(list: ShoppingList): Promise<ShoppingList>;

  /**
   * Deletes a shopping list by ID
   * @param id - Shopping list ID to delete
   * @returns Promise resolving to boolean indicating success
   */
  delete(id: string): Promise<boolean>;

  /**
   * Checks if a shopping list exists by ID
   * @param id - Shopping list ID
   * @returns Promise resolving to boolean
   */
  exists(id: string): Promise<boolean>;

  /**
   * Finds shopping lists by status
   * @param status - List status to filter by
   * @param userId - Optional user ID to filter by access
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  findByStatus(
    status: ShoppingListStatus, 
    userId?: string, 
    options?: ListQueryOptions
  ): Promise<ShoppingListSearchResult>;

  /**
   * Searches shopping lists by name or description
   * @param query - Search query
   * @param userId - User ID for access control
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  search(query: string, userId: string, options?: ListQueryOptions): Promise<ShoppingListSearchResult>;

  /**
   * Finds shopping lists by tags
   * @param tags - Array of tags to search for
   * @param userId - User ID for access control
   * @param options - Query options
   * @returns Promise resolving to search results
   */
  findByTags(tags: string[], userId: string, options?: ListQueryOptions): Promise<ShoppingListSearchResult>;

  /**
   * Finds recently modified shopping lists
   * @param userId - User ID for access control
   * @param days - Number of days to look back
   * @param limit - Maximum number of results
   * @returns Promise resolving to recently modified lists
   */
  findRecentlyModified(userId: string, days: number, limit?: number): Promise<ShoppingList[]>;

  /**
   * Finds shopping lists with upcoming recurring patterns
   * @param userId - User ID for access control
   * @param days - Number of days to look ahead
   * @returns Promise resolving to upcoming lists
   */
  findUpcomingRecurring(userId: string, days: number): Promise<ShoppingList[]>;

  /**
   * Gets shopping list statistics for a user
   * @param userId - User ID
   * @returns Promise resolving to list statistics
   */
  getListStats(userId: string): Promise<ListStats>;

  /**
   * Gets aggregated spending data for lists
   * @param userId - User ID
   * @param timeframe - Timeframe for aggregation
   * @returns Promise resolving to spending data
   */
  getSpendingData(userId: string, timeframe: SpendingTimeframe): Promise<SpendingData>;

  /**
   * Item-specific operations
   */

  /**
   * Adds an item to a shopping list
   * @param listId - Shopping list ID
   * @param item - Item to add
   * @returns Promise resolving to updated ShoppingList
   */
  addItem(listId: string, item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShoppingList>;

  /**
   * Updates an item in a shopping list
   * @param listId - Shopping list ID
   * @param itemId - Item ID
   * @param updates - Item updates
   * @returns Promise resolving to updated ShoppingList
   */
  updateItem(listId: string, itemId: string, updates: Partial<ShoppingListItem>): Promise<ShoppingList>;

  /**
   * Removes an item from a shopping list
   * @param listId - Shopping list ID
   * @param itemId - Item ID
   * @returns Promise resolving to updated ShoppingList
   */
  removeItem(listId: string, itemId: string): Promise<ShoppingList>;

  /**
   * Marks an item as completed
   * @param listId - Shopping list ID
   * @param itemId - Item ID
   * @param completedBy - User ID who completed the item
   * @returns Promise resolving to updated ShoppingList
   */
  completeItem(listId: string, itemId: string, completedBy: string): Promise<ShoppingList>;

  /**
   * Collaboration operations
   */

  /**
   * Adds a collaborator to a shopping list
   * @param listId - Shopping list ID
   * @param collaborator - Collaborator to add
   * @returns Promise resolving to updated ShoppingList
   */
  addCollaborator(listId: string, collaborator: ShoppingList['collaborators'][0]): Promise<ShoppingList>;

  /**
   * Removes a collaborator from a shopping list
   * @param listId - Shopping list ID
   * @param userId - Collaborator user ID
   * @returns Promise resolving to updated ShoppingList
   */
  removeCollaborator(listId: string, userId: string): Promise<ShoppingList>;

  /**
   * Updates collaborator permissions
   * @param listId - Shopping list ID
   * @param userId - Collaborator user ID
   * @param permissions - Updated permissions
   * @returns Promise resolving to updated ShoppingList
   */
  updateCollaboratorPermissions(
    listId: string, 
    userId: string, 
    permissions: Partial<ShoppingList['collaborators'][0]['permissions']>
  ): Promise<ShoppingList>;

  /**
   * Bulk operations for performance
   */
  bulkCreate(lists: ShoppingList[]): Promise<ShoppingList[]>;
  bulkUpdate(lists: ShoppingList[]): Promise<ShoppingList[]>;
  bulkDelete(listIds: string[]): Promise<number>; // Returns count of deleted lists

  /**
   * Finds lists shared with a specific user
   * @param userId - User ID
   * @param options - Query options
   * @returns Promise resolving to shared lists
   */
  findSharedWithUser(userId: string, options?: ListQueryOptions): Promise<ShoppingList[]>;

  /**
   * Gets template lists for a user
   * @param userId - User ID
   * @returns Promise resolving to template lists
   */
  getTemplates(userId: string): Promise<ShoppingList[]>;

  /**
   * Duplicates a shopping list
   * @param listId - Original list ID
   * @param newOwnerId - New owner user ID
   * @param newName - Optional new name
   * @returns Promise resolving to duplicated list
   */
  duplicate(listId: string, newOwnerId: string, newName?: string): Promise<ShoppingList>;
}

// ========================================
// Supporting Types
// ========================================

export interface ListQueryOptions {
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: ListSortField;
  readonly sortOrder?: 'asc' | 'desc';
  readonly status?: ShoppingListStatus;
  readonly includeArchived?: boolean;
  readonly includeCompleted?: boolean;
  readonly tags?: string[];
  readonly dateRange?: DateRange;
  readonly cursor?: string;
}

export type ListSortField = 
  | 'name' 
  | 'createdAt' 
  | 'updatedAt' 
  | 'completedAt' 
  | 'totalItems' 
  | 'completionPercentage'
  | 'estimatedCost'
  | 'actualCost';

export interface DateRange {
  readonly start: Date;
  readonly end: Date;
}

export interface ShoppingListSearchResult {
  readonly lists: ShoppingList[];
  readonly total: number;
  readonly hasMore: boolean;
  readonly cursor?: string;
}

export interface ListStats {
  readonly totalLists: number;
  readonly activeLists: number;
  readonly completedLists: number;
  readonly archivedLists: number;
  readonly sharedLists: number;
  readonly totalItems: number;
  readonly completedItems: number;
  readonly averageItemsPerList: number;
  readonly averageCompletionTime: number; // in hours
  readonly totalSpent: number;
  readonly averageSpentPerList: number;
  readonly mostUsedCategories: CategoryUsage[];
  readonly collaborationStats: CollaborationStats;
}

export interface CategoryUsage {
  readonly category: string;
  readonly count: number;
  readonly percentage: number;
}

export interface CollaborationStats {
  readonly totalCollaborators: number;
  readonly averageCollaboratorsPerList: number;
  readonly mostActiveCollaborator?: User;
  readonly collaborationFrequency: number; // percentage of lists that are shared
}

export type SpendingTimeframe = 'week' | 'month' | 'quarter' | 'year';

export interface SpendingData {
  readonly timeframe: SpendingTimeframe;
  readonly totalSpent: number;
  readonly averagePerList: number;
  readonly categories: CategorySpending[];
  readonly trends: SpendingTrend[];
  readonly budget?: BudgetData;
}

export interface CategorySpending {
  readonly category: string;
  readonly amount: number;
  readonly percentage: number;
  readonly itemCount: number;
}

export interface SpendingTrend {
  readonly period: string; // date string
  readonly amount: number;
  readonly listCount: number;
}

export interface BudgetData {
  readonly total: number;
  readonly spent: number;
  readonly remaining: number;
  readonly percentage: number;
  readonly onTrack: boolean;
}

// ========================================
// Repository Errors
// ========================================

export class ShoppingListRepositoryError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 500) {
    super(message);
    this.name = 'ShoppingListRepositoryError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class ShoppingListNotFoundError extends ShoppingListRepositoryError {
  constructor(listId: string) {
    super(`Shopping list with ID ${listId} not found`, 'LIST_NOT_FOUND', 404);
  }
}

export class ShoppingListAccessDeniedError extends ShoppingListRepositoryError {
  constructor(listId: string, userId: string) {
    super(
      `User ${userId} does not have access to shopping list ${listId}`, 
      'ACCESS_DENIED', 
      403
    );
  }
}

export class ShoppingListItemNotFoundError extends ShoppingListRepositoryError {
  constructor(itemId: string, listId: string) {
    super(
      `Item ${itemId} not found in shopping list ${listId}`, 
      'ITEM_NOT_FOUND', 
      404
    );
  }
}

export class ShoppingListCollaboratorNotFoundError extends ShoppingListRepositoryError {
  constructor(userId: string, listId: string) {
    super(
      `User ${userId} is not a collaborator on shopping list ${listId}`, 
      'COLLABORATOR_NOT_FOUND', 
      404
    );
  }
}

export class ShoppingListValidationError extends ShoppingListRepositoryError {
  public readonly field: string;
  public readonly value: unknown;

  constructor(field: string, value: unknown, message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.field = field;
    this.value = value;
  }
}

export class ShoppingListConcurrencyError extends ShoppingListRepositoryError {
  constructor(listId: string) {
    super(
      `Shopping list ${listId} was modified by another process. Please refresh and try again.`,
      'CONCURRENCY_ERROR',
      409
    );
  }
}
