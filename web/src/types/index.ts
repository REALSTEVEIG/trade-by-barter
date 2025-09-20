// Core types for the TradeByBarter application

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  bio?: string;
  location?: string;
  isVerified: boolean;
  rating: number;
  totalTrades: number;
  joinedAt: Date;
  lastActive: Date;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  price?: number | null; // Price in kobo (for cash/hybrid trades)
  isSwapOnly: boolean;
  acceptsCash: boolean;
  acceptsSwap: boolean;
  swapPreferences: string[];
  images: (string | MediaFile)[]; // API returns string URLs directly
  city: string;
  state: string;
  specificLocation?: string;
  status: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    displayName: string;
    profileImageUrl?: string;
    isPhoneVerified: boolean;
    averageRating: number;
    totalReviews: number;
  };
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
  isFavorite: boolean;
  isOwner: boolean;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  filename: string;
  size: number;
  width?: number;
  height?: number;
  blurhash?: string;
}

export interface Location {
  state: string;
  city: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Offer {
  id: string;
  listingId: string;
  listing?: Listing;
  offererId: string;
  offerer?: User;
  type: 'swap' | 'cash' | 'hybrid';
  message: string;
  cashAmount?: number; // In kobo
  offeredItems?: OfferedItem[];
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  counterOffers: CounterOffer[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface OfferedItem {
  id: string;
  title: string;
  description: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  estimatedValue?: number; // In kobo
  images: MediaFile[];
}

export interface CounterOffer {
  id: string;
  offerId: string;
  userId: string;
  user?: User;
  message: string;
  cashAmount?: number;
  offeredItems?: OfferedItem[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Chat {
  id: string;
  participants: User[];
  offerId?: string;
  offer?: Offer;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  content: string;
  type: 'text' | 'image' | 'offer' | 'system';
  attachments?: MediaFile[];
  status: 'sent' | 'delivered' | 'read';
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balanceInKobo: number;
  escrowBalanceInKobo: number;
  totalEarnedInKobo: number;
  totalSpentInKobo: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'topup' | 'withdrawal' | 'escrow_hold' | 'escrow_release' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  amountInKobo: number;
  description: string;
  reference: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'message' | 'trade_completed' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message: string;
  success: boolean;
}

// Form types
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

export interface CreateListingData {
  title: string;
  description: string;
  category: string;
  condition: string;
  tradeType: 'swap' | 'cash' | 'hybrid';
  priceInKobo?: number;
  desiredItems?: string[];
  images: File[];
  location: {
    state: string;
    city: string;
    address?: string;
  };
}

export interface CreateOfferData {
  listingId: string;
  type: 'swap' | 'cash' | 'hybrid';
  message: string;
  cashAmount?: number;
  offeredItems?: Omit<OfferedItem, 'id' | 'images'> & { images: File[] }[];
}

// Search and filter types
export interface ListingFilters {
  category?: string;
  condition?: string;
  tradeType?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  userId?: string;
}

export interface SearchParams {
  query?: string;
  filters?: ListingFilters;
  sort?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';
  page?: number;
  limit?: number;
}

// Nigerian specific types
export type NigerianState = 
  | 'Abia' | 'Adamawa' | 'Akwa Ibom' | 'Anambra' | 'Bauchi' | 'Bayelsa'
  | 'Benue' | 'Borno' | 'Cross River' | 'Delta' | 'Ebonyi' | 'Edo'
  | 'Ekiti' | 'Enugu' | 'FCT (Abuja)' | 'Gombe' | 'Imo' | 'Jigawa'
  | 'Kaduna' | 'Kano' | 'Katsina' | 'Kebbi' | 'Kogi' | 'Kwara'
  | 'Lagos' | 'Nasarawa' | 'Niger' | 'Ogun' | 'Ondo' | 'Osun'
  | 'Oyo' | 'Plateau' | 'Rivers' | 'Sokoto' | 'Taraba' | 'Yobe'
  | 'Zamfara';

export interface NigerianLocation {
  state: NigerianState;
  city: string;
  lga?: string; // Local Government Area
}