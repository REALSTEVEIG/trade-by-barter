export declare class DisputeEscrowDto {
    reason: string;
    details?: string;
}
export declare class DisputeEscrowResponseDto {
    success: boolean;
    message: string;
    escrowId: string;
    disputeReference: string;
    disputeOpenedAt: string;
    estimatedResolutionTime: string;
}
