import { PaymentMethod } from './topup-wallet.dto';
export declare class WithdrawFundsDto {
    amountInKobo: number;
    withdrawalMethod: PaymentMethod;
    accountNumber: string;
    bankCode: string;
    accountName: string;
    reason?: string;
}
export declare class WithdrawResponseDto {
    reference: string;
    status: string;
    amountInKobo: number;
    feeInKobo: number;
    netAmountInKobo: number;
    estimatedProcessingTime: string;
}
