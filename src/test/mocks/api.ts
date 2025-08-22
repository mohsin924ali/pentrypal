/**
 * API mocks for testing
 */

import { createMockApiResponse, createMockError } from './data';

// Axios mock
export const mockAxios = {
  get: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  post: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  put: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  patch: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  delete: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  request: jest.fn(() => Promise.resolve(createMockApiResponse({}))),
  create: jest.fn(() => mockAxios),
  defaults: {
    headers: {
      common: {},
      get: {},
      post: {},
      put: {},
      patch: {},
      delete: {},
    },
    timeout: 5000,
    baseURL: 'http://localhost:3000',
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

// Fetch mock
export const mockFetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers(),
  }),
);

// WebSocket mock
export const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  readyState: 1, // OPEN
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

// Socket.IO mock
export const mockSocketIO = {
  connect: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connected: true,
    id: 'mock-socket-id',
  })),
};

// RTK Query mock utilities
export const createMockApiSlice = (endpoints: Record<string, any> = {}) => ({
  reducerPath: 'api',
  reducer: jest.fn(),
  middleware: jest.fn(),
  endpoints: {
    ...endpoints,
  },
  injectEndpoints: jest.fn(),
  enhanceEndpoints: jest.fn(),
});

// API response builders
export const createSuccessResponse = <T>(data: T) => ({
  data,
  isLoading: false,
  isSuccess: true,
  isError: false,
  error: undefined,
});

export const createLoadingResponse = () => ({
  data: undefined,
  isLoading: true,
  isSuccess: false,
  isError: false,
  error: undefined,
});

export const createErrorResponse = (error: any) => ({
  data: undefined,
  isLoading: false,
  isSuccess: false,
  isError: true,
  error,
});

// Network state mock
export const mockNetInfo = {
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      isInternetReachable: true,
      type: 'wifi',
      details: {
        isConnectionExpensive: false,
        ssid: 'MockWiFi',
        strength: 100,
      },
    }),
  ),
  addEventListener: jest.fn(() => jest.fn()),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
  })),
};

// API test utilities
export const createApiTestUtils = () => ({
  mockSuccessfulRequest: (data: any) => {
    mockAxios.get.mockResolvedValueOnce(createMockApiResponse(data));
    mockAxios.post.mockResolvedValueOnce(createMockApiResponse(data));
    mockAxios.put.mockResolvedValueOnce(createMockApiResponse(data));
    mockAxios.patch.mockResolvedValueOnce(createMockApiResponse(data));
    mockAxios.delete.mockResolvedValueOnce(createMockApiResponse(data));
  },

  mockFailedRequest: (error: any) => {
    const errorResponse = createMockError(error);
    mockAxios.get.mockRejectedValueOnce(errorResponse);
    mockAxios.post.mockRejectedValueOnce(errorResponse);
    mockAxios.put.mockRejectedValueOnce(errorResponse);
    mockAxios.patch.mockRejectedValueOnce(errorResponse);
    mockAxios.delete.mockRejectedValueOnce(errorResponse);
  },

  resetMocks: () => {
    jest.clearAllMocks();
  },
});
