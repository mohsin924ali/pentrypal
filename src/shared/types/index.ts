// ========================================
// Core Types - Base types used throughout the application
// ========================================

export interface BaseEntity {
  readonly id: string;
  readonly createdAt: string; // ISO string for Redux serialization
  readonly updatedAt: string; // ISO string for Redux serialization
}

export interface User extends BaseEntity {
  readonly email?: string; // Optional since users can register with phone only
  readonly phone?: string; // Optional since users can register with email only
  readonly name: string;
  readonly avatar?: string;
  readonly preferences?: UserPreferences; // Optional for friend request contexts
  readonly status?: UserStatus; // Optional for friend request contexts
}

export interface UserPreferences {
  readonly theme: 'light' | 'dark' | 'system';
  readonly language: string;
  readonly currency: string;
  readonly notifications: NotificationSettings;
  readonly privacy: PrivacySettings;
}

export interface NotificationSettings {
  readonly pushEnabled: boolean;
  readonly emailEnabled: boolean;
  readonly listUpdates: boolean;
  readonly reminders: boolean;
  readonly promotions: boolean;
}

export interface PrivacySettings {
  readonly profileVisibility: 'public' | 'friends' | 'private';
  readonly locationSharing: boolean;
  readonly analyticsOptIn: boolean;
}

export type UserStatus = 'active' | 'inactive' | 'suspended';

// ========================================
// Shopping List Types
// ========================================

export interface ShoppingList extends BaseEntity {
  readonly name: string;
  readonly description?: string;
  readonly items: ShoppingListItem[];
  readonly collaborators: Collaborator[];
  readonly owner: User;
  readonly status: ShoppingListStatus;
  readonly totalEstimatedCost?: number;
  readonly actualCost?: number;
  readonly completedAt?: Date;
  readonly metadata: ShoppingListMetadata;
}

export interface ShoppingListItem extends BaseEntity {
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly category: ItemCategory;
  readonly estimatedPrice?: number;
  readonly actualPrice?: number;
  readonly notes?: string;
  readonly completed: boolean;
  readonly completedBy?: string;
  readonly completedAt?: Date;
  readonly assignedTo?: string;
  readonly priority: ItemPriority;
  readonly barcode?: string;
  readonly image?: string;
}

export interface Collaborator {
  readonly user: User;
  readonly role: CollaboratorRole;
  readonly permissions: CollaboratorPermissions;
  readonly joinedAt: Date;
}

export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type ShoppingListStatus = 'active' | 'completed' | 'archived' | 'shared';
export type ItemPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface CollaboratorPermissions {
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canInvite: boolean;
  readonly canManageItems: boolean;
  readonly canViewHistory: boolean;
}

export interface ShoppingListMetadata {
  readonly tags: string[];
  readonly store?: Store;
  readonly budget?: number;
  readonly estimatedTime?: number; // in minutes
  readonly recurringPattern?: RecurringPattern;
}

export interface RecurringPattern {
  readonly frequency: 'daily' | 'weekly' | 'monthly';
  readonly interval: number;
  readonly endDate?: Date;
}

// ========================================
// Pantry Types
// ========================================

export interface PantryItem extends BaseEntity {
  readonly name: string;
  readonly quantity: number;
  readonly unit: string;
  readonly category: ItemCategory;
  readonly location: PantryLocation;
  readonly expirationDate?: Date;
  readonly purchaseDate?: Date;
  readonly cost?: number;
  readonly barcode?: string;
  readonly image?: string;
  readonly notes?: string;
  readonly nutritionInfo?: NutritionInfo;
  readonly storage: StorageRequirements;
}

export interface PantryLocation {
  readonly area: 'pantry' | 'fridge' | 'freezer' | 'countertop' | 'cabinet';
  readonly shelf?: string;
  readonly container?: string;
}

export interface StorageRequirements {
  readonly temperature: 'room' | 'cold' | 'frozen';
  readonly humidity?: 'low' | 'medium' | 'high';
  readonly lightSensitive: boolean;
  readonly maxShelfLife?: number; // in days
}

export interface NutritionInfo {
  readonly calories?: number;
  readonly protein?: number;
  readonly carbs?: number;
  readonly fat?: number;
  readonly fiber?: number;
  readonly sugar?: number;
  readonly sodium?: number;
  readonly servingSize?: string;
}

// ========================================
// Item Categories
// ========================================

export interface ItemCategory {
  readonly id: string;
  readonly name: string;
  readonly icon: string;
  readonly color: string;
  readonly parent?: string;
  readonly sortOrder: number;
}

export interface Store extends BaseEntity {
  readonly name: string;
  readonly address: Address;
  readonly coordinates?: Coordinates;
  readonly hours: StoreHours;
  readonly contact: StoreContact;
  readonly features: StoreFeatures;
}

export interface Address {
  readonly street: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly country: string;
}

export interface Coordinates {
  readonly latitude: number;
  readonly longitude: number;
}

