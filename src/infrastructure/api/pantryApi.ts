// ========================================
// Pantry API Service
// ========================================

import { apiClient } from './apiClient';
import type {
  ApiResponse,
  BackendItemCategory,
  BackendPantryItem,
  BackendPantryItemConsume,
  BackendPantryItemCreate,
  BackendPantryItemUpdate,
  BackendPantryStats,
} from '../../shared/types/backend';

// ========================================
// Pantry API Class
// ========================================

export class PantryApi {
  // ========================================
  // Pantry Item CRUD Methods
  // ========================================

  /**
   * Get user's pantry items
   */
  async getPantryItems(params?: {
    category_id?: string;
    location?: string;
    expiring_soon?: boolean;
    low_stock?: boolean;
    search?: string;
    sort_by?: 'name' | 'quantity' | 'expiration_date' | 'created_at';
    sort_order?: 'asc' | 'desc';
    skip?: number;
    limit?: number;
  }): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.get<BackendPantryItem[]>('/pantry/', params);
  }

  /**
   * Get a specific pantry item by ID
   */
  async getPantryItem(itemId: string): Promise<ApiResponse<BackendPantryItem>> {
    return apiClient.get<BackendPantryItem>(`/pantry/${itemId}`);
  }

  /**
   * Add a new item to pantry
   */
  async addPantryItem(data: BackendPantryItemCreate): Promise<ApiResponse<BackendPantryItem>> {
    return apiClient.post<BackendPantryItem>('/pantry/', data);
  }

  /**
   * Update a pantry item
   */
  async updatePantryItem(
    itemId: string,
    data: BackendPantryItemUpdate
  ): Promise<ApiResponse<BackendPantryItem>> {
    return apiClient.put<BackendPantryItem>(`/pantry/${itemId}`, data);
  }

  /**
   * Delete a pantry item
   */
  async deletePantryItem(itemId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/pantry/${itemId}`);
  }

  /**
   * Consume/use a pantry item (reduce quantity)
   */
  async consumePantryItem(
    itemId: string,
    data: BackendPantryItemConsume
  ): Promise<ApiResponse<BackendPantryItem>> {
    return apiClient.post<BackendPantryItem>(`/pantry/${itemId}/consume`, data);
  }

  /**
   * Bulk update pantry items
   */
  async bulkUpdatePantryItems(
    updates: Array<{
      item_id: string;
      data: BackendPantryItemUpdate;
    }>
  ): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.put<BackendPantryItem[]>('/pantry/bulk-update', { updates });
  }

  /**
   * Bulk delete pantry items
   */
  async bulkDeletePantryItems(itemIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.delete<void>('/pantry/bulk-delete', {
      skipErrorHandling: false,
    });
  }

  // ========================================
  // Pantry Statistics and Analytics
  // ========================================

  /**
   * Get pantry overview statistics
   */
  async getPantryStats(): Promise<ApiResponse<BackendPantryStats>> {
    return apiClient.get<BackendPantryStats>('/pantry/stats/overview');
  }

  /**
   * Get pantry locations list
   */
  async getPantryLocations(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>('/pantry/locations/list');
  }

  /**
   * Get pantry categories usage statistics
   */
  async getCategoryStats(): Promise<
    ApiResponse<
      Array<{
        category_id: string;
        category_name: string;
        item_count: number;
        total_quantity: number;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        category_id: string;
        category_name: string;
        item_count: number;
        total_quantity: number;
      }>
    >('/pantry/stats/categories');
  }

  /**
   * Get location-based statistics
   */
  async getLocationStats(): Promise<
    ApiResponse<
      Array<{
        location: string;
        item_count: number;
        expiring_soon: number;
        low_stock: number;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        location: string;
        item_count: number;
        expiring_soon: number;
        low_stock: number;
      }>
    >('/pantry/stats/locations');
  }

  /**
   * Get consumption history
   */
  async getConsumptionHistory(params?: {
    item_id?: string;
    category_id?: string;
    period?: 'week' | 'month' | 'year';
    limit?: number;
  }): Promise<
    ApiResponse<
      Array<{
        item_name: string;
        quantity_consumed: number;
        consumption_date: string;
        notes?: string;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        item_name: string;
        quantity_consumed: number;
        consumption_date: string;
        notes?: string;
      }>
    >('/pantry/consumption-history', params);
  }

  // ========================================
  // Alerts and Notifications
  // ========================================

  /**
   * Get items expiring soon
   */
  async getExpiringItems(daysAhead: number = 7): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.get<BackendPantryItem[]>('/pantry/alerts/expiring', {
      days_ahead: daysAhead,
    });
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.get<BackendPantryItem[]>('/pantry/alerts/low-stock');
  }

  /**
   * Get expired items
   */
  async getExpiredItems(): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.get<BackendPantryItem[]>('/pantry/alerts/expired');
  }

  /**
   * Mark expired items as handled
   */
  async markExpiredItemsHandled(itemIds: string[]): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/pantry/alerts/expired/mark-handled', {
      item_ids: itemIds,
    });
  }

  /**
   * Set up custom alerts
   */
  async createCustomAlert(data: {
    name: string;
    conditions: {
      category_id?: string;
      location?: string;
      days_before_expiry?: number;
      stock_threshold?: number;
    };
    notification_methods: ('push' | 'email' | 'sms')[];
  }): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/pantry/alerts/custom', data);
  }

  /**
   * Get custom alerts
   */
  async getCustomAlerts(): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>('/pantry/alerts/custom');
  }

  // ========================================
  // Barcode and Product Information
  // ========================================

  /**
   * Search pantry item by barcode
   */
  async searchByBarcode(barcode: string): Promise<ApiResponse<BackendPantryItem | null>> {
    return apiClient.get<BackendPantryItem | null>(`/pantry/barcode/${barcode}`);
  }

  /**
   * Get product information by barcode (external API)
   */
  async getProductInfo(barcode: string): Promise<
    ApiResponse<{
      name?: string;
      brand?: string;
      category?: string;
      image_url?: string;
      nutrition_info?: any;
    }>
  > {
    return apiClient.get<{
      name?: string;
      brand?: string;
      category?: string;
      image_url?: string;
      nutrition_info?: any;
    }>(`/pantry/product-info/${barcode}`);
  }

  /**
   * Add product information to database
   */
  async addProductInfo(
    barcode: string,
    productData: {
      name: string;
      brand?: string;
      category_id?: string;
      image_url?: string;
      nutrition_info?: any;
    }
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/pantry/product-info/${barcode}`, productData);
  }

  // ========================================
  // Categories Management
  // ========================================

  /**
   * Get all item categories
   */
  async getCategories(): Promise<ApiResponse<BackendItemCategory[]>> {
    return apiClient.get<BackendItemCategory[]>('/categories/');
  }

  /**
   * Create a new category
   */
  async createCategory(data: {
    name: string;
    icon?: string;
    color?: string;
  }): Promise<ApiResponse<BackendItemCategory>> {
    return apiClient.post<BackendItemCategory>('/categories/', data);
  }

  /**
   * Update a category
   */
  async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      icon?: string;
      color?: string;
    }
  ): Promise<ApiResponse<BackendItemCategory>> {
    return apiClient.put<BackendItemCategory>(`/categories/${categoryId}`, data);
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/categories/${categoryId}`);
  }

  // ========================================
  // Search and Suggestions
  // ========================================

  /**
   * Search pantry items
   */
  async searchPantryItems(
    query: string,
    filters?: {
      category_id?: string;
      location?: string;
      include_expired?: boolean;
      limit?: number;
    }
  ): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.get<BackendPantryItem[]>('/pantry/search', {
      q: query,
      ...filters,
    });
  }

  /**
   * Get item name suggestions
   */
  async getItemSuggestions(
    query: string,
    category?: string,
    limit: number = 10
  ): Promise<ApiResponse<Array<{ name: string; category?: string }>>> {
    return apiClient.get<Array<{ name: string; category?: string }>>('/pantry/suggestions', {
      q: query,
      category,
      limit,
    });
  }

  /**
   * Get frequently used items
   */
  async getFrequentItems(limit: number = 20): Promise<
    ApiResponse<
      Array<{
        name: string;
        category?: string;
        usage_count: number;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        name: string;
        category?: string;
        usage_count: number;
      }>
    >('/pantry/frequent-items', { limit });
  }

  // ========================================
  // Shopping List Integration
  // ========================================

  /**
   * Add pantry item to shopping list
   */
  async addToShoppingList(
    itemId: string,
    listId: string,
    quantity?: number
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(`/pantry/${itemId}/add-to-shopping-list`, {
      list_id: listId,
      quantity,
    });
  }

  /**
   * Generate shopping list from low stock items
   */
  async generateShoppingListFromLowStock(
    listName: string,
    includeExpiring: boolean = false
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>('/pantry/generate-shopping-list', {
      list_name: listName,
      include_expiring: includeExpiring,
    });
  }

  /**
   * Move shopping list items to pantry (after shopping)
   */
  async moveShoppingItemsToPantry(
    listId: string,
    items: Array<{
      item_id: string;
      quantity?: number;
      location?: string;
      expiration_date?: string;
    }>
  ): Promise<ApiResponse<BackendPantryItem[]>> {
    return apiClient.post<BackendPantryItem[]>('/pantry/from-shopping-list', {
      list_id: listId,
      items,
    });
  }

  // ========================================
  // Import/Export Methods
  // ========================================

  /**
   * Export pantry data
   */
  async exportPantry(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<ApiResponse<Blob>> {
    return apiClient.get<Blob>('/pantry/export', { format });
  }

  /**
   * Import pantry data from file
   */
  async importPantry(
    file: File | Blob,
    format: 'json' | 'csv' = 'json',
    options?: {
      merge_duplicates?: boolean;
      update_existing?: boolean;
    }
  ): Promise<
    ApiResponse<{
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
    }>
  > {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format', format);

    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return apiClient.uploadFile<{
      imported: number;
      updated: number;
      skipped: number;
      errors: string[];
    }>('/pantry/import', file, 'file', { format, ...options });
  }

  // ========================================
  // Recipe Integration (Future)
  // ========================================

  /**
   * Get recipe suggestions based on available items
   */
  async getRecipeSuggestions(maxMissingIngredients: number = 3): Promise<
    ApiResponse<
      Array<{
        recipe_name: string;
        available_ingredients: string[];
        missing_ingredients: string[];
        recipe_url?: string;
      }>
    >
  > {
    return apiClient.get<
      Array<{
        recipe_name: string;
        available_ingredients: string[];
        missing_ingredients: string[];
        recipe_url?: string;
      }>
    >('/pantry/recipe-suggestions', {
      max_missing: maxMissingIngredients,
    });
  }

  /**
   * Mark ingredients as used for a recipe
   */
  async useIngredientsForRecipe(
    recipeId: string,
    ingredients: Array<{
      item_id: string;
      quantity_used: number;
    }>
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>('/pantry/use-for-recipe', {
      recipe_id: recipeId,
      ingredients,
    });
  }
}

// ========================================
// Default Export
// ========================================

export const pantryApi = new PantryApi();
