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
exports.TransferResponseDto = exports.TransferFundsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TransferFundsDto {
    recipientId;
    amount;
    description;
}
exports.TransferFundsDto = TransferFundsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the recipient user',
        example: 'usr_def456ghi789',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], TransferFundsDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to transfer in kobo (Nigerian currency)',
        example: 50000,
        minimum: 100,
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(100, { message: 'Minimum transfer amount is ₦1.00 (100 kobo)' }),
    __metadata("design:type", Number)
], TransferFundsDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Optional description for the transfer',
        example: 'Payment for laptop purchase',
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransferFundsDto.prototype, "description", void 0);
class TransferResponseDto {
    id;
    status;
    amount;
    amountFormatted;
    sender;
    recipient;
    description;
    createdAt;
}
exports.TransferResponseDto = TransferResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction ID',
        example: 'txn_abc123def456',
    }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer status',
        example: 'completed',
        enum: ['pending', 'completed', 'failed', 'cancelled'],
    }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount transferred in kobo',
        example: 50000,
    }),
    __metadata("design:type", Number)
], TransferResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount transferred in Naira (formatted)',
        example: '₦500.00',
    }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "amountFormatted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Sender user information',
        example: {
            id: 'usr_abc123def456',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
        },
    }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Recipient user information',
        example: {
            id: 'usr_def456ghi789',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
        },
    }),
    __metadata("design:type", Object)
], TransferResponseDto.prototype, "recipient", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transfer description',
        example: 'Payment for laptop purchase',
        required: false,
    }),
    __metadata("design:type", String)
], TransferResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction creation timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], TransferResponseDto.prototype, "createdAt", void 0);
//# sourceMappingURL=transfer-funds.dto.js.map