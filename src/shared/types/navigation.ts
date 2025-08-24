// ========================================
// Navigation Types - React Navigation v6 type definitions
// ========================================

import type { NavigatorScreenParams, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ========================================
// Root Navigation Stack
// ========================================

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Modal: NavigatorScreenParams<ModalStackParamList> | undefined;
  // Global modals that can be accessed from anywhere
  ImageViewer: {
    images: string[];
    initialIndex?: number;
  };
  WebView: {
    url: string;
    title?: string;
  };
  Permissions: {
    permission: PermissionType;
    callback?: () => void;
  };
};

// ========================================
// Authentication Stack
// ========================================

export type AuthStackParamList = {
  Welcome: undefined;
  Login: {
    email?: string;
    redirectTo?: keyof MainTabParamList;
  };
  Register: {
    email?: string;
    referralCode?: string;
  };
  ForgotPassword: {
    email?: string;
  };
  ResetPassword: {
    token: string;
    email: string;
  };
  VerifyEmail: {
    email: string;
    resendToken?: string;
  };
  TwoFactor: {
    methods: TwoFactorMethod[];
    sessionToken: string;
  };
  BiometricSetup: {
    skipable?: boolean;
  };
};

export interface TwoFactorMethod {
  type: 'sms' | 'email' | 'authenticator';
  enabled: boolean;
  masked?: string; // masked phone/email
}

// ========================================
// Main Tab Navigation
// ========================================

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Lists: NavigatorScreenParams<ListsStackParamList>;
  Pantry: NavigatorScreenParams<PantryStackParamList>;
  Analytics: NavigatorScreenParams<AnalyticsStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// ========================================
// Dashboard Stack
// ========================================

export type DashboardStackParamList = {
  DashboardHome: undefined;
  QuickAdd: {
    type: 'list' | 'item';
    listId?: string;
  };
  Notifications: undefined;
  Search: {
    query?: string;
    category?: string;
  };
  Scanner: {
    mode: 'barcode' | 'receipt';
    callback?: (result: ScanResult) => void;
  };
};

export interface ScanResult {
  type: 'barcode' | 'receipt';
  data: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

// ========================================
// Shopping Lists Stack
// ========================================

export type ListsStackParamList = {
  ListsHome: {
    filter?: ListFilter;
    sort?: ListSort;
  };
  ListDetail: {
    listId: string;
    mode?: 'view' | 'edit' | 'shopping';
  };
  CreateList: {
    template?: ListTemplate;
    collaborators?: string[];
  };
  EditList: {
    listId: string;
  };
  ShoppingMode: {
    listId: string;
    storeId?: string;
  };
  InviteCollaborators: {
    listId: string;
  };
  ManageCollaborators: {
    listId: string;
  };
  ListHistory: {
    listId: string;
  };
  ListTemplates: undefined;
  ShareList: {
    listId: string;
  };
  ListSettings: {
    listId: string;
  };
};

export interface ListFilter {
  status?: 'active' | 'completed' | 'archived';
  owner?: 'mine' | 'shared' | 'all';
  category?: string;
  dateRange?: DateRange;
}

export interface ListSort {
  field: 'name' | 'created' | 'updated' | 'priority';
  direction: 'asc' | 'desc';
}

export interface ListTemplate {
  id: string;
  name: string;
  description?: string;
  items: TemplateItem[];
  category: string;
}

export interface TemplateItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface DateRange {
  start: Date;
  end: Date;
}

// ========================================
// Pantry Stack
// ========================================

export type PantryStackParamList = {
  PantryHome: {
    filter?: PantryFilter;
    sort?: PantrySort;
    view?: 'grid' | 'list';
  };
  PantryItem: {
    itemId: string;
    mode?: 'view' | 'edit';
  };
  AddPantryItem: {
    barcode?: string;
    name?: string;
    fromList?: boolean;
  };
  EditPantryItem: {
    itemId: string;
  };
  ExpirationTracker: {
    timeframe?: 'today' | 'week' | 'month';
  };
  CategoryView: {
    categoryId: string;
    categoryName: string;
  };
  LocationView: {
    location: PantryLocation;
  };
  BulkEdit: {
    itemIds: string[];
  };
  PantrySettings: undefined;
  InventoryReport: undefined;
};

export interface PantryFilter {
  category?: string;
  location?: PantryLocation;
  expirationStatus?: 'fresh' | 'expiring' | 'expired';
  stockLevel?: 'low' | 'medium' | 'high';
  dateAdded?: DateRange;
}

export interface PantrySort {
  field: 'name' | 'expiration' | 'category' | 'quantity' | 'added';
  direction: 'asc' | 'desc';
}

export interface PantryLocation {
  area: 'pantry' | 'fridge' | 'freezer' | 'countertop' | 'cabinet';
  shelf?: string;
  container?: string;
}

// ========================================
// Analytics Stack
// ========================================

export type AnalyticsStackParamList = {
  AnalyticsHome: undefined;
  SpendingReport: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    categoryId?: string;
  };
  CategoryAnalytics: {
    categoryId: string;
    categoryName: string;
  };
  StoreAnalytics: {
    storeId: string;
    storeName: string;
  };
  BudgetTracker: undefined;
  CostComparison: {
    itemId?: string;
    categoryId?: string;
  };
  ExportData: undefined;
  Insights: undefined;
  Goals: undefined;
  SetBudget: {
    categoryId?: string;
    period: 'weekly' | 'monthly' | 'yearly';
  };
};

