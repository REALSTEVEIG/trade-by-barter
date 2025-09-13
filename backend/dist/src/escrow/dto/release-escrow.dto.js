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
exports.ReleaseEscrowResponseDto = exports.ReleaseEscrowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class ReleaseEscrowDto {
    reason;
    confirmCompletion;
}
exports.ReleaseEscrowDto = ReleaseEscrowDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Reason for releasing the escrow',
        example: 'Trade completed successfully',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReleaseEscrowDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Confirmation that trade is complete',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ReleaseEscrowDto.prototype, "confirmCompletion", void 0);
class ReleaseEscrowResponseDto {
    success;
    message;
    escrowId;
    amountReleased;
    recipientId;
    releasedAt;
}
exports.ReleaseEscrowResponseDto = ReleaseEscrowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether escrow was released successfully',
        example: true,
    }),
    __metadata("design:type", Boolean)
], ReleaseEscrowResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Escrow funds released successfully',
    }),
    __metadata("design:type", String)
], ReleaseEscrowResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow ID that was released',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], ReleaseEscrowResponseDto.prototype, "escrowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount released in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], ReleaseEscrowResponseDto.prototype, "amountReleased", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient user ID',
        example: '550e8400-e29b-41d4-a716-446655440001',
    }),
    __metadata("design:type", String)
], ReleaseEscrowResponseDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Release timestamp',
        example: '2023-12-01T16:00:00Z',
    }),
    __metadata("design:type", String)
], ReleaseEscrowResponseDto.prototype, "releasedAt", void 0);
//# sourceMappingURL=release-escrow.dto.js.map