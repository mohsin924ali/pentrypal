/**
 * Navigation mocks for testing
 */

export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => false),
  getId: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    key: 'test',
    index: 0,
    routeNames: ['Home'],
    routes: [{ key: 'Home', name: 'Home' }],
  })),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
};

export const mockRoute = {
  key: 'test-route',
  name: 'TestScreen',
  params: {},
};

export const mockNavigationState = {
  key: 'test-stack',
  index: 0,
  routeNames: ['Home', 'Details'],
  routes: [
    { key: 'Home', name: 'Home' },
    { key: 'Details', name: 'Details' },
  ],
};

export const createMockNavigationProp = (overrides: any = {}) => ({
  ...mockNavigation,
  ...overrides,
});

export const createMockRouteProp = (overrides: any = {}) => ({
  ...mockRoute,
  ...overrides,
});
