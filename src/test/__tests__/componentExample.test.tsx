/**
 * Example component test demonstrating comprehensive testing patterns
 */

import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { fireEvent, waitFor } from '@testing-library/react-native';
import {
  render,
  renderWithProviders,
  createTestStore,
  createFormTestUtils,
  createComponentTestUtils,
  createAccessibilityTestUtils,
} from '@test/utils';
import { createMockUser } from '@test/mocks';
import { createPerformanceTestUtils } from '../utils';
import { createComponentTestUtilities } from '../utils';
import { createAdvancedFormTestUtils } from '../utils';

// Example component for testing
interface ExampleButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
}

const ExampleButton: React.FC<ExampleButtonProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  testID = 'example-button',
}) => {
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityLabel={title}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      style={{
        padding: 16,
        backgroundColor: disabled ? '#ccc' : '#007AFF',
        borderRadius: 8,
        minHeight: 44,
        minWidth: 44,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: disabled ? '#666' : '#fff',
          fontSize: 16,
          fontWeight: '600',
        }}
      >
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
};

// Example form component
interface ExampleFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
  initialValues?: { name?: string; email?: string };
}

const ExampleForm: React.FC<ExampleFormProps> = ({
  onSubmit,
  initialValues,
}) => {
  const [name, setName] = React.useState(initialValues?.name || '');
  const [email, setEmail] = React.useState(initialValues?.email || '');
  const [errors, setErrors] = React.useState<string[]>([]);

  const handleSubmit = () => {
    const newErrors: string[] = [];

    if (!name.trim()) {
      newErrors.push('Name is required');
    }

    if (!email.trim()) {
      newErrors.push('Email is required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push('Email is invalid');
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      onSubmit({ name, email });
    }
  };

  return (
    <View testID="example-form">
      <Text>Name:</Text>
      <Text
        testID="name-input"
        onChangeText={setName}
        value={name}
        accessibilityLabel="Name input"
      />

      <Text>Email:</Text>
      <Text
        testID="email-input"
        onChangeText={setEmail}
        value={email}
        accessibilityLabel="Email input"
      />

      {errors.map((error, index) => (
        <Text key={index} testID={`error-${index}`} style={{ color: 'red' }}>
          {error}
        </Text>
      ))}

      <ExampleButton
        title="Submit"
        onPress={handleSubmit}
        testID="submit-button"
      />
    </View>
  );
};

describe('Component Testing Examples', () => {
  const formUtils = createAdvancedFormTestUtils();
  const componentUtils = createComponentTestUtilities();
  const accessibilityUtils = createAccessibilityTestUtils();

  describe('ExampleButton Component', () => {
    it('should render with correct title', () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} />,
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should call onPress when pressed', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} />,
      );

      fireEvent.press(getByTestId('example-button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled prop is true', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} disabled />,
      );

      const button = getByTestId('example-button');
      fireEvent.press(button);

      expect(mockOnPress).not.toHaveBeenCalled();
      expect(button.props.accessibilityState.disabled).toBe(true);
    });

    it('should show loading state', () => {
      const mockOnPress = jest.fn();
      const { getByText, getByTestId } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} loading />,
      );

      expect(getByText('Loading...')).toBeTruthy();

      const button = getByTestId('example-button');
      fireEvent.press(button);
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should have proper accessibility attributes', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} />,
      );

      const button = getByTestId('example-button');
      accessibilityUtils.expectAccessibleElement(
        button,
        'Test Button',
        'button',
      );
    });

    it('should meet minimum touch target size', () => {
      const mockOnPress = jest.fn();
      const { getByTestId } = render(
        <ExampleButton title="Test Button" onPress={mockOnPress} />,
      );

      const button = getByTestId('example-button');
      accessibilityUtils.expectMinimumTouchTarget(button, 44);
    });
  });

  describe('ExampleForm Component', () => {
    it('should render form fields', () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId } = render(<ExampleForm onSubmit={mockOnSubmit} />);

      expect(getByTestId('name-input')).toBeTruthy();
      expect(getByTestId('email-input')).toBeTruthy();
      expect(getByTestId('submit-button')).toBeTruthy();
    });

    it('should handle form submission with valid data', async () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId } = render(<ExampleForm onSubmit={mockOnSubmit} />);

      const nameInput = getByTestId('name-input');
      const emailInput = getByTestId('email-input');
      const submitButton = getByTestId('submit-button');

      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'john@example.com');
      fireEvent.press(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should show validation errors for empty fields', async () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId, getByText } = render(
        <ExampleForm onSubmit={mockOnSubmit} />,
      );

      const submitButton = getByTestId('submit-button');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Name is required')).toBeTruthy();
        expect(getByText('Email is required')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show validation error for invalid email', async () => {
      const mockOnSubmit = jest.fn();
      const { getByTestId, getByText } = render(
        <ExampleForm onSubmit={mockOnSubmit} />,
      );

      const nameInput = getByTestId('name-input');
      const emailInput = getByTestId('email-input');
      const submitButton = getByTestId('submit-button');

      fireEvent.changeText(nameInput, 'John Doe');
      fireEvent.changeText(emailInput, 'invalid-email');
      fireEvent.press(submitButton);

      await waitFor(() => {
        expect(getByText('Email is invalid')).toBeTruthy();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should populate initial values', () => {
      const mockOnSubmit = jest.fn();
      const initialValues = { name: 'Jane Doe', email: 'jane@example.com' };

      const { getByTestId } = render(
        <ExampleForm onSubmit={mockOnSubmit} initialValues={initialValues} />,
      );

      const nameInput = getByTestId('name-input');
      const emailInput = getByTestId('email-input');

      expect(nameInput.props.value).toBe('Jane Doe');
      expect(emailInput.props.value).toBe('jane@example.com');
    });
  });

  describe('Integration with Redux Store', () => {
    it('should work with Redux store', () => {
      const mockUser = createMockUser();
      const preloadedState = {
        auth: {
          user: mockUser,
          isAuthenticated: true,
        },
      };

      const { store, getByText } = renderWithProviders(
        <Text>{mockUser.displayName}</Text>,
        { preloadedState },
      );

      expect(getByText(mockUser.displayName)).toBeTruthy();
      expect(store.getState().auth.user).toEqual(mockUser);
    });
  });

  describe('Performance Testing', () => {
    it('should render quickly', async () => {
      const mockOnPress = jest.fn();

      const performanceUtils = createPerformanceTestUtils();
      const renderTime = await performanceUtils.measureRenderTime(() => {
        render(<ExampleButton title="Test Button" onPress={mockOnPress} />);
      });

      // Should render in under 16ms (60fps)
      expect(renderTime).toBeLessThan(16);
    });
  });

  describe('Error Boundary Testing', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to prevent error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const ThrowError = () => {
        throw new Error('Test error');
      };

      // This would be caught by an error boundary in a real app
      expect(() => render(<ThrowError />)).toThrow('Test error');

      consoleSpy.mockRestore();
    });
  });
});
