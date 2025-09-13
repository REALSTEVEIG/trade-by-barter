export declare class WalletResponseDto {
    id: string;
    userId: string;
    balance: number;
    balanceFormatted: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class WalletStatsDto {
    totalReceived: number;
    totalSent: number;
    transactionCount: number;
    escrowAmount: number;
}
export declare class WalletInfoResponseDto {
    wallet: WalletResponseDto;
    stats: WalletStatsDto;
}
