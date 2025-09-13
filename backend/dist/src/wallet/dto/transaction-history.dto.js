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
exports.TransactionHistoryResponseDto = exports.TransactionItemDto = exports.TransactionHistoryQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class TransactionHistoryQueryDto {
    page = 1;
    limit = 20;
    type;
    status;
}
exports.TransactionHistoryQueryDto = TransactionHistoryQueryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransactionHistoryQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of transactions per page',
        example: 20,
        minimum: 1,
        maximum: 100,
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], TransactionHistoryQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by transaction type',
        example: 'wallet_credit',
        enum: [
            'wallet_credit',
            'wallet_debit',
            'escrow_hold',
            'escrow_release',
            'payment_fee',
            'transfer_in',
            'transfer_out',
        ],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionHistoryQueryDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Filter by transaction status',
        example: 'completed',
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        required: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], TransactionHistoryQueryDto.prototype, "status", void 0);
class TransactionItemDto {
    id;
    type;
    amount;
    amountFormatted;
    status;
    description;
    referenceId;
    otherUser;
    createdAt;
}
exports.TransactionItemDto = TransactionItemDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction ID',
        example: 'txn_abc123def456',
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction type',
        example: 'wallet_credit',
        enum: [
            'wallet_credit',
            'wallet_debit',
            'escrow_hold',
            'escrow_release',
            'payment_fee',
            'transfer_in',
            'transfer_out',
        ],
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount in kobo',
        example: 50000,
    }),
    __metadata("design:type", Number)
], TransactionItemDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction amount in Naira (formatted)',
        example: '₦500.00',
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "amountFormatted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction status',
        example: 'completed',
        enum: ['pending', 'completed', 'failed', 'cancelled'],
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction description',
        example: 'Wallet topup via Paystack',
        required: false,
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reference or ID of related entity (offer, escrow, etc.)',
        example: 'off_def456ghi789',
        required: false,
    }),
    __metadata("design:type", String)
], TransactionItemDto.prototype, "referenceId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Other user involved in the transaction',
        example: {
            id: 'usr_def456ghi789',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
        },
        required: false,
    }),
    __metadata("design:type", Object)
], TransactionItemDto.prototype, "otherUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Transaction creation timestamp',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], TransactionItemDto.prototype, "createdAt", void 0);
class TransactionHistoryResponseDto {
    transactions;
    pagination;
    summary;
}
exports.TransactionHistoryResponseDto = TransactionHistoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'List of transactions',
        type: [TransactionItemDto],
    }),
    __metadata("design:type", Array)
], TransactionHistoryResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
        example: {
            page: 1,
            limit: 20,
            total: 145,
            totalPages: 8,
        },
    }),
    __metadata("design:type", Object)
], TransactionHistoryResponseDto.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Summary statistics for the current filter',
        example: {
            totalCredits: 500000,
            totalDebits: 350000,
            netAmount: 150000,
        },
    }),
    __metadata("design:type", Object)
], TransactionHistoryResponseDto.prototype, "summary", void 0);
//# sourceMappingURL=transaction-history.dto.js.map