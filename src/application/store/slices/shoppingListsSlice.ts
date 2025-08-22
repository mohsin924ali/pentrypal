/**
 * Shopping Lists Slice
 * Manages shopping lists and items state
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';

// Types
export interface ShoppingItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  assignedTo?: string;
  completed: boolean;
  price?: number;
  purchasedAmount?: number; // Amount actually paid when marking as purchased
  notes?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  userId: string;
  name: string;
  avatar: string;
  listId: string;
  role: 'owner' | 'editor' | 'viewer';
  permissions: string[];
  invitedAt: string;
  acceptedAt?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  collaborators: Collaborator[];
  items: ShoppingItem[];
  categories: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  status: 'active' | 'completed' | 'archived';
  budget?: {
    total: number;
    spent: number;
    currency: string;
  };
  itemsCount: number;
  completedCount: number;
  progress: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListFilters {
  status: 'all' | 'active' | 'completed' | 'archived';
  category?: string;
  assignedTo?: string;
  search?: string;
}

export interface ShoppingListsState {
  lists: Record<string, ShoppingList>;
  activeListId: string | null;
  filters: ListFilters;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
  lastSyncTime: string | null;
}

// Initial state
const initialState: ShoppingListsState = {
  lists: {},
  activeListId: null,
  filters: {
    status: 'all',
  },
  sortBy: 'updatedAt',
  sortOrder: 'desc',
  isLoading: false,
  error: null,
  lastSyncTime: null,
};

// Shopping lists slice
const shoppingListsSlice = createSlice({
  name: 'shoppingLists',
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

    // Lists management
    setLists: (state, action: PayloadAction<Record<string, ShoppingList>>) => {
      state.lists = action.payload;
      state.lastSyncTime = new Date().toISOString();
      state.isLoading = false;
    },

    addList: (state, action: PayloadAction<ShoppingList>) => {
      state.lists[action.payload.id] = action.payload;
    },

    updateList: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<ShoppingList> }>,
    ) => {
      const { id, updates } = action.payload;
      if (state.lists[id]) {
        state.lists[id] = {
          ...state.lists[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },

    removeList: (state, action: PayloadAction<string>) => {
      delete state.lists[action.payload];
      if (state.activeListId === action.payload) {
        state.activeListId = null;
      }
    },

    archiveList: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.lists[id]) {
        state.lists[id].status = 'archived';
        state.lists[id].updatedAt = new Date().toISOString();
        if (state.activeListId === id) {
          state.activeListId = null;
        }
      }
    },

    // Active list management
    setActiveList: (state, action: PayloadAction<string | null>) => {
      state.activeListId = action.payload;
    },

    // Items management
    addItem: (
      state,
      action: PayloadAction<{ listId: string; item: ShoppingItem }>,
    ) => {
      const { listId, item } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].items.push(item);
        
        // Recalculate counts and progress
        const list = state.lists[listId];
        list.itemsCount = list.items.length;
        list.completedCount = list.items.filter(item => item.completed).length;
        list.progress = list.itemsCount > 0 ? Math.round((list.completedCount / list.itemsCount) * 100) : 0;
        list.updatedAt = new Date().toISOString();
      }
    },

    updateItem: (
      state,
      action: PayloadAction<{
        listId: string;
        itemId: string;
        updates: Partial<ShoppingItem>;
      }>,
    ) => {
      const { listId, itemId, updates } = action.payload;
      if (state.lists[listId]) {
        const itemIndex = state.lists[listId].items.findIndex(
          item => item.id === itemId,
        );
        if (itemIndex !== -1) {
          state.lists[listId].items[itemIndex] = {
            ...state.lists[listId].items[itemIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          
          // Recalculate counts and progress
          const list = state.lists[listId];
          list.itemsCount = list.items.length;
          list.completedCount = list.items.filter(item => item.completed).length;
          list.progress = list.itemsCount > 0 ? Math.round((list.completedCount / list.itemsCount) * 100) : 0;
          list.updatedAt = new Date().toISOString();
        }
      }
    },

    removeItem: (
      state,
      action: PayloadAction<{ listId: string; itemId: string }>,
    ) => {
      const { listId, itemId } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].items = state.lists[listId].items.filter(
          item => item.id !== itemId,
        );
        
        // Recalculate counts and progress
        const list = state.lists[listId];
        list.itemsCount = list.items.length;
        list.completedCount = list.items.filter(item => item.completed).length;
        list.progress = list.itemsCount > 0 ? Math.round((list.completedCount / list.itemsCount) * 100) : 0;
        list.updatedAt = new Date().toISOString();
      }
    },

    toggleItemCompleted: (
      state,
      action: PayloadAction<{ listId: string; itemId: string; purchasedAmount?: number }>,
    ) => {
      const { listId, itemId, purchasedAmount } = action.payload;
      if (state.lists[listId]) {
        const itemIndex = state.lists[listId].items.findIndex(
          item => item.id === itemId,
        );
        if (itemIndex !== -1) {
          const item = state.lists[listId].items[itemIndex];
          const wasCompleted = item.completed;
          
          item.completed = !item.completed;
          item.updatedAt = new Date().toISOString();
          
          // If marking as completed and purchasedAmount is provided, store it
          if (!wasCompleted && item.completed && purchasedAmount !== undefined) {
            item.purchasedAmount = purchasedAmount;
          }
          // If unmarking as completed, clear the purchased amount
          else if (wasCompleted && !item.completed) {
            item.purchasedAmount = undefined;
          }
          
          // Recalculate counts, progress, and total spent
          const list = state.lists[listId];
          list.itemsCount = list.items.length;
          list.completedCount = list.items.filter(item => item.completed).length;
          list.progress = list.itemsCount > 0 ? Math.round((list.completedCount / list.itemsCount) * 100) : 0;
          list.totalSpent = list.items.reduce((total, item) => {
            return total + (item.completed && item.purchasedAmount ? item.purchasedAmount : 0);
          }, 0);
          list.updatedAt = new Date().toISOString();
        }
      }
    },

    // Collaborators management
    addCollaborator: (
      state,
      action: PayloadAction<{ listId: string; collaborator: Collaborator }>,
    ) => {
      const { listId, collaborator } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].collaborators = [
          ...state.lists[listId].collaborators,
          collaborator,
        ];
        state.lists[listId].updatedAt = new Date().toISOString();
      }
    },

    removeCollaborator: (
      state,
      action: PayloadAction<{ listId: string; userId: string }>,
    ) => {
      const { listId, userId } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].collaborators = state.lists[
          listId
        ].collaborators.filter(collab => collab.userId !== userId);
        state.lists[listId].updatedAt = new Date().toISOString();
      }
    },

    // Item assignment management
    assignItemToUser: (
      state,
      action: PayloadAction<{
        listId: string;
        itemId: string;
        userId: string;
      }>,
    ) => {
      const { listId, itemId, userId } = action.payload;
      if (state.lists[listId]) {
        const itemIndex = state.lists[listId].items.findIndex(
          item => item.id === itemId,
        );
        if (itemIndex !== -1) {
          state.lists[listId].items[itemIndex].assignedTo = userId;
          state.lists[listId].items[itemIndex].updatedAt =
            new Date().toISOString();
          state.lists[listId].updatedAt = new Date().toISOString();
        }
      }
    },

    unassignItem: (
      state,
      action: PayloadAction<{ listId: string; itemId: string }>,
    ) => {
      const { listId, itemId } = action.payload;
      if (state.lists[listId]) {
        const itemIndex = state.lists[listId].items.findIndex(
          item => item.id === itemId,
        );
        if (itemIndex !== -1) {
          state.lists[listId].items[itemIndex].assignedTo = undefined;
          state.lists[listId].items[itemIndex].updatedAt =
            new Date().toISOString();
          state.lists[listId].updatedAt = new Date().toISOString();
        }
      }
    },

    assignMultipleItems: (
      state,
      action: PayloadAction<{
        listId: string;
        itemIds: string[];
        userId: string;
      }>,
    ) => {
      const { listId, itemIds, userId } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].items.forEach((item, index) => {
          if (itemIds.includes(item.id)) {
            state.lists[listId].items[index].assignedTo = userId;
            state.lists[listId].items[index].updatedAt =
              new Date().toISOString();
          }
        });
        state.lists[listId].updatedAt = new Date().toISOString();
      }
    },

    // Filters and sorting
    setFilters: (state, action: PayloadAction<Partial<ListFilters>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },

    setSorting: (
      state,
      action: PayloadAction<{
        sortBy: ShoppingListsState['sortBy'];
        sortOrder: ShoppingListsState['sortOrder'];
      }>,
    ) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },

    // Reset state
    resetShoppingLists: () => initialState,
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  setLists,
  addList,
  updateList,
  removeList,
  archiveList,
  setActiveList,
  addItem,
  updateItem,
  removeItem,
  toggleItemCompleted,
  addCollaborator,
  removeCollaborator,
  assignItemToUser,
  unassignItem,
  assignMultipleItems,
  setFilters,
  setSorting,
  resetShoppingLists,
} = shoppingListsSlice.actions;

// Selectors
export const selectShoppingLists = (state: {
  shoppingLists: ShoppingListsState;
}) => state.shoppingLists;
export const selectAllLists = createSelector(
  [(state: { shoppingLists: ShoppingListsState }) => state.shoppingLists.lists],
  (lists) => Object.values(lists)
);
export const selectActiveList = (state: {
  shoppingLists: ShoppingListsState;
}) =>
  state.shoppingLists.activeListId
    ? state.shoppingLists.lists[state.shoppingLists.activeListId]
    : null;
export const selectListById =
  (listId: string) => (state: { shoppingLists: ShoppingListsState }) =>
    state.shoppingLists.lists[listId];
export const selectListsLoading = (state: {
  shoppingLists: ShoppingListsState;
}) => state.shoppingLists.isLoading;
export const selectListsError = (state: {
  shoppingLists: ShoppingListsState;
}) => state.shoppingLists.error;
export const selectListsFilters = (state: {
  shoppingLists: ShoppingListsState;
}) => state.shoppingLists.filters;

// Assignment-specific selectors
export const selectItemsByAssignee = 
  (listId: string, userId: string) => (state: { shoppingLists: ShoppingListsState }) =>
    state.shoppingLists.lists[listId]?.items.filter(item => item.assignedTo === userId) || [];

export const selectUnassignedItems = 
  (listId: string) => (state: { shoppingLists: ShoppingListsState }) =>
    state.shoppingLists.lists[listId]?.items.filter(item => !item.assignedTo) || [];

export const selectListCollaborators = 
  (listId: string) => (state: { shoppingLists: ShoppingListsState }) =>
    state.shoppingLists.lists[listId]?.collaborators || [];

// Export reducer
export default shoppingListsSlice.reducer;
