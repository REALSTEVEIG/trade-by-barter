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
exports.WithdrawResponseDto = exports.WithdrawFundsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const topup_wallet_dto_1 = require("./topup-wallet.dto");
class WithdrawFundsDto {
    amountInKobo;
    withdrawalMethod;
    accountNumber;
    bankCode;
    accountName;
    reason;
}
exports.WithdrawFundsDto = WithdrawFundsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to withdraw in kobo (minimum 100,000 kobo = ₦1,000)',
        example: 500000,
        minimum: 100000,
        maximum: 50000000,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(100000, { message: 'Minimum withdrawal amount is ₦1,000 (100,000 kobo)' }),
    (0, class_validator_1.Max)(50000000, { message: 'Maximum withdrawal amount is ₦500,000 (50,000,000 kobo)' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], WithdrawFundsDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Withdrawal method',
        enum: topup_wallet_dto_1.PaymentMethod,
        example: topup_wallet_dto_1.PaymentMethod.BANK_TRANSFER,
    }),
    (0, class_validator_1.IsEnum)(topup_wallet_dto_1.PaymentMethod),
    __metadata("design:type", String)
], WithdrawFundsDto.prototype, "withdrawalMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank account number for withdrawal',
        example: '0123456789',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawFundsDto.prototype, "accountNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank code for withdrawal',
        example: '044',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawFundsDto.prototype, "bankCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Account holder name',
        example: 'John Doe',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawFundsDto.prototype, "accountName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional reason for withdrawal',
        example: 'Monthly expenses',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WithdrawFundsDto.prototype, "reason", void 0);
class WithdrawResponseDto {
    reference;
    status;
    amountInKobo;
    feeInKobo;
    netAmountInKobo;
    estimatedProcessingTime;
}
exports.WithdrawResponseDto = WithdrawResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Withdrawal reference for tracking',
        example: 'WTH_1234567890',
    }),
    __metadata("design:type", String)
], WithdrawResponseDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Withdrawal status',
        example: 'processing',
    }),
    __metadata("design:type", String)
], WithdrawResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount being withdrawn in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], WithdrawResponseDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Processing fee in kobo',
        example: 5000,
    }),
    __metadata("design:type", Number)
], WithdrawResponseDto.prototype, "feeInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Net amount to be received in kobo',
        example: 495000,
    }),
    __metadata("design:type", Number)
], WithdrawResponseDto.prototype, "netAmountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated processing time',
        example: '1-3 business days',
    }),
    __metadata("design:type", String)
], WithdrawResponseDto.prototype, "estimatedProcessingTime", void 0);
//# sourceMappingURL=withdraw-funds.dto.js.map