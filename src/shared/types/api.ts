// ========================================
// API Types - HTTP Client and API Response Types
// ========================================

// ========================================
// Base API Types
// ========================================

export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly success: boolean;
  readonly message?: string;
  readonly errors?: ApiError[];
  readonly metadata?: ApiMetadata;
  readonly timestamp: string;
  readonly requestId: string;
}

export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
  readonly details?: Record<string, unknown>;
  readonly path?: string;
  readonly timestamp: string;
}

export interface ApiMetadata {
  readonly version: string;
  readonly environment: string;
  readonly rateLimit?: RateLimitInfo;
  readonly deprecation?: DeprecationInfo;
  readonly caching?: CachingInfo;
}

export interface RateLimitInfo {
  readonly limit: number;
  readonly remaining: number;
  readonly resetTime: string;
  readonly retryAfter?: number;
}

export interface DeprecationInfo {
  readonly deprecated: boolean;
  readonly sunset?: string;
  readonly link?: string;
  readonly message?: string;
}

export interface CachingInfo {
  readonly cached: boolean;
  readonly cacheKey?: string;
  readonly ttl?: number;
  readonly lastModified?: string;
  readonly etag?: string;
}

// ========================================
// Paginated Responses
// ========================================

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  readonly pagination: PaginationInfo;
}

export interface PaginationInfo {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNext: boolean;
  readonly hasPrev: boolean;
  readonly nextCursor?: string;
  readonly prevCursor?: string;
}

export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: SortParams;
  readonly filter?: FilterParams;
}

export interface SortParams {
  readonly field: string;
  readonly direction: 'asc' | 'desc';
}

export interface FilterParams {
  readonly [key: string]: string | number | boolean | string[] | undefined;
}

// ========================================
// HTTP Client Configuration
// ========================================

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly timeout: number;
  readonly retryAttempts: number;
  readonly retryDelay: number;
  readonly retryCondition?: (error: ApiError) => boolean;
  readonly headers: Record<string, string>;
  readonly interceptors?: ApiInterceptors;
  readonly cache?: CacheConfig;
}

export interface ApiInterceptors {
  readonly request?: RequestInterceptor[];
  readonly response?: ResponseInterceptor[];
  readonly error?: ErrorInterceptor[];
}

