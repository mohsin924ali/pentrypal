// ========================================
// Minimal Test App - For Debugging
// ========================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

/**
 * Minimal test app to check if basic React Native works
 */
const TestApp: React.FC = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>🎉 PentryPal Test App</Text>
          <Text style={styles.subtitle}>Basic React Native is working!</Text>
          <Text style={styles.description}>
            If you can see this, the Metro bundler and React Native are functioning correctly.
          </Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text style={styles.statusValue}>✅ App Loading Successful</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#27ae60',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  statusLabel: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '600',
  },
  statusValue: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default TestApp;
