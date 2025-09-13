import { MessageType } from './message-response.dto';
export declare class SendMessageDto {
    chatId: string;
    type: MessageType;
    content: string;
    mediaUrl?: string;
    metadata?: object;
}
export declare class SendTextMessageDto {
    chatId: string;
    content: string;
}
export declare class SendLocationMessageDto {
    chatId: string;
    latitude: number;
    longitude: number;
    address?: string;
}
export declare class MarkMessageReadDto {
    messageId: string;
}
export declare class BulkMarkReadDto {
    messageIds: string[];
}
