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
exports.GetOffersResponse = exports.OfferResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
const offer_types_1 = require("./offer-types");
class OfferResponse {
    id;
    type;
    status;
    cashAmount;
    displayCashAmount;
    message;
    expiresAt;
    createdAt;
    listing;
    offerer;
    offeredListings;
    parentOfferId;
    counterOffers;
    isOfferer;
    isListingOwner;
}
exports.OfferResponse = OfferResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier for the offer',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of offer',
        enum: offer_types_1.OfferType,
        example: offer_types_1.OfferType.CASH,
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current status of the offer',
        enum: offer_types_1.OfferStatus,
        example: offer_types_1.OfferStatus.PENDING,
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cash amount in kobo',
        example: 85000000,
    }),
    __metadata("design:type", Number)
], OfferResponse.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Formatted cash amount for display',
        example: '₦850,000',
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "displayCashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message accompanying the offer',
        example: 'I am very interested in this item. Can we negotiate?',
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer expiration date',
        example: '2024-01-15T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], OfferResponse.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Offer creation date',
        example: '2024-01-08T10:30:00.000Z',
    }),
    __metadata("design:type", Date)
], OfferResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing being offered on',
        type: Object,
    }),
    __metadata("design:type", Object)
], OfferResponse.prototype, "listing", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User making the offer',
        type: Object,
    }),
    __metadata("design:type", Object)
], OfferResponse.prototype, "offerer", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Listings offered in exchange (for SWAP and HYBRID offers)',
        type: [Object],
    }),
    __metadata("design:type", Array)
], OfferResponse.prototype, "offeredListings", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Parent offer ID for counteroffers',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    __metadata("design:type", String)
], OfferResponse.prototype, "parentOfferId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of counteroffers to this offer',
        type: [Object],
    }),
    __metadata("design:type", Array)
], OfferResponse.prototype, "counterOffers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the current user is the offerer',
        example: true,
    }),
    __metadata("design:type", Boolean)
], OfferResponse.prototype, "isOfferer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the current user is the listing owner',
        example: false,
    }),
    __metadata("design:type", Boolean)
], OfferResponse.prototype, "isListingOwner", void 0);
class GetOffersResponse {
    offers;
    pagination;
}
exports.GetOffersResponse = GetOffersResponse;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of offers',
        type: [OfferResponse],
    }),
    __metadata("design:type", Array)
], GetOffersResponse.prototype, "offers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination information',
        type: Object,
    }),
    __metadata("design:type", Object)
], GetOffersResponse.prototype, "pagination", void 0);
//# sourceMappingURL=offer-response.dto.js.map