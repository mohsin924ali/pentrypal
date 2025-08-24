// ========================================
// Shopping List Slice - List Management State
// ========================================

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingList, ShoppingItem, Collaborator } from '../../../shared/types/lists';

// ========================================
// State Types
// ========================================

export interface ShoppingListState {
  // Lists data
  readonly lists: ShoppingList[];
  readonly currentList: ShoppingList | null;
  readonly collaborators: Collaborator[];

  // Loading states
  readonly isLoadingLists: boolean;
  readonly isLoadingList: boolean;
  readonly isCreatingList: boolean;
  readonly isUpdatingList: boolean;
  readonly isDeletingList: boolean;
  readonly isLoadingItems: boolean;
  readonly isAddingItem: boolean;
  readonly isUpdatingItem: boolean;
  readonly isDeletingItem: boolean;
  readonly isLoadingCollaborators: boolean;
  readonly isAddingCollaborator: boolean;

  // UI states
  readonly selectedListId: string | null;
  readonly selectedItemId: string | null;
  readonly showCreateListModal: boolean;
  readonly showAddItemModal: boolean;
  readonly showCollaboratorModal: boolean;

  // Filters and search
  readonly statusFilter: 'all' | 'active' | 'completed' | 'archived';
  readonly searchQuery: string;
  readonly sortBy: 'name' | 'created_at' | 'updated_at';
  readonly sortOrder: 'asc' | 'desc';

  // Statistics
  readonly totalLists: number;
  readonly activeLists: number;
  readonly completedLists: number;
  readonly totalItems: number;
  readonly completedItems: number;

  // Errors
  readonly error: string | null;
  readonly lastError: ShoppingListError | null;
}

export interface ShoppingListError {
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
  readonly context?: Record<string, any>;
}

// ========================================
// Initial State
// ========================================

const initialState: ShoppingListState = {
  // Lists data
  lists: [],
  currentList: null,
  collaborators: [],

  // Loading states
  isLoadingLists: false,
  isLoadingList: false,
  isCreatingList: false,
  isUpdatingList: false,
  isDeletingList: false,
  isLoadingItems: false,
  isAddingItem: false,
  isUpdatingItem: false,
  isDeletingItem: false,
  isLoadingCollaborators: false,
  isAddingCollaborator: false,

  // UI states
  selectedListId: null,
  selectedItemId: null,
  showCreateListModal: false,
  showAddItemModal: false,
  showCollaboratorModal: false,

  // Filters and search
  statusFilter: 'all',
  searchQuery: '',
  sortBy: 'updated_at',
  sortOrder: 'desc',

  // Statistics
  totalLists: 0,
  activeLists: 0,
  completedLists: 0,
  totalItems: 0,
  completedItems: 0,

  // Errors
  error: null,
  lastError: null,
};

// ========================================
// Async Thunks
// ========================================

/**
 * Load shopping lists from API
 */
