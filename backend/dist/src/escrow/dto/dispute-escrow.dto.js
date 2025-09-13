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
exports.DisputeEscrowResponseDto = exports.DisputeEscrowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class DisputeEscrowDto {
    reason;
    details;
}
exports.DisputeEscrowDto = DisputeEscrowDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reason for opening the dispute',
        example: 'Item not as described',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeEscrowDto.prototype, "reason", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional details about the dispute',
        example: 'The iPhone received has a cracked screen which was not mentioned in the listing',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DisputeEscrowDto.prototype, "details", void 0);
class DisputeEscrowResponseDto {
    success;
    message;
    escrowId;
    disputeReference;
    disputeOpenedAt;
    estimatedResolutionTime;
}
exports.DisputeEscrowResponseDto = DisputeEscrowResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether dispute was opened successfully',
        example: true,
    }),
    __metadata("design:type", Boolean)
], DisputeEscrowResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Response message',
        example: 'Dispute opened successfully. Escrow funds have been frozen.',
    }),
    __metadata("design:type", String)
], DisputeEscrowResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Escrow ID that is disputed',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    __metadata("design:type", String)
], DisputeEscrowResponseDto.prototype, "escrowId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dispute reference for tracking',
        example: 'DISP_1234567890',
    }),
    __metadata("design:type", String)
], DisputeEscrowResponseDto.prototype, "disputeReference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Dispute opened timestamp',
        example: '2023-12-01T14:00:00Z',
    }),
    __metadata("design:type", String)
], DisputeEscrowResponseDto.prototype, "disputeOpenedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated resolution time',
        example: '3-5 business days',
    }),
    __metadata("design:type", String)
], DisputeEscrowResponseDto.prototype, "estimatedResolutionTime", void 0);
//# sourceMappingURL=dispute-escrow.dto.js.map