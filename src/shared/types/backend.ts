// ========================================
// Backend API Types - Match FastAPI Backend Responses
// ========================================

// ========================================
// Base API Response Types
// ========================================

export interface ApiResponse<T = unknown> {
  readonly data?: T;
  readonly detail?: string; // FastAPI uses 'detail' for error messages
  readonly error_code?: string;
  readonly timestamp?: string;
}

export interface PaginatedApiResponse<T> {
  readonly data: T[];
  readonly total: number;
  readonly skip: number;
  readonly limit: number;
  readonly has_more: boolean;
}

// ========================================
// Authentication Types (Backend Compatible)
// ========================================

export interface BackendUser {
  readonly id: string;
  readonly email: string;
  readonly phone: string;
  readonly country_code: string;
  readonly name: string;
  readonly avatar_url?: string;
  readonly is_active: boolean;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendTokens {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly token_type: 'bearer';
  readonly expires_in: number; // seconds
}

export interface BackendLoginRequest {
  readonly email_or_phone: string;
  readonly password: string;
}

export interface BackendLoginResponse {
  readonly user: BackendUser;
  readonly tokens: BackendTokens;
}

export interface BackendRegisterRequest {
  readonly email: string;
  readonly phone: string;
  readonly country_code: string;
  readonly name: string;
  readonly password: string;
}

export interface BackendRegisterResponse {
  readonly user: BackendUser;
  readonly tokens: BackendTokens;
}

export interface BackendBiometricLoginRequest {
  readonly user_id: string;
  readonly signature: string;
  readonly device_id: string;
}

export interface BackendRefreshTokenRequest {
  readonly refresh_token: string;
}

// ========================================
// User Management Types
// ========================================

export interface BackendUserPreferences {
  readonly id: string;
  readonly user_id: string;
  readonly theme: 'light' | 'dark' | 'system';
  readonly language: string;
  readonly currency: string;
  readonly timezone: string;
  readonly notifications: {
    readonly push_enabled: boolean;
    readonly email_enabled: boolean;
    readonly list_updates: boolean;
    readonly friend_requests: boolean;
    readonly reminders: boolean;
    readonly marketing: boolean;
  };
  readonly privacy: {
    readonly profile_visibility: 'public' | 'friends' | 'private';
    readonly show_online_status: boolean;
    readonly allow_friend_requests: boolean;
  };
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendUserUpdate {
  readonly name?: string;
  readonly avatar_url?: string;
}

export interface BackendPasswordChangeRequest {
  readonly current_password: string;
  readonly new_password: string;
}

export interface BackendSecuritySettings {
  readonly id: string;
  readonly user_id: string;
  readonly biometric_enabled: boolean;
  readonly login_alerts: boolean;
  readonly session_timeout: number;
  readonly max_sessions: number;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendBiometricAuthRequest {
  readonly public_key: string;
  readonly device_id: string;
}

// ========================================
// Shopping List Types
// ========================================

export interface BackendShoppingList {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly owner_id: string;
  readonly status: 'active' | 'completed' | 'archived';
  readonly budget_amount?: number;
  readonly budget_currency?: string;
  readonly created_at: string;
  readonly updated_at: string;
  readonly items?: BackendShoppingItem[];
  readonly collaborators?: BackendListCollaborator[];
}

export interface BackendShoppingItem {
  readonly id: string;
  readonly list_id: string;
  readonly name: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly category_id?: string;
  readonly completed: boolean;
  readonly estimated_price?: number;
  readonly actual_price?: number;
  readonly assigned_to?: string;
  readonly notes?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendListCollaborator {
  readonly id: string;
  readonly list_id: string;
  readonly user_id: string;
  readonly role: 'owner' | 'editor' | 'viewer';
  readonly permissions: {
    readonly can_edit_items: boolean;
    readonly can_add_items: boolean;
    readonly can_delete_items: boolean;
    readonly can_invite_others: boolean;
  };
  readonly created_at: string;
  readonly updated_at: string;
  readonly user?: BackendUser; // Include nested user data
}

export interface BackendShoppingListCreate {
  readonly name: string;
  readonly description?: string;
  readonly budget_amount?: number;
  readonly budget_currency?: string;
}

export interface BackendShoppingListUpdate {
  readonly name?: string;
  readonly description?: string;
  readonly status?: 'active' | 'completed' | 'archived';
  readonly budget_amount?: number;
  readonly budget_currency?: string;
}

export interface BackendShoppingItemCreate {
  readonly name: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly category_id?: string;
  readonly estimated_price?: number;
  readonly notes?: string;
}

export interface BackendShoppingItemUpdate {
  readonly name?: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly completed?: boolean;
  readonly actual_price?: number;
  readonly assigned_to?: string;
  readonly notes?: string;
}

// ========================================
// Pantry Management Types
// ========================================

export interface BackendPantryItem {
  readonly id: string;
  readonly user_id: string;
  readonly name: string;
  readonly category_id?: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly location?: string;
  readonly expiration_date?: string;
  readonly low_stock_threshold?: number;
  readonly barcode?: string;
  readonly image_url?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendPantryItemCreate {
  readonly name: string;
  readonly category_id?: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly location?: string;
  readonly expiration_date?: string;
  readonly low_stock_threshold?: number;
  readonly barcode?: string;
}

export interface BackendPantryItemUpdate {
  readonly name?: string;
  readonly category_id?: string;
  readonly quantity?: number;
  readonly unit?: string;
  readonly location?: string;
  readonly expiration_date?: string;
  readonly low_stock_threshold?: number;
  readonly barcode?: string;
  readonly image_url?: string;
}

export interface BackendPantryStats {
  readonly total_items: number;
  readonly expiring_soon: number;
  readonly expired_items: number;
  readonly low_stock_items: number;
  readonly categories_count: number;
  readonly locations_count: number;
}

export interface BackendPantryItemConsume {
  readonly quantity_used: number;
  readonly notes?: string;
}

// ========================================
// Social Features Types
// ========================================

export interface BackendUserSearch {
  readonly query: string;
  readonly limit?: number;
  readonly skip?: number;
}

export interface BackendFriendship {
  readonly id: string;
  readonly user1_id: string;
  readonly user2_id: string;
  readonly initiated_by: string;
  readonly status: 'active' | 'blocked';
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendFriendRequest {
  readonly id: string;
  readonly from_user_id: string;
  readonly to_user_id: string;
  readonly status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  readonly message?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

export interface BackendFriendRequestCreate {
  readonly to_user_id: string;
  readonly message?: string;
}

export interface BackendFriendRequestUpdate {
  readonly status: 'accepted' | 'rejected';
}

export interface BackendUserSearch {
  readonly query: string;
  readonly limit?: number;
}

export interface BackendRelationshipStatus {
  readonly status: 'none' | 'friends' | 'request_sent' | 'request_received' | 'blocked';
  readonly can_send_request: boolean;
}

// ========================================
// Category Types
// ========================================

export interface BackendItemCategory {
  readonly id: string;
  readonly name: string;
  readonly icon?: string;
  readonly color?: string;
  readonly created_at: string;
  readonly updated_at: string;
}

// ========================================
// Activity Log Types
// ========================================

export interface BackendActivityLog {
  readonly id: string;
  readonly user_id: string;
  readonly action: string;
  readonly entity_type: string;
  readonly entity_id: string;
  readonly meta_data?: Record<string, unknown>;
  readonly created_at: string;
}

// ========================================
// WebSocket Message Types
// ========================================

export interface BackendWebSocketMessage<T = unknown> {
  readonly type: string;
  readonly data?: T;
  readonly timestamp: string;
  readonly user_id?: string;
  readonly list_id?: string;
}

export interface BackendListUpdateMessage {
  readonly type: 'list_update';
  readonly data: {
    readonly id: string;
    readonly name: string;
    readonly status: string;
    readonly action: 'created' | 'updated' | 'deleted';
    readonly owner_id: string;
    readonly collaborators: Array<{
      readonly user_id: string;
      readonly role: string;
      readonly permissions: Record<string, boolean>;
    }>;
  };
  readonly list_id: string;
  readonly timestamp: string;
}

export interface BackendItemUpdateMessage {
  readonly type: 'item_update';
  readonly data: {
    readonly id: string;
    readonly name: string;
    readonly quantity?: number;
    readonly unit?: string;
    readonly completed: boolean;
    readonly assigned_to?: string;
    readonly action: 'created' | 'updated' | 'deleted';
  };
  readonly list_id: string;
  readonly timestamp: string;
}

export interface BackendFriendRequestMessage {
  readonly type: 'friend_request';
  readonly data: {
    readonly id: string;
    readonly from_user_id: string;
    readonly to_user_id: string;
    readonly status: string;
    readonly action: 'sent' | 'accepted' | 'declined';
    readonly message?: string;
    readonly created_at: string;
  };
  readonly to_user_id: string;
  readonly timestamp: string;
}

// ========================================
// Error Types
// ========================================

export interface BackendValidationError {
  readonly detail: Array<{
    readonly loc: (string | number)[];
    readonly msg: string;
    readonly type: string;
  }>;
}

export interface BackendError {
  readonly detail: string;
  readonly error_code?: string;
  readonly timestamp?: string;
}

// ========================================
// API Client Configuration
// ========================================

export interface BackendApiConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly websocketUrl: string;
}

// ========================================
// Request/Response Helpers
// ========================================

export type BackendApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface BackendRequestConfig {
  readonly method: BackendApiMethod;
  readonly url: string;
  readonly data?: unknown;
  readonly params?: Record<string, unknown>;
  readonly headers?: Record<string, string>;
  readonly requiresAuth?: boolean;
}

export interface BackendRequestOptions {
  readonly timeout?: number;
  readonly retries?: number;
  readonly retryDelay?: number;
  readonly skipErrorHandling?: boolean;
}

// ========================================
// Type Conversion Helpers
// ========================================

export type BackendToFrontend<T> = T extends BackendUser
  ? User
  : T extends BackendShoppingList
    ? ShoppingList
    : T extends BackendShoppingItem
      ? ShoppingItem
      : T extends BackendPantryItem
        ? PantryItem
        : T extends BackendFriendship
          ? Friendship
          : T extends BackendFriendRequest
            ? FriendRequest
            : T;

// Import frontend types for conversion
import type { AuthUser as User } from './auth';
import type { ShoppingItem, ShoppingList } from './lists';
import type { FriendRequest, Friendship } from './social';

// Pantry item type (to be defined)
export interface PantryItem {
  readonly id: string;
  readonly name: string;
  readonly category?: {
    readonly id: string;
    readonly name: string;
    readonly color: string;
  };
  readonly quantity: number;
  readonly unit?: string;
  readonly location?: string;
  readonly expirationDate?: string;
  readonly lowStockThreshold?: number;
  readonly barcode?: string;
  readonly imageUrl?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
