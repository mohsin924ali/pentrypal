/**
 * Additional test helper utilities for specific testing scenarios
 */

import { act, fireEvent } from '@testing-library/react-native';
import { createMockUser, createMockShoppingList } from '@test/mocks';

/**
 * Test data generators with realistic scenarios
 */
export const createTestScenarios = () => ({
  // Authentication scenarios
  authenticatedUser: () => ({
    user: createMockUser({
      email: 'test@example.com',
      displayName: 'Test User',
    }),
    isAuthenticated: true,
    token: 'mock-jwt-token',
  }),

  unauthenticatedUser: () => ({
    user: null,
    isAuthenticated: false,
    token: null,
  }),

  // Shopping list scenarios
  emptyShoppingList: () =>
    createMockShoppingList({
      name: 'Empty List',
      items: [],
      collaborators: [],
    }),

  populatedShoppingList: () =>
    createMockShoppingList({
      name: 'Grocery List',
      items: [
        { id: '1', name: 'Milk', completed: false },
        { id: '2', name: 'Bread', completed: true },
        { id: '3', name: 'Eggs', completed: false },
      ],
    }),

  // Network scenarios
  onlineState: () => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  }),

  offlineState: () => ({
    isConnected: false,
    isInternetReachable: false,
    type: 'none',
  }),
});

/**
 * Advanced form testing utilities
 */
export const createAdvancedFormTestUtils = () => ({
  fillForm: async (fields: Record<string, { element: any; value: string }>) => {
    for (const [fieldName, { element, value }] of Object.entries(fields)) {
      await act(async () => {
        fireEvent.changeText(element, value);
      });
    }
  },

  submitForm: async (submitButton: any) => {
    await act(async () => {
      fireEvent.press(submitButton);
    });
  },

  validateFormErrors: (container: any, expectedErrors: string[]) => {
    expectedErrors.forEach(error => {
      expect(container.getByText(error)).toBeTruthy();
    });
  },
});

/**
 * List testing utilities for FlatList and similar components
 */
export const createListTestUtils = () => ({
  scrollToItem: async (list: any, itemIndex: number) => {
    await act(async () => {
      fireEvent.scroll(list, {
        nativeEvent: {
          contentOffset: { y: itemIndex * 60 }, // Assuming 60px item height
          contentSize: { height: 1000, width: 400 },
          layoutMeasurement: { height: 600, width: 400 },
        },
      });
    });
  },

  pullToRefresh: async (list: any) => {
    await act(async () => {
      fireEvent(list, 'onRefresh');
    });
  },

  loadMore: async (list: any) => {
    await act(async () => {
      fireEvent(list, 'onEndReached');
    });
  },
});

/**
 * Animation testing utilities
 */
export const createAnimationTestUtils = () => ({
  completeAllAnimations: () => {
    jest.runAllTimers();
  },

  advanceAnimationsByTime: (ms: number) => {
    jest.advanceTimersByTime(ms);
  },

  mockAnimatedValue: (initialValue: number = 0) => ({
    setValue: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    interpolate: jest.fn(() => ({
      setValue: jest.fn(),
    })),
    _value: initialValue,
  }),
});

/**
 * Redux testing utilities with realistic scenarios
 */
export const createReduxTestScenarios = () => ({
  loadingState: {
    isLoading: true,
    error: null,
    data: null,
  },

  successState: (data: any) => ({
    isLoading: false,
    error: null,
    data,
  }),

  errorState: (error: string) => ({
    isLoading: false,
    error,
    data: null,
  }),

  // Common app states
  initialAppState: {
    auth: {
      user: null,
      isAuthenticated: false,
      isLoading: false,
    },
    shoppingLists: {
      lists: {},
      activeListId: null,
      isLoading: false,
    },
    ui: {
      theme: 'light',
      loading: false,
    },
  },
});

/**
 * API testing utilities with realistic responses
 */
export const createApiTestScenarios = () => ({
  successResponse: (data: any, status: number = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
  }),

  errorResponse: (message: string, status: number = 400) => ({
    response: {
      data: { message },
      status,
      statusText: status === 400 ? 'Bad Request' : 'Internal Server Error',
    },
  }),

  networkError: () => ({
    message: 'Network Error',
    code: 'NETWORK_ERROR',
    isAxiosError: true,
  }),

  timeoutError: () => ({
    message: 'Request timeout',
    code: 'ECONNABORTED',
    isAxiosError: true,
  }),
});

/**
 * Component testing utilities for common patterns
 */
export const createComponentTestUtilities = () => ({
  expectElementToBeVisible: (element: any) => {
    expect(element).toBeTruthy();
  },

  expectElementToBeHidden: (element: any) => {
    expect(element).toBeFalsy();
  },

  expectTextToBePresent: (container: any, text: string) => {
    expect(container.getByText(text)).toBeTruthy();
  },

  expectButtonToBeEnabled: (button: any) => {
    expect(button).not.toHaveStyle({ opacity: 0.5 });
    expect(button.props.disabled).not.toBe(true);
  },

  expectButtonToBeDisabled: (button: any) => {
    expect(button.props.disabled).toBe(true);
  },
});

/**
 * Advanced performance testing utilities
 */
export const createAdvancedPerformanceTestUtils = () => ({
  measureComponentRenderTime: async (renderFn: () => void) => {
    const start = performance.now();

    await act(async () => {
      renderFn();
    });

    const end = performance.now();
    return end - start;
  },

  expectRenderTimeUnder: (renderTime: number, threshold: number) => {
    expect(renderTime).toBeLessThan(threshold);
  },

  measureMemoryUsage: () => {
    if (typeof performance !== 'undefined' && performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },
});

/**
 * Accessibility testing utilities
 */
export const createAccessibilityTestUtils = () => ({
  expectAccessibleElement: (element: any, label: string, role?: string) => {
    expect(element).toHaveAccessibilityLabel(label);
    if (role) {
      expect(element).toHaveAccessibilityRole(role);
    }
  },

  expectProperFocusOrder: (elements: any[]) => {
    // Test that elements can be navigated in the correct order
    elements.forEach((element, index) => {
      expect(element).toBeTruthy();
      // Additional focus order testing would go here
    });
  },

  expectMinimumTouchTarget: (element: any, minSize: number = 44) => {
    const style = element.props.style || {};
    const width = style.width || style.minWidth;
    const height = style.height || style.minHeight;

    if (width && height) {
      expect(width).toBeGreaterThanOrEqual(minSize);
      expect(height).toBeGreaterThanOrEqual(minSize);
    }
  },
});
