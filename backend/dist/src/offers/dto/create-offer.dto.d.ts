import { OfferType } from './offer-types';
export declare class CreateOfferDto {
    listingId: string;
    type: OfferType;
    cashAmount?: number;
    offeredListingIds?: string[];
    message?: string;
    expiresAt?: string;
}
