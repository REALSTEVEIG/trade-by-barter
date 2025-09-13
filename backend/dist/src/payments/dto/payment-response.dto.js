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
exports.NigerianBankDto = exports.PaymentStatusResponseDto = exports.PaymentMethodResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const topup_wallet_dto_1 = require("./topup-wallet.dto");
class PaymentMethodResponseDto {
    method;
    displayName;
    isAvailable;
    feePercentage;
    description;
    minimumAmount;
    maximumAmount;
}
exports.PaymentMethodResponseDto = PaymentMethodResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method identifier',
        enum: topup_wallet_dto_1.PaymentMethod,
        example: topup_wallet_dto_1.PaymentMethod.CARD,
    }),
    __metadata("design:type", String)
], PaymentMethodResponseDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method display name',
        example: 'Card Payment',
    }),
    __metadata("design:type", String)
], PaymentMethodResponseDto.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether method is currently available',
        example: true,
    }),
    __metadata("design:type", Boolean)
], PaymentMethodResponseDto.prototype, "isAvailable", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Processing fee percentage',
        example: 1.5,
    }),
    __metadata("design:type", Number)
], PaymentMethodResponseDto.prototype, "feePercentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional method-specific information',
        example: 'Supports Visa and Mastercard',
    }),
    __metadata("design:type", String)
], PaymentMethodResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum transaction amount in kobo',
        example: 10000,
    }),
    __metadata("design:type", Number)
], PaymentMethodResponseDto.prototype, "minimumAmount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum transaction amount in kobo',
        example: 50000000,
    }),
    __metadata("design:type", Number)
], PaymentMethodResponseDto.prototype, "maximumAmount", void 0);
class PaymentStatusResponseDto {
    reference;
    status;
    amountInKobo;
    paymentMethod;
    paidAt;
    feeInKobo;
    gatewayResponse;
    authorizationCode;
}
exports.PaymentStatusResponseDto = PaymentStatusResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment reference',
        example: 'PAY_1234567890',
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment status',
        example: 'success',
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Amount paid in kobo',
        example: 500000,
    }),
    __metadata("design:type", Number)
], PaymentStatusResponseDto.prototype, "amountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment method used',
        enum: topup_wallet_dto_1.PaymentMethod,
        example: topup_wallet_dto_1.PaymentMethod.CARD,
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "paymentMethod", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment completion timestamp',
        example: '2023-12-01T10:00:00Z',
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "paidAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Transaction fees in kobo',
        example: 7500,
    }),
    __metadata("design:type", Number)
], PaymentStatusResponseDto.prototype, "feeInKobo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Payment gateway response',
        example: 'Approved by Financial Institution',
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "gatewayResponse", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Authorization code for card payments',
        example: 'AUTH_abcdef123',
    }),
    __metadata("design:type", String)
], PaymentStatusResponseDto.prototype, "authorizationCode", void 0);
class NigerianBankDto {
    name;
    code;
    slug;
    supportsUssd;
    supportsTransfer;
}
exports.NigerianBankDto = NigerianBankDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank name',
        example: 'Guaranty Trust Bank',
    }),
    __metadata("design:type", String)
], NigerianBankDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank code',
        example: '058',
    }),
    __metadata("design:type", String)
], NigerianBankDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Bank slug identifier',
        example: 'gtbank',
    }),
    __metadata("design:type", String)
], NigerianBankDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether bank supports USSD',
        example: true,
    }),
    __metadata("design:type", Boolean)
], NigerianBankDto.prototype, "supportsUssd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether bank supports transfers',
        example: true,
    }),
    __metadata("design:type", Boolean)
], NigerianBankDto.prototype, "supportsTransfer", void 0);
//# sourceMappingURL=payment-response.dto.js.map