export interface StoreHours {
  readonly monday: DayHours;
  readonly tuesday: DayHours;
  readonly wednesday: DayHours;
  readonly thursday: DayHours;
  readonly friday: DayHours;
  readonly saturday: DayHours;
  readonly sunday: DayHours;
}

export interface DayHours {
  readonly open: string; // HH:mm format
  readonly close: string; // HH:mm format
  readonly closed: boolean;
}

export interface StoreContact {
  readonly phone?: string;
  readonly email?: string;
  readonly website?: string;
}

export interface StoreFeatures {
  readonly hasPickup: boolean;
  readonly hasDelivery: boolean;
  readonly hasParkingLot: boolean;
  readonly acceptsCards: boolean;
  readonly acceptsCash: boolean;
  readonly hasWifi: boolean;
}

// ========================================
// Analytics Types
// ========================================

export interface SpendingReport {
  readonly period: 'weekly' | 'monthly' | 'yearly';
  readonly totalSpent: number;
  readonly categoryBreakdown: CategorySpending[];
  readonly storeBreakdown: StoreSpending[];
  readonly trends: SpendingTrend[];
  readonly projections: SpendingProjection[];
}

export interface CategorySpending {
  readonly category: ItemCategory;
  readonly amount: number;
  readonly percentage: number;
  readonly items: number;
}

export interface StoreSpending {
  readonly store: Store;
  readonly amount: number;
  readonly percentage: number;
  readonly visits: number;
}

export interface SpendingTrend {
  readonly date: Date;
  readonly amount: number;
  readonly category?: string;
}

export interface SpendingProjection {
  readonly month: string;
  readonly projected: number;
  readonly confidence: number;
}

// ========================================
// API Types
// ========================================

export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly errors?: ApiError[];
  readonly metadata?: ApiMetadata;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
}

export interface ApiMetadata {
  readonly page?: number;
  readonly limit?: number;
  readonly total?: number;
  readonly hasMore?: boolean;
  readonly cursor?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly page: number;
    readonly limit: number;
    readonly total: number;
    readonly totalPages: number;
    readonly hasNext: boolean;
    readonly hasPrev: boolean;
  };
}

// ========================================
// Authentication Types
// ========================================

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresIn: number;
  readonly scope: string[];
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
}

export interface RegisterCredentials {
  readonly email: string;
  readonly password: string;
  readonly confirmPassword: string;
  readonly name: string;
  readonly acceptTerms: boolean;
  readonly marketingConsent?: boolean;
}

export interface PasswordResetRequest {
  readonly email: string;
}

export interface PasswordReset {
  readonly token: string;
  readonly password: string;
  readonly confirmPassword: string;
}

// ========================================
// Navigation Types
// ========================================

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Lists: undefined;
  Pantry: undefined;
  Analytics: undefined;
  Profile: undefined;
};

export type ListsStackParamList = {
  ListsHome: undefined;
  ListDetail: { listId: string };
  CreateList: undefined;
  EditList: { listId: string };
  ShoppingMode: { listId: string };
  InviteCollaborators: { listId: string };
};

export type PantryStackParamList = {
  PantryHome: undefined;
  PantryItem: { itemId: string };
  AddPantryItem: undefined;
  EditPantryItem: { itemId: string };
  ExpirationTracker: undefined;
  CategoryView: { categoryId: string };
};

// ========================================
// Utility Types
// ========================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type EntityId = string;

export type Timestamp = string; // ISO 8601 format

export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type LanguageCode = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

// ========================================
// Error Types
// ========================================

export interface AppError {
  readonly code: string;
  readonly message: string;
  readonly statusCode?: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;
  readonly requestId?: string;
}

export interface ValidationError extends AppError {
  readonly field: string;
  readonly value: unknown;
  readonly constraint: string;
}

export interface NetworkError extends AppError {
  readonly url: string;
  readonly method: string;
  readonly timeout: boolean;
  readonly retryable: boolean;
}

// ========================================
// Feature Flag Types
// ========================================

export interface FeatureFlags {
  readonly offlineMode: boolean;
  readonly pushNotifications: boolean;
  readonly analytics: boolean;
  readonly crashReporting: boolean;
  readonly performanceMonitoring: boolean;
  readonly biometricAuth: boolean;
  readonly darkMode: boolean;
  readonly multiLanguage: boolean;
  readonly socialFeatures: boolean;
  readonly premiumFeatures: boolean;
}

// ========================================
// Environment Types
// ========================================

export interface EnvironmentConfig {
  readonly nodeEnv: 'development' | 'staging' | 'production';
  readonly apiBaseUrl: string;
  readonly apiTimeout: number;
  readonly apiRetryAttempts: number;
  readonly enableLogging: boolean;
  readonly enableCrashReporting: boolean;
  readonly enableAnalytics: boolean;
  readonly featureFlags: FeatureFlags;
}

// ========================================
// Export all types
// ========================================

export * from './auth';
export * from './navigation';
export * from './api';
export * from './ui';
