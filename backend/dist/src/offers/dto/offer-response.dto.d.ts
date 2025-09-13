import { OfferType, OfferStatus } from './offer-types';
import type { UserSummary, ListingSummary } from './offer-types';
export declare class OfferResponse {
    id: string;
    type: OfferType;
    status: OfferStatus;
    cashAmount?: number;
    displayCashAmount?: string;
    message?: string;
    expiresAt: Date;
    createdAt: Date;
    listing: {
        id: string;
        title: string;
        owner: UserSummary;
    };
    offerer: UserSummary;
    offeredListings?: ListingSummary[];
    parentOfferId?: string;
    counterOffers?: OfferResponse[];
    isOfferer: boolean;
    isListingOwner: boolean;
}
export declare class GetOffersResponse {
    offers: OfferResponse[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
