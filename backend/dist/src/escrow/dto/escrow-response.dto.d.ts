export declare enum EscrowStatus {
    CREATED = "CREATED",
    FUNDED = "FUNDED",
    DISPUTED = "DISPUTED",
    RELEASED = "RELEASED",
    REFUNDED = "REFUNDED",
    EXPIRED = "EXPIRED"
}
export declare class EscrowResponseDto {
    id: string;
    reference: string;
    amountInKobo: number;
    feeInKobo: number;
    status: EscrowStatus;
    description?: string;
    releaseCondition?: string;
    buyerId: string;
    sellerId: string;
    offerId: string;
    expiresAt?: string;
    releasedAt?: string;
    disputeOpenedAt?: string;
    createdAt: string;
    updatedAt: string;
}
export declare class EscrowListResponseDto {
    escrows: EscrowResponseDto[];
    total: number;
    active: number;
    completed: number;
}
