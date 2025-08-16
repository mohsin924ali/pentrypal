const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/presentation/components'),
      '@/screens': path.resolve(__dirname, 'src/presentation/screens'),
      '@/hooks': path.resolve(__dirname, 'src/presentation/hooks'),
      '@/store': path.resolve(__dirname, 'src/application/store'),
      '@/services': path.resolve(__dirname, 'src/application/services'),
      '@/utils': path.resolve(__dirname, 'src/application/utils'),
      '@/domain': path.resolve(__dirname, 'src/domain'),
      '@/infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
