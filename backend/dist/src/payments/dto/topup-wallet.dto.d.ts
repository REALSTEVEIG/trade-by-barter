export declare enum PaymentMethod {
    BANK_TRANSFER = "BANK_TRANSFER",
    CARD = "CARD",
    MOBILE_MONEY = "MOBILE_MONEY",
    USSD = "USSD",
    WALLET = "WALLET"
}
export declare class TopupWalletDto {
    amountInKobo: number;
    paymentMethod: PaymentMethod;
    metadata?: Record<string, any>;
}
export declare class TopupResponseDto {
    reference: string;
    authorizationUrl: string;
    accessCode: string;
    amountInKobo: number;
    currency: string;
    paymentMethod: PaymentMethod;
}
