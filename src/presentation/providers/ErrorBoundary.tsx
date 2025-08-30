// ========================================
// Error Boundary - Catches and handles React errors
// ========================================

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { Typography } from '../components/atoms/Typography/Typography';
import { Button } from '../components/atoms/Button/Button';
import { useTheme } from './ThemeProvider';

// Error Boundary Props
interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Error Boundary State
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
  readonly errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to monitoring service
    this.logError(error, errorInfo);

    // Update state with error info
    this.setState({ errorInfo });

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private logError = (error: Error, errorInfo: ErrorInfo): void => {
    // In production, send to crash reporting service (Sentry, Crashlytics, etc.)
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    } else {
      // Send to monitoring service
      // crashReporting.recordError(error, errorInfo);
    }
  };

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined } as any);
  };

  private handleReload = (): void => {
    // In a real app, you might want to restart the app
    // or navigate to a safe screen
    this.handleRetry();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          {...({
            error: this.state.error,
            onRetry: this.handleRetry,
            onReload: this.handleReload,
          } as any)}
        />
      );
    }

    return this.props.children;
  }
}

// Error Fallback Component
interface ErrorFallbackProps {
  readonly error?: Error;
  readonly onRetry: () => void;
  readonly onReload: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onRetry, onReload }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Error Icon */}
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.semantic.error[50] }]}>
          <Typography variant='h1' style={{ fontSize: 64 }}>
            😵
          </Typography>
        </View>

        {/* Error Message */}
        <Typography
          variant='h3'
          color={theme.colors.text.primary}
          align='center'
          style={{ marginBottom: theme.spacing.md }}>
          Oops! Something went wrong
        </Typography>

        <Typography
          variant='body1'
          color={theme.colors.text.secondary}
          align='center'
          style={{
            marginBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
            lineHeight: 24,
          }}>
          We're sorry for the inconvenience. The app encountered an unexpected error.
        </Typography>

        {/* Error Details (only in development) */}
        {__DEV__ && error && (
          <View
            style={
              [
                styles.errorDetails,
                {
                  backgroundColor: theme.colors.neutral[50],
                  borderColor: theme.colors.border.primary,
                },
              ] as any
            }>
            <Typography
              variant='caption'
              color={theme.colors.text.tertiary}
              style={{ marginBottom: theme.spacing.sm }}>
              Error Details (Development Only):
            </Typography>
            <Typography
              variant='caption'
              color={theme.colors.semantic.error[700]}
              style={{ fontFamily: 'monospace' }}>
              {error.message}
            </Typography>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actions as any}>
          <Button
            title='Try Again'
            variant='primary'
            size='lg'
            fullWidth
            onPress={onRetry}
            style={{ marginBottom: theme.spacing.md } as any}
          />

          <Button title='Restart App' variant='outline' size='md' fullWidth onPress={onReload} />
        </View>

        {/* Help Text */}
        <Typography
          variant='caption'
          color={theme.colors.text.tertiary}
          align='center'
          style={{
            marginTop: theme.spacing.xl,
            paddingHorizontal: theme.spacing.lg,
          }}>
          If this problem persists, please contact support at support@pentrypal.app
        </Typography>
      </ScrollView>
    </View>
  );
};

// Styles
const styles = {
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  errorDetails: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 32,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
};

// Hook for using Error Boundary
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: string) => {
    // Log error and potentially show user-friendly message
    if (__DEV__) {
      console.error('Error caught by useErrorHandler:', error);
      if (errorInfo) {
        console.error('Additional info:', errorInfo);
      }
    }

    // In production, send to crash reporting
    // crashReporting.recordError(error, { additionalInfo: errorInfo });
  }, []);
};
