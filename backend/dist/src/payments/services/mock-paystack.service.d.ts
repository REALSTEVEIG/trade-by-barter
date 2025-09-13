import { ConfigService } from '@nestjs/config';
export interface MockPaymentResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}
export interface MockWebhookPayload {
    event: string;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string;
        gateway_response: string;
        paid_at: string | null;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: Record<string, any>;
        fees: number;
        authorization: {
            authorization_code: string;
            bin: string;
            last4: string;
            exp_month: string;
            exp_year: string;
            channel: string;
            card_type: string;
            bank: string;
            country_code: string;
            brand: string;
            reusable: boolean;
            signature: string;
        };
        customer: {
            id: number;
            first_name: string;
            last_name: string;
            email: string;
            phone: string;
            metadata: Record<string, any>;
        };
    };
}
export declare class MockPaystackService {
    private configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly secretKey;
    constructor(configService: ConfigService);
    initializePayment(email: string, amountInKobo: number, reference: string, metadata?: Record<string, any>): Promise<MockPaymentResponse>;
    verifyPayment(reference: string): Promise<MockWebhookPayload['data']>;
    createTransferRecipient(accountNumber: string, bankCode: string, name: string): Promise<any>;
    initiateTransfer(recipientCode: string, amountInKobo: number, reason: string): Promise<any>;
    verifyWebhookSignature(payload: string, signature: string): boolean;
    private delay;
    private getBankName;
    getAllNigerianBanks(): Array<{
        code: string;
        name: string;
        ussd?: string;
    }>;
    getPaymentMethods(): Array<{
        type: string;
        name: string;
        description: string;
        processingTime: string;
        fee: string;
    }>;
    generateNigerianPaymentScenario(paymentMethod: string, amount: number): {
        channel: string;
        gateway_response: string;
        authorization?: any;
        fees: number;
    };
    private getRandomNigerianBin;
    private getRandomNigerianBank;
    initializeMobileMoneyPayment(phoneNumber: string, amountInKobo: number, provider?: string): Promise<any>;
    initiateUSSDPayment(bankCode: string, amountInKobo: number, phoneNumber: string): Promise<any>;
}
