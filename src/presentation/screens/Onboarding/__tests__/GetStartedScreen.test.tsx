/**
 * GetStartedScreen Tests
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { GetStartedScreen } from '../GetStartedScreen';

// Mock SafeAreaProvider
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
}));

describe('GetStartedScreen', () => {
  const mockProps = {
    onSignUp: jest.fn(),
    onLogin: jest.fn(),
    onSkip: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the first slide correctly', () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    expect(getByText('Create Shopping Lists')).toBeTruthy();
    expect(
      getByText(
        'Collaborate with friends and family on shared shopping lists. Never forget an item again!',
      ),
    ).toBeTruthy();
    expect(getByText('Get Started')).toBeTruthy();
    expect(getByText('Skip')).toBeTruthy();
  });

  it('should navigate to next slide when Get Started is pressed', async () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    fireEvent.press(getByText('Get Started'));

    await waitFor(() => {
      expect(getByText('Share & Assign with Friends/Family')).toBeTruthy();
      expect(getByText('Next')).toBeTruthy();
    });
  });

  it('should navigate through all slides', async () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    // First slide
    fireEvent.press(getByText('Get Started'));

    // Second slide
    await waitFor(() => {
      expect(getByText('Share & Assign with Friends/Family')).toBeTruthy();
    });

    fireEvent.press(getByText('Next'));

    // Third slide
    await waitFor(() => {
      expect(getByText('Track Spending & Pantry')).toBeTruthy();
    });

    fireEvent.press(getByText('Get Started'));

    // Final slide
    await waitFor(() => {
      expect(getByText('Shop smarter, together')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
      expect(getByText('Log In')).toBeTruthy();
    });
  });

  it('should call onSignUp when Sign Up button is pressed', async () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    // Navigate to final slide
    fireEvent.press(getByText('Get Started'));
    await waitFor(() => fireEvent.press(getByText('Next')));
    await waitFor(() => fireEvent.press(getByText('Get Started')));

    // Press Sign Up
    await waitFor(() => {
      fireEvent.press(getByText('Sign Up'));
    });

    expect(mockProps.onSignUp).toHaveBeenCalledTimes(1);
  });

  it('should call onLogin when Log In button is pressed', async () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    // Navigate to final slide
    fireEvent.press(getByText('Get Started'));
    await waitFor(() => fireEvent.press(getByText('Next')));
    await waitFor(() => fireEvent.press(getByText('Get Started')));

    // Press Log In
    await waitFor(() => {
      fireEvent.press(getByText('Log In'));
    });

    expect(mockProps.onLogin).toHaveBeenCalledTimes(1);
  });

  it('should call onSkip when Skip button is pressed', () => {
    const { getByText } = render(<GetStartedScreen {...mockProps} />);

    fireEvent.press(getByText('Skip'));

    expect(mockProps.onSkip).toHaveBeenCalledTimes(1);
  });

  it('should not show Skip button on final slide', async () => {
    const { getByText, queryByText } = render(
      <GetStartedScreen {...mockProps} />,
    );

    // Navigate to final slide
    fireEvent.press(getByText('Get Started'));
    await waitFor(() => fireEvent.press(getByText('Next')));
    await waitFor(() => fireEvent.press(getByText('Get Started')));

    await waitFor(() => {
      expect(queryByText('Skip')).toBeNull();
    });
  });

  it('should show progress indicator on first three slides', async () => {
    const { getByText, getByTestId } = render(
      <GetStartedScreen {...mockProps} />,
    );

    // First slide - should have progress indicator
    expect(() => getByTestId('progress-indicator')).not.toThrow();

    // Navigate to final slide
    fireEvent.press(getByText('Get Started'));
    await waitFor(() => fireEvent.press(getByText('Next')));
    await waitFor(() => fireEvent.press(getByText('Get Started')));

    // Final slide - should not have progress indicator
    await waitFor(() => {
      expect(() => getByTestId('progress-indicator')).toThrow();
    });
  });
});
