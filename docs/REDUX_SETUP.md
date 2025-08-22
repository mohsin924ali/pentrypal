# Redux State Management Setup

## Overview

This document describes the Redux Toolkit setup implemented for PentryPal, including state management, persistence, offline functionality, and API integration.

## Architecture

### Store Structure

```typescript
RootState = {
  auth: AuthState,           // User authentication and profile
  ui: UIState,              // Global UI state and preferences  
  shoppingLists: ShoppingListsState,  // Shopping lists and items
  pantry: PantryState,      // Pantry inventory management
  offline: OfflineState,    // Offline queue and sync status
  api: ApiState,           // RTK Query API cache
}
```

### Key Features

- **Redux Toolkit**: Modern Redux with simplified syntax
- **RTK Query**: Powerful data fetching and caching
- **Redux Persist**: State persistence with AsyncStorage
- **Offline Support**: Action queuing and synchronization
- **TypeScript**: Full type safety throughout
- **Middleware**: Custom offline middleware for network handling

## Store Configuration

### Main Store (`src/application/store/index.ts`)

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/FLUSH', 'persist/REHYDRATE', ...],
      },
    })
    .concat(apiSlice.middleware)
    .concat(offlineMiddleware),
  devTools: __DEV__,
});
```

### Persistence Configuration

```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'shoppingLists', 'pantry', 'ui'],
  blacklist: ['api', 'offline'],
};
```

## State Slices

### 1. Auth Slice (`authSlice.ts`)

Manages user authentication and profile data.

**State:**
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  lastLoginTime: string | null;
  error: string | null;
}
```

**Key Actions:**
- `setTokens` - Set authentication tokens and user data
- `updateUser` - Update user profile information
- `updatePreferences` - Update user preferences
- `logout` - Clear authentication state
- `setBiometricEnabled` - Toggle biometric authentication

### 2. UI Slice (`uiSlice.ts`)

Manages global UI state and user interface preferences.

**State:**
```typescript
interface UIState {
  theme: 'light' | 'dark' | 'system';
  loading: boolean;
  toast: ToastState;
  modal: ModalState;
  bottomSheet: BottomSheetState;
  keyboard: KeyboardState;
  safeArea: SafeAreaState;
  orientation: 'portrait' | 'landscape';
  networkStatus: 'online' | 'offline' | 'unknown';
}
```

**Key Actions:**
- `setTheme` - Change app theme
- `showToast` / `hideToast` - Toast notifications
- `showModal` / `hideModal` - Modal management
- `setLoading` - Global loading state
- `setNetworkStatus` - Network connectivity status

### 3. Shopping Lists Slice (`shoppingListsSlice.ts`)

Manages shopping lists, items, and collaborators.

**State:**
```typescript
interface ShoppingListsState {
  lists: Record<string, ShoppingList>;
  activeListId: string | null;
  filters: ListFilters;
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
}
```

**Key Actions:**
- `addList` / `updateList` / `removeList` - List management
- `addItem` / `updateItem` / `removeItem` - Item management
- `toggleItemCompleted` - Mark items as completed
- `setActiveList` - Set currently active list
- `addCollaborator` / `removeCollaborator` - Collaboration

### 4. Pantry Slice (`pantrySlice.ts`)

Manages pantry inventory with expiry tracking and stock management.

**State:**
```typescript
interface PantryState {
  items: Record<string, PantryItem>;
  filters: PantryFilters;
  sortBy: SortOption;
  lowStockItems: string[];
  expiringItems: string[];
  locations: string[];
}
```

**Key Actions:**
- `addItem` / `updateItem` / `removeItem` - Item management
- `updateQuantity` / `consumeItem` / `restockItem` - Quantity management
- `refreshExpiringItems` - Update expiry tracking
- `addLocation` / `removeLocation` - Location management

### 5. Offline Slice (`offlineSlice.ts`)

Manages offline functionality and action synchronization.

**State:**
```typescript
interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  conflictResolutions: ConflictResolution[];
  lastSyncTime: string | null;
  syncInProgress: boolean;
}
```

**Key Actions:**
- `setOnlineStatus` - Network status updates
- `addPendingAction` / `removePendingAction` - Queue management
- `setSyncInProgress` / `setSyncSuccess` - Sync status
- `addConflictResolution` / `resolveConflict` - Conflict handling

## API Integration (RTK Query)

### Base API Slice (`apiSlice.ts`)

```typescript
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'ShoppingList', 'ShoppingItem', 'PantryItem'],
  endpoints: (builder) => ({
    // Endpoints will be injected by feature slices
  }),
});
```

