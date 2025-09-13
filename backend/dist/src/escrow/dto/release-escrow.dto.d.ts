export declare class ReleaseEscrowDto {
    reason?: string;
    confirmCompletion: boolean;
}
export declare class ReleaseEscrowResponseDto {
    success: boolean;
    message: string;
    escrowId: string;
    amountReleased: number;
    recipientId: string;
    releasedAt: string;
}
