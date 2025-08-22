/**
 * Redux Integration Tests
 */

import { store } from '../index';
import { setTokens, logout } from '../slices/authSlice';
import { setTheme, showToast } from '../slices/uiSlice';
import { addList, setActiveList } from '../slices/shoppingListsSlice';
import { addItem } from '../slices/pantrySlice';
import {
  createMockUser,
  createMockShoppingList,
  createMockPantryItem,
} from '@test/mocks';

describe('Redux Integration', () => {
  beforeEach(() => {
    // Reset store state before each test
    store.dispatch({ type: 'auth/resetAuth' });
    store.dispatch({ type: 'ui/resetUI' });
    store.dispatch({ type: 'shoppingLists/resetShoppingLists' });
    store.dispatch({ type: 'pantry/resetPantry' });
  });

  it('should handle complete authentication flow', () => {
    const mockUser = createMockUser();

    // Initial state
    expect(store.getState().auth.isAuthenticated).toBe(false);

    // Login
    store.dispatch(
      setTokens({
        token: 'access-token',
        refreshToken: 'refresh-token',
        user: mockUser,
      }),
    );

    const authState = store.getState().auth;
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user).toEqual(mockUser);
    expect(authState.token).toBe('access-token');

    // Logout
    store.dispatch(logout());

    const loggedOutState = store.getState().auth;
    expect(loggedOutState.isAuthenticated).toBe(false);
    expect(loggedOutState.user).toBeNull();
    expect(loggedOutState.token).toBeNull();
  });

  it('should handle UI state management', () => {
    // Initial state
    expect(store.getState().ui.theme).toBe('system');
    expect(store.getState().ui.toast.visible).toBe(false);

    // Update theme
    store.dispatch(setTheme('dark'));
    expect(store.getState().ui.theme).toBe('dark');

    // Show toast
    store.dispatch(
      showToast({
        message: 'Test message',
        type: 'success',
      }),
    );

    const toastState = store.getState().ui.toast;
    expect(toastState.visible).toBe(true);
    expect(toastState.message).toBe('Test message');
    expect(toastState.type).toBe('success');
  });

  it('should handle shopping lists management', () => {
    const mockList = createMockShoppingList();

    // Initial state
    expect(Object.keys(store.getState().shoppingLists.lists)).toHaveLength(0);
    expect(store.getState().shoppingLists.activeListId).toBeNull();

    // Add list
    store.dispatch(addList(mockList));

    const listsState = store.getState().shoppingLists;
    expect(Object.keys(listsState.lists)).toHaveLength(1);
    expect(listsState.lists[mockList.id]).toEqual(mockList);

    // Set active list
    store.dispatch(setActiveList(mockList.id));
    expect(store.getState().shoppingLists.activeListId).toBe(mockList.id);
  });

  it('should handle pantry management', () => {
    const mockItem = createMockPantryItem();

    // Initial state
    expect(Object.keys(store.getState().pantry.items)).toHaveLength(0);

    // Add item
    store.dispatch(addItem(mockItem));

    const pantryState = store.getState().pantry;
    expect(Object.keys(pantryState.items)).toHaveLength(1);
    expect(pantryState.items[mockItem.id]).toEqual(mockItem);
  });

  it('should handle cross-slice interactions', () => {
    const mockUser = createMockUser();
    const mockList = createMockShoppingList({ ownerId: mockUser.id });

    // Login user
    store.dispatch(
      setTokens({
        token: 'token',
        refreshToken: 'refresh-token',
        user: mockUser,
      }),
    );

    // Add list owned by user
    store.dispatch(addList(mockList));

    // Verify state consistency
    const state = store.getState();
    expect(state.auth.user?.id).toBe(mockUser.id);
    expect(state.shoppingLists.lists[mockList.id].ownerId).toBe(mockUser.id);
  });

  it('should maintain state structure integrity', () => {
    const state = store.getState();

    // Verify all required slices exist
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('shoppingLists');
    expect(state).toHaveProperty('pantry');
    expect(state).toHaveProperty('offline');
    expect(state).toHaveProperty('api');

    // Verify slice structure
    expect(state.auth).toHaveProperty('user');
    expect(state.auth).toHaveProperty('isAuthenticated');
    expect(state.ui).toHaveProperty('theme');
    expect(state.ui).toHaveProperty('loading');
    expect(state.shoppingLists).toHaveProperty('lists');
    expect(state.shoppingLists).toHaveProperty('activeListId');
    expect(state.pantry).toHaveProperty('items');
    expect(state.offline).toHaveProperty('isOnline');
  });
});
