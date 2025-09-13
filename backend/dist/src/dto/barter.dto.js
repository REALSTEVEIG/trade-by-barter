"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTransactionStatusDto = exports.CreateTransactionDto = exports.EscrowDetailsDto = exports.ContactInfoDto = exports.MeetingDetailsDto = exports.TransactionDto = exports.OfferResponseDto = exports.ListingSummaryDto = exports.RespondToOfferDto = exports.UpdateOfferDto = exports.CreateOfferDto = exports.TransactionStatus = exports.OfferStatus = exports.OfferType = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const listing_dto_1 = require("./listing.dto");
var OfferType;
(function (OfferType) {
    OfferType["ITEM_FOR_ITEM"] = "item_for_item";
    OfferType["ITEM_PLUS_CASH"] = "item_plus_cash";
    OfferType["CASH_ONLY"] = "cash_only";
    OfferType["MULTIPLE_ITEMS"] = "multiple_items";
})(OfferType || (exports.OfferType = OfferType = {}));
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "pending";
    OfferStatus["ACCEPTED"] = "accepted";
    OfferStatus["REJECTED"] = "rejected";
    OfferStatus["COUNTER_OFFERED"] = "counter_offered";
    OfferStatus["EXPIRED"] = "expired";
    OfferStatus["WITHDRAWN"] = "withdrawn";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["INITIATED"] = "initiated";
    TransactionStatus["ITEMS_EXCHANGED"] = "items_exchanged";
    TransactionStatus["PAYMENT_PENDING"] = "payment_pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["DISPUTED"] = "disputed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
class CreateOfferDto {
    listingId;
    offerType;
    cashAmount;
    offeredItems;
    message;
    proposedLocation;
    autoExpire;
    expiryHours;
}
exports.CreateOfferDto = CreateOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the listing being offered on',
        example: 'lst_123456789'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of offer being made',
        enum: OfferType,
        example: OfferType.ITEM_FOR_ITEM
    }),
    (0, class_validator_1.IsEnum)(OfferType),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "offerType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cash amount in Naira (if applicable)',
        example: 50000,
        minimum: 0,
        maximum: 50000000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50000000),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Items being offered in exchange',
        example: ['lst_987654321', 'lst_555666777'],
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "offeredItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed message explaining the offer',
        example: 'Hi! I would like to trade my MacBook Pro for your iPhone. It\'s in excellent condition with original packaging.',
        maxLength: 1000
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Proposed meeting location in Nigeria',
        example: 'Computer Village, Ikeja, Lagos'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "proposedLocation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether offer expires automatically',
        example: true,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateOfferDto.prototype, "autoExpire", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Offer expiry in hours from creation',
        example: 72,
        minimum: 1,
        maximum: 168,
        default: 72
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(168),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "expiryHours", void 0);
class UpdateOfferDto {
    cashAmount;
    message;
    proposedLocation;
}
exports.UpdateOfferDto = UpdateOfferDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated cash amount',
        minimum: 0,
        maximum: 50000000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(50000000),
    __metadata("design:type", Number)
], UpdateOfferDto.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated offer message',
        maxLength: 1000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateOfferDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated meeting location'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], UpdateOfferDto.prototype, "proposedLocation", void 0);
