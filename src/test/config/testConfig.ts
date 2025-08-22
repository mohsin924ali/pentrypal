/**
 * Test configuration for different testing environments
 */

export interface TestConfig {
  timeout: number;
  retries: number;
  coverage: {
    enabled: boolean;
    threshold: number;
  };
  mocks: {
    api: boolean;
    storage: boolean;
    navigation: boolean;
  };
  performance: {
    enabled: boolean;
    thresholds: {
      renderTime: number;
      memoryUsage: number;
    };
  };
}

/**
 * Default test configuration
 */
export const defaultTestConfig: TestConfig = {
  timeout: 10000,
  retries: 0,
  coverage: {
    enabled: true,
    threshold: 80,
  },
  mocks: {
    api: true,
    storage: true,
    navigation: true,
  },
  performance: {
    enabled: false,
    thresholds: {
      renderTime: 16, // 60fps = 16ms per frame
      memoryUsage: 50 * 1024 * 1024, // 50MB
    },
  },
};

/**
 * CI/CD test configuration
 */
export const ciTestConfig: TestConfig = {
  ...defaultTestConfig,
  timeout: 30000,
  retries: 2,
  coverage: {
    enabled: true,
    threshold: 85,
  },
  performance: {
    enabled: true,
    thresholds: {
      renderTime: 32, // More lenient for CI
      memoryUsage: 100 * 1024 * 1024, // 100MB
    },
  },
};

/**
 * Development test configuration
 */
export const devTestConfig: TestConfig = {
  ...defaultTestConfig,
  timeout: 5000,
  coverage: {
    enabled: false,
    threshold: 70,
  },
  performance: {
    enabled: true,
    thresholds: {
      renderTime: 16,
      memoryUsage: 30 * 1024 * 1024, // 30MB
    },
  },
};

/**
 * E2E test configuration
 */
export const e2eTestConfig = {
  timeout: 120000,
  retries: 3,
  devices: {
    ios: {
      simulator: 'iPhone 15',
      os: 'iOS 17.0',
    },
    android: {
      emulator: 'Pixel_7_API_34',
      os: 'Android 14',
    },
  },
  performance: {
    startupTime: 5000,
    navigationTime: 1000,
    renderTime: 100,
  },
};

/**
 * Get test configuration based on environment
 */
export const getTestConfig = (): TestConfig => {
  const env = process.env.NODE_ENV || 'development';
  const isCI = process.env.CI === 'true';

  if (isCI) {
    return ciTestConfig;
  }

  switch (env) {
    case 'production':
      return ciTestConfig;
    case 'test':
      return defaultTestConfig;
    case 'development':
    default:
      return devTestConfig;
  }
};

/**
 * Test environment setup utilities
 */
export const setupTestEnvironment = (config: TestConfig = getTestConfig()) => {
  // Set global timeout
  jest.setTimeout(config.timeout);

  // Configure retries if supported
  if (config.retries > 0) {
    jest.retryTimes(config.retries);
  }

  // Setup performance monitoring
  if (config.performance.enabled) {
    global.performance = global.performance || {
      now: () => Date.now(),
      memory: {
        usedJSHeapSize: 0,
        totalJSHeapSize: 0,
        jsHeapSizeLimit: 0,
      },
    };
  }

  return config;
};

/**
 * Test categories for organizing tests
 */
export const TEST_CATEGORIES = {
  UNIT: 'unit',
  INTEGRATION: 'integration',
  E2E: 'e2e',
  PERFORMANCE: 'performance',
  ACCESSIBILITY: 'accessibility',
  VISUAL: 'visual',
} as const;

/**
 * Test tags for filtering tests
 */
export const TEST_TAGS = {
  SMOKE: 'smoke',
  REGRESSION: 'regression',
  CRITICAL: 'critical',
  SLOW: 'slow',
  FLAKY: 'flaky',
} as const;

/**
 * Test utilities for different categories
 */
export const createCategoryTestUtils = (category: string) => ({
  skip: (reason: string) => {
    console.warn(`Skipping ${category} test: ${reason}`);
  },

  only: (testName: string) => {
    console.log(`Running only ${category} test: ${testName}`);
  },

  timeout: (ms: number) => {
    jest.setTimeout(ms);
  },
});

/**
 * Test data cleanup utilities
 */
export const createCleanupUtils = () => ({
  clearAllMocks: () => {
    jest.clearAllMocks();
  },

  resetAllMocks: () => {
    jest.resetAllMocks();
  },

  restoreAllMocks: () => {
    jest.restoreAllMocks();
  },

  clearTimers: () => {
    jest.clearAllTimers();
  },

  resetModules: () => {
    jest.resetModules();
  },
});
