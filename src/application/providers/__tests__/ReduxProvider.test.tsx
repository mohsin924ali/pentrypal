/**
 * Redux Provider Tests
 */

import React from 'react';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react-native';
import { createTestStore } from '@test/utils';
import { useAppSelector } from '../../store/hooks';

// Test component that uses Redux
const TestComponent: React.FC = () => {
  const theme = useAppSelector(state => state.ui.theme);
  return <Text testID="theme-text">{theme}</Text>;
};

// Simplified provider for testing (without network listener)
const TestReduxProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const store = createTestStore();
  return <Provider store={store}>{children}</Provider>;
};

describe('ReduxProvider', () => {
  it('should provide Redux store to children', () => {
    const { getByTestId } = render(
      <TestReduxProvider>
        <TestComponent />
      </TestReduxProvider>,
    );

    const themeText = getByTestId('theme-text');
    expect(themeText.props.children).toBe('light'); // Default theme from test store
  });

  it('should handle store state updates', () => {
    const store = createTestStore();

    const { getByTestId } = render(
      <Provider store={store}>
        <TestComponent />
      </Provider>,
    );

    // Dispatch an action
    store.dispatch({ type: 'ui/setTheme', payload: 'dark' });

    const themeText = getByTestId('theme-text');
    expect(themeText.props.children).toBe('dark');
  });
});
