import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { MockPaystackService } from './services/mock-paystack.service';
import { TopupWalletDto, TopupResponseDto } from './dto/topup-wallet.dto';
import { WithdrawFundsDto, WithdrawResponseDto } from './dto/withdraw-funds.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentMethodResponseDto, PaymentStatusResponseDto, NigerianBankDto } from './dto/payment-response.dto';
export declare class PaymentsService {
    private prisma;
    private mockPaystack;
    private configService;
    private readonly logger;
    constructor(prisma: PrismaService, mockPaystack: MockPaystackService, configService: ConfigService);
    topupWallet(userId: string, topupData: TopupWalletDto): Promise<TopupResponseDto>;
    handleWebhook(webhookData: PaymentWebhookDto): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
    private processSuccessfulPayment;
    private processSuccessfulTransfer;
    private shouldProcessWebhookEvent;
    private processFailedPayment;
    withdrawFunds(userId: string, withdrawData: WithdrawFundsDto): Promise<WithdrawResponseDto>;
    getPaymentMethods(): Promise<PaymentMethodResponseDto[]>;
    getPaymentStatus(reference: string): Promise<PaymentStatusResponseDto>;
    getNigerianBanks(): Promise<NigerianBankDto[]>;
    private getChannelFromMethod;
}
