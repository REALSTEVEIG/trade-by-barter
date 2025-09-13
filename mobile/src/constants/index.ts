import { NigerianState } from '@/types';

// Export network configuration
export * from './network';

// App Configuration
export const APP_CONFIG = {
  NAME: 'TradeByBarter',
  VERSION: '1.0.0',
  DESCRIPTION: 'Nigerian barter marketplace - Trade anything, anywhere',
  SCHEME: 'tradebybarter',
  BUNDLE_ID: 'com.tradebybarter.mobile',
  
  // API
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Pagination
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 50,
  
  // Media
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGES_PER_LISTING: 8,
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: { width: 200, height: 200 },
  
  // Chat
  MAX_MESSAGE_LENGTH: 1000,
  TYPING_TIMEOUT: 3000,
  MAX_VOICE_DURATION: 60, // seconds
  
  // Location
  LOCATION_ACCURACY: 'high' as const,
  GEOFENCE_RADIUS: 5000, // meters
  
  // Biometric
  BIOMETRIC_PROMPT_TITLE: 'Authenticate',
  BIOMETRIC_PROMPT_SUBTITLE: 'Use your biometric to access TradeByBarter',
  BIOMETRIC_PROMPT_DESCRIPTION: 'Place your finger on the sensor or look at the camera',
  
  // Nigerian Specific
  DEFAULT_CURRENCY: 'NGN',
  DEFAULT_COUNTRY: 'NG',
  DEFAULT_TIMEZONE: 'Africa/Lagos',
  PHONE_NUMBER_PREFIX: '+234',
  
  // Features
  FEATURES: {
    BIOMETRIC_AUTH: true,
    PUSH_NOTIFICATIONS: true,
    OFFLINE_MODE: true,
    VOICE_MESSAGES: true,
    LOCATION_SERVICES: true,
    CAMERA_INTEGRATION: true,
    SOCIAL_LOGIN: true,
    PAYMENT_INTEGRATION: true,
  },
};

