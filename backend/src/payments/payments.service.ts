import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MockPaystackService } from './services/mock-paystack.service';
import { v4 as uuidv4 } from 'uuid';
import { TopupWalletDto, TopupResponseDto, PaymentMethod } from './dto/topup-wallet.dto';
import { WithdrawFundsDto, WithdrawResponseDto } from './dto/withdraw-funds.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  PaymentMethodResponseDto,
  PaymentStatusResponseDto,
  NigerianBankDto
} from './dto/payment-response.dto';
import {
  PaymentException,
  InsufficientFundsException,
  PaymentProviderException,
  InvalidSignatureException,
  WalletNotFoundedException,
} from '../common/exceptions/payment.exception';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private prisma: PrismaService,
    private mockPaystack: MockPaystackService,
    private configService: ConfigService,
  ) {}

  async topupWallet(userId: string, topupData: TopupWalletDto): Promise<TopupResponseDto> {
    this.logger.log(`Initiating wallet topup for user ${userId}`);

    // Get user details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });

    if (!user) {
      throw new PaymentException('User not found', 404);
    }

    // Create or get wallet
    if (!user.wallet) {
      await this.prisma.wallet.create({
        data: { userId },
      });
    }

    // Generate payment reference
    const reference = `TBB_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Calculate fees (1.5% for card payments, 1% for bank transfer)
    const feePercentage = topupData.paymentMethod === 'CARD' ? 0.015 : 0.01;
    const feeInKobo = Math.floor(topupData.amountInKobo * feePercentage);

    try {
      // Create payment record
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

      // Initialize payment with mock provider
      const paymentResponse = await this.mockPaystack.initializePayment(
        user.email,
        topupData.amountInKobo,
        reference,
        { userId, paymentId: payment.id, ...topupData.metadata },
      );

      this.logger.log(`Payment initialized successfully: ${reference}`);

      return {
        reference,
        authorizationUrl: paymentResponse.data.authorization_url,
        accessCode: paymentResponse.data.access_code,
        amountInKobo: topupData.amountInKobo,
        currency: 'NGN',
        paymentMethod: topupData.paymentMethod,
      };
    } catch (error) {
      this.logger.error(`Failed to initialize payment: ${error.message}`, error.stack);
      throw new PaymentProviderException('Failed to initialize payment', error);
    }
  }

  async handleWebhook(webhookData: PaymentWebhookDto): Promise<{ success: boolean; message: string; data?: any }> {
    this.logger.log(`Processing webhook: ${webhookData.event} for reference: ${webhookData.data.reference}`);

    try {
      // Verify webhook signature
      const signatureValid = this.mockPaystack.verifyWebhookSignature(
        JSON.stringify(webhookData),
        webhookData.signature || ''
      );

      if (!signatureValid) {
        this.logger.warn('Invalid webhook signature');
        throw new InvalidSignatureException();
      }

      // Check if we should process this event type
      if (!this.shouldProcessWebhookEvent(webhookData.event)) {
        this.logger.log(`Skipping unsupported event: ${webhookData.event}`);
        return { success: true, message: 'Event type not supported' };
      }

      const { reference, status } = webhookData.data;

      return await this.prisma.$transaction(async (tx) => {
        // Find payment record
        const payment = await tx.payment.findUnique({
          where: { reference },
          include: { user: { include: { wallet: true } } },
        });

        if (!payment) {
          this.logger.warn(`Payment not found for reference: ${reference}`);
          return { success: false, message: 'Payment not found' };
        }

        // Prevent duplicate processing
        if (payment.webhookVerified && payment.status !== 'PENDING') {
          this.logger.log(`Webhook already processed for reference: ${reference}`);
          return { success: true, message: 'Webhook already processed' };
        }

        // Update payment status
        const updatedPayment = await tx.payment.update({
          where: { id: payment.id },
          data: {
            status: status === 'success' ? 'SUCCESS' : 'FAILED',
            paidAt: status === 'success' ? new Date() : null,
            webhookVerified: true,
            authorizationCode: webhookData.data.authorization?.authorization_code,
            metadata: {
              ...(payment.metadata as Record<string, any>),
              webhookData: webhookData.data,
              processedAt: new Date().toISOString(),
            },
          },
        });

        let transactionResult: any = null;

        if (status === 'success') {
          // Handle successful payments
          if (webhookData.event === 'charge.success') {
            transactionResult = await this.processSuccessfulPayment(tx, payment, webhookData.data);
          } else if (webhookData.event === 'transfer.success') {
            transactionResult = await this.processSuccessfulTransfer(tx, payment, webhookData.data);
          }
        } else {
          // Handle failed payments/transfers
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

    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      return {
        success: false,
        message: 'Internal processing error',
        data: { error: error.message }
      };
    }
  }

  private async processSuccessfulPayment(tx: any, payment: any, webhookData: any) {
    // Create transaction record for successful payment
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

    // Update wallet balance
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

  private async processSuccessfulTransfer(tx: any, payment: any, webhookData: any) {
    // For successful transfers (withdrawals), just update transaction status
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

  private shouldProcessWebhookEvent(eventType: string): boolean {
    const supportedEvents = [
      'charge.success',
      'charge.failed',
      'transfer.success',
      'transfer.failed',
      'transfer.reversed'
    ];
    
    return supportedEvents.includes(eventType);
  }

  private async processFailedPayment(tx: any, payment: any, webhookData: any) {
    // For failed payments, we may need to reverse any pending changes
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

  async withdrawFunds(userId: string, withdrawData: WithdrawFundsDto): Promise<WithdrawResponseDto> {
    this.logger.log(`Processing withdrawal for user ${userId}`);

    // Get user wallet
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new WalletNotFoundedException(userId);
    }

    // Calculate withdrawal fee (1% minimum ₦50)
    const feeInKobo = Math.max(Math.floor(withdrawData.amountInKobo * 0.01), 5000);
    const totalAmount = withdrawData.amountInKobo + feeInKobo;

    // Check sufficient balance
    if (wallet.balanceInKobo < totalAmount) {
      throw new InsufficientFundsException(wallet.balanceInKobo, totalAmount);
    }

    const reference = `WTH_${Date.now()}_${uuidv4().substring(0, 8)}`;

    try {
      // Create transfer recipient (mock)
      const recipient = await this.mockPaystack.createTransferRecipient(
        withdrawData.accountNumber,
        withdrawData.bankCode,
        withdrawData.accountName,
      );

      // Initiate transfer (mock)
      const transfer = await this.mockPaystack.initiateTransfer(
        recipient.data.recipient_code,
        withdrawData.amountInKobo,
        withdrawData.reason || 'Wallet withdrawal',
      );

      if (!transfer.status) {
        throw new Error('Transfer initiation failed');
      }

      // Create transaction record
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

      // Update wallet balance
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
    } catch (error) {
      this.logger.error(`Withdrawal failed: ${error.message}`, error.stack);
      
      // Re-throw known exceptions
      if (error instanceof PaymentException ||
          error instanceof InsufficientFundsException ||
          error instanceof WalletNotFoundedException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new PaymentException('Withdrawal processing failed', 500, { originalError: error.message });
    }
  }

  async getPaymentMethods(): Promise<PaymentMethodResponseDto[]> {
    return [
      {
        method: PaymentMethod.CARD,
        displayName: 'Card Payment',
        isAvailable: true,
        feePercentage: 1.5,
        description: 'Pay with Visa, Mastercard, or Verve',
        minimumAmount: 10000, // ₦100
        maximumAmount: 50000000, // ₦500,000
      },
      {
        method: PaymentMethod.BANK_TRANSFER,
        displayName: 'Bank Transfer',
        isAvailable: true,
        feePercentage: 1.0,
        description: 'Direct bank transfer',
        minimumAmount: 10000,
        maximumAmount: 50000000,
      },
      {
        method: PaymentMethod.USSD,
        displayName: 'USSD Payment',
        isAvailable: true,
        feePercentage: 1.0,
        description: 'Pay using USSD code',
        minimumAmount: 10000,
        maximumAmount: 2000000, // ₦20,000 USSD limit
      },
      {
        method: PaymentMethod.MOBILE_MONEY,
        displayName: 'Mobile Money',
        isAvailable: false,
        feePercentage: 1.5,
        description: 'Coming soon',
        minimumAmount: 10000,
        maximumAmount: 50000000,
      },
    ];
  }

  async getPaymentStatus(reference: string): Promise<PaymentStatusResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { reference },
    });

    if (!payment) {
      throw new PaymentException('Payment not found', 404);
    }

    return {
      reference: payment.reference,
      status: payment.status.toLowerCase(),
      amountInKobo: payment.amountInKobo,
      paymentMethod: payment.paymentMethod as any,
      paidAt: payment.paidAt?.toISOString() || '',
      feeInKobo: payment.feeInKobo || undefined,
      authorizationCode: payment.authorizationCode || undefined,
    };
  }

  async getNigerianBanks(): Promise<NigerianBankDto[]> {
    // Mock Nigerian banks data
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

  private getChannelFromMethod(method: string): string {
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
}