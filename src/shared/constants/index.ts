// Application constants

export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  SHOPPING_LISTS: '/shopping-lists',
  PANTRY: '/pantry',
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  OFFLINE_ACTIONS: 'offline_actions',
} as const;

export const NAVIGATION_ROUTES = {
  AUTH_STACK: 'AuthStack',
  MAIN_STACK: 'MainStack',
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  SHOPPING_LISTS: 'ShoppingLists',
  PANTRY: 'Pantry',
  PROFILE: 'Profile',
} as const;

export const THEME_COLORS = {
  PRIMARY: '#007AFF',
  SECONDARY: '#5856D6',
  SUCCESS: '#34C759',
  WARNING: '#FF9500',
  ERROR: '#FF3B30',
  BACKGROUND: '#F2F2F7',
  SURFACE: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#8E8E93',
} as const;
