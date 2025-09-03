// ========================================
// Application Constants
// ========================================

export const APP_CONFIG = {
  name: 'PentryPal Next',
  version: '1.0.0',
  description: 'Collaborative grocery and pantry management',
  author: 'PentryPal Team',
  website: 'https://pentrypal.app',
  supportEmail: 'support@pentrypal.app',
} as const;

export const API_CONFIG = {
  baseUrl: process.env.API_BASE_URL ?? 'http://192.168.1.103:8000/api/v1',
  timeout: parseInt(process.env.API_TIMEOUT ?? '30000', 10),
  retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS ?? '3', 10),
  retryDelay: 1000, // milliseconds
  websocketUrl: process.env.WEBSOCKET_URL ?? 'ws://192.168.1.103:8000/api/v1/realtime/ws',
} as const;

export const STORAGE_KEYS = {
  // Authentication
  authTokens: '@pentrypal/auth-tokens',
  refreshToken: '@pentrypal/refresh-token',
  biometricEnabled: '@pentrypal/biometric-enabled',

  // User Data
  userProfile: '@pentrypal/user-profile',
  userPreferences: '@pentrypal/user-preferences',

  // Application State
  onboardingCompleted: '@pentrypal/onboarding-completed',
  appVersion: '@pentrypal/app-version',

  // Cache
  apiCache: '@pentrypal/api-cache',
  imageCache: '@pentrypal/image-cache',

  // Offline
  offlineQueue: '@pentrypal/offline-queue',
  syncTimestamp: '@pentrypal/sync-timestamp',
} as const;

export const VALIDATION_RULES = {
  email: {
    maxLength: 254,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]{2,100}$/,
  },
  listName: {
    minLength: 2,
    maxLength: 100,
  },
  itemName: {
    minLength: 1,
    maxLength: 200,
  },
  description: {
    maxLength: 500,
  },
} as const;

export const LIMITS = {
  // Lists
  maxListsPerUser: 1000,
  maxItemsPerList: 1000,
  maxCollaboratorsPerList: 50,

  // Files
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxImageSize: 5 * 1024 * 1024, // 5MB

  // API
  maxRequestsPerMinute: 100,
  maxBatchSize: 100,

  // Offline
  maxOfflineActions: 1000,
  maxCacheSize: 100 * 1024 * 1024, // 100MB
} as const;

export const TIMEOUTS = {
  api: 30000, // 30 seconds
  biometric: 10000, // 10 seconds
  splash: 2000, // 2 seconds
  toast: 4000, // 4 seconds
  animation: 300, // 300ms
} as const;

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultOffset: 0,
} as const;

export const COLORS = {
  // Brand Colors
  primary: '#19e680',
  primaryDark: '#16c472',
  primaryLight: '#4cffb3',

  // Semantic Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral Colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
} as const;

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 60,
} as const;

export const BORDER_RADIUS = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
} as const;

export const ANIMATIONS = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  easings: {
    easeInOut: 'easeInOut',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    linear: 'linear',
  },
} as const;

export const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const;

export const FEATURE_FLAGS = {
  enableBiometricAuth: true,
  enablePushNotifications: true,
  enableOfflineMode: true,
  enableAnalytics: true,
  enableCrashReporting: true,
  enablePerformanceMonitoring: true,
  enableDarkMode: true,
  enableSocialFeatures: true,
  enablePremiumFeatures: false,
} as const;

export const DEEP_LINKS = {
  scheme: 'pentrypal',
  prefix: 'https://pentrypal.app',
  universal: 'https://pentrypal.app',
} as const;

export const CATEGORIES = [
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: '#ff6b6b' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕', color: '#4ecdc4' },
  { id: 'meat', name: 'Meat & Poultry', icon: '🥩', color: '#45b7d1' },
  { id: 'dairy', name: 'Dairy', icon: '🥛', color: '#f9ca24' },
  { id: 'grains', name: 'Grains & Bread', icon: '🍞', color: '#f0932b' },
  { id: 'snacks', name: 'Snacks', icon: '🍪', color: '#eb4d4b' },
  { id: 'beverages', name: 'Beverages', icon: '🥤', color: '#6c5ce7' },
  { id: 'frozen', name: 'Frozen Foods', icon: '🧊', color: '#74b9ff' },
  { id: 'pantry', name: 'Pantry Staples', icon: '🥫', color: '#a29bfe' },
  { id: 'household', name: 'Household', icon: '🧽', color: '#fd79a8' },
  { id: 'personal', name: 'Personal Care', icon: '🧴', color: '#fdcb6e' },
  { id: 'other', name: 'Other', icon: '📦', color: '#636e72' },
] as const;

export const UNITS = [
  'pcs',
  'kg',
  'g',
  'lb',
  'oz',
  'l',
  'ml',
  'cup',
  'tbsp',
  'tsp',
  'dozen',
  'bunch',
  'bag',
  'box',
  'can',
  'bottle',
  'jar',
  'pack',
] as const;

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
] as const;

export const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
] as const;

export const ERROR_CODES = {
  // Network
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',

  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Business Logic
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',

  // System
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const STORAGE_SIZES = {
  small: 1024 * 1024, // 1MB
  medium: 5 * 1024 * 1024, // 5MB
  large: 10 * 1024 * 1024, // 10MB
  xlarge: 50 * 1024 * 1024, // 50MB
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  APP_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
  VALIDATION_RULES,
  LIMITS,
  TIMEOUTS,
  PAGINATION,
  COLORS,
  SPACING,
  FONT_SIZES,
  BORDER_RADIUS,
  SHADOWS,
  ANIMATIONS,
  BREAKPOINTS,
  FEATURE_FLAGS,
  DEEP_LINKS,
  CATEGORIES,
  UNITS,
  CURRENCIES,
  LANGUAGES,
  ERROR_CODES,
  STORAGE_SIZES,
} as const;
