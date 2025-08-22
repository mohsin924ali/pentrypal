import { ShoppingList, ShoppingItem, Collaborator } from '../../application/store/slices/shoppingListsSlice';

// Mock database storage (in a real app, this would be AsyncStorage, SQLite, or remote API)
class MockShoppingListDatabase {
  private lists: ShoppingList[] = [];
  private nextId: number = 1;

  constructor() {
    this.resetAllData();
  }

  // Reset all data to clean state
  resetAllData() {
    console.log('🧹 RESETTING ALL SHOPPING LIST DATA - CLEARING CACHE');
    this.lists = [];
    this.nextId = 1;
    
    // Add sample shopping lists with collaborators for testing
    this.addSampleLists();
    
    console.log('✅ Shopping list data reset complete');
  }

  // Add sample shopping lists with collaborators for testing
  private addSampleLists() {
    console.log('🛒 Adding sample shopping lists with collaborators...');
    
    // Sample list 1: Shared between Mohsin and Rabia
    const sampleList1: ShoppingList = {
      id: 'list_1',
      name: 'Weekly Groceries',
      description: 'Our weekly grocery shopping list',
      ownerId: 'user_100', // Mohsin owns this list
      items: [
        {
          id: 'item_1',
          name: 'Apples',
          quantity: 2,
          unit: 'lbs',
          category: { id: 'fruits', name: 'Fruits', color: '#FF6B6B' },
          assignedTo: 'user_101', // Assigned to Rabia
          completed: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'item_2',
          name: 'Milk',
          quantity: 1,
          unit: 'gallon',
          category: { id: 'dairy', name: 'Dairy', color: '#4ECDC4' },
          assignedTo: 'user_100', // Assigned to Mohsin
          completed: true,
          price: 4.50,
          purchasedAmount: 4.25,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      categories: [
        { id: 'fruits', name: 'Fruits', color: '#FF6B6B' },
        { id: 'dairy', name: 'Dairy', color: '#4ECDC4' },
      ],
      status: 'active',
      collaborators: [
        {
          userId: 'user_100',
          name: 'Mohsin Ali',
          avatar: '👨‍💼',
          listId: 'list_1',
          role: 'owner',
          permissions: ['read', 'write', 'assign'],
          invitedAt: new Date(Date.now() - 86400000).toISOString(),
          acceptedAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          userId: 'user_101',
          name: 'Rabia Ghaffar',
          avatar: '👩‍💼',
          listId: 'list_1',
          role: 'editor',
          permissions: ['read', 'write'],
          invitedAt: new Date(Date.now() - 86400000).toISOString(),
          acceptedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      itemsCount: 2,
      completedCount: 1,
      progress: 50,
      totalSpent: 4.25,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    };

    // Sample list 2: Rabia owns this list, Mohsin is collaborator
    const sampleList2: ShoppingList = {
      id: 'list_2',
      name: 'Party Supplies',
      description: 'Supplies for the weekend party',
      ownerId: 'user_101', // Rabia owns this list
      items: [
        {
          id: 'item_3',
          name: 'Chips',
          quantity: 3,
          unit: 'bags',
          category: { id: 'snacks', name: 'Snacks', color: '#FFE66D' },
          assignedTo: 'user_100', // Assigned to Mohsin
          completed: false,
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      categories: [
        { id: 'snacks', name: 'Snacks', color: '#FFE66D' },
      ],
      status: 'active',
      collaborators: [
        {
          userId: 'user_101',
          name: 'Rabia Ghaffar',
          avatar: '👩‍💼',
          listId: 'list_2',
          role: 'owner',
          permissions: ['read', 'write', 'assign'],
          invitedAt: new Date(Date.now() - 43200000).toISOString(),
          acceptedAt: new Date(Date.now() - 43200000).toISOString(),
        },
        {
          userId: 'user_100',
          name: 'Mohsin Ali',
          avatar: '👨‍💼',
          listId: 'list_2',
          role: 'editor',
          permissions: ['read', 'write'],
          invitedAt: new Date(Date.now() - 43200000).toISOString(),
          acceptedAt: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      itemsCount: 1,
      completedCount: 0,
      progress: 0,
      totalSpent: 0,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    };

    this.lists.push(sampleList1);
    this.lists.push(sampleList2);
    
    console.log('✅ Sample shopping lists added:');
    console.log('  - Weekly Groceries (shared between Mohsin & Rabia)');
    console.log('  - Party Supplies (Rabia owns, Mohsin collaborates)');
  }

  private initializeSampleData() {
    const sampleLists: ShoppingList[] = [
      {
        id: 'sample_1',
        name: 'Weekly Groceries',
        description: 'Our weekly grocery shopping list',
        ownerId: 'current_user_1',
        items: [
          {
            id: 'item_1',
            name: 'Apples',
            quantity: 2,
            unit: 'lbs',
            category: {
              id: 'fruits',
              name: 'Fruits',
              color: '#FF6B6B'
            },
            assignedTo: undefined,
            completed: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'item_2',
            name: 'Milk',
            quantity: 1,
            unit: 'gallon',
            category: {
              id: 'dairy',
              name: 'Dairy',
              color: '#4ECDC4'
            },
            assignedTo: 'user_2',
            completed: true,
            price: 4.50,
            purchasedAmount: 4.25,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'item_3',
            name: 'Bread',
            quantity: 2,
            unit: 'loaves',
            category: {
              id: 'pantry',
              name: 'Pantry',
              color: '#FFE66D'
            },
            assignedTo: undefined,
            completed: false,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        categories: [
          { id: 'fruits', name: 'Fruits', color: '#FF6B6B' },
          { id: 'dairy', name: 'Dairy', color: '#4ECDC4' },
          { id: 'pantry', name: 'Pantry', color: '#FFE66D' }
        ],
        status: 'active',
        collaborators: [
          {
            userId: 'current_user_1',
            name: 'John Doe',
            avatar: '👤',
            listId: 'sample_1',
            role: 'owner',
            permissions: ['read', 'write', 'assign'],
            invitedAt: new Date(Date.now() - 86400000).toISOString(),
            acceptedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            userId: 'user_2',
            name: 'Sarah Wilson',
            avatar: '👩',
            listId: 'sample_1',
            role: 'editor',
            permissions: ['read', 'write'],
            invitedAt: new Date(Date.now() - 86400000).toISOString(),
            acceptedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        itemsCount: 3,
        completedCount: 1,
        progress: 33,
        totalSpent: 0, // Will be calculated after initialization
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'sample_2',
        name: 'Party Supplies',
        description: 'Items for the weekend party',
        ownerId: 'current_user_1',
        items: [
          {
            id: 'item_4',
            name: 'Chips',
            quantity: 3,
            unit: 'bags',
            category: {
              id: 'snacks',
              name: 'Snacks',
              color: '#FF9F43'
            },
            assignedTo: undefined,
            completed: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
          {
            id: 'item_5',
            name: 'Soda',
            quantity: 6,
            unit: 'cans',
            category: {
              id: 'beverages',
              name: 'Beverages',
              color: '#0FB9B1'
            },
            assignedTo: undefined,
            completed: false,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        categories: [
          { id: 'snacks', name: 'Snacks', color: '#FF9F43' },
          { id: 'beverages', name: 'Beverages', color: '#0FB9B1' }
        ],
        status: 'active',
        collaborators: [
          {
            userId: 'current_user_1',
            name: 'John Doe',
            avatar: '👤',
            listId: 'sample_2',
            role: 'owner',
            permissions: ['read', 'write', 'assign'],
            invitedAt: new Date(Date.now() - 172800000).toISOString(),
            acceptedAt: new Date(Date.now() - 172800000).toISOString(),
          },
        ],
        itemsCount: 2,
        completedCount: 0,
        progress: 0,
        totalSpent: 0,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    this.lists = sampleLists;
    
    // Calculate correct totalSpent for all lists after initialization
    this.lists.forEach(list => {
      list.totalSpent = this.calculateTotalSpent(list.items);
    });
    
    this.nextId = 100; // Start custom IDs from 100
  }

  // Simulate async database operations
  private async delay(ms: number = 100): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Helper method to calculate total spent from items
  private calculateTotalSpent(items: ShoppingItem[]): number {
    return items.reduce((total, item) => {
      return total + (item.completed && item.purchasedAmount ? item.purchasedAmount : 0);
    }, 0);
  }

  // Get all shopping lists
  async getAllLists(): Promise<ShoppingList[]> {
    await this.delay();
    return [...this.lists].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get a specific list by ID
  async getListById(id: string): Promise<ShoppingList | null> {
    await this.delay();
    return this.lists.find(list => list.id === id) || null;
  }

  // Create a new shopping list
  async createList(data: {
    name: string;
    items: Array<{
      id: string;
      name: string;
      quantity: string;
      unit: string;
      icon: string;
      category: string;
    }>;
    ownerId?: string;
    ownerName?: string;
  }): Promise<ShoppingList> {
    await this.delay();

    const actualOwnerId = data.ownerId || 'current_user_1';
    const actualOwnerName = data.ownerName || 'Current User';

    const items = data.items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: parseInt(item.quantity) || 1,
      unit: item.unit,
      category: {
        id: item.category,
        name: item.category,
        color: '#4ECDC4'
      },
      assignedTo: undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const itemsCount = items.length;
    const completedCount = items.filter(item => item.completed).length;
    const progress = itemsCount > 0 ? Math.round((completedCount / itemsCount) * 100) : 0;

    const newList: ShoppingList = {
      id: `list_${this.nextId++}`,
      name: data.name,
      description: '',
      ownerId: actualOwnerId,
      items,
      itemsCount,
      completedCount,
      progress,
      totalSpent: 0,
      categories: [
        { id: 'general', name: 'General', color: '#4ECDC4' }
      ],
      status: 'active',
      collaborators: [
        {
          userId: actualOwnerId,
          name: actualOwnerName,
          avatar: '👤',
          listId: `list_${this.nextId - 1}`,
          role: 'owner',
          permissions: ['read', 'write', 'assign'],
          invitedAt: new Date().toISOString(),
          acceptedAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.lists.unshift(newList);
    return newList;
  }

  // Update an existing list
  async updateList(id: string, updates: Partial<ShoppingList>): Promise<ShoppingList | null> {
    await this.delay();

    const listIndex = this.lists.findIndex(list => list.id === id);
    if (listIndex === -1) {
      return null;
    }

    this.lists[listIndex] = {
      ...this.lists[listIndex],
      ...updates,
    };

    // Recalculate progress if items were updated
    if (updates.items) {
      const totalItems = updates.items.length;
      const completedItems = updates.items.filter(item => item.completed).length;
      this.lists[listIndex].itemsCount = totalItems;
      this.lists[listIndex].completedCount = completedItems;
      this.lists[listIndex].progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }

    return this.lists[listIndex];
  }

  // Update list with full object (for shopping mode)
  async updateFullList(updatedList: ShoppingList): Promise<ShoppingList> {
    await this.delay();
    
    const listIndex = this.lists.findIndex(list => list.id === updatedList.id);
    if (listIndex === -1) {
      throw new Error('List not found');
    }

    // Ensure totalSpent is correctly calculated
    const listWithCorrectTotal = {
      ...updatedList,
      totalSpent: this.calculateTotalSpent(updatedList.items)
    };

    this.lists[listIndex] = listWithCorrectTotal;
    return this.lists[listIndex];
  }

  // Delete a list
  async deleteList(id: string): Promise<boolean> {
    await this.delay();

    const initialLength = this.lists.length;
    this.lists = this.lists.filter(list => list.id !== id);
    return this.lists.length < initialLength;
  }

  // Toggle item completion status
  async toggleItemCompletion(listId: string, itemId: string): Promise<ShoppingList | null> {
    await this.delay();

    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      return null;
    }

    const item = list.items.find(i => i.id === itemId);
    if (!item) {
      return null;
    }

    item.completed = !item.completed;

    // Recalculate progress
    const completedItems = list.items.filter(item => item.completed).length;
    list.completedCount = completedItems;
    list.progress = list.itemsCount > 0 ? Math.round((completedItems / list.itemsCount) * 100) : 0;

    return list;
  }

  // Add item to existing list
  async addItemToList(listId: string, item: Omit<ShoppingItem, 'completed'>): Promise<ShoppingList | null> {
    await this.delay();

    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      return null;
    }

    const newItem: ShoppingItem = {
      ...item,
      completed: false,
    };

    list.items.push(newItem);
    list.itemsCount = list.items.length;

    return list;
  }

  // Remove item from list
  async removeItemFromList(listId: string, itemId: string): Promise<ShoppingList | null> {
    await this.delay();

    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      return null;
    }

    list.items = list.items.filter(item => item.id !== itemId);
    list.itemsCount = list.items.length;
    list.completedCount = list.items.filter(item => item.completed).length;
    list.progress = list.itemsCount > 0 ? Math.round((list.completedCount / list.itemsCount) * 100) : 0;

    return list;
  }

  // Search lists by name
  async searchLists(query: string): Promise<ShoppingList[]> {
    await this.delay();

    if (!query.trim()) {
      return this.getAllLists();
    }

    return this.lists.filter(list => 
      list.name.toLowerCase().includes(query.toLowerCase())
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Add contributor to a list
  async addContributor(listId: string, contributor: Collaborator): Promise<ShoppingList | null> {
    await this.delay();

    // Validate inputs
    if (!listId || !contributor || !contributor.userId) {
      throw new Error('Invalid input: listId and contributor with userId are required');
    }

    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      throw new Error('List not found');
    }

    // Check if contributor is already added
    const existingContributor = list.collaborators.find(c => c.userId === contributor.userId);
    if (existingContributor) {
      throw new Error('User is already a contributor to this list');
    }

    // Limit the number of collaborators to prevent performance issues
    const MAX_COLLABORATORS = 100;
    if (list.collaborators.length >= MAX_COLLABORATORS) {
      throw new Error(`Maximum number of collaborators (${MAX_COLLABORATORS}) reached for this list`);
    }

    // Create a new collaborators array instead of mutating the existing one
    // This ensures immutability and prevents the "cannot add property" error
    const updatedCollaborators = [...list.collaborators, contributor];
    
    // Find the list index in the internal array
    const listIndex = this.lists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      throw new Error('List not found in service');
    }
    
    // Update the list in the internal array
    this.lists[listIndex] = {
      ...this.lists[listIndex],
      collaborators: updatedCollaborators,
      updatedAt: new Date().toISOString()
    };
    
    // Return the updated list
    return this.lists[listIndex];
  }

  // Remove contributor from a list
  async removeContributor(listId: string, contributorId: string): Promise<ShoppingList | null> {
    await this.delay();

    const list = this.lists.find(l => l.id === listId);
    if (!list) {
      throw new Error('List not found');
    }

    const initialLength = list.collaborators.length;
    const updatedCollaborators = list.collaborators.filter(c => c.userId !== contributorId);
    
    if (updatedCollaborators.length === initialLength) {
      throw new Error('Contributor not found in this list');
    }

    // Find the list index in the internal array
    const listIndex = this.lists.findIndex(l => l.id === listId);
    if (listIndex === -1) {
      throw new Error('List not found in service');
    }

    // Update the list in the internal array
    this.lists[listIndex] = {
      ...this.lists[listIndex],
      collaborators: updatedCollaborators,
      updatedAt: new Date().toISOString()
    };

    // Return the updated list
    return this.lists[listIndex];
  }

  // Get lists where user is a contributor
  async getListsForUser(userId: string): Promise<ShoppingList[]> {
    await this.delay();
    
    return this.lists.filter(list => 
      list.collaborators.some(collaborator => collaborator.userId === userId)
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Archive a list
  async archiveList(id: string): Promise<boolean> {
    await this.delay();
    
    const listIndex = this.lists.findIndex(list => list.id === id);
    if (listIndex === -1) {
      return false;
    }

    this.lists[listIndex].status = 'archived';
    this.lists[listIndex].updatedAt = new Date().toISOString();
    return true;
  }

  // Get lists statistics
  async getListsStats(): Promise<{
    totalLists: number;
    completedLists: number;
    totalItems: number;
    completedItems: number;
    overallProgress: number;
  }> {
    await this.delay();

    const totalLists = this.lists.length;
    const completedLists = this.lists.filter(list => list.progress === 100).length;
    const totalItems = this.lists.reduce((sum, list) => sum + list.itemsCount, 0);
    const completedItems = this.lists.reduce((sum, list) => sum + list.completedCount, 0);
    const overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalLists,
      completedLists,
      totalItems,
      completedItems,
      overallProgress,
    };
  }

  // Sync user updates from auth service (for avatar/name changes in collaborators)
  async syncUserFromAuth(authUser: any): Promise<boolean> {
    await this.delay();
    try {
      let updatedListsCount = 0;
      
      // Update all collaborators in all lists that match this user
      this.lists.forEach(list => {
        let listUpdated = false;
        
        list.collaborators.forEach(collaborator => {
          if (collaborator.userId === authUser.id || collaborator.email === authUser.email) {
            console.log(`Updating collaborator in list ${list.id} for user ${authUser.email} - old avatar: ${collaborator.avatar} -> new avatar: ${authUser.avatar}`);
            collaborator.name = authUser.name;
            collaborator.avatar = authUser.avatar;
            listUpdated = true;
          }
        });
        
        if (listUpdated) {
          list.updatedAt = new Date().toISOString();
          updatedListsCount++;
        }
      });
      
      console.log(`Synced user updates to shopping list service: ${authUser.email} (updated ${updatedListsCount} lists)`);
      return true;
    } catch (error) {
      console.error('Error syncing user to shopping list service:', error);
      return false;
    }
  }
}

// Singleton instance
const mockDatabase = new MockShoppingListDatabase();

// Service interface
export const ShoppingListService = {
  // Core CRUD operations
  getAllLists: () => mockDatabase.getAllLists(),
  getListById: (id: string) => mockDatabase.getListById(id),
  createList: (data: Parameters<typeof mockDatabase.createList>[0]) => mockDatabase.createList(data),
  updateList: (id: string, updates: Parameters<typeof mockDatabase.updateList>[1]) => mockDatabase.updateList(id, updates),
  updateFullList: (updatedList: ShoppingList) => mockDatabase.updateFullList(updatedList),
  deleteList: (id: string) => mockDatabase.deleteList(id),
  archiveList: (id: string) => mockDatabase.archiveList(id),

  // Item operations
  toggleItemCompletion: (listId: string, itemId: string) => mockDatabase.toggleItemCompletion(listId, itemId),
  addItemToList: (listId: string, item: Parameters<typeof mockDatabase.addItemToList>[1]) => mockDatabase.addItemToList(listId, item),
  removeItemFromList: (listId: string, itemId: string) => mockDatabase.removeItemFromList(listId, itemId),

  // Collaborator operations
  addContributor: (listId: string, contributor: Parameters<typeof mockDatabase.addContributor>[1]) => mockDatabase.addContributor(listId, contributor),
  removeContributor: (listId: string, contributorId: string) => mockDatabase.removeContributor(listId, contributorId),
  getListsForUser: (userId: string) => mockDatabase.getListsForUser(userId),

  // Utility operations
  searchLists: (query: string) => mockDatabase.searchLists(query),
  getListsStats: () => mockDatabase.getListsStats(),
  
  // Sync operations
  syncUserFromAuth: (authUser: any) => mockDatabase.syncUserFromAuth(authUser),
  resetAllData: () => mockDatabase.resetAllData(),
};

export default ShoppingListService;