// ========================================
// Profile Stack
// ========================================

export type ProfileStackParamList = {
  ProfileHome: undefined;
  EditProfile: undefined;
  AccountSettings: undefined;
  NotificationSettings: undefined;
  PrivacySettings: undefined;
  SecuritySettings: undefined;
  SubscriptionManagement: undefined;
  PaymentMethods: undefined;
  TwoFactorAuth: undefined;
  BiometricSettings: undefined;
  DataManagement: undefined;
  ExportData: undefined;
  DeleteAccount: undefined;
  Support: undefined;
  About: undefined;
  Feedback: undefined;
  InviteFriends: undefined;
  AppSettings: undefined;
  ThemeSettings: undefined;
  LanguageSettings: undefined;
  DeviceManagement: undefined;
};

// ========================================
// Modal Stack
// ========================================

export type ModalStackParamList = {
  // Item management modals
  AddItem: {
    listId?: string;
    category?: string;
    barcode?: string;
  };
  EditItem: {
    itemId: string;
    listId?: string;
  };
  ItemDetail: {
    itemId: string;
    context: 'list' | 'pantry';
  };

  // Collaboration modals
  ShareSheet: {
    type: 'list' | 'item';
    id: string;
  };
  CollaboratorPicker: {
    listId: string;
    excludeUserIds?: string[];
  };

  // General modals
  FilterSheet: {
    currentFilter: Record<string, unknown>;
    onApply: (filter: Record<string, unknown>) => void;
  };
  SortSheet: {
    currentSort: { field: string; direction: 'asc' | 'desc' };
    onApply: (sort: { field: string; direction: 'asc' | 'desc' }) => void;
  };
  ConfirmationModal: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  };

  // Feature-specific modals
  LocationPicker: {
    currentLocation?: PantryLocation;
    onSelect: (location: PantryLocation) => void;
  };
  CategoryPicker: {
    selectedCategories?: string[];
    multiSelect?: boolean;
    onSelect: (categories: string[]) => void;
  };
  DatePicker: {
    date?: Date;
    mode?: 'date' | 'datetime' | 'time';
    minimumDate?: Date;
    maximumDate?: Date;
    onSelect: (date: Date) => void;
  };
  StorePicker: {
    currentStoreId?: string;
    onSelect: (storeId: string) => void;
  };
};

// ========================================
// Navigation Props Types
// ========================================

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
export type AuthStackNavigationProp = StackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
export type DashboardStackNavigationProp = StackNavigationProp<DashboardStackParamList>;
export type ListsStackNavigationProp = StackNavigationProp<ListsStackParamList>;
export type PantryStackNavigationProp = StackNavigationProp<PantryStackParamList>;
export type AnalyticsStackNavigationProp = StackNavigationProp<AnalyticsStackParamList>;
export type ProfileStackNavigationProp = StackNavigationProp<ProfileStackParamList>;
export type ModalStackNavigationProp = StackNavigationProp<ModalStackParamList>;

