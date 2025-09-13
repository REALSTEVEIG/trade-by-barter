export declare enum ListingCondition {
    NEW = "new",
    LIKE_NEW = "like_new",
    GOOD = "good",
    FAIR = "fair",
    POOR = "poor"
}
export declare enum ListingStatus {
    ACTIVE = "active",
    PENDING = "pending",
    TRADED = "traded",
    EXPIRED = "expired",
    SUSPENDED = "suspended"
}
export declare class CreateListingDto {
    title: string;
    description: string;
    categoryId: string;
    condition: ListingCondition;
    estimatedValue: number;
    location: string;
    images: string[];
    lookingFor?: string;
    tags?: string[];
    allowCashOffers?: boolean;
    allowPartialTrade?: boolean;
}
export declare class UpdateListingDto {
    title?: string;
    description?: string;
    condition?: ListingCondition;
    estimatedValue?: number;
    lookingFor?: string;
    tags?: string[];
    allowCashOffers?: boolean;
    allowPartialTrade?: boolean;
}
export declare class ListingResponseDto {
    id: string;
    title: string;
    description: string;
    category: CategoryResponseDto;
    condition: ListingCondition;
    estimatedValue: number;
    location: string;
    images: string[];
    lookingFor: string;
    tags: string[];
    status: ListingStatus;
    owner: UserSummaryDto;
    viewCount: number;
    offerCount: number;
    isFavorited: boolean;
    allowCashOffers: boolean;
    allowPartialTrade: boolean;
    createdAt: Date;
    updatedAt: Date;
    expiresAt: Date;
}
export declare class CategoryResponseDto {
    id: string;
    name: string;
    icon: string;
}
export declare class UserSummaryDto {
    id: string;
    fullName: string;
    profilePicture: string | null;
    location: string;
    reputationScore: number;
    isVerified: boolean;
    memberSince: Date;
}
export declare class SearchListingsDto {
    q?: string;
    categoryId?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: ListingCondition;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export declare class PaginatedListingsDto {
    data: ListingResponseDto[];
    meta: PaginationMetaDto;
}
export declare class PaginationMetaDto {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
