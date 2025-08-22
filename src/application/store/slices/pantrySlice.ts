/**
 * Pantry Slice
 * Manages pantry items and inventory state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  expiryDate?: string;
  location?: string;
  minimumStock: number;
  barcode?: string;
  notes?: string;
  price?: number;
  purchaseDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PantryFilters {
  category?: string;
  location?: string;
  expiryStatus?: 'all' | 'expiring' | 'expired' | 'fresh';
  stockStatus?: 'all' | 'low' | 'adequate' | 'overstocked';
  search?: string;
}

export interface PantryState {
  items: Record<string, PantryItem>;
  filters: PantryFilters;
  sortBy: 'name' | 'expiryDate' | 'quantity' | 'createdAt' | 'updatedAt';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
  locations: string[];
  lowStockItems: string[]; // Item IDs that are low in stock
  expiringItems: string[]; // Item IDs that are expiring soon
}

// Initial state
const initialState: PantryState = {
  items: {},
  filters: {
    expiryStatus: 'all',
    stockStatus: 'all',
  },
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  isLoading: false,
  error: null,
  lastSyncTime: null,
  locations: ['Fridge', 'Pantry', 'Freezer', 'Cabinet'],
  lowStockItems: [],
  expiringItems: [],
};

// Helper functions
const isLowStock = (item: PantryItem): boolean => {
  return item.quantity <= item.minimumStock;
};

const isExpiringSoon = (
  item: PantryItem,
  daysThreshold: number = 7,
): boolean => {
  if (!item.expiryDate) return false;
  const expiryDate = new Date(item.expiryDate);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays >= 0;
};

const isExpired = (item: PantryItem): boolean => {
  if (!item.expiryDate) return false;
  const expiryDate = new Date(item.expiryDate);
  const today = new Date();
  return expiryDate < today;
};

// Pantry slice
const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    // Error handling
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: state => {
      state.error = null;
    },

    // Items management
    setItems: (state, action: PayloadAction<PantryItem[]>) => {
      state.items = {};
      state.lowStockItems = [];
      state.expiringItems = [];

      action.payload.forEach(item => {
        state.items[item.id] = item;

        // Update low stock items
        if (isLowStock(item)) {
          state.lowStockItems.push(item.id);
        }

        // Update expiring items
        if (isExpiringSoon(item)) {
          state.expiringItems.push(item.id);
        }
      });

      state.lastSyncTime = new Date().toISOString();
      state.isLoading = false;
    },

    addItem: (state, action: PayloadAction<PantryItem>) => {
      const item = action.payload;
      state.items[item.id] = item;

      // Update low stock items
      if (isLowStock(item)) {
        state.lowStockItems.push(item.id);
      }

      // Update expiring items
      if (isExpiringSoon(item)) {
        state.expiringItems.push(item.id);
      }
    },

    updateItem: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<PantryItem> }>,
    ) => {
      const { id, updates } = action.payload;
      if (state.items[id]) {
        const updatedItem = {
          ...state.items[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        state.items[id] = updatedItem;

        // Update low stock tracking
        const isCurrentlyLowStock = state.lowStockItems.includes(id);
        const shouldBeLowStock = isLowStock(updatedItem);

        if (shouldBeLowStock && !isCurrentlyLowStock) {
          state.lowStockItems.push(id);
        } else if (!shouldBeLowStock && isCurrentlyLowStock) {
          state.lowStockItems = state.lowStockItems.filter(
            itemId => itemId !== id,
          );
        }

        // Update expiring tracking
        const isCurrentlyExpiring = state.expiringItems.includes(id);
        const shouldBeExpiring = isExpiringSoon(updatedItem);

        if (shouldBeExpiring && !isCurrentlyExpiring) {
          state.expiringItems.push(id);
        } else if (!shouldBeExpiring && isCurrentlyExpiring) {
          state.expiringItems = state.expiringItems.filter(
            itemId => itemId !== id,
          );
        }
      }
    },

    removeItem: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      delete state.items[id];

      // Remove from tracking arrays
      state.lowStockItems = state.lowStockItems.filter(itemId => itemId !== id);
      state.expiringItems = state.expiringItems.filter(itemId => itemId !== id);
    },

    // Quantity management
    updateQuantity: (
      state,
      action: PayloadAction<{ id: string; quantity: number }>,
    ) => {
      const { id, quantity } = action.payload;
      if (state.items[id]) {
        state.items[id].quantity = Math.max(0, quantity);
        state.items[id].updatedAt = new Date().toISOString();

        // Update low stock tracking
        const isCurrentlyLowStock = state.lowStockItems.includes(id);
        const shouldBeLowStock = isLowStock(state.items[id]);

        if (shouldBeLowStock && !isCurrentlyLowStock) {
          state.lowStockItems.push(id);
        } else if (!shouldBeLowStock && isCurrentlyLowStock) {
          state.lowStockItems = state.lowStockItems.filter(
            itemId => itemId !== id,
          );
        }
      }
    },

    consumeItem: (
      state,
      action: PayloadAction<{ id: string; amount: number }>,
    ) => {
      const { id, amount } = action.payload;
      if (state.items[id]) {
        const newQuantity = Math.max(0, state.items[id].quantity - amount);
        state.items[id].quantity = newQuantity;
        state.items[id].updatedAt = new Date().toISOString();

        // Update low stock tracking
        const isCurrentlyLowStock = state.lowStockItems.includes(id);
        const shouldBeLowStock = isLowStock(state.items[id]);

        if (shouldBeLowStock && !isCurrentlyLowStock) {
          state.lowStockItems.push(id);
        }
      }
    },

    restockItem: (
      state,
      action: PayloadAction<{ id: string; amount: number }>,
    ) => {
      const { id, amount } = action.payload;
      if (state.items[id]) {
        state.items[id].quantity += amount;
        state.items[id].updatedAt = new Date().toISOString();

        // Update low stock tracking
        const isCurrentlyLowStock = state.lowStockItems.includes(id);
        const shouldBeLowStock = isLowStock(state.items[id]);

        if (!shouldBeLowStock && isCurrentlyLowStock) {
          state.lowStockItems = state.lowStockItems.filter(
            itemId => itemId !== id,
          );
        }
      }
    },

    // Locations management
    addLocation: (state, action: PayloadAction<string>) => {
      if (!state.locations.includes(action.payload)) {
        state.locations.push(action.payload);
      }
    },

    removeLocation: (state, action: PayloadAction<string>) => {
      state.locations = state.locations.filter(
        location => location !== action.payload,
      );
    },

    // Filters and sorting
    setFilters: (state, action: PayloadAction<Partial<PantryFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: PantryState['sortBy'];
        sortOrder: PantryState['sortOrder'];
      }>,
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Refresh expiring items (called periodically)
    refreshExpiringItems: state => {
      state.expiringItems = [];
      Object.values(state.items).forEach(item => {
        if (isExpiringSoon(item)) {
          state.expiringItems.push(item.id);
        }
      });
    },

    // Reset state
    resetPantry: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setItems,
  addItem,
  updateItem,
  removeItem,
  updateQuantity,
  consumeItem,
  restockItem,
  addLocation,
  removeLocation,
  setFilters,
  setSorting,
  refreshExpiringItems,
  resetPantry,
} = pantrySlice.actions;

// Selectors
export const selectPantry = (state: { pantry: PantryState }) => state.pantry;
export const selectAllPantryItems = (state: { pantry: PantryState }) =>
  Object.values(state.pantry.items);
export const selectPantryItemById =
  (itemId: string) => (state: { pantry: PantryState }) =>
    state.pantry.items[itemId];
export const selectLowStockItems = (state: { pantry: PantryState }) =>
  state.pantry.lowStockItems.map(id => state.pantry.items[id]).filter(Boolean);
export const selectExpiringItems = (state: { pantry: PantryState }) =>
  state.pantry.expiringItems.map(id => state.pantry.items[id]).filter(Boolean);
export const selectPantryLocations = (state: { pantry: PantryState }) =>
  state.pantry.locations;
export const selectPantryLoading = (state: { pantry: PantryState }) =>
  state.pantry.isLoading;
export const selectPantryError = (state: { pantry: PantryState }) =>
  state.pantry.error;
export const selectPantryFilters = (state: { pantry: PantryState }) =>
  state.pantry.filters;

// Export reducer
export default pantrySlice.reducer;
