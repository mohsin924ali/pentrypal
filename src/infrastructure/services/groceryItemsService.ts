/**
 * Grocery Items Service
 * Provides grocery item data, categories, and search functionality
 * Data is loaded from external JSON file for better maintainability
 */

const groceryData = require('../data/groceryItems.json');

export interface GroceryItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  defaultUnit: string;
  commonUnits: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  items: GroceryItem[];
}

export interface GroceryData {
  version: string;
  lastUpdated: string;
  categories: Category[];
}

class GroceryItemsService {
  private data: GroceryData;
  private categories: Category[];

  constructor() {
    this.data = groceryData as GroceryData;
    this.categories = this.data.categories;
  }

  /**
   * Get data version and last updated info
   */
  getDataInfo(): { version: string; lastUpdated: string } {
    return {
      version: this.data.version,
      lastUpdated: this.data.lastUpdated,
    };
  }

  /**
   * Get all categories
   */
  getCategories(): Category[] {
    return this.categories;
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId: string): Category | undefined {
    return this.categories.find(cat => cat.id === categoryId);
  }

  /**
   * Get all items across all categories
   */
  getAllItems(): GroceryItem[] {
    return this.categories.flatMap(category => category.items);
  }

  /**
   * Get items by category
   */
  getItemsByCategory(categoryId: string): GroceryItem[] {
    const category = this.getCategory(categoryId);
    return category ? category.items : [];
  }

  /**
   * Search items by name
   */
  searchItems(query: string): GroceryItem[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAllItems().filter(item => item.name.toLowerCase().includes(lowercaseQuery));
  }

  /**
   * Get item by ID
   */
  getItem(itemId: string): GroceryItem | undefined {
    return this.getAllItems().find(item => item.id === itemId);
  }

  /**
   * Get popular items (first 20 items across categories)
   */
  getPopularItems(): GroceryItem[] {
    const allItems = this.getAllItems();
    return allItems.slice(0, 20);
  }

  /**
   * Get items by multiple categories
   */
  getItemsByCategories(categoryIds: string[]): GroceryItem[] {
    return categoryIds.flatMap(categoryId => this.getItemsByCategory(categoryId));
  }

  /**
   * Get category names for autocomplete
   */
  getCategoryNames(): string[] {
    return this.categories.map(cat => cat.name);
  }

  /**
   * Get item names for autocomplete
   */
  getItemNames(): string[] {
    return this.getAllItems().map(item => item.name);
  }

  /**
   * Get statistics about the data
   */
  getStatistics(): {
    totalCategories: number;
    totalItems: number;
    itemsPerCategory: { [categoryId: string]: number };
  } {
    const itemsPerCategory: { [categoryId: string]: number } = {};

    this.categories.forEach(category => {
      itemsPerCategory[category.id] = category.items.length;
    });

    return {
      totalCategories: this.categories.length,
      totalItems: this.getAllItems().length,
      itemsPerCategory,
    };
  }

  /**
   * Validate data integrity
   */
  validateData(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const allItemIds = new Set<string>();

    // Check for duplicate item IDs
    this.categories.forEach(category => {
      category.items.forEach(item => {
        if (allItemIds.has(item.id)) {
          errors.push(`Duplicate item ID found: ${item.id}`);
        } else {
          allItemIds.add(item.id);
        }
      });
    });

    // Check for empty categories
    this.categories.forEach(category => {
      if (category.items.length === 0) {
        errors.push(`Empty category found: ${category.id}`);
      }
    });

    // Check for missing required fields
    this.categories.forEach(category => {
      if (!category.id || !category.name || !category.icon) {
        errors.push(`Category missing required fields: ${category.id}`);
      }

      category.items.forEach(item => {
        if (!item.id || !item.name || !item.icon || !item.category) {
          errors.push(`Item missing required fields: ${item.id}`);
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const groceryItemsService = new GroceryItemsService();
export default groceryItemsService;
