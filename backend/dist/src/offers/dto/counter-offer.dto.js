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
exports.CounterOfferDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const offer_types_1 = require("./offer-types");
class CounterOfferDto {
    type;
    cashAmount;
    offeredListingIds;
    message;
    expiresAt;
}
exports.CounterOfferDto = CounterOfferDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Type of counteroffer being made',
        enum: offer_types_1.OfferType,
        example: offer_types_1.OfferType.HYBRID,
    }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(offer_types_1.OfferType),
    __metadata("design:type", String)
], CounterOfferDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Cash amount in kobo (required for CASH and HYBRID offers)',
        example: 75000000,
        minimum: 100,
        maximum: 100000000000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100),
    (0, class_validator_1.Max)(100000000000),
    (0, class_transformer_1.Transform)(({ value }) => parseInt(value)),
    __metadata("design:type", Number)
], CounterOfferDto.prototype, "cashAmount", void 0);
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
], CounterOfferDto.prototype, "offeredListingIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Message to accompany the counteroffer',
        example: 'Thanks for your offer! How about this counter-proposal?',
        maxLength: 1000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Transform)(({ value }) => value?.trim()),
    __metadata("design:type", String)
], CounterOfferDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom expiration date for the counteroffer (default: 7 days from creation)',
        example: '2024-01-15T10:30:00.000Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CounterOfferDto.prototype, "expiresAt", void 0);
//# sourceMappingURL=counter-offer.dto.js.map