// Nigerian States and Cities
export const NIGERIAN_STATES: NigerianState[] = [
  {
    name: 'Abia',
    code: 'AB',
    cities: ['Umuahia', 'Aba', 'Arochukwu', 'Ohafia', 'Ukwa']
  },
  {
    name: 'Adamawa',
    code: 'AD',
    cities: ['Yola', 'Mubi', 'Jimeta', 'Numan', 'Ganye']
  },
  {
    name: 'Akwa Ibom',
    code: 'AK',
    cities: ['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak']
  },
  {
    name: 'Anambra',
    code: 'AN',
    cities: ['Awka', 'Onitsha', 'Nnewi', 'Ekwulobia', 'Agulu']
  },
  {
    name: 'Bauchi',
    code: 'BA',
    cities: ['Bauchi', 'Azare', 'Misau', 'Jama\'are', 'Katagum']
  },
  {
    name: 'Bayelsa',
    code: 'BY',
    cities: ['Yenagoa', 'Brass', 'Ogbia', 'Sagbama', 'Nembe']
  },
  {
    name: 'Benue',
    code: 'BE',
    cities: ['Makurdi', 'Gboko', 'Otukpo', 'Katsina-Ala', 'Vandeikya']
  },
  {
    name: 'Borno',
    code: 'BO',
    cities: ['Maiduguri', 'Biu', 'Bama', 'Gwoza', 'Dikwa']
  },
  {
    name: 'Cross River',
    code: 'CR',
    cities: ['Calabar', 'Ugep', 'Ogoja', 'Ikom', 'Obudu']
  },
  {
    name: 'Delta',
    code: 'DE',
    cities: ['Asaba', 'Warri', 'Sapele', 'Ughelli', 'Agbor']
  },
  {
    name: 'Ebonyi',
    code: 'EB',
    cities: ['Abakaliki', 'Afikpo', 'Onueke', 'Ezza', 'Ikwo']
  },
  {
    name: 'Edo',
    code: 'ED',
    cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Irrua']
  },
  {
    name: 'Ekiti',
    code: 'EK',
    cities: ['Ado-Ekiti', 'Ikere', 'Oye', 'Ijero', 'Aramoko']
  },
  {
    name: 'Enugu',
    code: 'EN',
    cities: ['Enugu', 'Nsukka', 'Oji River', 'Agbani', 'Awgu']
  },
  {
    name: 'Federal Capital Territory',
    code: 'FC',
    cities: ['Abuja', 'Gwagwalada', 'Kuje', 'Kwali', 'Bwari']
  },
  {
    name: 'Gombe',
    code: 'GO',
    cities: ['Gombe', 'Billiri', 'Kaltungo', 'Dukku', 'Bajoga']
  },
  {
    name: 'Imo',
    code: 'IM',
    cities: ['Owerri', 'Orlu', 'Okigwe', 'Oguta', 'Mbaise']
  },
  {
    name: 'Jigawa',
    code: 'JI',
    cities: ['Dutse', 'Hadejia', 'Kazaure', 'Gumel', 'Ringim']
  },
  {
    name: 'Kaduna',
    code: 'KD',
    cities: ['Kaduna', 'Zaria', 'Kafanchan', 'Kagoro', 'Malumfashi']
  },
  {
    name: 'Kano',
    code: 'KN',
    cities: ['Kano', 'Wudil', 'Gaya', 'Rano', 'Karaye']
  },
  {
    name: 'Katsina',
    code: 'KT',
    cities: ['Katsina', 'Daura', 'Funtua', 'Malumfashi', 'Dutsin-Ma']
  },
  {
    name: 'Kebbi',
    code: 'KE',
    cities: ['Birnin Kebbi', 'Argungu', 'Yauri', 'Zuru', 'Bagudo']
  },
  {
    name: 'Kogi',
    code: 'KO',
    cities: ['Lokoja', 'Okene', 'Idah', 'Kabba', 'Ankpa']
  },
  {
    name: 'Kwara',
    code: 'KW',
    cities: ['Ilorin', 'Offa', 'Omu-Aran', 'Lafiagi', 'Esie']
  },
  {
    name: 'Lagos',
    code: 'LA',
    cities: ['Ikeja', 'Lagos Island', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Ikoyi', 'Ajah', 'Alaba', 'Mushin', 'Agege', 'Badagry', 'Epe', 'Ikorodu']
  },
  {
    name: 'Nasarawa',
    code: 'NA',
    cities: ['Lafia', 'Keffi', 'Akwanga', 'Nasarawa', 'Doma']
  },
  {
    name: 'Niger',
    code: 'NI',
    cities: ['Minna', 'Bida', 'Kontagora', 'Suleja', 'New Bussa']
  },
  {
    name: 'Ogun',
    code: 'OG',
    cities: ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ilaro', 'Ota']
  },
  {
    name: 'Ondo',
    code: 'ON',
    cities: ['Akure', 'Ondo', 'Owo', 'Ikare', 'Okitipupa']
  },
  {
    name: 'Osun',
    code: 'OS',
    cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Iwo']
  },
  {
    name: 'Oyo',
    code: 'OY',
    cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Saki']
  },
  {
    name: 'Plateau',
    code: 'PL',
    cities: ['Jos', 'Bukuru', 'Shendam', 'Pankshin', 'Vom']
  },
  {
    name: 'Rivers',
    code: 'RI',
    cities: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Ahoada', 'Bonny']
  },
  {
    name: 'Sokoto',
    code: 'SO',
    cities: ['Sokoto', 'Tambuwal', 'Gwadabawa', 'Bodinga', 'Yabo']
  },
  {
    name: 'Taraba',
    code: 'TA',
    cities: ['Jalingo', 'Wukari', 'Bali', 'Gembu', 'Serti']
  },
  {
    name: 'Yobe',
    code: 'YO',
    cities: ['Damaturu', 'Potiskum', 'Gashua', 'Nguru', 'Geidam']
  },
  {
    name: 'Zamfara',
    code: 'ZA',
    cities: ['Gusau', 'Kaura Namoda', 'Talata Mafara', 'Zurmi', 'Anka']
  }
];

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion & Clothing',
  'Home & Garden',
  'Sports & Recreation',
  'Books & Education',
  'Health & Beauty',
  'Automotive',
  'Collectibles & Art',
  'Musical Instruments',
  'Toys & Games',
  'Food & Beverages',
  'Services',
  'Real Estate',
  'Jewelry & Accessories',
  'Baby & Kids',
  'Office & Business',
  'Crafts & Hobbies',
  'Agriculture & Farming',
  'Industrial & Scientific',
  'Other'
];

// Product Conditions
export const PRODUCT_CONDITIONS = [
  { value: 'new', label: 'Brand New', description: 'Never used, original packaging' },
  { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'good', label: 'Good', description: 'Used but well maintained' },
  { value: 'fair', label: 'Fair', description: 'Shows wear but functional' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repair' }
];

// Trade Types
export const TRADE_TYPES = [
  { value: 'item', label: 'Item for Item', description: 'Trade your item for another item' },
  { value: 'money', label: 'Item for Money', description: 'Sell your item for cash' },
  { value: 'service', label: 'Item for Service', description: 'Trade your item for a service' },
  { value: 'combo', label: 'Combination', description: 'Mix of items, money, and services' }
];

// Currency
export const CURRENCY = {
  NGN: {
    symbol: '₦',
    name: 'Nigerian Naira',
    code: 'NGN',
    decimals: 2
  }
};

// Distance Units
export const DISTANCE_UNITS = [
  { value: 1, label: '1 km' },
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
  { value: -1, label: 'Any distance' }
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'nearby', label: 'Nearest to Me' },
  { value: 'alphabetical', label: 'A-Z' }
];

