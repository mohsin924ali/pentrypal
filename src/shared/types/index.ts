// Global type definitions

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Shopping List Types - REMOVED! 
// Now using Redux types as single source of truth:
// import { ShoppingList, ShoppingItem, Collaborator } from '@/application/store/slices/shoppingListsSlice';

// Social/Friends Types
export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar: string;
  status: 'pending' | 'accepted' | 'blocked';
  addedAt: string;
  mutualLists?: number;
  lastActiveAt?: string;
  userId?: string; // The user who owns this friend relationship
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  toUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  respondedAt?: string;
}

export interface SentInvite {
  id: string;
  email: string;
  invitedByUserId: string;
  status: 'pending' | 'accepted' | 'expired';
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

// Shop-related types
export interface ShopProduct extends GroceryItem {
  price: number;
  discountPrice?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  brand?: string;
  store: string;
  distance: string;
  imageUrl?: string;
  isOrganic?: boolean;
  isFeatured?: boolean;
}

export interface Store {
  id: string;
  name: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openUntil?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDelivery: string;
  categories: string[];
}

export interface ShopFilters {
  categories: string[];
  stores: string[];
  priceRange: [number, number];
  rating: number;
  inStockOnly: boolean;
  organicOnly: boolean;
  featuredOnly: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedUnit: string;
}

export interface SocialStats {
  totalFriends: number;
  pendingRequests: number;
  sentInvites: number;
  mutualLists: number;
  totalCollaborations: number;
}

// Grocery Items Types
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

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthSession {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  expiresAt: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
    theme: 'light' | 'dark' | 'auto';
  };
  stats: {
    totalLists: number;
    totalFriends: number;
    listsCreated: number;
    collaborations: number;
  };
  createdAt: string;
  lastActiveAt: string;
  isActive: boolean;
}

// Shop-related types
export interface ShopProduct extends GroceryItem {
  price: number;
  discountPrice?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviews: number;
  brand?: string;
  store: string;
  distance: string;
  imageUrl?: string;
  isOrganic?: boolean;
  isFeatured?: boolean;
}

export interface Store {
  id: string;
  name: string;
  distance: string;
  rating: number;
  isOpen: boolean;
  openUntil?: string;
  deliveryFee: number;
  minimumOrder: number;
  estimatedDelivery: string;
  categories: string[];
}

export interface ShopFilters {
  categories: string[];
  stores: string[];
  priceRange: [number, number];
  rating: number;
  inStockOnly: boolean;
  organicOnly: boolean;
  featuredOnly: boolean;
  sortBy: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

export interface CartItem {
  product: ShopProduct;
  quantity: number;
  selectedUnit: string;
}
