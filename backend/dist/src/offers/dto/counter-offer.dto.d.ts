import { OfferType } from './offer-types';
export declare class CounterOfferDto {
    type: OfferType;
    cashAmount?: number;
    offeredListingIds?: string[];
    message?: string;
    expiresAt?: string;
}
