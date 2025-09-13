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
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/store': './src/store',
            '@/constants': './src/constants',
            '@/navigation': './src/navigation',
            '@/config': './src/config',
          },
        },
      ],
    ],
  };
};