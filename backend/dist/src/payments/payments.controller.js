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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const topup_wallet_dto_1 = require("./dto/topup-wallet.dto");
const withdraw_funds_dto_1 = require("./dto/withdraw-funds.dto");
const payment_webhook_dto_1 = require("./dto/payment-webhook.dto");
const payment_response_dto_1 = require("./dto/payment-response.dto");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    paymentsService;
    logger = new common_1.Logger(PaymentsController_1.name);
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async topupWallet(userId, topupData) {
        this.logger.log(`Wallet topup request from user: ${userId}`);
        return this.paymentsService.topupWallet(userId, topupData);
    }
    async handleWebhook(webhookData, signature) {
        this.logger.log(`Webhook received: ${webhookData.event}`);
        const webhookWithSignature = {
            ...webhookData,
            signature,
        };
        return this.paymentsService.handleWebhook(webhookWithSignature);
    }
    async withdrawFunds(userId, withdrawData) {
        this.logger.log(`Withdrawal request from user: ${userId}`);
        return this.paymentsService.withdrawFunds(userId, withdrawData);
    }
    async getPaymentMethods() {
        this.logger.log('Payment methods requested');
        return this.paymentsService.getPaymentMethods();
    }
    async getPaymentStatus(reference) {
        this.logger.log(`Payment status check for reference: ${reference}`);
        return this.paymentsService.getPaymentStatus(reference);
    }
    async getNigerianBanks() {
        this.logger.log('Nigerian banks list requested');
        return this.paymentsService.getNigerianBanks();
    }
    async verifyPayment(reference) {
        this.logger.log(`Manual payment verification for reference: ${reference}`);
        try {
            const paymentStatus = await this.paymentsService.getPaymentStatus(reference);
            return {
                success: true,
                message: 'Payment verification completed',
                data: paymentStatus,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Payment verification failed',
            };
        }
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('topup'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Top up wallet',
        description: 'Initialize wallet top-up payment with Nigerian payment providers (mock implementation)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Payment initialization successful',
        type: topup_wallet_dto_1.TopupResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request data',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, topup_wallet_dto_1.TopupWalletDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "topupWallet", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Payment webhook handler',
        description: 'Handle payment provider webhooks for payment confirmations (mock implementation)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Webhook processed successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid webhook data',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_webhook_dto_1.PaymentWebhookDto, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Withdraw funds',
        description: 'Withdraw funds from wallet to Nigerian bank account (mock implementation)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Withdrawal initiated successfully',
        type: withdraw_funds_dto_1.WithdrawResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request data or insufficient balance',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, withdraw_funds_dto_1.WithdrawFundsDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "withdrawFunds", null);
__decorate([
    (0, common_1.Get)('methods'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment methods',
        description: 'Get available Nigerian payment methods and their details',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment methods retrieved successfully',
        type: [payment_response_dto_1.PaymentMethodResponseDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentMethods", null);
__decorate([
    (0, common_1.Get)('status/:reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get payment status',
        description: 'Check the status of a payment transaction',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment status retrieved successfully',
        type: payment_response_dto_1.PaymentStatusResponseDto,
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Payment not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Get)('banks'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get Nigerian banks',
        description: 'Get list of supported Nigerian banks for transfers',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Nigerian banks retrieved successfully',
        type: [payment_response_dto_1.NigerianBankDto],
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getNigerianBanks", null);
__decorate([
    (0, common_1.Post)('verify/:reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Verify payment',
        description: 'Manually verify payment status with provider (for testing)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Payment verification completed',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Payment not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized',
    }),
    __param(0, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyPayment", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, swagger_1.ApiTags)('Payments'),
    (0, common_1.Controller)('api/v1/payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map