import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack Types
export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  VerifyOtp: { phone: string };
};

// Main Tab Types (Bottom Navigation)
export type MainTabParamList = {
  Home: undefined;
  Trade: undefined;
  Post: undefined;
  Messages: undefined;
  Profile: undefined;
};

// Root Stack Types
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ListingDetail: { listingId: string };
  UserProfile: { userId: string };
  Chat: { chatId: string };
  Wallet: undefined;
  Notifications: undefined;
  Search: { query?: string };
  CreateListing: undefined;
  EditListing: { listingId: string };
  MakeOffer: { listingId: string };
  Camera: { mode: 'listing' | 'chat' };
  Settings: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Help: undefined;
  About: undefined;
};

// Feed Stack Types (nested in Trade tab)
export type FeedStackParamList = {
  Feed: undefined;
  Search: { query?: string };
  Filter: undefined;
};

// Offers Stack Types
export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { offerId: string };
  MakeOffer: { listingId: string };
};

// Chat Stack Types
export type ChatStackParamList = {
  ChatList: undefined;
  Chat: { chatId: string };
  ChatSettings: { chatId: string };
};

// Profile Stack Types
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Wallet: undefined;
  Favorites: undefined;
  MyListings: undefined;
  TradeHistory: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}