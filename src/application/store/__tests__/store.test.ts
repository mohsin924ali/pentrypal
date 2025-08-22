/**
 * Store Configuration Tests
 */

import { store, persistor } from '../index';
import { setLoading } from '../slices/authSlice';
import { setTheme } from '../slices/uiSlice';

describe('Redux Store', () => {
  it('should have the correct initial state structure', () => {
    const state = store.getState();

    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('shoppingLists');
    expect(state).toHaveProperty('pantry');
    expect(state).toHaveProperty('offline');
    expect(state).toHaveProperty('api');
  });

  it('should handle auth actions', () => {
    store.dispatch(setLoading(true));

    const state = store.getState();
    expect(state.auth.isLoading).toBe(true);
  });

  it('should handle UI actions', () => {
    store.dispatch(setTheme('dark'));

    const state = store.getState();
    expect(state.ui.theme).toBe('dark');
  });

  it('should have persistor configured', () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.flush).toBe('function');
    expect(typeof persistor.pause).toBe('function');
    expect(typeof persistor.persist).toBe('function');
    expect(typeof persistor.purge).toBe('function');
  });

  it('should have middleware configured', () => {
    // Test that middleware is working by dispatching an action
    const initialState = store.getState();
    store.dispatch(setLoading(false));
    const newState = store.getState();

    expect(newState).not.toBe(initialState);
    expect(newState.auth.isLoading).toBe(false);
  });
});
