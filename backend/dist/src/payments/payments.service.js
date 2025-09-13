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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const mock_paystack_service_1 = require("./services/mock-paystack.service");
const uuid_1 = require("uuid");
const topup_wallet_dto_1 = require("./dto/topup-wallet.dto");
const payment_exception_1 = require("../common/exceptions/payment.exception");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    prisma;
    mockPaystack;
    configService;
    logger = new common_1.Logger(PaymentsService_1.name);
    constructor(prisma, mockPaystack, configService) {
        this.prisma = prisma;
        this.mockPaystack = mockPaystack;
        this.configService = configService;
    }
    async topupWallet(userId, topupData) {
        this.logger.log(`Initiating wallet topup for user ${userId}`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { wallet: true },
        });
        if (!user) {
            throw new payment_exception_1.PaymentException('User not found', 404);
        }
        if (!user.wallet) {
            await this.prisma.wallet.create({
                data: { userId },
            });
        }
        const reference = `TBB_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
        const feePercentage = topupData.paymentMethod === 'CARD' ? 0.015 : 0.01;
        const feeInKobo = Math.floor(topupData.amountInKobo * feePercentage);
        try {
            const payment = await this.prisma.payment.create({
                data: {
                    reference,
                    amountInKobo: topupData.amountInKobo,
                    currency: 'NGN',
                    status: 'PENDING',
                    paymentMethod: topupData.paymentMethod,
                    paymentProvider: 'MOCK_PROVIDER',
                    channel: this.getChannelFromMethod(topupData.paymentMethod),
                    customerEmail: user.email,
                    customerPhone: user.phoneNumber,
                    feeInKobo,
                    metadata: topupData.metadata || {},
                    userId,
                },
            });
            const paymentResponse = await this.mockPaystack.initializePayment(user.email, topupData.amountInKobo, reference, { userId, paymentId: payment.id, ...topupData.metadata });
            this.logger.log(`Payment initialized successfully: ${reference}`);
            return {
                reference,
                authorizationUrl: paymentResponse.data.authorization_url,
                accessCode: paymentResponse.data.access_code,
                amountInKobo: topupData.amountInKobo,
                currency: 'NGN',
                paymentMethod: topupData.paymentMethod,
            };
        }
        catch (error) {
            this.logger.error(`Failed to initialize payment: ${error.message}`, error.stack);
            throw new payment_exception_1.PaymentProviderException('Failed to initialize payment', error);
        }
    }
    async handleWebhook(webhookData) {
        this.logger.log(`Processing webhook: ${webhookData.event} for reference: ${webhookData.data.reference}`);
        try {
            const signatureValid = this.mockPaystack.verifyWebhookSignature(JSON.stringify(webhookData), webhookData.signature || '');
            if (!signatureValid) {
                this.logger.warn('Invalid webhook signature');
                throw new payment_exception_1.InvalidSignatureException();
            }
            if (!this.shouldProcessWebhookEvent(webhookData.event)) {
                this.logger.log(`Skipping unsupported event: ${webhookData.event}`);
                return { success: true, message: 'Event type not supported' };
            }
            const { reference, status } = webhookData.data;
            return await this.prisma.$transaction(async (tx) => {
                const payment = await tx.payment.findUnique({
                    where: { reference },
                    include: { user: { include: { wallet: true } } },
                });
                if (!payment) {
                    this.logger.warn(`Payment not found for reference: ${reference}`);
                    return { success: false, message: 'Payment not found' };
                }
                if (payment.webhookVerified && payment.status !== 'PENDING') {
                    this.logger.log(`Webhook already processed for reference: ${reference}`);
                    return { success: true, message: 'Webhook already processed' };
                }
                const updatedPayment = await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: status === 'success' ? 'SUCCESS' : 'FAILED',
                        paidAt: status === 'success' ? new Date() : null,
                        webhookVerified: true,
                        authorizationCode: webhookData.data.authorization?.authorization_code,
                        metadata: {
                            ...payment.metadata,
                            webhookData: webhookData.data,
                            processedAt: new Date().toISOString(),
                        },
                    },
                });
                let transactionResult = null;
                if (status === 'success') {
                    if (webhookData.event === 'charge.success') {
                        transactionResult = await this.processSuccessfulPayment(tx, payment, webhookData.data);
                    }
                    else if (webhookData.event === 'transfer.success') {
                        transactionResult = await this.processSuccessfulTransfer(tx, payment, webhookData.data);
                    }
                }
                else {
                    transactionResult = await this.processFailedPayment(tx, payment, webhookData.data);
                }
                this.logger.log(`Webhook processed successfully for reference: ${reference}`);
                return {
                    success: true,
                    message: 'Webhook processed successfully',
                    data: {
                        reference,
                        status: updatedPayment.status,
                        amount: updatedPayment.amountInKobo,
                        transactionId: transactionResult?.id,
                    }
                };
            });
        }
        catch (error) {
            this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
            return {
                success: false,
                message: 'Internal processing error',
                data: { error: error.message }
            };
        }
    }
    async processSuccessfulPayment(tx, payment, webhookData) {
        const transaction = await tx.transaction.create({
            data: {
                type: 'WALLET_TOPUP',
                amountInKobo: webhookData.amount,
                status: 'COMPLETED',
                paymentMethod: payment.paymentMethod,
                paymentProvider: payment.paymentProvider,
                paymentReference: payment.reference,
                processingFee: webhookData.fees || 0,
                description: 'Wallet top-up via payment',
                senderId: payment.userId,
                receiverId: payment.userId,
                paymentId: payment.id,
                metadata: {
                    channel: webhookData.channel,
                    gateway_response: webhookData.gateway_response,
                    authorization: webhookData.authorization,
                },
            },
        });
        await tx.wallet.upsert({
            where: { userId: payment.userId },
            create: {
                userId: payment.userId,
                balanceInKobo: webhookData.amount,
                totalEarnedInKobo: webhookData.amount,
                lastTransactionAt: new Date(),
            },
            update: {
                balanceInKobo: {
                    increment: webhookData.amount,
                },
                totalEarnedInKobo: {
                    increment: webhookData.amount,
                },
                lastTransactionAt: new Date(),
            },
        });
        this.logger.log(`Wallet topped up: ${webhookData.amount} kobo for user ${payment.userId}`);
        return transaction;
    }
    async processSuccessfulTransfer(tx, payment, webhookData) {
        const transaction = await tx.transaction.updateMany({
            where: {
                paymentReference: payment.reference,
                type: 'WALLET_WITHDRAWAL',
            },
            data: {
                status: 'COMPLETED',
                metadata: {
                    transferCode: webhookData.transfer_code,
                    completedAt: new Date().toISOString(),
                },
            },
        });
        this.logger.log(`Transfer completed successfully: ${payment.reference}`);
        return { id: `transfer-${payment.reference}` };
    }
    shouldProcessWebhookEvent(eventType) {
        const supportedEvents = [
            'charge.success',
            'charge.failed',
            'transfer.success',
            'transfer.failed',
            'transfer.reversed'
        ];
        return supportedEvents.includes(eventType);
    }
    async processFailedPayment(tx, payment, webhookData) {
        if (payment.paymentMethod && webhookData.message) {
            const transaction = await tx.transaction.create({
                data: {
                    type: 'FAILED_PAYMENT',
                    amountInKobo: webhookData.amount || payment.amountInKobo,
                    status: 'FAILED',
                    paymentMethod: payment.paymentMethod,
                    paymentProvider: payment.paymentProvider,
                    paymentReference: payment.reference,
                    processingFee: 0,
                    description: `Failed payment: ${webhookData.message}`,
                    senderId: payment.userId,
                    receiverId: payment.userId,
                    paymentId: payment.id,
                    metadata: {
                        failureReason: webhookData.message,
                        gateway_response: webhookData.gateway_response,
                    },
                },
            });
            this.logger.log(`Failed payment recorded: ${payment.reference} - ${webhookData.message}`);
            return transaction;
        }
        return null;
    }
    async withdrawFunds(userId, withdrawData) {
        this.logger.log(`Processing withdrawal for user ${userId}`);
        const wallet = await this.prisma.wallet.findUnique({
            where: { userId },
        });
        if (!wallet) {
            throw new payment_exception_1.WalletNotFoundedException(userId);
        }
        const feeInKobo = Math.max(Math.floor(withdrawData.amountInKobo * 0.01), 5000);
        const totalAmount = withdrawData.amountInKobo + feeInKobo;
        if (wallet.balanceInKobo < totalAmount) {
            throw new payment_exception_1.InsufficientFundsException(wallet.balanceInKobo, totalAmount);
        }
        const reference = `WTH_${Date.now()}_${(0, uuid_1.v4)().substring(0, 8)}`;
        try {
            const recipient = await this.mockPaystack.createTransferRecipient(withdrawData.accountNumber, withdrawData.bankCode, withdrawData.accountName);
            const transfer = await this.mockPaystack.initiateTransfer(recipient.data.recipient_code, withdrawData.amountInKobo, withdrawData.reason || 'Wallet withdrawal');
            if (!transfer.status) {
                throw new Error('Transfer initiation failed');
            }
            await this.prisma.transaction.create({
                data: {
                    type: 'WALLET_WITHDRAWAL',
                    amountInKobo: withdrawData.amountInKobo,
                    status: 'PROCESSING',
                    paymentMethod: withdrawData.withdrawalMethod,
                    paymentProvider: 'MOCK_PROVIDER',
                    paymentReference: reference,
                    processingFee: feeInKobo,
                    description: `Withdrawal to ${withdrawData.accountNumber}`,
                    senderId: userId,
                    receiverId: userId,
                    metadata: {
                        accountNumber: withdrawData.accountNumber,
                        bankCode: withdrawData.bankCode,
                        accountName: withdrawData.accountName,
                        transferCode: transfer.data.transfer_code,
                    },
                },
            });
            await this.prisma.wallet.update({
                where: { userId },
                data: {
                    balanceInKobo: {
                        decrement: totalAmount,
                    },
                    totalSpentInKobo: {
                        increment: totalAmount,
                    },
                    lastTransactionAt: new Date(),
                },
            });
            return {
                reference,
                status: 'processing',
                amountInKobo: withdrawData.amountInKobo,
                feeInKobo,
                netAmountInKobo: withdrawData.amountInKobo,
                estimatedProcessingTime: '1-3 business days',
            };
        }
        catch (error) {
            this.logger.error(`Withdrawal failed: ${error.message}`, error.stack);
            if (error instanceof payment_exception_1.PaymentException ||
                error instanceof payment_exception_1.InsufficientFundsException ||
                error instanceof payment_exception_1.WalletNotFoundedException) {
                throw error;
            }
            throw new payment_exception_1.PaymentException('Withdrawal processing failed', 500, { originalError: error.message });
        }
    }
    async getPaymentMethods() {
        return [
            {
                method: topup_wallet_dto_1.PaymentMethod.CARD,
                displayName: 'Card Payment',
                isAvailable: true,
                feePercentage: 1.5,
                description: 'Pay with Visa, Mastercard, or Verve',
                minimumAmount: 10000,
                maximumAmount: 50000000,
            },
            {
                method: topup_wallet_dto_1.PaymentMethod.BANK_TRANSFER,
                displayName: 'Bank Transfer',
                isAvailable: true,
                feePercentage: 1.0,
                description: 'Direct bank transfer',
                minimumAmount: 10000,
                maximumAmount: 50000000,
            },
            {
                method: topup_wallet_dto_1.PaymentMethod.USSD,
                displayName: 'USSD Payment',
                isAvailable: true,
                feePercentage: 1.0,
                description: 'Pay using USSD code',
                minimumAmount: 10000,
                maximumAmount: 2000000,
            },
            {
                method: topup_wallet_dto_1.PaymentMethod.MOBILE_MONEY,
                displayName: 'Mobile Money',
                isAvailable: false,
                feePercentage: 1.5,
                description: 'Coming soon',
                minimumAmount: 10000,
                maximumAmount: 50000000,
            },
        ];
    }
    async getPaymentStatus(reference) {
        const payment = await this.prisma.payment.findUnique({
            where: { reference },
        });
        if (!payment) {
            throw new payment_exception_1.PaymentException('Payment not found', 404);
        }
        return {
            reference: payment.reference,
            status: payment.status.toLowerCase(),
            amountInKobo: payment.amountInKobo,
            paymentMethod: payment.paymentMethod,
            paidAt: payment.paidAt?.toISOString() || '',
            feeInKobo: payment.feeInKobo || undefined,
            authorizationCode: payment.authorizationCode || undefined,
        };
    }
    async getNigerianBanks() {
        return [
            { name: 'Access Bank', code: '044', slug: 'access-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'Guaranty Trust Bank', code: '058', slug: 'gtbank', supportsUssd: true, supportsTransfer: true },
            { name: 'Zenith Bank', code: '057', slug: 'zenith-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'First Bank of Nigeria', code: '011', slug: 'first-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'United Bank for Africa', code: '033', slug: 'uba', supportsUssd: true, supportsTransfer: true },
            { name: 'Fidelity Bank', code: '070', slug: 'fidelity-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'Union Bank of Nigeria', code: '032', slug: 'union-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'Sterling Bank', code: '232', slug: 'sterling-bank', supportsUssd: true, supportsTransfer: true },
            { name: 'Stanbic IBTC Bank', code: '221', slug: 'stanbic-ibtc', supportsUssd: true, supportsTransfer: true },
            { name: 'Ecobank Nigeria', code: '050', slug: 'ecobank', supportsUssd: true, supportsTransfer: true },
        ];
    }
    getChannelFromMethod(method) {
        switch (method) {
            case 'CARD':
                return 'card';
            case 'BANK_TRANSFER':
                return 'bank_transfer';
            case 'USSD':
                return 'ussd';
            case 'MOBILE_MONEY':
                return 'mobile_money';
            default:
                return 'card';
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mock_paystack_service_1.MockPaystackService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map