export const loadShoppingLists = createAsyncThunk(
  'shoppingList/loadLists',
  async (
    params?: {
      status?: 'active' | 'completed' | 'archived';
      skip?: number;
      limit?: number;
      search?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux loadShoppingLists started with params:', params);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const response = await shoppingListApi.getShoppingLists(params);
      console.log('🛒 Redux loadShoppingLists received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'LOAD_LISTS_FAILED',
          message: response.detail || 'Failed to load shopping lists',
          timestamp: new Date().toISOString(),
        });
      }

      // Convert backend lists to frontend format
      const lists: ShoppingList[] = response.data.map(backendList => {
        // Process items if they exist in the response
        const items = (backendList.items || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          quantity: parseFloat(item.quantity) || 1,
          unit: item.unit || 'pcs',
          category: {
            id: item.category_id || 'other',
            name: 'Other',
            color: '#636e72',
          },
          assignedTo: item.assigned_to,
          completed: item.completed || false,
          price: item.estimated_price,
          purchasedAmount: item.actual_price,
          notes: item.notes,
          barcode: item.barcode || undefined,
          icon: undefined,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

        // Process collaborators from backend response
        const collaborators = (backendList.collaborators || []).map(collab => ({
          id: collab.id,
          userId: collab.user_id,
          name: collab.user?.name || 'Unknown User',
          email: collab.user?.email || '',
          avatar: collab.user?.avatar_url || undefined,
          listId: collab.list_id,
          role: collab.role,
          permissions: Object.keys(collab.permissions || {}),
          invitedAt: collab.invited_at || collab.created_at,
          acceptedAt: collab.accepted_at || collab.created_at,
        }));

        // Add the owner as a collaborator if not already included
        const ownerAsCollaborator = {
          id: `owner-${backendList.id}`,
          userId: backendList.owner_id,
          name: backendList.owner?.name || 'You',
          email: backendList.owner?.email || '',
          avatar: backendList.owner?.avatar_url || undefined,
          listId: backendList.id,
          role: 'owner' as const,
          permissions: ['read', 'write', 'delete', 'manage'],
          invitedAt: backendList.created_at,
          acceptedAt: backendList.created_at,
        };

        // Check if owner is already in collaborators list
        const ownerInCollaborators = collaborators.some(c => c.userId === backendList.owner_id);
        const allCollaborators = ownerInCollaborators
          ? collaborators
          : [ownerAsCollaborator, ...collaborators];

        return {
          id: backendList.id,
          name: backendList.name,
          description: backendList.description,
          ownerId: backendList.owner_id,
          ownerName: backendList.owner?.name || 'You',
          collaborators: allCollaborators,
          items: items,
          categories: [], // Will be loaded separately if needed
          status: backendList.status,
          budget: backendList.budget_amount
            ? {
                total: backendList.budget_amount,
                spent: items.reduce((sum, item) => sum + (item.purchasedAmount || 0), 0),
                currency: backendList.budget_currency || 'USD',
              }
            : undefined,
          itemsCount: items.length,
          completedCount: items.filter(item => item.completed).length,
          progress:
            items.length > 0
              ? (items.filter(item => item.completed).length / items.length) * 100
              : 0,
          totalSpent: items.reduce((sum, item) => {
            const amount = parseFloat(item.purchasedAmount) || parseFloat(item.actual_price) || 0;
            return sum + (typeof amount === 'number' ? amount : 0);
          }, 0),
          createdAt: backendList.created_at,
          updatedAt: backendList.updated_at,
        };
      });

      return lists;
    } catch (error: any) {
      console.error('🛒 Redux loadShoppingLists error:', error);

      // Check if it's an authentication error
      if (
        error.message?.includes('Not authenticated') ||
        error.message?.includes('Invalid access token')
      ) {
        console.warn('🚨 Authentication error detected - tokens may be corrupted');

        // Force clear authentication data
        try {
          const { forceResetAuthentication } = await import('../../../infrastructure/api');
          await forceResetAuthentication();
        } catch (resetError) {
          console.error('Failed to reset authentication:', resetError);
        }
      }

      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to load shopping lists',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Load a specific shopping list with items
 */
export const loadShoppingList = createAsyncThunk(
  'shoppingList/loadList',
  async (listId: string, { rejectWithValue }) => {
    try {
      console.log('🛒 Redux loadShoppingList started for list:', listId);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const response = await shoppingListApi.getShoppingList(listId);
      console.log('🛒 Redux loadShoppingList received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'LOAD_LIST_FAILED',
          message: response.detail || 'Failed to load shopping list',
          timestamp: new Date().toISOString(),
        });
      }

      const backendList = response.data;

      // Convert backend list to frontend format
      const list: ShoppingList = {
        id: backendList.id,
        name: backendList.name,
        description: backendList.description,
        ownerId: backendList.owner_id,
        ownerName: 'Owner', // Will be populated by other calls
        collaborators: (backendList.collaborators || []).map(collab => ({
          id: collab.id,
          userId: collab.user_id,
          name: 'Collaborator', // Will be populated by other calls
          email: '', // Will be populated by other calls
          avatar: undefined,
          listId: collab.list_id,
          role: collab.role,
          permissions: Object.keys(collab.permissions),
          invitedAt: collab.created_at,
          acceptedAt: collab.created_at,
        })),
        items: (backendList.items || []).map(item => ({
          id: item.id,
          name: item.name,
          description: undefined,
          quantity: item.quantity || 1,
          unit: item.unit || 'pcs',
          category: {
            id: item.category_id || 'other',
            name: 'Other',
            color: '#636e72',
          },
          assignedTo: item.assigned_to,
          completed: item.completed,
          price: item.estimated_price,
          purchasedAmount: item.actual_price,
          notes: item.notes,
          barcode: undefined,
          icon: undefined,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
        categories: [], // Will be loaded separately
        status: backendList.status,
        budget: backendList.budget_amount
          ? {
              total: backendList.budget_amount,
              spent: 0, // Will be calculated
              currency: backendList.budget_currency || 'USD',
            }
          : undefined,
        itemsCount: backendList.items?.length || 0,
        completedCount: backendList.items?.filter(item => item.completed).length || 0,
        progress: backendList.items?.length
          ? (backendList.items.filter(item => item.completed).length / backendList.items.length) *
            100
          : 0,
        totalSpent:
          backendList.items?.reduce((sum, item) => {
            const amount = parseFloat(item.actual_price) || parseFloat(item.purchasedAmount) || 0;
            return sum + (typeof amount === 'number' ? amount : 0);
          }, 0) || 0,
        createdAt: backendList.created_at,
        updatedAt: backendList.updated_at,
      };

      return list;
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to load shopping list',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Create a new shopping list
 */
export const createShoppingList = createAsyncThunk(
  'shoppingList/createList',
  async (
    data: {
      name: string;
      description?: string;
      budget_amount?: number;
      budget_currency?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux createShoppingList started with data:', data);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const response = await shoppingListApi.createShoppingList(data);
      console.log('🛒 Redux createShoppingList received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'CREATE_LIST_FAILED',
          message: response.detail || 'Failed to create shopping list',
          timestamp: new Date().toISOString(),
        });
      }

      const backendList = response.data;

      // Convert backend list to frontend format
      const list: ShoppingList = {
        id: backendList.id,
        name: backendList.name,
        description: backendList.description,
        ownerId: backendList.owner_id,
        ownerName: 'You',
        collaborators: [],
        items: [],
        categories: [],
        status: backendList.status,
        budget: backendList.budget_amount
          ? {
              total: backendList.budget_amount,
              spent: 0,
              currency: backendList.budget_currency || 'USD',
            }
          : undefined,
        itemsCount: 0,
        completedCount: 0,
        progress: 0,
        totalSpent: 0,
        createdAt: backendList.created_at,
        updatedAt: backendList.updated_at,
      };

      return list;
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to create shopping list',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Add item to shopping list
 */
export const addShoppingItem = createAsyncThunk(
  'shoppingList/addItem',
  async (
    data: {
      listId: string;
      name: string;
      quantity?: number;
      unit?: string;
      category_id?: string;
      estimated_price?: number;
      notes?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux addShoppingItem started with data:', data);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const { listId, ...itemData } = data;
      const response = await shoppingListApi.addShoppingItem(listId, itemData);
      console.log('🛒 Redux addShoppingItem received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'ADD_ITEM_FAILED',
          message: response.detail || 'Failed to add item',
          timestamp: new Date().toISOString(),
        });
      }

      const backendItem = response.data;

      // Convert backend item to frontend format
      const item: ShoppingItem = {
        id: backendItem.id,
        name: backendItem.name,
        description: undefined,
        quantity: backendItem.quantity || 1,
        unit: backendItem.unit || 'pcs',
        category: {
          id: backendItem.category_id || 'other',
          name: 'Other',
          color: '#636e72',
        },
        assignedTo: backendItem.assigned_to,
        completed: backendItem.completed,
        price: backendItem.estimated_price,
        purchasedAmount: backendItem.actual_price,
        notes: backendItem.notes,
        barcode: undefined,
        icon: undefined,
        createdAt: backendItem.created_at,
        updatedAt: backendItem.updated_at,
      };

      return { listId, item };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to add item',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Update shopping item
 */
export const updateShoppingItem = createAsyncThunk(
  'shoppingList/updateItem',
  async (
    data: {
      listId: string;
      itemId: string;
      updates: {
        name?: string;
        quantity?: number;
        unit?: string;
        completed?: boolean;
        actual_price?: number;
        assigned_to?: string;
        notes?: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux updateShoppingItem started with data:', data);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const { listId, itemId, updates } = data;
      const response = await shoppingListApi.updateShoppingItem(listId, itemId, updates);
      console.log('🛒 Redux updateShoppingItem received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'UPDATE_ITEM_FAILED',
          message: response.detail || 'Failed to update item',
          timestamp: new Date().toISOString(),
        });
      }

      const backendItem = response.data;

      // Convert backend item to frontend format
      const item: ShoppingItem = {
        id: backendItem.id,
        name: backendItem.name,
        description: undefined,
        quantity: backendItem.quantity || 1,
        unit: backendItem.unit || 'pcs',
        category: {
          id: backendItem.category_id || 'other',
          name: 'Other',
          color: '#636e72',
        },
        assignedTo: backendItem.assigned_to,
        completed: backendItem.completed,
        price: backendItem.estimated_price,
        purchasedAmount: backendItem.actual_price,
        notes: backendItem.notes,
        barcode: undefined,
        icon: undefined,
        createdAt: backendItem.created_at,
        updatedAt: backendItem.updated_at,
      };

      return { listId, item };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to update item',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Assign item to a collaborator
 */
export const assignShoppingItem = createAsyncThunk(
  'shoppingList/assignItem',
  async (
    data: {
      listId: string;
      itemId: string;
      userId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux assignShoppingItem started with data:', data);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const { listId, itemId, userId } = data;
      const response = await shoppingListApi.assignItem(listId, itemId, userId);
      console.log('🛒 Redux assignShoppingItem received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'ASSIGN_ITEM_FAILED',
          message: response.detail || 'Failed to assign item',
          timestamp: new Date().toISOString(),
        });
      }

      const backendItem = response.data;

      // Convert backend item to frontend format
      const item: ShoppingItem = {
        id: backendItem.id,
        name: backendItem.name,
        description: undefined,
        quantity: backendItem.quantity || 1,
        unit: backendItem.unit || 'pcs',
        category: {
          id: backendItem.category_id || 'other',
          name: 'Other',
          color: '#636e72',
        },
        assignedTo: backendItem.assigned_to,
        completed: backendItem.completed,
        price: backendItem.estimated_price,
        purchasedAmount: backendItem.actual_price,
        notes: backendItem.notes,
        barcode: undefined,
        icon: undefined,
        createdAt: backendItem.created_at,
        updatedAt: backendItem.updated_at,
      };

      return { listId, item };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to assign item',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Unassign item
 */
export const unassignShoppingItem = createAsyncThunk(
  'shoppingList/unassignItem',
  async (
    data: {
      listId: string;
      itemId: string;
    },
    { rejectWithValue }
  ) => {
    try {
      console.log('🛒 Redux unassignShoppingItem started with data:', data);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const { listId, itemId } = data;
      const response = await shoppingListApi.unassignItem(listId, itemId);
      console.log('🛒 Redux unassignShoppingItem received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'UNASSIGN_ITEM_FAILED',
          message: response.detail || 'Failed to unassign item',
          timestamp: new Date().toISOString(),
        });
      }

      const backendItem = response.data;

      // Convert backend item to frontend format
      const item: ShoppingItem = {
        id: backendItem.id,
        name: backendItem.name,
        description: undefined,
        quantity: backendItem.quantity || 1,
        unit: backendItem.unit || 'pcs',
        category: {
          id: backendItem.category_id || 'other',
          name: 'Other',
          color: '#636e72',
        },
        assignedTo: backendItem.assigned_to,
        completed: backendItem.completed,
        price: backendItem.estimated_price,
        purchasedAmount: backendItem.actual_price,
        notes: backendItem.notes,
        barcode: undefined,
        icon: undefined,
        createdAt: backendItem.created_at,
        updatedAt: backendItem.updated_at,
      };

      return { listId, item };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to unassign item',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

/**
 * Archive a shopping list
 */
export const archiveShoppingList = createAsyncThunk(
  'shoppingList/archiveList',
  async (listId: string, { rejectWithValue }) => {
    try {
      console.log('🛒 Redux archiveShoppingList started with listId:', listId);

      // Import shopping list API
      const { shoppingListApi } = await import('../../../infrastructure/api');

      const response = await shoppingListApi.updateShoppingList(listId, {
        status: 'archived',
      });
      console.log('🛒 Redux archiveShoppingList received response:', response);

      if (!response.data) {
        return rejectWithValue({
          code: response.error_code || 'ARCHIVE_LIST_FAILED',
          message: response.detail || 'Failed to archive shopping list',
          timestamp: new Date().toISOString(),
        });
      }

      return { listId };
    } catch (error: any) {
      return rejectWithValue({
        code: 'NETWORK_ERROR',
        message: error.message || 'Failed to archive shopping list',
        timestamp: new Date().toISOString(),
      });
    }
  }
);

// ========================================
// Shopping List Slice
// ========================================

const shoppingListSlice = createSlice({
  name: 'shoppingList',
  initialState,
  reducers: {
    // Clear errors
    clearError: state => {
      state.error = null;
      state.lastError = null;
    },

    // UI state management
    setSelectedListId: (state, action: PayloadAction<string | null>) => {
      state.selectedListId = action.payload;
    },

    setSelectedItemId: (state, action: PayloadAction<string | null>) => {
      state.selectedItemId = action.payload;
    },

    setShowCreateListModal: (state, action: PayloadAction<boolean>) => {
      state.showCreateListModal = action.payload;
    },

    setShowAddItemModal: (state, action: PayloadAction<boolean>) => {
      state.showAddItemModal = action.payload;
    },

    setShowCollaboratorModal: (state, action: PayloadAction<boolean>) => {
      state.showCollaboratorModal = action.payload;
    },

    // Filters and search
    setStatusFilter: (
      state,
      action: PayloadAction<'all' | 'active' | 'completed' | 'archived'>
    ) => {
      state.statusFilter = action.payload;
    },

    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setSortBy: (state, action: PayloadAction<'name' | 'created_at' | 'updated_at'>) => {
      state.sortBy = action.payload;
    },

    setSortOrder: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortOrder = action.payload;
    },

    // Real-time updates
    updateListFromWebSocket: (
      state,
      action: PayloadAction<Partial<ShoppingList> & { id: string }>
    ) => {
      const index = state.lists.findIndex(list => list.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...action.payload };
      }
      if (state.currentList?.id === action.payload.id) {
        state.currentList = { ...state.currentList, ...action.payload };
      }
    },

    updateItemFromWebSocket: (
      state,
      action: PayloadAction<{ listId: string; item: ShoppingItem }>
    ) => {
      const { listId, item } = action.payload;

      // Update in current list
      if (state.currentList?.id === listId) {
        const itemIndex = state.currentList.items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          state.currentList.items[itemIndex] = item;
        } else {
          state.currentList.items.push(item);
        }
      }

      // Update in lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        const itemIndex = state.lists[listIndex].items.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          state.lists[listIndex].items[itemIndex] = item;
        } else {
          state.lists[listIndex].items.push(item);
        }
      }
    },

    addItemFromWebSocket: (
      state,
      action: PayloadAction<{ listId: string; item: ShoppingItem }>
    ) => {
      const { listId, item } = action.payload;

      // Add to current list
      if (state.currentList?.id === listId) {
        state.currentList.items.push(item);
        state.currentList.itemsCount += 1;
      }

      // Add to lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        state.lists[listIndex].items.push(item);
        state.lists[listIndex].itemsCount += 1;
      }
    },

    // Optimistically add collaborator to list
    addCollaboratorToList: (
      state,
      action: PayloadAction<{ listId: string; collaborator: Collaborator }>
    ) => {
      const { listId, collaborator } = action.payload;

      // Add to current list
      if (state.currentList?.id === listId) {
        // Check if collaborator already exists
        const existingIndex = state.currentList.collaborators.findIndex(
          c => c.userId === collaborator.userId
        );
        if (existingIndex === -1) {
          state.currentList.collaborators.push(collaborator);
        }
      }

      // Add to lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        // Check if collaborator already exists
        const existingIndex = state.lists[listIndex].collaborators.findIndex(
          c => c.userId === collaborator.userId
        );
        if (existingIndex === -1) {
          state.lists[listIndex].collaborators.push(collaborator);
        }
      }
    },

    // Optimistically remove collaborator from list
    removeCollaboratorFromList: (
      state,
      action: PayloadAction<{ listId: string; userId: string }>
    ) => {
      const { listId, userId } = action.payload;

      // Remove from current list
      if (state.currentList?.id === listId) {
        state.currentList.collaborators = state.currentList.collaborators.filter(
          c => c.userId !== userId
        );
      }

      // Remove from lists array
      const listIndex = state.lists.findIndex(list => list.id === listId);
      if (listIndex !== -1) {
        state.lists[listIndex].collaborators = state.lists[listIndex].collaborators.filter(
          c => c.userId !== userId
        );
      }
    },
  },
  extraReducers: builder => {
    // Load Shopping Lists
    builder
      .addCase(loadShoppingLists.pending, state => {
        state.isLoadingLists = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(loadShoppingLists.fulfilled, (state, action) => {
        state.isLoadingLists = false;
        state.lists = action.payload;
        state.totalLists = action.payload.length;
        state.activeLists = action.payload.filter(list => list.status === 'active').length;
        state.completedLists = action.payload.filter(list => list.status === 'completed').length;
      })
      .addCase(loadShoppingLists.rejected, (state, action) => {
        state.isLoadingLists = false;
        state.error = action.payload?.message || 'Failed to load shopping lists';
        state.lastError = action.payload as ShoppingListError;
      });

    // Load Shopping List
    builder
      .addCase(loadShoppingList.pending, state => {
        state.isLoadingList = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(loadShoppingList.fulfilled, (state, action) => {
        state.isLoadingList = false;
        state.currentList = action.payload;
        state.selectedListId = action.payload.id;

        // Update in lists array if it exists
        const index = state.lists.findIndex(list => list.id === action.payload.id);
        if (index !== -1) {
          state.lists[index] = action.payload;
        }
      })
      .addCase(loadShoppingList.rejected, (state, action) => {
        state.isLoadingList = false;
        state.error = action.payload?.message || 'Failed to load shopping list';
        state.lastError = action.payload as ShoppingListError;
      });

    // Create Shopping List
    builder
      .addCase(createShoppingList.pending, state => {
        state.isCreatingList = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(createShoppingList.fulfilled, (state, action) => {
        state.isCreatingList = false;
        state.lists.unshift(action.payload);
        state.totalLists += 1;
        state.activeLists += 1;
        state.showCreateListModal = false;
      })
      .addCase(createShoppingList.rejected, (state, action) => {
        state.isCreatingList = false;
        state.error = action.payload?.message || 'Failed to create shopping list';
        state.lastError = action.payload as ShoppingListError;
      });

    // Add Shopping Item
    builder
      .addCase(addShoppingItem.pending, state => {
        state.isAddingItem = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(addShoppingItem.fulfilled, (state, action) => {
        state.isAddingItem = false;
        const { listId, item } = action.payload;

        // Add to current list
        if (state.currentList?.id === listId) {
          state.currentList.items.push(item);
          state.currentList.itemsCount += 1;
        }

        // Add to lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          state.lists[listIndex].items.push(item);
          state.lists[listIndex].itemsCount += 1;
        }

        state.showAddItemModal = false;
      })
      .addCase(addShoppingItem.rejected, (state, action) => {
        state.isAddingItem = false;
        state.error = action.payload?.message || 'Failed to add item';
        state.lastError = action.payload as ShoppingListError;
      });

    // Update Shopping Item
    builder
      .addCase(updateShoppingItem.pending, state => {
        state.isUpdatingItem = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(updateShoppingItem.fulfilled, (state, action) => {
        state.isUpdatingItem = false;
        const { listId, item } = action.payload;

        // Update in current list
        if (state.currentList?.id === listId) {
          const itemIndex = state.currentList.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex] = item;
            // Recalculate progress
            state.currentList.completedCount = state.currentList.items.filter(
              i => i.completed
            ).length;
            state.currentList.progress =
              state.currentList.itemsCount > 0
                ? (state.currentList.completedCount / state.currentList.itemsCount) * 100
                : 0;
          }
        }

        // Update in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          const itemIndex = state.lists[listIndex].items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.lists[listIndex].items[itemIndex] = item;
            // Recalculate progress
            state.lists[listIndex].completedCount = state.lists[listIndex].items.filter(
              i => i.completed
            ).length;
            state.lists[listIndex].progress =
              state.lists[listIndex].itemsCount > 0
                ? (state.lists[listIndex].completedCount / state.lists[listIndex].itemsCount) * 100
                : 0;
          }
        }
      })
      .addCase(updateShoppingItem.rejected, (state, action) => {
        state.isUpdatingItem = false;
        state.error = action.payload?.message || 'Failed to update item';
        state.lastError = action.payload as ShoppingListError;
      });

    // Assign Shopping Item
    builder
      .addCase(assignShoppingItem.pending, state => {
        state.isUpdatingItem = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(assignShoppingItem.fulfilled, (state, action) => {
        state.isUpdatingItem = false;
        const { listId, item } = action.payload;

        // Update in current list
        if (state.currentList?.id === listId) {
          const itemIndex = state.currentList.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex] = item;
          }
        }

        // Update in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          const itemIndex = state.lists[listIndex].items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.lists[listIndex].items[itemIndex] = item;
          }
        }
      })
      .addCase(assignShoppingItem.rejected, (state, action) => {
        state.isUpdatingItem = false;
        state.error = action.payload?.message || 'Failed to assign item';
        state.lastError = action.payload as ShoppingListError;
      });

    // Unassign Shopping Item
    builder
      .addCase(unassignShoppingItem.pending, state => {
        state.isUpdatingItem = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(unassignShoppingItem.fulfilled, (state, action) => {
        state.isUpdatingItem = false;
        const { listId, item } = action.payload;

        // Update in current list
        if (state.currentList?.id === listId) {
          const itemIndex = state.currentList.items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.currentList.items[itemIndex] = item;
          }
        }

        // Update in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          const itemIndex = state.lists[listIndex].items.findIndex(i => i.id === item.id);
          if (itemIndex !== -1) {
            state.lists[listIndex].items[itemIndex] = item;
          }
        }
      })
      .addCase(unassignShoppingItem.rejected, (state, action) => {
        state.isUpdatingItem = false;
        state.error = action.payload?.message || 'Failed to unassign item';
        state.lastError = action.payload as ShoppingListError;
      });

    // Archive Shopping List
    builder
      .addCase(archiveShoppingList.pending, state => {
        state.isUpdatingList = true;
        state.error = null;
        state.lastError = null;
      })
      .addCase(archiveShoppingList.fulfilled, (state, action) => {
        state.isUpdatingList = false;
        const { listId } = action.payload;

        // Remove from current list if it's the archived one
        if (state.currentList?.id === listId) {
          state.currentList = null;
        }

        // Update status in lists array
        const listIndex = state.lists.findIndex(list => list.id === listId);
        if (listIndex !== -1) {
          state.lists[listIndex].status = 'archived';
        }
      })
      .addCase(archiveShoppingList.rejected, (state, action) => {
        state.isUpdatingList = false;
        state.error = action.payload?.message || 'Failed to archive list';
        state.lastError = action.payload as ShoppingListError;
      });
  },
});

// ========================================
// Actions and Selectors
// ========================================

export const {
  clearError,
  setSelectedListId,
  setSelectedItemId,
  setShowCreateListModal,
  setShowAddItemModal,
  setShowCollaboratorModal,
  setStatusFilter,
  setSearchQuery,
  setSortBy,
  setSortOrder,
  updateListFromWebSocket,
  updateItemFromWebSocket,
  addItemFromWebSocket,
  addCollaboratorToList,
  removeCollaboratorFromList,
} = shoppingListSlice.actions;

export default shoppingListSlice.reducer;

// ========================================
// Selectors
// ========================================

export const selectShoppingListState = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList;
export const selectShoppingLists = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.lists;
export const selectCurrentList = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.currentList;
export const selectIsLoadingLists = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.isLoadingLists;
export const selectIsLoadingList = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.isLoadingList;
export const selectShoppingListError = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.error;

// Filtered lists selector
export const selectFilteredLists = (state: { shoppingList: ShoppingListState }) => {
  const { lists, statusFilter, searchQuery } = state.shoppingList;

  let filtered = lists;

  // Filter by status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(list => list.status === statusFilter);
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(
      list =>
        list.name.toLowerCase().includes(query) ||
        list.description?.toLowerCase().includes(query) ||
        list.items.some(item => item.name.toLowerCase().includes(query))
    );
  }

  return filtered;
};

// Statistics selectors
export const selectShoppingListStats = (state: { shoppingList: ShoppingListState }) => ({
  totalLists: state.shoppingList.totalLists,
  activeLists: state.shoppingList.activeLists,
  completedLists: state.shoppingList.completedLists,
  totalItems: state.shoppingList.lists.reduce((sum, list) => sum + list.itemsCount, 0),
  completedItems: state.shoppingList.lists.reduce((sum, list) => sum + list.completedCount, 0),
});

// Modal and loading state selectors
export const selectIsCreatingList = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.isCreatingList;

export const selectShowCreateListModal = (state: { shoppingList: ShoppingListState }) =>
  state.shoppingList.showCreateListModal;
