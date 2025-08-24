// ========================================
// Shopping Lists Types - Enhanced Implementation
// ========================================

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
  icon?: string; // Emoji or icon identifier
  createdAt: string;
  updatedAt: string;
}

export interface Collaborator {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
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
  ownerName: string;
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

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  sharedLists?: number;
  lastActivity?: string;
}

// Notification types
export interface Notification {
  id: string;
  type:
    | 'friend_request'
    | 'list_shared'
    | 'list_activity'
    | 'general'
    | 'system'
    | 'social'
    | 'auth';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: any;
  priority: 'low' | 'medium' | 'high';
  userId?: string;
}

// Currency types
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR';

export interface CurrencyInfo {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// Avatar types
export type AvatarType = string | number | { uri: string } | any;

// Assignment modal props
export interface AssignmentModalProps {
  visible: boolean;
  onClose: () => void;
  item: ShoppingItem | null;
  collaborators: Collaborator[];
  currentUserId: string;
  listOwnerId: string;
  onAssign: (itemId: string, userId: string) => void;
  onUnassign: (itemId: string) => void;
  getUserName: (userId: string) => string;
  getUserAvatar?: (userId: string) => AvatarType;
}

// Lists screen props
export interface EnhancedListsScreenProps {
  onAddListPress?: () => void;
  onEditListPress?: (list: ShoppingList) => void;
  onNavigationTabPress?: (tab: string) => void;
}
