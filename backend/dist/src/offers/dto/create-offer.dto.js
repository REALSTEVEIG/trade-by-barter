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
exports.CreateOfferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const offer_types_1 = require("./offer-types");
class CreateOfferDto {
    listingId;
    type;
    cashAmount;
    offeredListingIds;
    message;
    expiresAt;
}
exports.CreateOfferDto = CreateOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the listing to make an offer on',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of offer being made',
        enum: offer_types_1.OfferType,
        example: offer_types_1.OfferType.CASH,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(offer_types_1.OfferType),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cash amount in kobo (required for CASH and HYBRID offers)',
        example: 85000000,
        minimum: 100,
        maximum: 100000000000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(100000000000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CreateOfferDto.prototype, "cashAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of listing IDs being offered in exchange (required for SWAP and HYBRID offers)',
        type: [String],
        example: ['550e8400-e29b-41d4-a716-446655440001'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], CreateOfferDto.prototype, "offeredListingIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional message to accompany the offer',
        example: 'I am very interested in this item. Can we negotiate?',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom expiration date for the offer (default: 7 days from creation)',
        example: '2024-01-15T10:30:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateOfferDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=create-offer.dto.js.map