// ========================================
// Route Props Types
// ========================================

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
export type AuthStackRouteProp<T extends keyof AuthStackParamList> = RouteProp<
  AuthStackParamList,
  T
>;
export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<MainTabParamList, T>;
export type DashboardStackRouteProp<T extends keyof DashboardStackParamList> = RouteProp<
  DashboardStackParamList,
  T
>;
export type ListsStackRouteProp<T extends keyof ListsStackParamList> = RouteProp<
  ListsStackParamList,
  T
>;
export type PantryStackRouteProp<T extends keyof PantryStackParamList> = RouteProp<
  PantryStackParamList,
  T
>;
export type AnalyticsStackRouteProp<T extends keyof AnalyticsStackParamList> = RouteProp<
  AnalyticsStackParamList,
  T
>;
export type ProfileStackRouteProp<T extends keyof ProfileStackParamList> = RouteProp<
  ProfileStackParamList,
  T
>;
export type ModalStackRouteProp<T extends keyof ModalStackParamList> = RouteProp<
  ModalStackParamList,
  T
>;

// ========================================
// Navigation State Types
// ========================================

export interface NavigationState {
  readonly currentRoute: string;
  readonly previousRoute?: string;
  readonly history: NavigationHistoryEntry[];
  readonly isLoading: boolean;
  readonly deepLinkPending?: string;
}

export interface NavigationHistoryEntry {
  readonly route: string;
  readonly params?: Record<string, unknown>;
  readonly timestamp: Date;
}

// ========================================
// Utility Types
// ========================================

export type PermissionType =
  | 'camera'
  | 'location'
  | 'notifications'
  | 'microphone'
  | 'storage'
  | 'contacts';

export interface TabBarIcon {
  focused: boolean;
  color: string;
  size: number;
}

export interface HeaderButton {
  title?: string;
  icon?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

export interface NavigationOptions {
  title?: string;
  headerShown?: boolean;
  headerTitle?: string;
  headerLeft?: () => React.ReactNode;
  headerRight?: () => React.ReactNode;
  headerBackTitle?: string;
  headerBackTitleVisible?: boolean;
  gestureEnabled?: boolean;
  animationEnabled?: boolean;
  presentation?: 'card' | 'modal' | 'transparentModal';
}

// ========================================
// Deep Linking Types
// ========================================

export interface DeepLinkConfig {
  screens: {
    Auth: {
      screens: {
        Login: 'auth/login';
        Register: 'auth/register';
        ForgotPassword: 'auth/forgot-password';
        ResetPassword: 'auth/reset-password/:token';
        VerifyEmail: 'auth/verify-email/:token';
      };
    };
    Main: {
      screens: {
        Lists: {
          screens: {
            ListsHome: 'lists';
            ListDetail: 'lists/:listId';
            CreateList: 'lists/create';
            EditList: 'lists/:listId/edit';
            ShoppingMode: 'lists/:listId/shop';
            InviteCollaborators: 'lists/:listId/invite';
          };
        };
        Pantry: {
          screens: {
            PantryHome: 'pantry';
            PantryItem: 'pantry/:itemId';
            AddPantryItem: 'pantry/add';
            ExpirationTracker: 'pantry/expiring';
          };
        };
        Analytics: {
          screens: {
            AnalyticsHome: 'analytics';
            SpendingReport: 'analytics/spending';
            BudgetTracker: 'analytics/budget';
          };
        };
        Profile: {
          screens: {
            ProfileHome: 'profile';
            AccountSettings: 'profile/settings';
            SubscriptionManagement: 'profile/subscription';
          };
        };
      };
    };
    Modal: {
      screens: {
        AddItem: 'modal/add-item';
        ShareSheet: 'modal/share';
      };
    };
  };
}

export interface ParsedDeepLink {
  readonly routeName: string;
  readonly params: Record<string, string | undefined>;
  readonly isValid: boolean;
  readonly error?: string;
}
