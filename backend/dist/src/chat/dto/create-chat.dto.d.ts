import { ChatType } from './chat-response.dto';
export declare class CreateChatDto {
    type: ChatType;
    recipientId: string;
    initialMessage?: string;
    listingId?: string;
    offerId?: string;
}
export declare class CreateGroupChatDto {
    participantIds: string[];
    name: string;
    description?: string;
    listingId?: string;
}
export declare class JoinChatDto {
    chatId: string;
}
export declare class LeaveChatDto {
    chatId: string;
}
