export interface ListingOwnerResponse {
  id: string;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  profileImageUrl?: string | null;
  isPhoneVerified: boolean;
  averageRating: number;
  totalReviews: number;
}

export interface ListingResponse {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  condition: string;
  price?: number; // in kobo
  displayPrice?: string; // formatted as "₦1,500"
  isSwapOnly: boolean;
  acceptsCash: boolean;
  acceptsSwap: boolean;
  swapPreferences: string[];
  city: string;
  state: string;
  specificLocation?: string | null;
  status: string;
  images: string[];
  owner: ListingOwnerResponse;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
  favoriteCount: number;
  isFavorite?: boolean;
  isOwner?: boolean;
}

export interface SearchListingsResponse {
  listings: ListingResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    tradeType?: string;
  };
}

export interface CategoryResponse {
  value: string;
  label: string;
  description: string;
  popular: boolean;
}

export interface LocationResponse {
  state: string;
  cities: string[];
}