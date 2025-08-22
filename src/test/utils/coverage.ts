/**
 * Test coverage utilities and helpers
 */

/**
 * Coverage thresholds for different types of files
 */
export const COVERAGE_THRESHOLDS = {
  components: {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
  hooks: {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  utils: {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  services: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
};

/**
 * Files that should be excluded from coverage
 */
export const COVERAGE_EXCLUSIONS = [
  '**/*.d.ts',
  '**/index.ts',
  '**/index.tsx',
  '**/*.stories.*',
  '**/*.test.*',
  '**/*.spec.*',
  '**/test/**',
  '**/tests/**',
  '**/__tests__/**',
  '**/node_modules/**',
  '**/coverage/**',
  '**/build/**',
  '**/dist/**',
];

/**
 * Generate coverage report summary
 */
export const generateCoverageSummary = (coverageData: any) => {
  const summary = {
    total: {
      lines: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      statements: { covered: 0, total: 0, percentage: 0 },
    },
    files: [] as any[],
  };

  // Process coverage data and generate summary
  // This would be implemented based on the actual coverage format

  return summary;
};

/**
 * Check if coverage meets minimum thresholds
 */
export const checkCoverageThresholds = (
  coverage: any,
  thresholds: typeof COVERAGE_THRESHOLDS.components,
): boolean => {
  const { branches, functions, lines, statements } = coverage;

  return (
    branches >= thresholds.branches &&
    functions >= thresholds.functions &&
    lines >= thresholds.lines &&
    statements >= thresholds.statements
  );
};
