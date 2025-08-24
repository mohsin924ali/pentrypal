module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
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
          },
        },
      ],
      'react-native-reanimated/plugin', // Note: This must be last
    ],
  };
};