**Features:**
- Automatic token refresh on 401 responses
- Request/response interceptors
- Intelligent caching with tags
- Optimistic updates support

## Offline Functionality

### Offline Middleware (`offlineMiddleware.ts`)

Automatically queues actions when offline and syncs when back online.

**Queueable Actions:**
- Shopping list operations (add, update, delete)
- Pantry item operations
- User profile updates
- Item completion toggles

**Sync Process:**
1. Detect network status changes
2. Queue actions when offline
3. Retry failed actions with exponential backoff
4. Handle conflicts with resolution strategies

## Usage Examples

### Basic Usage with Hooks

```typescript
import { useAppSelector, useAppDispatch } from '@/application/store/hooks';
import { setTheme } from '@/application/store/slices/uiSlice';

const MyComponent = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector(state => state.ui.theme);
  
  const handleThemeChange = () => {
    dispatch(setTheme('dark'));
  };
  
  return <Button onPress={handleThemeChange}>Toggle Theme</Button>;
};
```

### Authentication Flow

```typescript
import { setTokens, logout } from '@/application/store/slices/authSlice';

// Login
dispatch(setTokens({
  token: 'access-token',
  refreshToken: 'refresh-token',
  user: userData,
}));

// Logout
dispatch(logout());
```

### Shopping List Management

```typescript
import { addList, addItem } from '@/application/store/slices/shoppingListsSlice';

// Add new list
dispatch(addList({
  id: 'list-1',
  name: 'Grocery List',
  items: [],
  // ... other properties
}));

// Add item to list
dispatch(addItem({
  listId: 'list-1',
  item: {
    id: 'item-1',
    name: 'Milk',
    quantity: 1,
    // ... other properties
  },
}));
```

### RTK Query Usage

```typescript
import { useHealthCheckQuery } from '@/application/store/api/apiSlice';

const HealthCheck = () => {
  const { data, error, isLoading } = useHealthCheckQuery();
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return <Text>Status: {data?.status}</Text>;
};
```

## Provider Setup

### Redux Provider (`ReduxProvider.tsx`)

```typescript
import { ReduxProvider } from '@/application/providers/ReduxProvider';

const App = () => (
  <ReduxProvider>
    <YourAppContent />
  </ReduxProvider>
);
```

The provider includes:
- Redux store provision
- Persistence gate for rehydration
- Network listener initialization
- Automatic cleanup on unmount

## Testing

### Test Utilities

```typescript
import { createTestStore } from '@test/utils';

const store = createTestStore({
  auth: { user: mockUser, isAuthenticated: true },
});
```

### Integration Tests

Comprehensive tests cover:
- Individual slice functionality
- Cross-slice interactions
- Store configuration
- Middleware behavior
- Persistence handling

## Performance Considerations

### Optimizations Implemented

1. **Selective Persistence**: Only persist necessary slices
2. **Normalized State**: Entities stored by ID for efficient updates
3. **Memoized Selectors**: Prevent unnecessary re-renders
4. **RTK Query Caching**: Intelligent data caching and invalidation
5. **Offline Queue Limits**: Prevent memory issues with large queues

### Best Practices

1. Use typed hooks (`useAppSelector`, `useAppDispatch`)
2. Keep actions simple and focused
3. Use RTK Query for server state
4. Implement proper error boundaries
5. Monitor bundle size impact

## Debugging

### Redux DevTools

Enabled in development mode with:
- Action history
- State inspection
- Time-travel debugging
- Performance monitoring

### Logging

Development logging includes:
- Action dispatches
- State changes
- Network events
- Sync operations

## Migration and Updates

### Adding New Slices

1. Create slice file in `src/application/store/slices/`
2. Add to root reducer in `index.ts`
3. Update persistence config if needed
4. Add to TypeScript types
5. Write comprehensive tests

### API Endpoints

1. Create endpoint in appropriate API slice
2. Use `injectEndpoints` for code splitting
3. Define proper cache tags
4. Implement optimistic updates if needed

## Security Considerations

### Token Management

- Tokens stored securely with Redux Persist
- Automatic refresh on expiry
- Secure cleanup on logout
- Biometric authentication support

### Data Protection

- Sensitive data excluded from persistence
- Proper error handling to prevent data leaks
- Network request encryption
- Input validation and sanitization

## Conclusion

This Redux setup provides a robust, scalable foundation for PentryPal's state management needs. It includes modern best practices, comprehensive offline support, and full TypeScript integration while maintaining excellent developer experience and performance.