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
exports.WalletInfoResponseDto = exports.WalletStatsDto = exports.WalletResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class WalletResponseDto {
    id;
    userId;
    balance;
    balanceFormatted;
    createdAt;
    updatedAt;
}
exports.WalletResponseDto = WalletResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet ID',
        example: 'wlt_abc123def456',
    }),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID who owns the wallet',
        example: 'usr_def456ghi789',
    }),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current wallet balance in kobo (Nigerian currency)',
        example: 150000,
    }),
    __metadata("design:type", Number)
], WalletResponseDto.prototype, "balance", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current wallet balance in Naira (formatted for display)',
        example: '₦1,500.00',
    }),
    __metadata("design:type", String)
], WalletResponseDto.prototype, "balanceFormatted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet creation date',
        example: '2024-01-15T10:30:00Z',
    }),
    __metadata("design:type", Date)
], WalletResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last wallet update date',
        example: '2024-01-15T14:45:00Z',
    }),
    __metadata("design:type", Date)
], WalletResponseDto.prototype, "updatedAt", void 0);
class WalletStatsDto {
    totalReceived;
    totalSent;
    transactionCount;
    escrowAmount;
}
exports.WalletStatsDto = WalletStatsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount received in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], WalletStatsDto.prototype, "totalReceived", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total amount sent in kobo',
        example: 350000,
    }),
    __metadata("design:type", Number)
], WalletStatsDto.prototype, "totalSent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of transactions',
        example: 25,
    }),
    __metadata("design:type", Number)
], WalletStatsDto.prototype, "transactionCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount in escrow in kobo',
        example: 75000,
    }),
    __metadata("design:type", Number)
], WalletStatsDto.prototype, "escrowAmount", void 0);
class WalletInfoResponseDto {
    wallet;
    stats;
}
exports.WalletInfoResponseDto = WalletInfoResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet information',
        type: WalletResponseDto,
    }),
    __metadata("design:type", WalletResponseDto)
], WalletInfoResponseDto.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Wallet statistics',
        type: WalletStatsDto,
    }),
    __metadata("design:type", WalletStatsDto)
], WalletInfoResponseDto.prototype, "stats", void 0);
//# sourceMappingURL=wallet-response.dto.js.map