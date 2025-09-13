export declare class TransferFundsDto {
    recipientId: string;
    amount: number;
    description?: string;
}
export declare class TransferResponseDto {
    id: string;
    status: string;
    amount: number;
    amountFormatted: string;
    sender: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    recipient: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    description?: string;
    createdAt: Date;
}
