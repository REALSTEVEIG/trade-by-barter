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
exports.WebhookVerificationDto = exports.PaymentWebhookDto = exports.WebhookEventType = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var WebhookEventType;
(function (WebhookEventType) {
    WebhookEventType["CHARGE_SUCCESS"] = "charge.success";
    WebhookEventType["CHARGE_FAILED"] = "charge.failed";
    WebhookEventType["TRANSFER_SUCCESS"] = "transfer.success";
    WebhookEventType["TRANSFER_FAILED"] = "transfer.failed";
})(WebhookEventType || (exports.WebhookEventType = WebhookEventType = {}));
class PaymentWebhookDto {
    event;
    data;
    signature;
    timestamp;
}
exports.PaymentWebhookDto = PaymentWebhookDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Webhook event type',
        enum: WebhookEventType,
        example: WebhookEventType.CHARGE_SUCCESS,
    }),
    (0, class_validator_1.IsEnum)(WebhookEventType),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "event", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment data from provider',
    }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PaymentWebhookDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Webhook signature for verification',
        example: 'signature123',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Webhook timestamp',
        example: '2023-12-01T10:00:00Z',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PaymentWebhookDto.prototype, "timestamp", void 0);
class WebhookVerificationDto {
    isValid;
    reference;
    status;
    error;
}
exports.WebhookVerificationDto = WebhookVerificationDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether webhook signature is valid',
        example: true,
    }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], WebhookVerificationDto.prototype, "isValid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment reference from webhook',
        example: 'PAY_1234567890',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookVerificationDto.prototype, "reference", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Payment status from webhook',
        example: 'success',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookVerificationDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Error message if verification failed',
        example: 'Invalid signature',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WebhookVerificationDto.prototype, "error", void 0);
//# sourceMappingURL=payment-webhook.dto.js.map