export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
export type ResponseInterceptor<T = unknown> = (response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

export interface CacheConfig {
  readonly enabled: boolean;
  readonly ttl: number; // seconds
  readonly maxSize: number; // bytes
  readonly excludePatterns?: RegExp[];
  readonly includePatterns?: RegExp[];
}

// ========================================
// Request Configuration
// ========================================

export interface RequestConfig {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly params?: Record<string, unknown>;
  readonly data?: unknown;
  readonly timeout?: number;
  readonly retryAttempts?: number;
  readonly cache?: boolean;
  readonly authentication?: AuthConfig;
  readonly validation?: ValidationConfig;
  readonly transform?: TransformConfig;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';

export interface AuthConfig {
  readonly type: 'bearer' | 'basic' | 'api-key' | 'none';
  readonly token?: string;
  readonly username?: string;
  readonly password?: string;
  readonly apiKey?: string;
  readonly refreshToken?: string;
}

export interface ValidationConfig {
  readonly validateRequest?: boolean;
  readonly validateResponse?: boolean;
  readonly schema?: Record<string, unknown>;
}

export interface TransformConfig {
  readonly request?: (data: unknown) => unknown;
  readonly response?: (data: unknown) => unknown;
}

// ========================================
// Network State
// ========================================

export interface NetworkState {
  readonly isConnected: boolean;
  readonly isInternetReachable: boolean;
  readonly type: NetworkType;
  readonly details: NetworkDetails;
}

export type NetworkType = 'none' | 'unknown' | 'cellular' | 'wifi' | 'bluetooth' | 'ethernet' | 'wimax' | 'vpn' | 'other';

export interface NetworkDetails {
  readonly strength?: number; // 0-100
  readonly frequency?: number; // WiFi frequency in MHz
  readonly ssid?: string; // WiFi SSID
  readonly bssid?: string; // WiFi BSSID
  readonly carrier?: string; // Cellular carrier
  readonly generation?: string; // Cellular generation (3G, 4G, 5G)
}

// ========================================
// Offline Support
// ========================================

export interface OfflineConfig {
  readonly enabled: boolean;
  readonly queueRequests: boolean;
  readonly maxQueueSize: number;
  readonly syncOnReconnect: boolean;
  readonly conflictResolution: ConflictResolutionStrategy;
  readonly storage: OfflineStorageConfig;
}

export type ConflictResolutionStrategy = 'client-wins' | 'server-wins' | 'merge' | 'manual';

export interface OfflineStorageConfig {
  readonly maxSize: number; // bytes
  readonly encryption: boolean;
  readonly compression: boolean;
  readonly ttl: number; // seconds
}

export interface QueuedRequest {
  readonly id: string;
  readonly config: RequestConfig;
  readonly timestamp: Date;
  readonly attempts: number;
  readonly priority: RequestPriority;
  readonly metadata?: Record<string, unknown>;
}

export type RequestPriority = 'low' | 'normal' | 'high' | 'critical';

// ========================================
// WebSocket Types
// ========================================

export interface WebSocketConfig {
  readonly url: string;
  readonly protocols?: string[];
  readonly reconnect: boolean;
  readonly reconnectInterval: number;
  readonly maxReconnectAttempts: number;
  readonly heartbeat: HeartbeatConfig;
  readonly authentication?: WebSocketAuth;
}

export interface HeartbeatConfig {
  readonly enabled: boolean;
  readonly interval: number; // seconds
  readonly timeout: number; // seconds
  readonly message: string;
}

export interface WebSocketAuth {
  readonly type: 'token' | 'query' | 'header';
  readonly token: string;
  readonly key?: string;
}

export interface WebSocketMessage<T = unknown> {
  readonly type: string;
  readonly payload: T;
  readonly id?: string;
  readonly timestamp: Date;
  readonly metadata?: Record<string, unknown>;
}

export interface WebSocketEvent {
  readonly type: WebSocketEventType;
  readonly data?: unknown;
  readonly error?: string;
  readonly timestamp: Date;
}

export type WebSocketEventType = 
  | 'connected' 
  | 'disconnected' 
  | 'reconnecting' 
  | 'message' 
  | 'error' 
  | 'heartbeat';

// ========================================
// Upload/Download Types
// ========================================

export interface UploadConfig {
  readonly url: string;
  readonly method: 'POST' | 'PUT';
  readonly fieldName: string;
  readonly headers?: Record<string, string>;
  readonly maxFileSize: number; // bytes
  readonly allowedTypes: string[];
  readonly compression?: CompressionConfig;
  readonly progress?: boolean;
}

export interface CompressionConfig {
  readonly enabled: boolean;
  readonly quality: number; // 0-1
  readonly maxWidth?: number;
  readonly maxHeight?: number;
  readonly format?: 'jpeg' | 'png' | 'webp';
}

export interface UploadProgress {
  readonly loaded: number;
  readonly total: number;
  readonly progress: number; // 0-1
  readonly speed?: number; // bytes/second
  readonly timeRemaining?: number; // seconds
}

export interface DownloadConfig {
  readonly url: string;
  readonly destination: string;
  readonly headers?: Record<string, string>;
  readonly resumable: boolean;
  readonly progress?: boolean;
  readonly validation?: FileValidation;
}

export interface FileValidation {
  readonly checksum?: string;
  readonly checksumType?: 'md5' | 'sha1' | 'sha256';
  readonly size?: number;
  readonly type?: string;
}

export interface DownloadProgress {
  readonly downloaded: number;
  readonly total: number;
  readonly progress: number; // 0-1
  readonly speed?: number; // bytes/second
  readonly timeRemaining?: number; // seconds
}

// ========================================
// API Endpoints Configuration
// ========================================

export interface ApiEndpoints {
  readonly auth: AuthEndpoints;
  readonly users: UserEndpoints;
  readonly lists: ListEndpoints;
  readonly items: ItemEndpoints;
  readonly pantry: PantryEndpoints;
  readonly analytics: AnalyticsEndpoints;
  readonly collaboration: CollaborationEndpoints;
  readonly notifications: NotificationEndpoints;
  readonly files: FileEndpoints;
}

export interface AuthEndpoints {
  readonly login: string;
  readonly register: string;
  readonly refresh: string;
  readonly logout: string;
  readonly forgotPassword: string;
  readonly resetPassword: string;
  readonly verifyEmail: string;
  readonly twoFactor: string;
}

export interface UserEndpoints {
  readonly profile: string;
  readonly updateProfile: string;
  readonly preferences: string;
  readonly sessions: string;
  readonly security: string;
  readonly subscription: string;
}

export interface ListEndpoints {
  readonly lists: string;
  readonly createList: string;
  readonly updateList: string;
  readonly deleteList: string;
  readonly shareList: string;
  readonly templates: string;
}

export interface ItemEndpoints {
  readonly items: string;
  readonly createItem: string;
  readonly updateItem: string;
  readonly deleteItem: string;
  readonly search: string;
  readonly barcode: string;
}

export interface PantryEndpoints {
  readonly pantry: string;
  readonly addItem: string;
  readonly updateItem: string;
  readonly removeItem: string;
  readonly categories: string;
  readonly expiring: string;
}

export interface AnalyticsEndpoints {
  readonly spending: string;
  readonly trends: string;
  readonly reports: string;
  readonly insights: string;
  readonly export: string;
}

export interface CollaborationEndpoints {
  readonly invite: string;
  readonly accept: string;
  readonly remove: string;
  readonly permissions: string;
}

export interface NotificationEndpoints {
  readonly notifications: string;
  readonly markRead: string;
  readonly preferences: string;
  readonly push: string;
}

export interface FileEndpoints {
  readonly upload: string;
  readonly download: string;
  readonly delete: string;
  readonly metadata: string;
}

// ========================================
// GraphQL Types (Optional)
// ========================================

export interface GraphQLRequest {
  readonly query: string;
  readonly variables?: Record<string, unknown>;
  readonly operationName?: string;
}

export interface GraphQLResponse<T = unknown> {
  readonly data?: T;
  readonly errors?: GraphQLError[];
  readonly extensions?: Record<string, unknown>;
}

export interface GraphQLError {
  readonly message: string;
  readonly locations?: GraphQLErrorLocation[];
  readonly path?: (string | number)[];
  readonly extensions?: Record<string, unknown>;
}

export interface GraphQLErrorLocation {
  readonly line: number;
  readonly column: number;
}

// ========================================
// Monitoring and Analytics
// ========================================

export interface ApiMetrics {
  readonly requestCount: number;
  readonly errorCount: number;
  readonly averageResponseTime: number;
  readonly successRate: number;
  readonly cacheHitRate: number;
  readonly retryCount: number;
  readonly offlineRequestCount: number;
}

export interface RequestMetrics {
  readonly url: string;
  readonly method: HttpMethod;
  readonly duration: number;
  readonly statusCode: number;
  readonly size: RequestSize;
  readonly cached: boolean;
  readonly retries: number;
  readonly timestamp: Date;
}

export interface RequestSize {
  readonly request: number; // bytes
  readonly response: number; // bytes
}

export interface PerformanceMetrics {
  readonly api: ApiMetrics;
  readonly network: NetworkMetrics;
  readonly cache: CacheMetrics;
  readonly offline: OfflineMetrics;
}

export interface NetworkMetrics {
  readonly connectivity: number; // percentage uptime
  readonly averageLatency: number; // milliseconds
  readonly bandwidth: BandwidthInfo;
}

export interface BandwidthInfo {
  readonly download: number; // Mbps
  readonly upload: number; // Mbps
  readonly measured: Date;
}

export interface CacheMetrics {
  readonly hitRate: number; // percentage
  readonly missRate: number; // percentage
  readonly size: number; // bytes
  readonly itemCount: number;
  readonly evictions: number;
}

export interface OfflineMetrics {
  readonly queueSize: number;
  readonly syncSuccessRate: number;
  readonly conflictCount: number;
  readonly lastSyncTime: Date;
}
