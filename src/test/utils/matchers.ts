/**
 * Custom Jest matchers for React Native testing
 */

import { expect } from '@jest/globals';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeVisibleOnScreen(): R;
      toHaveAccessibilityLabel(label: string): R;
      toHaveAccessibilityHint(hint: string): R;
      toHaveAccessibilityRole(role: string): R;
      toHaveAccessibilityState(state: any): R;
      toHaveStyle(style: any): R;
      toHaveTextContent(text: string): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBeFocused(): R;
      toHaveDisplayValue(value: string): R;
      toHaveProp(prop: string, value?: any): R;
    }
  }
}

/**
 * Custom matcher to check if element is visible on screen
 */
expect.extend({
  toBeVisibleOnScreen(received) {
    const pass =
      received && received.props && !received.props.style?.display === 'none';

    if (pass) {
      return {
        message: () => `expected element not to be visible on screen`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be visible on screen`,
        pass: false,
      };
    }
  },

  toHaveAccessibilityLabel(received, expectedLabel) {
    const actualLabel = received?.props?.accessibilityLabel;
    const pass = actualLabel === expectedLabel;

    if (pass) {
      return {
        message: () =>
          `expected element not to have accessibility label "${expectedLabel}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessibility label "${expectedLabel}", but got "${actualLabel}"`,
        pass: false,
      };
    }
  },

  toHaveAccessibilityHint(received, expectedHint) {
    const actualHint = received?.props?.accessibilityHint;
    const pass = actualHint === expectedHint;

    if (pass) {
      return {
        message: () =>
          `expected element not to have accessibility hint "${expectedHint}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessibility hint "${expectedHint}", but got "${actualHint}"`,
        pass: false,
      };
    }
  },

  toHaveAccessibilityRole(received, expectedRole) {
    const actualRole = received?.props?.accessibilityRole;
    const pass = actualRole === expectedRole;

    if (pass) {
      return {
        message: () =>
          `expected element not to have accessibility role "${expectedRole}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessibility role "${expectedRole}", but got "${actualRole}"`,
        pass: false,
      };
    }
  },

  toHaveAccessibilityState(received, expectedState) {
    const actualState = received?.props?.accessibilityState;
    const pass = JSON.stringify(actualState) === JSON.stringify(expectedState);

    if (pass) {
      return {
        message: () =>
          `expected element not to have accessibility state ${JSON.stringify(expectedState)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have accessibility state ${JSON.stringify(expectedState)}, but got ${JSON.stringify(actualState)}`,
        pass: false,
      };
    }
  },

  toHaveStyle(received, expectedStyle) {
    const actualStyle = received?.props?.style;
    const pass = Object.keys(expectedStyle).every(
      key => actualStyle && actualStyle[key] === expectedStyle[key],
    );

    if (pass) {
      return {
        message: () =>
          `expected element not to have style ${JSON.stringify(expectedStyle)}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have style ${JSON.stringify(expectedStyle)}, but got ${JSON.stringify(actualStyle)}`,
        pass: false,
      };
    }
  },

  toHaveTextContent(received, expectedText) {
    const actualText = received?.props?.children || received?.children;
    const pass = actualText === expectedText;

    if (pass) {
      return {
        message: () =>
          `expected element not to have text content "${expectedText}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have text content "${expectedText}", but got "${actualText}"`,
        pass: false,
      };
    }
  },

  toBeDisabled(received) {
    const disabled =
      received?.props?.disabled ||
      received?.props?.accessibilityState?.disabled;
    const pass = disabled === true;

    if (pass) {
      return {
        message: () => `expected element not to be disabled`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be disabled`,
        pass: false,
      };
    }
  },

  toBeEnabled(received) {
    const disabled =
      received?.props?.disabled ||
      received?.props?.accessibilityState?.disabled;
    const pass = disabled !== true;

    if (pass) {
      return {
        message: () => `expected element not to be enabled`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be enabled`,
        pass: false,
      };
    }
  },

  toBeFocused(received) {
    const focused =
      received?.props?.autoFocus ||
      received?.props?.accessibilityState?.selected;
    const pass = focused === true;

    if (pass) {
      return {
        message: () => `expected element not to be focused`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected element to be focused`,
        pass: false,
      };
    }
  },

  toHaveDisplayValue(received, expectedValue) {
    const actualValue = received?.props?.value || received?.props?.defaultValue;
    const pass = actualValue === expectedValue;

    if (pass) {
      return {
        message: () =>
          `expected element not to have display value "${expectedValue}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected element to have display value "${expectedValue}", but got "${actualValue}"`,
        pass: false,
      };
    }
  },

  toHaveProp(received, propName, expectedValue) {
    const actualValue = received?.props?.[propName];
    const pass =
      expectedValue === undefined
        ? actualValue !== undefined
        : actualValue === expectedValue;

    if (pass) {
      return {
        message: () =>
          expectedValue === undefined
            ? `expected element not to have prop "${propName}"`
            : `expected element not to have prop "${propName}" with value "${expectedValue}"`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          expectedValue === undefined
            ? `expected element to have prop "${propName}"`
            : `expected element to have prop "${propName}" with value "${expectedValue}", but got "${actualValue}"`,
        pass: false,
      };
    }
  },
});
