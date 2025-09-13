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
exports.TopupResponseDto = exports.TopupWalletDto = exports.PaymentMethod = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["BANK_TRANSFER"] = "BANK_TRANSFER";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["MOBILE_MONEY"] = "MOBILE_MONEY";
    PaymentMethod["USSD"] = "USSD";
    PaymentMethod["WALLET"] = "WALLET";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
class TopupWalletDto {
    amountInKobo;
    paymentMethod;
    metadata;
}
exports.TopupWalletDto = TopupWalletDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to top up in kobo (minimum 10,000 kobo = ₦100)',
        example: 500000,
        minimum: 10000,
        maximum: 50000000,
    }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10000, { message: 'Minimum topup amount is ₦100 (10,000 kobo)' }),
    (0, class_validator_1.Max)(50000000, { message: 'Maximum topup amount is ₦500,000 (50,000,000 kobo)' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], TopupWalletDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method for wallet topup',
        enum: PaymentMethod,
        example: PaymentMethod.CARD,
    }),
    (0, class_validator_1.IsEnum)(PaymentMethod),
    __metadata("design:type", String)
], TopupWalletDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional metadata for the payment',
        example: { source: 'wallet_topup', user_note: 'Monthly topup' },
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], TopupWalletDto.prototype, "metadata", void 0);
class TopupResponseDto {
    reference;
    authorizationUrl;
    accessCode;
    amountInKobo;
    currency;
    paymentMethod;
}
exports.TopupResponseDto = TopupResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment reference for tracking',
        example: 'PAY_1234567890',
    }),
    __metadata("design:type", String)
], TopupResponseDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment authorization URL for redirecting user',
        example: 'https://checkout.paystack.com/abcdef123456',
    }),
    __metadata("design:type", String)
], TopupResponseDto.prototype, "authorizationUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment access code',
        example: 'abcdef123456',
    }),
    __metadata("design:type", String)
], TopupResponseDto.prototype, "accessCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount to be paid in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], TopupResponseDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Currency code',
        example: 'NGN',
    }),
    __metadata("design:type", String)
], TopupResponseDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method used',
        enum: PaymentMethod,
        example: PaymentMethod.CARD,
    }),
    __metadata("design:type", String)
], TopupResponseDto.prototype, "paymentMethod", void 0);
//# sourceMappingURL=topup-wallet.dto.js.map