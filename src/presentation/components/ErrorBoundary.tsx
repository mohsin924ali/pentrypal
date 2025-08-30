// ========================================
// Production Error Boundary - Critical Safety Net
// ========================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Production Error Boundary
 * Prevents app crashes by catching and handling runtime errors gracefully
 */
export class ProductionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for monitoring in production
    if (__DEV__) {
      console.error('🚨 Production Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    } else {
      // In production, send to crash reporting service
      // crashlytics().recordError(error);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined } as any);
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.message}>
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </Text>
            {__DEV__ && this.state.error && (
              <Text style={styles.errorDetails}>{this.state.error.message}</Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  errorDetails: {
    color: '#dc3545',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    color: '#6c757d',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#212529',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default ProductionErrorBoundary;
