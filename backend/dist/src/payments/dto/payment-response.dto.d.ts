import { PaymentMethod } from './topup-wallet.dto';
export declare class PaymentMethodResponseDto {
    method: PaymentMethod;
    displayName: string;
    isAvailable: boolean;
    feePercentage: number;
    description?: string;
    minimumAmount?: number;
    maximumAmount?: number;
}
export declare class PaymentStatusResponseDto {
    reference: string;
    status: string;
    amountInKobo: number;
    paymentMethod: PaymentMethod;
    paidAt: string;
    feeInKobo?: number;
    gatewayResponse?: string;
    authorizationCode?: string;
}
export declare class NigerianBankDto {
    name: string;
    code: string;
    slug: string;
    supportsUssd: boolean;
    supportsTransfer: boolean;
}
