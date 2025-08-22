/**
 * Storage mocks for testing
 */

// AsyncStorage mock
export const mockAsyncStorage = {
  getItem: jest.fn((key: string) => Promise.resolve(null)),
  setItem: jest.fn((key: string, value: string) => Promise.resolve()),
  removeItem: jest.fn((key: string) => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn((keys: string[]) => Promise.resolve([])),
  multiSet: jest.fn((keyValuePairs: [string, string][]) => Promise.resolve()),
  multiRemove: jest.fn((keys: string[]) => Promise.resolve()),
};

// Keychain mock
export const mockKeychain = {
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() =>
    Promise.resolve({
      username: 'test',
      password: 'test-token',
    }),
  ),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
  hasInternetCredentials: jest.fn(() => Promise.resolve(true)),
  ACCESS_CONTROL: {
    BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
    BIOMETRY_ANY: 'BiometryAny',
  },
};

// SQLite mock
export const mockSQLite = {
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(callback => {
      const tx = {
        executeSql: jest.fn((sql, params, success, error) => {
          if (success) success(tx, { rows: { _array: [] } });
        }),
      };
      callback(tx);
    }),
    close: jest.fn(),
  })),
};

// MMKV mock (if using react-native-mmkv)
export const mockMMKV = {
  set: jest.fn(),
  getString: jest.fn(() => undefined),
  getNumber: jest.fn(() => undefined),
  getBoolean: jest.fn(() => undefined),
  contains: jest.fn(() => false),
  delete: jest.fn(),
  clearAll: jest.fn(),
  getAllKeys: jest.fn(() => []),
};

// Storage utilities for tests
export const createStorageTestUtils = () => {
  const storage = new Map<string, string>();

  return {
    getItem: jest.fn((key: string) =>
      Promise.resolve(storage.get(key) || null),
    ),
    setItem: jest.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    removeItem: jest.fn((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      storage.clear();
      return Promise.resolve();
    }),
    getAllKeys: jest.fn(() => Promise.resolve(Array.from(storage.keys()))),
    _storage: storage, // For direct access in tests
  };
};
