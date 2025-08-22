# Testing Infrastructure Documentation

This document outlines the comprehensive testing infrastructure implemented for PentryPal React Native application.

## Overview

The testing infrastructure follows a three-tier testing pyramid:
- **Unit Tests**: Jest with React Native Testing Library
- **Integration Tests**: React Native Testing Library with custom providers
- **E2E Tests**: Detox for iOS and Android

## Testing Stack

### Core Testing Libraries
- **Jest**: JavaScript testing framework with React Native preset
- **React Native Testing Library**: Component testing utilities
- **Detox**: End-to-end testing framework
- **@faker-js/faker**: Mock data generation

### Configuration Files
- `jest.config.js`: Jest configuration with TypeScript support
- `.detoxrc.js`: Detox configuration for iOS and Android
- `e2e/jest.config.js`: Detox-specific Jest configuration
- `src/test/setup.ts`: Global test setup and mocks

## Directory Structure

```
src/test/
├── __tests__/           # Global test files
├── mocks/              # Mock factories and utilities
│   ├── api.ts          # API mocking utilities
│   ├── components.ts   # Component mocks
│   ├── data.ts         # Mock data factories
│   ├── navigation.ts   # Navigation mocks
│   └── storage.ts      # Storage mocks
└── utils/              # Testing utilities
    ├── coverage.ts     # Coverage utilities
    ├── helpers.ts      # Test helper functions
    ├── matchers.ts     # Custom Jest matchers
    └── render.tsx      # Custom render functions

e2e/
├── jest.config.js      # E2E Jest configuration
├── init.js            # Detox initialization
└── app.test.js        # E2E test examples
```

## Available Scripts

### Unit Testing
```bash
npm run test                # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage report
npm run test:ci            # Run tests for CI (no watch)
npm run test:debug         # Run tests with debugging
npm run test:unit          # Run only unit tests
```

### E2E Testing
```bash
npm run test:e2e           # Run E2E tests
npm run test:e2e:build     # Build app for E2E testing
npm run test:e2e:ios       # Run E2E tests on iOS simulator
npm run test:e2e:android   # Run E2E tests on Android emulator
```

## Writing Tests

### Unit Tests

#### Component Testing
```typescript
import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@test/utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />);
    expect(getByText('Test')).toBeTruthy();
  });

  it('should handle user interactions', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <MyComponent title="Test" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

#### Hook Testing
```typescript
import { renderHookWithProviders } from '@test/utils';
import { useMyHook } from '../useMyHook';

describe('useMyHook', () => {
  it('should return initial state', () => {
    const { result } = renderHookWithProviders(() => useMyHook());
    
    expect(result.current.value).toBe(initialValue);
  });
});
```

#### Redux Testing
```typescript
import { createTestStore } from '@test/utils';
import { myAction } from '../mySlice';

describe('mySlice', () => {
  it('should handle action', () => {
    const store = createTestStore();
    
    store.dispatch(myAction({ payload: 'test' }));
    
    const state = store.getState();
    expect(state.mySlice.value).toBe('test');
  });
});
```

### Integration Tests

```typescript
import React from 'react';
import { render, waitFor } from '@test/utils';
import { createMockUser } from '@test/mocks';
import MyScreen from '../MyScreen';

describe('MyScreen Integration', () => {
  it('should load and display user data', async () => {
    const mockUser = createMockUser();
    const preloadedState = {
      auth: { user: mockUser, isAuthenticated: true }
    };
    
    const { getByText } = render(<MyScreen />, { preloadedState });
    
    await waitFor(() => {
      expect(getByText(mockUser.displayName)).toBeTruthy();
    });
  });
});
```

### E2E Tests

```javascript
const { device, expect, element, by, waitFor } = require('detox');

describe('App Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should complete user journey', async () => {
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password');
    await element(by.id('submit-button')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

## Mock Utilities

### Data Factories
```typescript
import { createMockUser, createMockShoppingList } from '@test/mocks';

const user = createMockUser({ email: 'custom@example.com' });
const list = createMockShoppingList({ name: 'Custom List' });
```

### API Mocking
```typescript
import { mockAxios, createApiTestUtils } from '@test/mocks';

const apiUtils = createApiTestUtils();

// Mock successful API call
apiUtils.mockSuccessfulRequest({ data: 'response' });

// Mock failed API call
apiUtils.mockFailedRequest({ status: 500, message: 'Server Error' });
```

### Navigation Mocking
```typescript
import { createMockNavigationProp } from '@test/mocks';

const navigation = createMockNavigationProp({
  navigate: jest.fn(),
});
```

## Custom Matchers

The testing infrastructure includes custom Jest matchers for React Native:

```typescript
// Accessibility testing
expect(element).toHaveAccessibilityLabel('Button Label');
expect(element).toHaveAccessibilityRole('button');

// Style testing
expect(element).toHaveStyle({ backgroundColor: 'red' });

// State testing
expect(element).toBeDisabled();
expect(element).toBeEnabled();
expect(element).toBeFocused();

// Content testing
expect(element).toHaveTextContent('Expected Text');
expect(element).toHaveDisplayValue('Input Value');
```

## Coverage Configuration

### Coverage Thresholds
- **Global**: 80% for branches, functions, lines, and statements
- **Components**: 85% coverage requirement
- **Hooks**: 90% coverage requirement
- **Utils**: 95% coverage requirement
- **Services**: 80% coverage requirement

### Coverage Reports
Coverage reports are generated in the `coverage/` directory and include:
- HTML report: `coverage/lcov-report/index.html`
- LCOV format: `coverage/lcov.info`
- JSON format: `coverage/coverage-final.json`

## Best Practices

### Test Organization
1. **Co-locate tests**: Place test files next to the code they test
2. **Use descriptive names**: Test names should clearly describe what they test
3. **Group related tests**: Use `describe` blocks to organize tests
4. **Test behavior, not implementation**: Focus on what the code does, not how

### Test Structure
1. **Arrange**: Set up test data and conditions
2. **Act**: Execute the code being tested
3. **Assert**: Verify the expected outcome

### Mocking Guidelines
1. **Mock external dependencies**: APIs, storage, navigation
2. **Use real implementations for internal code**: Don't mock your own code
3. **Keep mocks simple**: Only mock what's necessary for the test
4. **Reset mocks between tests**: Use `jest.clearAllMocks()`

### Performance
1. **Use `renderWithProviders` for simple tests**: Avoid full navigation setup when not needed
2. **Mock heavy operations**: Database calls, network requests, file operations
3. **Limit test scope**: Test one thing at a time
4. **Use `waitFor` for async operations**: Don't use arbitrary timeouts

## Continuous Integration

The testing infrastructure is configured for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm run test:ci
    npm run test:e2e:build
    npm run test:e2e
```

## Debugging Tests

### Debug Mode
```bash
npm run test:debug -- --testNamePattern="specific test"
```

### VS Code Debugging
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Check `moduleNameMapper` in Jest config
2. **Async test failures**: Use `waitFor` and proper async/await
3. **Mock not working**: Ensure mocks are set up before imports
4. **Coverage too low**: Add more test cases or exclude non-testable code

### Performance Issues
1. **Slow tests**: Check for unnecessary re-renders or heavy operations
2. **Memory leaks**: Ensure proper cleanup in `afterEach` hooks
3. **Flaky tests**: Add proper waits and avoid race conditions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)