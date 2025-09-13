import { MessageStatus } from './message-response.dto';
export declare class UpdateMessageStatusDto {
    messageId: string;
    status: MessageStatus;
    timestamp?: string;
}
export declare class MessageDeliveredDto {
    messageId: string;
    userId: string;
    deliveredAt: string;
}
export declare class MessageReadDto {
    messageId: string;
    userId: string;
    readAt: string;
}
export declare class BulkMessageStatusDto {
    messageIds: string[];
    status: MessageStatus;
}
