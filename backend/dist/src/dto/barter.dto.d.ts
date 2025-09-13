import { UserSummaryDto } from './listing.dto';
export declare enum OfferType {
    ITEM_FOR_ITEM = "item_for_item",
    ITEM_PLUS_CASH = "item_plus_cash",
    CASH_ONLY = "cash_only",
    MULTIPLE_ITEMS = "multiple_items"
}
export declare enum OfferStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    COUNTER_OFFERED = "counter_offered",
    EXPIRED = "expired",
    WITHDRAWN = "withdrawn"
}
export declare enum TransactionStatus {
    INITIATED = "initiated",
    ITEMS_EXCHANGED = "items_exchanged",
    PAYMENT_PENDING = "payment_pending",
    COMPLETED = "completed",
    DISPUTED = "disputed",
    CANCELLED = "cancelled"
}
export declare class CreateOfferDto {
    listingId: string;
    offerType: OfferType;
    cashAmount?: number;
    offeredItems?: string[];
    message: string;
    proposedLocation?: string;
    autoExpire?: boolean;
    expiryHours?: number;
}
export declare class UpdateOfferDto {
    cashAmount?: number;
    message?: string;
    proposedLocation?: string;
}
export declare class RespondToOfferDto {
    response: 'accept' | 'reject' | 'counter';
    message?: string;
    counterOffer?: CreateOfferDto;
}
export declare class ListingSummaryDto {
    id: string;
    title: string;
    mainImage: string;
    estimatedValue: number;
    condition: string;
    location: string;
}
export declare class OfferResponseDto {
    id: string;
    listing: ListingSummaryDto;
    offerer: UserSummaryDto;
    offerType: OfferType;
    cashAmount: number | null;
    offeredItems: ListingSummaryDto[];
    message: string;
    proposedLocation: string;
    status: OfferStatus;
    canRespond: boolean;
    createdAt: Date;
    expiresAt: Date;
    updatedAt: Date;
}
export declare class TransactionDto {
    id: string;
    offer: OfferResponseDto;
    status: TransactionStatus;
    meetingDetails: MeetingDetailsDto;
    escrowDetails: EscrowDetailsDto | null;
    createdAt: Date;
    completedAt: Date | null;
    updatedAt: Date;
}
export declare class MeetingDetailsDto {
    location: string;
    scheduledAt: Date;
    safetyTips: string[];
    contactInfo: ContactInfoDto;
}
export declare class ContactInfoDto {
    phoneNumbers: string[];
    preferredMethod: string;
}
export declare class EscrowDetailsDto {
    id: string;
    fee: number;
    items: ListingSummaryDto[];
    status: string;
    releaseDate: Date;
}
export declare class CreateTransactionDto {
    offerId: string;
    meetingLocation: string;
    scheduledAt: string;
    useEscrow?: boolean;
    preferredContact?: string;
}
export declare class UpdateTransactionStatusDto {
    status: TransactionStatus;
    notes?: string;
}
