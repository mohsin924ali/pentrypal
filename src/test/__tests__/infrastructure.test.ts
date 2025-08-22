/**
 * Infrastructure tests to validate testing setup
 */

import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { createTestStore } from '@test/utils';
import {
  createMockUser,
  createMockShoppingList,
  createApiTestUtils,
} from '@test/mocks';

describe('Testing Infrastructure', () => {
  describe('Mock Data Factories', () => {
    it('should create mock user with default values', () => {
      const user = createMockUser();

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('displayName');
      expect(user).toHaveProperty('preferences');
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.displayName).toBe('string');
    });

    it('should create mock user with overrides', () => {
      const customEmail = 'custom@test.com';
      const user = createMockUser({ email: customEmail });

      expect(user.email).toBe(customEmail);
    });

    it('should create mock shopping list', () => {
      const list = createMockShoppingList();

      expect(list).toHaveProperty('id');
      expect(list).toHaveProperty('name');
      expect(list).toHaveProperty('ownerId');
      expect(list).toHaveProperty('items');
      expect(list).toHaveProperty('collaborators');
      expect(Array.isArray(list.items)).toBe(true);
      expect(Array.isArray(list.collaborators)).toBe(true);
    });
  });

  describe('Test Store', () => {
    it('should create test store with default state', () => {
      const store = createTestStore();
      const state = store.getState();

      expect(state).toHaveProperty('auth');
      expect(state).toHaveProperty('ui');
      expect(state.auth.user).toBeNull();
      expect(state.auth.isAuthenticated).toBe(false);
    });

    it('should create test store with preloaded state', () => {
      const mockUser = createMockUser();
      const preloadedState = {
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
      };

      const store = createTestStore(preloadedState);
      const state = store.getState();

      expect(state.auth.user).toEqual(mockUser);
      expect(state.auth.isAuthenticated).toBe(true);
    });
  });

  describe('API Test Utilities', () => {
    it('should mock successful API requests', () => {
      const apiUtils = createApiTestUtils();
      const mockData = { success: true, data: 'test' };

      apiUtils.mockSuccessfulRequest(mockData);

      // Verify mocks are set up correctly
      expect(jest.isMockFunction(require('@test/mocks').mockAxios.get)).toBe(
        true,
      );
    });

    it('should mock failed API requests', () => {
      const apiUtils = createApiTestUtils();
      const mockError = { status: 500, message: 'Server Error' };

      apiUtils.mockFailedRequest(mockError);

      // Verify error mocks are set up correctly
      expect(jest.isMockFunction(require('@test/mocks').mockAxios.get)).toBe(
        true,
      );
    });
  });

  describe('Custom Matchers', () => {
    it('should extend Jest with custom matchers', () => {
      // Test that custom matchers are available
      expect(expect({}).toHaveAccessibilityLabel).toBeDefined();
      expect(expect({}).toHaveStyle).toBeDefined();
      expect(expect({}).toBeDisabled).toBeDefined();
      expect(expect({}).toBeEnabled).toBeDefined();
    });
  });

  describe('Environment Setup', () => {
    it('should have proper test environment configuration', () => {
      // Verify global test utilities are available
      expect(global.flushPromises).toBeDefined();
      expect(global.wait).toBeDefined();
      expect(typeof global.flushPromises).toBe('function');
      expect(typeof global.wait).toBe('function');
    });

    it('should have React Native mocks configured', () => {
      const { Platform, Dimensions } = require('react-native');

      expect(Platform.OS).toBe('ios');
      expect(Platform.select).toBeDefined();
      expect(Dimensions.get).toBeDefined();
      expect(typeof Dimensions.get).toBe('function');
    });

    it('should have navigation mocks configured', () => {
      const { useNavigation } = require('@react-navigation/native');
      const navigation = useNavigation();

      expect(navigation.navigate).toBeDefined();
      expect(navigation.goBack).toBeDefined();
      expect(typeof navigation.navigate).toBe('function');
      expect(typeof navigation.goBack).toBe('function');
    });
  });

  describe('Async Testing Utilities', () => {
    it('should handle async operations with flushPromises', async () => {
      let resolved = false;

      const asyncOperation = async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
        resolved = true;
      };

      asyncOperation();
      expect(resolved).toBe(false);

      await global.flushPromises();
      expect(resolved).toBe(true);
    });

    it('should handle delays with wait utility', async () => {
      const start = Date.now();
      await global.wait(10);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(10);
    });
  });
});
