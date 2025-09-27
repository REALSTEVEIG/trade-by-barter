export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export const CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electronics' },
  { value: 'FASHION', label: 'Fashion' },
  { value: 'VEHICLES', label: 'Vehicles' },
  { value: 'HOME_GARDEN', label: 'Home & Garden' },
  { value: 'BOOKS_MEDIA', label: 'Books & Media' },
  { value: 'SPORTS_RECREATION', label: 'Sports & Recreation' },
  { value: 'AUTOMOTIVE', label: 'Automotive' },
  { value: 'BEAUTY_HEALTH', label: 'Beauty & Health' },
  { value: 'TOYS_GAMES', label: 'Toys & Games' },
  { value: 'JEWELRY_ACCESSORIES', label: 'Jewelry & Accessories' },
  { value: 'ARTS_CRAFTS', label: 'Arts & Crafts' },
  { value: 'MUSICAL_INSTRUMENTS', label: 'Musical Instruments' },
  { value: 'FOOD_BEVERAGES', label: 'Food & Beverages' },
  { value: 'TOOLS_EQUIPMENT', label: 'Tools & Equipment' },
  { value: 'SERVICES', label: 'Services' },
  { value: 'HOME_APPLIANCES', label: 'Home Appliances' },
  { value: 'PET_SUPPLIES', label: 'Pet Supplies' },
  { value: 'OFFICE_SUPPLIES', label: 'Office Supplies' },
  { value: 'OTHER', label: 'Other' }
];

// Alias for backward compatibility
export const PRODUCT_CATEGORIES = CATEGORIES;

export const PRODUCT_CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' }
];

export const TRADE_OPTIONS = [
  {
    value: 'swap',
    label: 'Swap only',
    description: 'Trade for other items only'
  },
  {
    value: 'cash',
    label: 'Cash only',
    description: 'Sell for money only'
  },
  {
    value: 'both',
    label: 'Both',
    description: 'Open to cash or trade'
  }
];

export const COLORS = {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
    DEFAULT: '#1E3A8A'
  },
  secondary: {
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
    950: '#022C22',
    DEFAULT: '#10B981'
  },
  accent: {
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
    950: '#431407',
    DEFAULT: '#F97316'
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#030712'
  },
  neutral: {
    light: '#F3F4F6',
    gray: '#6B7280',
    dark: '#111827',
    border: '#E5E7EB'
  },
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6'
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36
};

export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700'
};

// Typography system
export const TYPOGRAPHY = {
  fontSize: FONT_SIZES,
  fontWeight: FONT_WEIGHTS,
  fontFamily: {
    inter: 'System',
    poppins: 'System'
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
};

// Animation constants
export const ANIMATION = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500
  },
  normal: 300, // backward compatibility
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out'
  }
};

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  THEME_PREFERENCE: 'themePreference',
  LANGUAGE_PREFERENCE: 'languagePreference'
};

// Nigerian currency formatting
export const formatNaira = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Time formatting
export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }

  return 'Just now';
};

// Input validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Nigerian phone number formats
  const phoneRegex = /^(\+234|234|0)[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

export const formatPhoneNumber = (phone: string): string => {
  // Format Nigerian phone number for display
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('234')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+234${cleaned.slice(1)}`;
  }
  
  return phone;
};

// Device utils
export const isTablet = (width: number): boolean => {
  return width >= 768;
};

export const getResponsivePadding = (width: number): number => {
  return isTablet(width) ? SPACING.xl : SPACING.md;
};

// Nigerian business hours
export const BUSINESS_HOURS = {
  start: 8, // 8 AM
  end: 18,  // 6 PM
};

export const isBusinessHours = (): boolean => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= BUSINESS_HOURS.start && hour < BUSINESS_HOURS.end;
};

// App version and build info
export const APP_INFO = {
  version: '1.0.0',
  buildNumber: '1',
  supportEmail: 'support@tradebybarter.ng',
  supportPhone: '+234 800 TRADE NOW',
  website: 'https://tradebybarter.ng',
  privacyPolicy: 'https://tradebybarter.ng/privacy',
  termsOfService: 'https://tradebybarter.ng/terms',
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  NETWORK: 'Network error. Please check your internet connection.',
  SERVER: 'Server error. Please try again later.',
  AUTH_ERROR: 'Authentication failed. Please login again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  FILE_TOO_LARGE: 'File size is too large. Please choose a smaller file.',
  INVALID_FILE_TYPE: 'Invalid file type. Please choose a valid image file.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  SIGNUP: 'Account created successfully!',
  LISTING_CREATED: 'Your listing has been created successfully!',
  LISTING_UPDATED: 'Your listing has been updated successfully!',
  LISTING_DELETED: 'Your listing has been deleted successfully!',
  OFFER_SENT: 'Your offer has been sent successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  PROFILE_UPDATED: 'Your profile has been updated successfully!',
  PASSWORD_CHANGED: 'Your password has been changed successfully!',
};