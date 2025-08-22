/**
 * Test helper utilities
 */

import { act, fireEvent } from '@testing-library/react-native';

/**
 * Wait for a specified amount of time
 */
export const wait = (ms: number = 0): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wait for the next tick
 */
export const waitForNextTick = (): Promise<void> =>
  new Promise(resolve => setImmediate(resolve));

/**
 * Flush all pending promises
 */
export const flushPromises = (): Promise<void> =>
  new Promise(resolve => setImmediate(resolve));

/**
 * Wait for component to update
 */
export const waitForUpdate = async (): Promise<void> => {
  await act(async () => {
    await flushPromises();
  });
};

/**
 * Simulate async operation
 */
export const simulateAsyncOperation = async (
  operation: () => Promise<any>,
  delay: number = 100,
): Promise<any> => {
  await act(async () => {
    await wait(delay);
    return operation();
  });
};

/**
 * Create a deferred promise for testing
 */
export const createDeferred = <T>() => {
  let resolve: (value: T) => void;
  let reject: (reason?: any) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
};

/**
 * Mock timer utilities
 */
export const createTimerUtils = () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  return {
    advanceTimersByTime: (ms: number) => {
      act(() => {
        jest.advanceTimersByTime(ms);
      });
    },

    runAllTimers: () => {
      act(() => {
        jest.runAllTimers();
      });
    },

    runOnlyPendingTimers: () => {
      act(() => {
        jest.runOnlyPendingTimers();
      });
    },
  };
};

/**
 * Form testing utilities
 */
export const createFormTestUtils = () => ({
  fillInput: (input: any, value: string) => {
    fireEvent.changeText(input, value);
  },

  submitForm: (form: any) => {
    fireEvent.press(form);
  },

  clearInput: (input: any) => {
    fireEvent.changeText(input, '');
  },
});

/**
 * Navigation testing utilities
 */
export const createNavigationTestUtils = () => ({
  navigateToScreen: (navigation: any, screenName: string, params?: any) => {
    act(() => {
      navigation.navigate(screenName, params);
    });
  },

  goBack: (navigation: any) => {
    act(() => {
      navigation.goBack();
    });
  },

  resetNavigation: (navigation: any, state: any) => {
    act(() => {
      navigation.reset(state);
    });
  },
});

/**
 * Redux testing utilities
 */
export const createReduxTestUtils = () => ({
  dispatchAction: (store: any, action: any) => {
    act(() => {
      store.dispatch(action);
    });
  },

  getStoreState: (store: any) => store.getState(),

  waitForStateChange: async (
    store: any,
    predicate: (state: any) => boolean,
  ) => {
    return new Promise<void>(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (predicate(store.getState())) {
          unsubscribe();
          resolve();
        }
      });
    });
  },
});

/**
 * API testing utilities
 */
export const createApiTestUtils = () => ({
  mockApiCall: (mockFn: jest.Mock, response: any, delay: number = 0) => {
    mockFn.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(response), delay)),
    );
  },

  mockApiError: (mockFn: jest.Mock, error: any, delay: number = 0) => {
    mockFn.mockImplementation(
      () => new Promise((_, reject) => setTimeout(() => reject(error), delay)),
    );
  },
});

/**
 * Component testing utilities
 */
export const createComponentTestUtils = () => ({
  findByTestId: (container: any, testId: string) =>
    container.getByTestId(testId),

  findByText: (container: any, text: string) => container.getByText(text),

  findAllByText: (container: any, text: string) => container.getAllByText(text),

  queryByTestId: (container: any, testId: string) =>
    container.queryByTestId(testId),

  expectToBeVisible: (element: any) => expect(element).toBeTruthy(),

  expectNotToBeVisible: (element: any) => expect(element).toBeFalsy(),
});

/**
 * Performance testing utilities
 */
export const createPerformanceTestUtils = () => ({
  measureRenderTime: async (renderFn: () => void) => {
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
});
