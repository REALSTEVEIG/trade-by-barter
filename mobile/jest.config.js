module.exports = {
  preset: 'react-native',
  
  // Setup files for React Native testing in Nigerian context
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js',
    '@testing-library/jest-native/extend-expect'
  ],
  
  // Transform configuration for React Native
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  
  // Module name mapping for Nigerian marketplace components
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@/navigation/(.*)$': '<rootDir>/src/navigation/$1',
    '^@/services/(.*)$': '<rootDir>/src/services/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
    // Mock react-native modules for testing
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
  },
  
  // Test environment for React Native
  testEnvironment: 'node',
  
  // File extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Test patterns optimized for Nigerian marketplace mobile app
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
  ],
  
  // Ignore patterns for mobile-specific files
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/android/',
    '<rootDir>/ios/',
  ],
  
  // Transform ignore patterns for React Native dependencies
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-async-storage|react-native-gesture-handler|react-native-reanimated|react-native-screens|@react-navigation|react-native-safe-area-context|react-native-keyboard-aware-scroll-view)/)',
  ],
  
  // Coverage configuration for Nigerian mobile app
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.{js,jsx,ts,tsx}',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/types.ts',
    '!src/**/constants.ts',
    '!src/assets/**',
  ],
  
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Coverage thresholds for mobile app quality
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
  
  // Globals for React Native testing environment
  globals: {
    'ts-jest': {
      babelConfig: true,
    },
  },
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output for debugging Nigerian marketplace features
  verbose: true,
  
  // Max workers for CI environments
  maxWorkers: '50%',
  
  // Cache directory
  cacheDirectory: '<rootDir>/.jest-cache',
}