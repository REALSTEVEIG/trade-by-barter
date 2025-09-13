export declare class TransactionHistoryQueryDto {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
}
export declare class TransactionItemDto {
    id: string;
    type: string;
    amount: number;
    amountFormatted: string;
    status: string;
    description?: string;
    referenceId?: string;
    otherUser?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    createdAt: Date;
}
export declare class TransactionHistoryResponseDto {
    transactions: TransactionItemDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    summary: {
        totalCredits: number;
        totalDebits: number;
        netAmount: number;
    };
}
