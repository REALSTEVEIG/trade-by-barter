export declare enum OfferType {
    CASH = "CASH",
    SWAP = "SWAP",
    HYBRID = "HYBRID"
}
export declare enum OfferStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    COUNTERED = "COUNTERED",
    WITHDRAWN = "WITHDRAWN",
    EXPIRED = "EXPIRED"
}
export interface UserSummary {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    profileImageUrl?: string;
    isPhoneVerified: boolean;
    averageRating: number;
    totalReviews: number;
}
export interface ListingSummary {
    id: string;
    title: string;
    category: string;
    condition: string;
    price?: number;
    displayPrice?: string;
    images: string[];
    owner: UserSummary;
}
