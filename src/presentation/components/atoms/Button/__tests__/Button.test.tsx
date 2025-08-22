/**
 * Button component tests
 */

import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { render } from '@test/utils';
import Button from '../Button';

describe('Button Component', () => {
  it('should render correctly', () => {
    const { getByText } = render(<Button title="Test Button" />);

    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />,
    );

    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled />,
    );

    const button = getByText('Test Button');
    fireEvent.press(button);

    // Should not call onPress when disabled
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should apply custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = render(
      <Button title="Test Button" style={customStyle} testID="custom-button" />,
    );

    const button = getByTestId('custom-button');
    expect(button.props.style).toEqual(expect.objectContaining(customStyle));
  });
});
