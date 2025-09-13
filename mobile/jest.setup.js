// Jest setup for TradeByBarter Nigerian Mobile App
import 'react-native-gesture-handler/jestSetup'
import '@testing-library/jest-native/extend-expect'

// Mock react-native modules
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter')

// Mock AsyncStorage for offline functionality
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon')
jest.mock('react-native-vector-icons/Ionicons', () => 'Icon')
jest.mock('react-native-vector-icons/Feather', () => 'Icon')

// Mock Expo modules for Nigerian marketplace
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() => 
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: 6.5244, // Lagos coordinates
        longitude: 3.3792,
      },
    })
  ),
}))

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  launchImageLibraryAsync: jest.fn(() =>
    Promise.resolve({
      cancelled: false,
      assets: [{ uri: 'mock-image-uri' }],
    })
  ),
}))

// Mock react-navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}))

// Mock Nigerian network providers for testing
jest.mock('react-native-network-info', () => ({
  getSSID: jest.fn(() => Promise.resolve('MTN-Nigeria')),
  getBSSID: jest.fn(() => Promise.resolve('mock-bssid')),
  getIPAddress: jest.fn(() => Promise.resolve('192.168.1.1')),
}))

// Mock Nigerian payment integration
jest.mock('react-native-paystack-webview', () => ({
  PayStackWebView: jest.fn().mockImplementation(() => null),
}))

// Mock push notifications for Nigerian users
jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getExpoPushTokenAsync: jest.fn(() =>
    Promise.resolve({ data: 'mock-expo-push-token' })
  ),
  setNotificationHandler: jest.fn(),
}))

// Mock Nigerian SMS verification
jest.mock('react-native-otp-verify', () => ({
  getHash: jest.fn(() => Promise.resolve(['mock-hash'])),
  startOtpListener: jest.fn(),
  removeListener: jest.fn(),
}))

// Mock device info for Nigerian market testing
jest.mock('react-native-device-info', () => ({
  getDeviceType: jest.fn(() => Promise.resolve('Handset')),
  getManufacturer: jest.fn(() => Promise.resolve('Samsung')), // Popular in Nigeria
  getModel: jest.fn(() => Promise.resolve('Galaxy A10')), // Common budget phone
  getSystemVersion: jest.fn(() => Promise.resolve('10')),
  getBatteryLevel: jest.fn(() => Promise.resolve(0.8)),
  isLocationEnabled: jest.fn(() => Promise.resolve(true)),
}))

// Mock NetInfo for Nigerian network conditions
jest.mock('@react-native-netinfo/netinfo', () => ({
  fetch: jest.fn(() =>
    Promise.resolve({
      isConnected: true,
      type: 'cellular',
      details: {
        carrier: 'MTN Nigeria',
        cellularGeneration: '4g',
      },
    })
  ),
  addEventListener: jest.fn(() => jest.fn()),
}))

// Mock react-native-contacts for Nigerian phone book
jest.mock('react-native-contacts', () => ({
  requestPermission: jest.fn(() => Promise.resolve('authorized')),
  getAll: jest.fn(() =>
    Promise.resolve([
      {
        givenName: 'Adebayo',
        familyName: 'Oladimeji',
        phoneNumbers: [{ number: '+2348012345678' }],
      },
    ])
  ),
}))

// Mock Flipper for development
jest.mock('react-native-flipper', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock react-native-keychain for secure storage
jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(() => Promise.resolve()),
  getInternetCredentials: jest.fn(() =>
    Promise.resolve({
      username: 'test@tradebybarter.ng',
      password: 'mock-token',
    })
  ),
  resetInternetCredentials: jest.fn(() => Promise.resolve()),
}))

// Mock react-native-share for Nigerian social sharing
jest.mock('react-native-share', () => ({
  open: jest.fn(() => Promise.resolve()),
}))

// Mock Nigerian currency formatting
global.Intl = {
  NumberFormat: jest.fn(() => ({
    format: jest.fn((value) => `₦${value.toLocaleString()}`),
  })),
  DateTimeFormat: jest.fn(() => ({
    format: jest.fn((date) => date.toLocaleDateString('en-NG')),
  })),
}

// Mock timers for performance testing
jest.useFakeTimers()

// Global test utilities for Nigerian marketplace
global.nigerianTestData = {
  users: [
    {
      id: 'usr_001',
      fullName: 'Adebayo Oladimeji',
      phone: '+2348012345678',
      email: 'adebayo@example.com',
      location: 'Lagos',
      isVerified: true,
    },
    {
      id: 'usr_002',
      fullName: 'Fatima Ibrahim',
      phone: '+2347012345678',
      email: 'fatima@example.com',
      location: 'Abuja',
      isVerified: false,
    },
  ],
  listings: [
    {
      id: 'lst_001',
      title: 'iPhone 13 Pro Max 256GB',
      description: 'Excellent condition, barely used',
      price: 450000,
      location: 'Lagos',
      images: ['mock-image-1.jpg'],
      category: 'Electronics',
    },
    {
      id: 'lst_002',
      title: 'Samsung Galaxy S22 Ultra',
      description: 'Brand new, sealed box',
      price: 520000,
      location: 'Abuja',
      images: ['mock-image-2.jpg'],
      category: 'Electronics',
    },
  ],
  nigerianStates: [
    'Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt',
    'Benin City', 'Maiduguri', 'Zaria', 'Aba', 'Jos'
  ],
  phoneNetworks: ['MTN', 'Glo', 'Airtel', '9mobile'],
}

// Console override for cleaner test output
const originalConsoleError = console.error
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return
  }
  originalConsoleError.call(console, ...args)
}

// Setup fake Nigerian time zone
Date.now = jest.fn(() => new Date('2024-03-15T14:30:00.000Z').getTime()) // 3:30 PM WAT

// Mock global fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
)

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks()
})