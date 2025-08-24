// ========================================
// Shopping List API Service
// ========================================

import { apiClient } from './apiClient';
import type {
  BackendShoppingList,
  BackendShoppingItem,
  BackendListCollaborator,
  BackendShoppingListCreate,
  BackendShoppingListUpdate,
  BackendShoppingItemCreate,
  BackendShoppingItemUpdate,
  PaginatedApiResponse,
  ApiResponse,
} from '../../shared/types/backend';

// ========================================
// Shopping List API Class
// ========================================

export class ShoppingListApi {
  // ========================================
  // Shopping List CRUD Methods
  // ========================================

  /**
   * Get user's shopping lists
   */
  async getShoppingLists(params?: {
    status?: 'active' | 'completed' | 'archived';
    skip?: number;
    limit?: number;
    search?: string;
  }): Promise<ApiResponse<BackendShoppingList[]>> {
    return apiClient.get<BackendShoppingList[]>('/shopping-lists/', params);
  }

  /**
   * Get a specific shopping list by ID
   */
  async getShoppingList(listId: string): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.get<BackendShoppingList>(`/shopping-lists/${listId}`);
  }

  /**
   * Create a new shopping list
   */
  async createShoppingList(
    data: BackendShoppingListCreate
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.post<BackendShoppingList>('/shopping-lists/', data);
  }

  /**
   * Update a shopping list
   */
  async updateShoppingList(
    listId: string,
    data: BackendShoppingListUpdate
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.put<BackendShoppingList>(`/shopping-lists/${listId}`, data);
  }

  /**
   * Delete a shopping list
   */
  async deleteShoppingList(listId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shopping-lists/${listId}`);
  }

  /**
   * Archive a shopping list
   */
  async archiveShoppingList(listId: string): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.put<BackendShoppingList>(`/shopping-lists/${listId}`, {
      status: 'archived',
    });
  }

  /**
   * Complete a shopping list
   */
  async completeShoppingList(listId: string): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.put<BackendShoppingList>(`/shopping-lists/${listId}`, {
      status: 'completed',
    });
  }

  /**
   * Duplicate a shopping list
   */
  async duplicateShoppingList(
    listId: string,
    newName?: string
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.post<BackendShoppingList>(`/shopping-lists/${listId}/duplicate`, {
      name: newName,
    });
  }

  // ========================================
  // Shopping Item CRUD Methods
  // ========================================

  /**
   * Get items for a shopping list
   */
  async getShoppingItems(
    listId: string,
    params?: {
      completed?: boolean;
      category_id?: string;
      assigned_to?: string;
      skip?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<BackendShoppingItem[]>> {
    return apiClient.get<BackendShoppingItem[]>(`/shopping-lists/${listId}/items`, params);
  }

  /**
   * Get a specific shopping item
   */
  async getShoppingItem(listId: string, itemId: string): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.get<BackendShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`);
  }

  /**
   * Add an item to a shopping list
   */
  async addShoppingItem(
    listId: string,
    data: BackendShoppingItemCreate
  ): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.post<BackendShoppingItem>(`/shopping-lists/${listId}/items`, data);
  }

  /**
   * Update a shopping item
   */
  async updateShoppingItem(
    listId: string,
    itemId: string,
    data: BackendShoppingItemUpdate
  ): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.put<BackendShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`, data);
  }

  /**
   * Delete a shopping item
   */
  async deleteShoppingItem(listId: string, itemId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shopping-lists/${listId}/items/${itemId}`);
  }

  /**
   * Toggle item completion status
   */
  async toggleItemCompletion(
    listId: string,
    itemId: string,
    completed: boolean,
    actualPrice?: number
  ): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.put<BackendShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`, {
      completed,
      actual_price: actualPrice,
    });
  }

  /**
   * Assign item to a collaborator
   */
  async assignItem(
    listId: string,
    itemId: string,
    userId: string
  ): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.put<BackendShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`, {
      assigned_to: userId,
    });
  }

  /**
   * Unassign item
   */
  async unassignItem(listId: string, itemId: string): Promise<ApiResponse<BackendShoppingItem>> {
    return apiClient.put<BackendShoppingItem>(`/shopping-lists/${listId}/items/${itemId}`, {
      assigned_to: null,
    });
  }

  /**
   * Bulk update items
   */
  async bulkUpdateItems(
    listId: string,
    updates: Array<{
      item_id: string;
      data: BackendShoppingItemUpdate;
    }>
  ): Promise<ApiResponse<BackendShoppingItem[]>> {
    return apiClient.put<BackendShoppingItem[]>(`/shopping-lists/${listId}/items/bulk`, {
      updates,
    });
  }

  /**
   * Bulk delete items
   */
  async bulkDeleteItems(listId: string, itemIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shopping-lists/${listId}/items/bulk`, {
      skipErrorHandling: false,
    });
  }

  // ========================================
  // Collaboration Methods
  // ========================================

  /**
   * Get list collaborators
   */
  async getCollaborators(listId: string): Promise<ApiResponse<BackendListCollaborator[]>> {
    return apiClient.get<BackendListCollaborator[]>(`/shopping-lists/${listId}/collaborators`);
  }

  /**
   * Add a collaborator to a list
   */
  async addCollaborator(
    listId: string,
    data: {
      user_id: string;
      role: 'editor' | 'viewer';
      permissions?: {
        can_edit_items?: boolean;
        can_add_items?: boolean;
        can_delete_items?: boolean;
        can_invite_others?: boolean;
      };
    }
  ): Promise<ApiResponse<BackendListCollaborator>> {
    return apiClient.post<BackendListCollaborator>(`/shopping-lists/${listId}/collaborators`, data);
  }

  /**
   * Update collaborator permissions
   */
  async updateCollaborator(
    listId: string,
    collaboratorId: string,
    data: {
      role?: 'editor' | 'viewer';
      permissions?: {
        can_edit_items?: boolean;
        can_add_items?: boolean;
        can_delete_items?: boolean;
        can_invite_others?: boolean;
      };
    }
  ): Promise<ApiResponse<BackendListCollaborator>> {
    return apiClient.put<BackendListCollaborator>(
      `/shopping-lists/${listId}/collaborators/${collaboratorId}`,
      data
    );
  }

  /**
   * Remove a collaborator from a list
   */
  async removeCollaborator(listId: string, collaboratorId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shopping-lists/${listId}/collaborators/${collaboratorId}`);
  }

  /**
   * Leave a shared list (as a collaborator)
   */
  async leaveList(listId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/shopping-lists/${listId}/leave`);
  }

  /**
   * Transfer list ownership
   */
  async transferOwnership(
    listId: string,
    newOwnerId: string
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.put<BackendShoppingList>(`/shopping-lists/${listId}/transfer`, {
      new_owner_id: newOwnerId,
    });
  }

  // ========================================
  // List Templates Methods
  // ========================================

  /**
   * Get available list templates
   */
  async getListTemplates(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/shopping-lists/templates');
  }

  /**
   * Create list from template
   */
  async createFromTemplate(
    templateId: string,
    name: string,
    customizations?: any
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.post<BackendShoppingList>('/shopping-lists/from-template', {
      template_id: templateId,
      name,
      customizations,
    });
  }

  /**
   * Save list as template
   */
  async saveAsTemplate(
    listId: string,
    templateName: string,
    isPublic: boolean = false
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/shopping-lists/${listId}/save-as-template`, {
      name: templateName,
      is_public: isPublic,
    });
  }

  // ========================================
  // List Statistics Methods
  // ========================================

  /**
   * Get list statistics
   */
  async getListStats(listId: string): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`/shopping-lists/${listId}/stats`);
  }

  /**
   * Get user's shopping statistics
   */
  async getUserShoppingStats(period?: 'week' | 'month' | 'year'): Promise<ApiResponse<any>> {
    return apiClient.get<any>('/shopping-lists/stats', { period });
  }

  /**
   * Get spending analysis
   */
  async getSpendingAnalysis(
    listId?: string,
    period?: 'week' | 'month' | 'year'
  ): Promise<ApiResponse<any>> {
    const params: any = {};
    if (listId) params.list_id = listId;
    if (period) params.period = period;

    return apiClient.get<any>('/shopping-lists/spending-analysis', params);
  }

  // ========================================
  // Search and Filter Methods
  // ========================================

  /**
   * Search items across all lists
   */
  async searchItems(
    query: string,
    filters?: {
      list_id?: string;
      category_id?: string;
      completed?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<BackendShoppingItem[]>> {
    return apiClient.get<BackendShoppingItem[]>('/shopping-lists/search/items', {
      q: query,
      ...filters,
    });
  }

  /**
   * Search lists
   */
  async searchLists(
    query: string,
    filters?: {
      status?: 'active' | 'completed' | 'archived';
      limit?: number;
    }
  ): Promise<ApiResponse<BackendShoppingList[]>> {
    return apiClient.get<BackendShoppingList[]>('/shopping-lists/search', {
      q: query,
      ...filters,
    });
  }

  /**
   * Get popular items (suggestions)
   */
  async getPopularItems(
    category?: string,
    limit: number = 20
  ): Promise<ApiResponse<Array<{ name: string; count: number }>>> {
    return apiClient.get<Array<{ name: string; count: number }>>('/shopping-lists/popular-items', {
      category,
      limit,
    });
  }

  /**
   * Get item suggestions based on history
   */
  async getItemSuggestions(
    query?: string,
    listId?: string,
    limit: number = 10
  ): Promise<ApiResponse<Array<{ name: string; category?: string }>>> {
    return apiClient.get<Array<{ name: string; category?: string }>>(
      '/shopping-lists/item-suggestions',
      {
        q: query,
        list_id: listId,
        limit,
      }
    );
  }

  // ========================================
  // Import/Export Methods
  // ========================================

  /**
   * Export list to various formats
   */
  async exportList(
    listId: string,
    format: 'json' | 'csv' | 'pdf' = 'json'
  ): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>(`/shopping-lists/${listId}/export`, { format });
  }

  /**
   * Import list from file
   */
  async importList(
    file: File | Blob,
    format: 'json' | 'csv' = 'json'
  ): Promise<ApiResponse<BackendShoppingList>> {
    return apiClient.uploadFile<BackendShoppingList>(
      `/shopping-lists/import?format=${format}`,
      file,
      'file'
    );
  }
}

// ========================================
// Default Export
// ========================================

export const shoppingListApi = new ShoppingListApi();
