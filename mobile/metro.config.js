const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Fix for TurboModule registry issues
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Ensure proper module resolution
config.resolver.alias = {
  '@': './src',
};

// Handle React Native compatibility
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = config;