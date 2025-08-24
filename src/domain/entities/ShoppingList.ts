// ========================================
// Shopping List Entity - Domain Model
// ========================================

import type { 
  BaseEntity, 
  ShoppingListItem, 
  Collaborator, 
  User, 
  ShoppingListStatus, 
  ShoppingListMetadata 
} from '@/types';

export class ShoppingList implements BaseEntity {
  public readonly id: string;
  public readonly name: string;
  public readonly description?: string;
  public readonly items: ShoppingListItem[];
  public readonly collaborators: Collaborator[];
  public readonly owner: User;
  public readonly status: ShoppingListStatus;
  public readonly totalEstimatedCost?: number;
  public readonly actualCost?: number;
  public readonly completedAt?: Date;
  public readonly metadata: ShoppingListMetadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(data: ShoppingListConstructorData) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.items = data.items ?? [];
    this.collaborators = data.collaborators ?? [];
    this.owner = data.owner;
    this.status = data.status ?? 'active';
    this.totalEstimatedCost = data.totalEstimatedCost;
    this.actualCost = data.actualCost;
    this.completedAt = data.completedAt;
    this.metadata = data.metadata;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    this.validate();
  }

  /**
   * Validates the shopping list entity
   */
  private validate(): void {
    if (!this.id.trim()) {
      throw new Error('Shopping list ID is required');
    }

    if (!this.name.trim()) {
      throw new Error('Shopping list name is required');
    }

    if (this.name.length < 2) {
      throw new Error('Shopping list name must be at least 2 characters long');
    }

    if (this.name.length > 100) {
      throw new Error('Shopping list name must be less than 100 characters');
    }

    if (this.description && this.description.length > 500) {
      throw new Error('Description must be less than 500 characters');
    }

    if (this.items.length > 1000) {
      throw new Error('Shopping list cannot have more than 1000 items');
    }

    if (this.collaborators.length > 50) {
      throw new Error('Shopping list cannot have more than 50 collaborators');
    }
  }

  /**
   * Adds an item to the shopping list
   */
  public addItem(item: Omit<ShoppingListItem, 'id' | 'createdAt' | 'updatedAt'>): ShoppingList {
    const newItem: ShoppingListItem = {
      ...item,
      id: this.generateItemId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return new ShoppingList({
      ...this,
      items: [...this.items, newItem],
      updatedAt: new Date(),
    });
  }

  /**
   * Updates an item in the shopping list
   */
  public updateItem(itemId: string, updates: Partial<ShoppingListItem>): ShoppingList {
    const itemIndex = this.items.findIndex(item => item.id === itemId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in shopping list');
    }

    const updatedItems = [...this.items];
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return new ShoppingList({
      ...this,
      items: updatedItems,
      updatedAt: new Date(),
    });
  }

  /**
   * Removes an item from the shopping list
   */
  public removeItem(itemId: string): ShoppingList {
    const filteredItems = this.items.filter(item => item.id !== itemId);
    
    if (filteredItems.length === this.items.length) {
      throw new Error('Item not found in shopping list');
    }

    return new ShoppingList({
      ...this,
      items: filteredItems,
      updatedAt: new Date(),
    });
  }

  /**
   * Marks an item as completed
   */
  public completeItem(itemId: string, completedBy: string): ShoppingList {
    return this.updateItem(itemId, {
      completed: true,
      completedBy,
      completedAt: new Date(),
    });
  }

  /**
   * Marks an item as incomplete
   */
  public uncompleteItem(itemId: string): ShoppingList {
    return this.updateItem(itemId, {
      completed: false,
      completedBy: undefined,
      completedAt: undefined,
    });
  }

  /**
   * Adds a collaborator to the shopping list
   */
  public addCollaborator(collaborator: Collaborator): ShoppingList {
    // Check if user is already a collaborator
    const existingCollaborator = this.collaborators.find(
      c => c.user.id === collaborator.user.id
    );

    if (existingCollaborator) {
      throw new Error('User is already a collaborator');
    }

    return new ShoppingList({
      ...this,
      collaborators: [...this.collaborators, collaborator],
      updatedAt: new Date(),
    });
  }

  /**
   * Removes a collaborator from the shopping list
   */
  public removeCollaborator(userId: string): ShoppingList {
    const filteredCollaborators = this.collaborators.filter(
      c => c.user.id !== userId
    );

    if (filteredCollaborators.length === this.collaborators.length) {
      throw new Error('Collaborator not found');
    }

    return new ShoppingList({
      ...this,
      collaborators: filteredCollaborators,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates collaborator permissions
   */
  public updateCollaboratorPermissions(
    userId: string, 
    permissions: Partial<Collaborator['permissions']>
  ): ShoppingList {
    const collaboratorIndex = this.collaborators.findIndex(
      c => c.user.id === userId
    );

    if (collaboratorIndex === -1) {
      throw new Error('Collaborator not found');
    }

    const updatedCollaborators = [...this.collaborators];
    updatedCollaborators[collaboratorIndex] = {
      ...updatedCollaborators[collaboratorIndex],
      permissions: {
        ...updatedCollaborators[collaboratorIndex].permissions,
        ...permissions,
      },
    };

    return new ShoppingList({
      ...this,
      collaborators: updatedCollaborators,
      updatedAt: new Date(),
    });
  }

  /**
   * Marks the entire shopping list as completed
   */
  public complete(): ShoppingList {
    if (this.status === 'completed') {
      throw new Error('Shopping list is already completed');
    }

    return new ShoppingList({
      ...this,
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * Archives the shopping list
   */
  public archive(): ShoppingList {
    if (this.status === 'archived') {
      throw new Error('Shopping list is already archived');
    }

    return new ShoppingList({
      ...this,
      status: 'archived',
      updatedAt: new Date(),
    });
  }

  /**
   * Reactivates the shopping list
   */
  public reactivate(): ShoppingList {
    if (this.status === 'active') {
      throw new Error('Shopping list is already active');
    }

    return new ShoppingList({
      ...this,
      status: 'active',
      completedAt: undefined,
      updatedAt: new Date(),
    });
  }

  /**
   * Updates the shopping list metadata
   */
  public updateMetadata(metadata: Partial<ShoppingListMetadata>): ShoppingList {
    return new ShoppingList({
      ...this,
      metadata: {
        ...this.metadata,
        ...metadata,
      },
      updatedAt: new Date(),
    });
  }

  /**
   * Updates the actual cost of the shopping list
   */
  public updateActualCost(cost: number): ShoppingList {
    if (cost < 0) {
      throw new Error('Cost cannot be negative');
    }

    return new ShoppingList({
      ...this,
      actualCost: cost,
      updatedAt: new Date(),
    });
  }

  /**
   * Calculates the total estimated cost
   */
  public get calculatedEstimatedCost(): number {
    return this.items.reduce((total, item) => {
      const itemCost = (item.estimatedPrice ?? 0) * item.quantity;
      return total + itemCost;
    }, 0);
  }

  /**
   * Calculates the total actual cost
   */
  public get calculatedActualCost(): number {
    return this.items.reduce((total, item) => {
      const itemCost = (item.actualPrice ?? 0) * item.quantity;
      return total + itemCost;
    }, 0);
  }

  /**
   * Gets the completion percentage
   */
  public get completionPercentage(): number {
    if (this.items.length === 0) return 0;
    
    const completedItems = this.items.filter(item => item.completed);
    return Math.round((completedItems.length / this.items.length) * 100);
  }

  /**
   * Gets the total number of items
   */
  public get totalItems(): number {
    return this.items.length;
  }

  /**
   * Gets the number of completed items
   */
  public get completedItems(): number {
    return this.items.filter(item => item.completed).length;
  }

  /**
   * Gets the number of remaining items
   */
  public get remainingItems(): number {
    return this.items.filter(item => !item.completed).length;
  }

  /**
   * Checks if the list is completed
   */
  public get isCompleted(): boolean {
    return this.status === 'completed' || this.remainingItems === 0;
  }

  /**
   * Checks if the list is archived
   */
  public get isArchived(): boolean {
    return this.status === 'archived';
  }

  /**
   * Checks if the list is shared
   */
  public get isShared(): boolean {
    return this.collaborators.length > 0;
  }

  /**
   * Checks if a user has permission to perform an action
   */
  public userHasPermission(userId: string, action: keyof Collaborator['permissions']): boolean {
    // Owner has all permissions
    if (this.owner.id === userId) {
      return true;
    }

    // Find collaborator and check permission
    const collaborator = this.collaborators.find(c => c.user.id === userId);
    return collaborator?.permissions[action] ?? false;
  }

  /**
   * Generates a unique ID for a new item
   */
  private generateItemId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `item_${timestamp}_${random}`;
  }

  /**
   * Converts to plain object for serialization
   */
  public toJSON(): ShoppingListJSON {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      items: this.items,
      collaborators: this.collaborators,
      owner: this.owner,
      status: this.status,
      totalEstimatedCost: this.totalEstimatedCost,
      actualCost: this.actualCost,
      completedAt: this.completedAt?.toISOString(),
      metadata: this.metadata,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  /**
   * Creates ShoppingList from JSON
   */
  public static fromJSON(json: ShoppingListJSON): ShoppingList {
    return new ShoppingList({
      id: json.id,
      name: json.name,
      description: json.description,
      items: json.items,
      collaborators: json.collaborators,
      owner: json.owner,
      status: json.status,
      totalEstimatedCost: json.totalEstimatedCost,
      actualCost: json.actualCost,
      completedAt: json.completedAt ? new Date(json.completedAt) : undefined,
      metadata: json.metadata,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  /**
   * Creates a new shopping list
   */
  public static create(data: CreateShoppingListData): ShoppingList {
    const now = new Date();
    
    return new ShoppingList({
      id: data.id,
      name: data.name,
      description: data.description,
      items: [],
      collaborators: [],
      owner: data.owner,
      status: 'active',
      metadata: {
        tags: data.tags ?? [],
        store: data.store,
        budget: data.budget,
        estimatedTime: data.estimatedTime,
        recurringPattern: data.recurringPattern,
      },
      createdAt: now,
      updatedAt: now,
    });
  }
}

// ========================================
// Supporting Types
// ========================================

export interface ShoppingListConstructorData {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly items?: ShoppingListItem[];
  readonly collaborators?: Collaborator[];
  readonly owner: User;
  readonly status?: ShoppingListStatus;
  readonly totalEstimatedCost?: number;
  readonly actualCost?: number;
  readonly completedAt?: Date;
  readonly metadata: ShoppingListMetadata;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateShoppingListData {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly owner: User;
  readonly tags?: string[];
  readonly store?: ShoppingListMetadata['store'];
  readonly budget?: number;
  readonly estimatedTime?: number;
  readonly recurringPattern?: ShoppingListMetadata['recurringPattern'];
}

export interface ShoppingListJSON {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly items: ShoppingListItem[];
  readonly collaborators: Collaborator[];
  readonly owner: User;
  readonly status: ShoppingListStatus;
  readonly totalEstimatedCost?: number;
  readonly actualCost?: number;
  readonly completedAt?: string;
  readonly metadata: ShoppingListMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}

// ========================================
// Domain Events
// ========================================

export abstract class ShoppingListDomainEvent {
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly version: number;

  constructor(aggregateId: string, version: number = 1) {
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
    this.version = version;
  }
}

export class ShoppingListCreatedEvent extends ShoppingListDomainEvent {
  public readonly name: string;
  public readonly ownerId: string;

  constructor(aggregateId: string, name: string, ownerId: string) {
    super(aggregateId);
    this.name = name;
    this.ownerId = ownerId;
  }
}

export class ShoppingListItemAddedEvent extends ShoppingListDomainEvent {
  public readonly item: ShoppingListItem;

  constructor(aggregateId: string, item: ShoppingListItem) {
    super(aggregateId);
    this.item = item;
  }
}

export class ShoppingListItemCompletedEvent extends ShoppingListDomainEvent {
  public readonly itemId: string;
  public readonly completedBy: string;

  constructor(aggregateId: string, itemId: string, completedBy: string) {
    super(aggregateId);
    this.itemId = itemId;
    this.completedBy = completedBy;
  }
}

export class ShoppingListCompletedEvent extends ShoppingListDomainEvent {
  public readonly completedAt: Date;

  constructor(aggregateId: string, completedAt: Date) {
    super(aggregateId);
    this.completedAt = completedAt;
  }
}

export class CollaboratorAddedEvent extends ShoppingListDomainEvent {
  public readonly collaborator: Collaborator;

  constructor(aggregateId: string, collaborator: Collaborator) {
    super(aggregateId);
    this.collaborator = collaborator;
  }
}

export class CollaboratorRemovedEvent extends ShoppingListDomainEvent {
  public readonly userId: string;

  constructor(aggregateId: string, userId: string) {
    super(aggregateId);
    this.userId = userId;
  }
}
