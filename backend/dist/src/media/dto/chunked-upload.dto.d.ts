import { UploadDto } from './upload.dto';
export declare enum ChunkedUploadStatus {
    INITIATED = "INITIATED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    CANCELLED = "CANCELLED",
    EXPIRED = "EXPIRED"
}
export declare class InitiateChunkedUploadDto extends UploadDto {
    totalSize: number;
    filename: string;
    mimeType: string;
    chunkSize?: number;
    timeoutSeconds?: number;
    checksum?: string;
    resumeSessionId?: string;
}
export declare class UploadChunkDto {
    sessionId: string;
    chunkNumber: number;
    chunkSize: number;
    chunkChecksum?: string;
    isFinalChunk?: boolean;
}
export declare class CompleteChunkedUploadDto {
    sessionId: string;
    finalChecksum?: string;
    startProcessing?: boolean;
}
export declare class ChunkedUploadSessionDto {
    id: string;
    filename: string;
    mimeType: string;
    totalSize: number;
    chunkSize: number;
    totalChunks: number;
    uploadedChunks: number;
    progress: number;
    status: ChunkedUploadStatus;
    uploadedChunkNumbers: number[];
    missingChunkNumbers: number[];
    error?: string;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    userId: string;
    mediaId?: string;
}
export declare class ChunkedUploadResponseDto {
    message: string;
    session: ChunkedUploadSessionDto;
    nextChunkNumber?: number;
    uploadUrl?: string;
    retryDelay?: number;
}
export declare class ResumeChunkedUploadDto {
    sessionId: string;
    verifyIntegrity?: boolean;
}
export declare class CancelChunkedUploadDto {
    sessionId: string;
    cleanup?: boolean;
}
