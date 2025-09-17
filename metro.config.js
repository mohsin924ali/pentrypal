const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Configure resolver for path aliases
config.resolver.alias = {
  '@': './src',
  '@/components': './src/presentation/components',
  '@/screens': './src/presentation/screens',
  '@/navigation': './src/presentation/navigation',
  '@/hooks': './src/presentation/hooks',
  '@/providers': './src/presentation/providers',
  '@/store': './src/application/store',
  '@/services': './src/application/services',
  '@/utils': './src/application/utils',
  '@/domain': './src/domain',
  '@/infrastructure': './src/infrastructure',
  '@/shared': './src/shared',
  '@/types': './src/shared/types',
  '@/constants': './src/shared/constants',
  '@/theme': './src/shared/theme',
  '@/validation': './src/shared/validation',
  '@/i18n': './src/shared/i18n',
  '@/test': './test',
};

// Configure transformer for better performance
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Enable SVG support
config.resolver.assetExts.push('svg');

module.exports = withNativeWind(config, { input: './global.css' });
