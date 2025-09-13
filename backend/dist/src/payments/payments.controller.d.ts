import { PaymentsService } from './payments.service';
import { TopupWalletDto, TopupResponseDto } from './dto/topup-wallet.dto';
import { WithdrawFundsDto, WithdrawResponseDto } from './dto/withdraw-funds.dto';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentMethodResponseDto, PaymentStatusResponseDto, NigerianBankDto } from './dto/payment-response.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    private readonly logger;
    constructor(paymentsService: PaymentsService);
    topupWallet(userId: string, topupData: TopupWalletDto): Promise<TopupResponseDto>;
    handleWebhook(webhookData: PaymentWebhookDto, signature?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    withdrawFunds(userId: string, withdrawData: WithdrawFundsDto): Promise<WithdrawResponseDto>;
    getPaymentMethods(): Promise<PaymentMethodResponseDto[]>;
    getPaymentStatus(reference: string): Promise<PaymentStatusResponseDto>;
    getNigerianBanks(): Promise<NigerianBankDto[]>;
    verifyPayment(reference: string): Promise<{
        success: boolean;
        message: string;
        data?: any;
    }>;
}