// Nigerian Phone Number Validation
export const PHONE_REGEX = /^(\+234|234|0)?[789][01]\d{8}$/;

// Common Nigerian Phone Prefixes
export const PHONE_PREFIXES = [
  '0701', '0703', '0704', '0705', '0706', '0708', '0802', '0803', '0805', '0806', '0807', '0808', '0809',
  '0810', '0811', '0812', '0813', '0814', '0815', '0816', '0817', '0818', '0819', '0901', '0902', '0903',
  '0904', '0905', '0906', '0907', '0908', '0909', '0915', '0916', '0917', '0918'
];

// Common Image Formats
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

// App Store URLs
export const STORE_URLS = {
  IOS: 'https://apps.apple.com/app/tradebybarter',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.tradebybarter.mobile'
};

// Social Media URLs
export const SOCIAL_URLS = {
  WEBSITE: 'https://tradebybarter.com',
  FACEBOOK: 'https://facebook.com/tradebybarter',
  TWITTER: 'https://twitter.com/tradebybarter',
  INSTAGRAM: 'https://instagram.com/tradebybarter',
  LINKEDIN: 'https://linkedin.com/company/tradebybarter'
};

// Support
export const SUPPORT = {
  EMAIL: 'support@tradebybarter.com',
  PHONE: '+234-800-TRADE-BY',
  WHATSAPP: '+234-800-872-332-9',
  HELP_CENTER: 'https://help.tradebybarter.com'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK: 'Please check your internet connection and try again',
  SERVER: 'Something went wrong on our end. Please try again later',
  VALIDATION: 'Please check your input and try again',
  UNAUTHORIZED: 'You need to login to access this feature',
  FORBIDDEN: 'You don\'t have permission to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  TIMEOUT: 'Request timed out. Please try again',
  OFFLINE: 'You are currently offline. Some features may not be available',
  CAMERA_PERMISSION: 'Camera permission is required to take photos',
  LOCATION_PERMISSION: 'Location permission is required for this feature',
  STORAGE_PERMISSION: 'Storage permission is required to save photos',
  BIOMETRIC_NOT_AVAILABLE: 'Biometric authentication is not available on this device',
  BIOMETRIC_NOT_ENROLLED: 'No biometric credentials are enrolled on this device'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back to TradeByBarter!',
  SIGNUP: 'Account created successfully! Welcome to TradeByBarter',
  LOGOUT: 'You have been logged out successfully',
  LISTING_CREATED: 'Your listing has been posted successfully',
  LISTING_UPDATED: 'Your listing has been updated',
  LISTING_DELETED: 'Your listing has been deleted',
  OFFER_SENT: 'Your offer has been sent successfully',
  OFFER_ACCEPTED: 'Offer accepted! You can now proceed with the trade',
  OFFER_REJECTED: 'Offer has been rejected',
  MESSAGE_SENT: 'Message sent successfully',
  PROFILE_UPDATED: 'Your profile has been updated',
  PAYMENT_SUCCESS: 'Payment completed successfully',
  VERIFICATION_SENT: 'Verification code has been sent to your phone'
};

// Loading Messages
export const LOADING_MESSAGES = {
  AUTHENTICATING: 'Signing you in...',
  CREATING_ACCOUNT: 'Creating your account...',
  LOADING_LISTINGS: 'Loading listings...',
  POSTING_LISTING: 'Posting your listing...',
  SENDING_OFFER: 'Sending your offer...',
  PROCESSING_PAYMENT: 'Processing payment...',
  UPLOADING_IMAGES: 'Uploading images...',
  SENDING_MESSAGE: 'Sending message...',
  VERIFYING_PHONE: 'Verifying phone number...'
};

// App Theme Colors (from design system)
export const COLORS = {
  primary: {
    DEFAULT: '#1E3A8A',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  secondary: {
    DEFAULT: '#10B981',
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  accent: {
    DEFAULT: '#F97316',
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  neutral: {
    light: '#F9FAFB',
    dark: '#111827',
    gray: '#6B7280',
    border: '#E5E7EB',
  },
  status: {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
  }
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    inter: 'System', // Use system font instead of Inter for now
    poppins: 'System', // Use system font instead of Poppins for now
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

// Animation Durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
  splash: 2000,
};

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  THEME: 'theme',
  LANGUAGE: 'language',
  BIOMETRIC_ENABLED: 'biometricEnabled',
  PUSH_TOKEN: 'pushToken',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  CACHED_LISTINGS: 'cachedListings',
  LAST_SYNC: 'lastSync',
  DRAFT_LISTING: 'draftListing',
  SEARCH_HISTORY: 'searchHistory',
};