import { UserSummary } from './chat-response.dto';
export declare class MediaAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    thumbnailUrl?: string;
    uploadedAt: Date;
}
export declare class ReadReceipt {
    userId: string;
    readAt: Date;
    user: UserSummary;
}
export declare enum MessageStatus {
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ"
}
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    AUDIO = "AUDIO",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT",
    LOCATION = "LOCATION",
    SYSTEM = "SYSTEM"
}
export declare class MessageResponse {
    id: string;
    chatId: string;
    senderId: string;
    sender: UserSummary;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    media?: MediaAttachment[];
    metadata?: object;
    status: MessageStatus;
    sentAt: Date;
    readBy: ReadReceipt[];
    isRead: boolean;
    readAt?: Date;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare class MessageHistoryResponse {
    messages: MessageResponse[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