class RespondToOfferDto {
    response;
    message;
    counterOffer;
}
exports.RespondToOfferDto = RespondToOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response to the offer',
        enum: ['accept', 'reject', 'counter'],
        example: 'accept'
    }),
    (0, class_validator_1.IsEnum)(['accept', 'reject', 'counter']),
    __metadata("design:type", String)
], RespondToOfferDto.prototype, "response", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Response message',
        example: 'Great offer! I accept your trade proposal.',
        maxLength: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], RespondToOfferDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Counter offer details (if response is counter)',
        type: () => CreateOfferDto
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", CreateOfferDto)
], RespondToOfferDto.prototype, "counterOffer", void 0);
class ListingSummaryDto {
    id;
    title;
    mainImage;
    estimatedValue;
    condition;
    location;
}
exports.ListingSummaryDto = ListingSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing ID',
        example: 'lst_123456789'
    }),
    __metadata("design:type", String)
], ListingSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing title',
        example: 'iPhone 13 Pro Max 256GB'
    }),
    __metadata("design:type", String)
], ListingSummaryDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Main image URL',
        example: 'https://cdn.tradebybarter.ng/listings/img1.jpg'
    }),
    __metadata("design:type", String)
], ListingSummaryDto.prototype, "mainImage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated value in Naira',
        example: 450000
    }),
    __metadata("design:type", Number)
], ListingSummaryDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Item condition',
        example: 'like_new'
    }),
    __metadata("design:type", String)
], ListingSummaryDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Owner location',
        example: 'Lagos'
    }),
    __metadata("design:type", String)
], ListingSummaryDto.prototype, "location", void 0);
class OfferResponseDto {
    id;
    listing;
    offerer;
    offerType;
    cashAmount;
    offeredItems;
    message;
    proposedLocation;
    status;
    canRespond;
    createdAt;
    expiresAt;
    updatedAt;
}
exports.OfferResponseDto = OfferResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique offer identifier',
        example: 'off_123456789'
    }),
    __metadata("design:type", String)
], OfferResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing being offered on',
        type: () => ListingSummaryDto
    }),
    __metadata("design:type", ListingSummaryDto)
], OfferResponseDto.prototype, "listing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User making the offer',
        type: () => listing_dto_1.UserSummaryDto
    }),
    __metadata("design:type", listing_dto_1.UserSummaryDto)
], OfferResponseDto.prototype, "offerer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of offer',
        enum: OfferType,
        example: OfferType.ITEM_FOR_ITEM
    }),
    __metadata("design:type", String)
], OfferResponseDto.prototype, "offerType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Cash amount involved (if any)',
        example: 50000,
        nullable: true
    }),
    __metadata("design:type", Object)
], OfferResponseDto.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items offered in exchange',
        type: [ListingSummaryDto]
    }),
    __metadata("design:type", Array)
], OfferResponseDto.prototype, "offeredItems", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer message',
        example: 'I would like to trade my MacBook for your iPhone'
    }),
    __metadata("design:type", String)
], OfferResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Proposed meeting location',
        example: 'Computer Village, Ikeja, Lagos'
    }),
    __metadata("design:type", String)
], OfferResponseDto.prototype, "proposedLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current offer status',
        enum: OfferStatus,
        example: OfferStatus.PENDING
    }),
    __metadata("design:type", String)
], OfferResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether current user can respond to this offer',
        example: true
    }),
    __metadata("design:type", Boolean)
], OfferResponseDto.prototype, "canRespond", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer creation timestamp',
        example: '2024-03-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], OfferResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer expiry timestamp',
        example: '2024-03-18T10:30:00Z'
    }),
    __metadata("design:type", Date)
], OfferResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-03-16T14:45:00Z'
    }),
    __metadata("design:type", Date)
], OfferResponseDto.prototype, "updatedAt", void 0);
class TransactionDto {
    id;
    offer;
    status;
    meetingDetails;
    escrowDetails;
    createdAt;
    completedAt;
    updatedAt;
}
exports.TransactionDto = TransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique transaction identifier',
        example: 'txn_123456789'
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Accepted offer that initiated this transaction',
        type: () => OfferResponseDto
    }),
    __metadata("design:type", OfferResponseDto)
], TransactionDto.prototype, "offer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction status',
        enum: TransactionStatus,
        example: TransactionStatus.INITIATED
    }),
    __metadata("design:type", String)
], TransactionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Meeting details for exchange',
        type: () => MeetingDetailsDto
    }),
    __metadata("design:type", MeetingDetailsDto)
], TransactionDto.prototype, "meetingDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow information (if applicable)',
        type: () => EscrowDetailsDto,
        nullable: true
    }),
    __metadata("design:type", Object)
], TransactionDto.prototype, "escrowDetails", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction creation timestamp',
        example: '2024-03-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction completion timestamp',
        example: '2024-03-17T15:20:00Z',
        nullable: true
    }),
    __metadata("design:type", Object)
], TransactionDto.prototype, "completedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-03-16T14:45:00Z'
    }),
    __metadata("design:type", Date)
], TransactionDto.prototype, "updatedAt", void 0);
class MeetingDetailsDto {
    location;
    scheduledAt;
    safetyTips;
    contactInfo;
}
exports.MeetingDetailsDto = MeetingDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Meeting location in Nigeria',
        example: 'Computer Village, Ikeja, Lagos'
    }),
    __metadata("design:type", String)
], MeetingDetailsDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Scheduled meeting date and time',
        example: '2024-03-18T14:00:00Z'
    }),
    __metadata("design:type", Date)
], MeetingDetailsDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Safety tips and guidelines',
        example: [
            'Meet in a public place',
            'Bring a friend if possible',
            'Verify items before exchange'
        ]
    }),
    __metadata("design:type", Array)
], MeetingDetailsDto.prototype, "safetyTips", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Contact information for coordination',
        type: () => ContactInfoDto
    }),
    __metadata("design:type", ContactInfoDto)
], MeetingDetailsDto.prototype, "contactInfo", void 0);
class ContactInfoDto {
    phoneNumbers;
    preferredMethod;
}
exports.ContactInfoDto = ContactInfoDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Masked phone numbers for safety',
        example: ['+234801***5678', '+234802***9012']
    }),
    __metadata("design:type", Array)
], ContactInfoDto.prototype, "phoneNumbers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Preferred contact method',
        example: 'WhatsApp',
        enum: ['WhatsApp', 'Phone', 'In-App']
    }),
    __metadata("design:type", String)
], ContactInfoDto.prototype, "preferredMethod", void 0);
class EscrowDetailsDto {
    id;
    fee;
    items;
    status;
    releaseDate;
}
exports.EscrowDetailsDto = EscrowDetailsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow service ID',
        example: 'esc_123456789'
    }),
    __metadata("design:type", String)
], EscrowDetailsDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow fee in Naira',
        example: 2500
    }),
    __metadata("design:type", Number)
], EscrowDetailsDto.prototype, "fee", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items held in escrow',
        type: [ListingSummaryDto]
    }),
    __metadata("design:type", Array)
], EscrowDetailsDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow status',
        example: 'holding',
        enum: ['initiated', 'holding', 'released', 'disputed']
    }),
    __metadata("design:type", String)
], EscrowDetailsDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Expected release date',
        example: '2024-03-20T10:30:00Z'
    }),
    __metadata("design:type", Date)
], EscrowDetailsDto.prototype, "releaseDate", void 0);
class CreateTransactionDto {
    offerId;
    meetingLocation;
    scheduledAt;
    useEscrow;
    preferredContact;
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer ID that was accepted',
        example: 'off_123456789'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "offerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Proposed meeting location',
        example: 'Computer Village, Ikeja, Lagos'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "meetingLocation", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Proposed meeting date and time',
        example: '2024-03-18T14:00:00Z'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to use escrow service',
        example: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateTransactionDto.prototype, "useEscrow", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Preferred contact method',
        example: 'WhatsApp',
        enum: ['WhatsApp', 'Phone', 'In-App']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "preferredContact", void 0);
class UpdateTransactionStatusDto {
    status;
    notes;
}
exports.UpdateTransactionStatusDto = UpdateTransactionStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'New transaction status',
        enum: TransactionStatus,
        example: TransactionStatus.ITEMS_EXCHANGED
    }),
    (0, class_validator_1.IsEnum)(TransactionStatus),
    __metadata("design:type", String)
], UpdateTransactionStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional notes about the status update',
        example: 'Items successfully exchanged. Both parties satisfied.',
        maxLength: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateTransactionStatusDto.prototype, "notes", void 0);
//# sourceMappingURL=barter.dto.js.map