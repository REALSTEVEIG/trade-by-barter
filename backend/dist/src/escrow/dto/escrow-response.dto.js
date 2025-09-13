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
exports.EscrowListResponseDto = exports.EscrowResponseDto = exports.EscrowStatus = void 0;
const swagger_1 = require("@nestjs/swagger");
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus["CREATED"] = "CREATED";
    EscrowStatus["FUNDED"] = "FUNDED";
    EscrowStatus["DISPUTED"] = "DISPUTED";
    EscrowStatus["RELEASED"] = "RELEASED";
    EscrowStatus["REFUNDED"] = "REFUNDED";
    EscrowStatus["EXPIRED"] = "EXPIRED";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
class EscrowResponseDto {
    id;
    reference;
    amountInKobo;
    feeInKobo;
    status;
    description;
    releaseCondition;
    buyerId;
    sellerId;
    offerId;
    expiresAt;
    releasedAt;
    disputeOpenedAt;
    createdAt;
    updatedAt;
}
exports.EscrowResponseDto = EscrowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow ID',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow reference',
        example: 'ESC_1234567890',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow amount in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], EscrowResponseDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow service fee in kobo (2.5%)',
        example: 12500,
    }),
    __metadata("design:type", Number)
], EscrowResponseDto.prototype, "feeInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current escrow status',
        enum: EscrowStatus,
        example: EscrowStatus.CREATED,
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Escrow description',
        example: 'Escrow for iPhone 13 trade',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release condition',
        example: 'Both parties confirm trade completion',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "releaseCondition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Buyer user ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "buyerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Seller user ID',
        example: '550e8400-e29b-41d4-a716-446655440002',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "sellerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Related offer ID',
        example: '550e8400-e29b-41d4-a716-446655440003',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "offerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Auto-release date',
        example: '2023-12-08T10:00:00Z',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "expiresAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release timestamp',
        example: '2023-12-01T16:00:00Z',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "releasedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Dispute opened timestamp',
        example: '2023-12-01T14:00:00Z',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "disputeOpenedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow creation timestamp',
        example: '2023-12-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2023-12-01T12:00:00Z',
    }),
    __metadata("design:type", String)
], EscrowResponseDto.prototype, "updatedAt", void 0);
class EscrowListResponseDto {
    escrows;
    total;
    active;
    completed;
}
exports.EscrowListResponseDto = EscrowListResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of escrow accounts',
        type: [EscrowResponseDto],
    }),
    __metadata("design:type", Array)
], EscrowListResponseDto.prototype, "escrows", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of escrows',
        example: 10,
    }),
    __metadata("design:type", Number)
], EscrowListResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of active escrows',
        example: 3,
    }),
    __metadata("design:type", Number)
], EscrowListResponseDto.prototype, "active", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of completed escrows',
        example: 7,
    }),
    __metadata("design:type", Number)
], EscrowListResponseDto.prototype, "completed", void 0);
//# sourceMappingURL=escrow-response.dto.js.map