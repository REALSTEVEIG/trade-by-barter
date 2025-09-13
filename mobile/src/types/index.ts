// Core API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  location?: {
    state: string;
    city: string;
    address?: string;
  };
  bio?: string;
  rating: number;
  totalTrades: number;
  joinedAt: string;
  lastSeen: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state: string;
  city: string;
  displayName?: string;
  address?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Listing Types
export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  user: User;
  location: {
    state: string;
    city: string;
    address?: string;
  };
  status: 'active' | 'inactive' | 'traded' | 'deleted';
  wantedItems?: string[];
  tags: string[];
  views: number;
  favoritesCount: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  condition: string;
  images: string[];
  wantedItems?: string[];
  tags?: string[];
  location: {
    state: string;
    city: string;
    address?: string;
  };
}

// Offer Types
export interface Offer {
  id: string;
  listingId: string;
  listing: Listing;
  offererId: string;
  offerer: User;
  receiverId: string;
  receiver: User;
  type: 'item' | 'money' | 'service' | 'combo';
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  items?: Listing[];
  amount?: number;
  currency?: string;
  description?: string;
  message?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOfferData {
  listingId: string;
  type: 'item' | 'money' | 'service' | 'combo';
  items?: string[];
  amount?: number;
  currency?: string;
  description?: string;
  message?: string;
}

// Chat Types
export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  type: 'trade' | 'support';
  metadata?: {
    listingId?: string;
    offerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'image' | 'voice' | 'system';
  metadata?: {
    imageUrl?: string;
    voiceUrl?: string;
    duration?: number;
  };
  isRead: boolean;
  createdAt: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'trade' | 'message' | 'system' | 'promotion';
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}

// Search & Filter Types
export interface SearchFilters {
  query?: string;
  category?: string;
  condition?: string[];
  location?: {
    state?: string;
    city?: string;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  sortBy?: 'recent' | 'popular' | 'nearby' | 'alphabetical';
  radius?: number;
}

export interface SearchResult {
  listings: Listing[];
  filters: {
    categories: string[];
    conditions: string[];
    locations: Array<{ state: string; city: string; count: number }>;
    priceRange: { min: number; max: number };
  };
  total: number;
}

// Navigation Types
export interface RootStackParamList {
  Auth: undefined;
  Main: undefined;
  ListingDetail: { listingId: string };
  UserProfile: { userId: string };
  Chat: { chatId: string };
  Wallet: undefined;
  Notifications: undefined;
  Search: { query?: string; filters?: SearchFilters };
  CreateListing: undefined;
  EditListing: { listingId: string };
  MakeOffer: { listingId: string };
  Camera: { mode: 'listing' | 'chat' };
}

export interface MainTabParamList {
  Home: undefined;
  Feed: undefined;
  Create: undefined;
  Offers: undefined;
  Profile: undefined;
}

export interface AuthStackParamList {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { phone: string };
}

// Form Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormError[];
}

// Nigerian Specific Types
export interface NigerianState {
  name: string;
  code: string;
  cities: string[];
}

export interface NigerianLocation {
  state: string;
  city: string;
  lga?: string;
}

// App State Types
export interface AppState {
  auth: {
    isAuthenticated: boolean;
    user: User | null;
    tokens: AuthTokens | null;
    isLoading: boolean;
    error: string | null;
  };
  listings: {
    featured: Listing[];
    feed: Listing[];
    favorites: Listing[];
    userListings: Listing[];
    searchResults: SearchResult | null;
    isLoading: boolean;
    error: string | null;
  };
  chat: {
    chats: Chat[];
    activeChat: Chat | null;
    messages: Record<string, Message[]>;
    isLoading: boolean;
    error: string | null;
  };
  offers: {
    sent: Offer[];
    received: Offer[];
    isLoading: boolean;
    error: string | null;
  };
  wallet: {
    wallet: Wallet | null;
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
  };
  notifications: {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;
  };
  app: {
    isOnline: boolean;
    theme: 'light' | 'dark';
    language: string;
    currency: string;
    location: NigerianLocation | null;
    pushToken: string | null;
  };
}

// Component Props Types
export interface TouchableButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
}

export interface MobileInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
}

export interface ProductCardProps {
  listing: Listing;
  onPress: () => void;
  onFavorite?: () => void;
  variant?: 'grid' | 'list';
}

export interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onImagePress?: (imageUrl: string) => void;
  onVoicePlay?: (voiceUrl: string) => void;
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  status: LoadingState;
  error: string | null;
}

// Nigerian specific constants
export const NIGERIAN_STATES: NigerianState[] = [
  {
    name: 'Lagos',
    code: 'LG',
    cities: ['Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Ikoyi', 'Ajah', 'Alaba']
  },
  {
    name: 'Abuja',
    code: 'FC',
    cities: ['Central Area', 'Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa']
  },
  // Add more states as needed
];

export const NIGERIAN_CURRENCIES = {
  NGN: {
    symbol: '₦',
    name: 'Nigerian Naira',
    code: 'NGN'
  }
};