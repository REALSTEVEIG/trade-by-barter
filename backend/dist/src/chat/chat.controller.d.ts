import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto, SendTextMessageDto, SendLocationMessageDto, BulkMarkReadDto } from './dto/send-message.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
import { ChatResponse } from './dto/chat-response.dto';
import { MessageResponse } from './dto/message-response.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getUserChats(userId: string, pagination: PaginationDto): Promise<PaginatedResult<ChatResponse>>;
    getUserChatStats(userId: string): Promise<any>;
    getChatById(chatId: string, userId: string): Promise<ChatResponse>;
    createChat(createChatDto: CreateChatDto, senderId: string): Promise<ChatResponse>;
    getChatMessages(chatId: string, userId: string, pagination: PaginationDto): Promise<PaginatedResult<MessageResponse>>;
    sendMessage(chatId: string, sendMessageDto: SendMessageDto, senderId: string): Promise<MessageResponse>;
    sendTextMessage(chatId: string, sendTextMessageDto: SendTextMessageDto, senderId: string): Promise<MessageResponse>;
    sendLocationMessage(chatId: string, sendLocationDto: SendLocationMessageDto, senderId: string): Promise<MessageResponse>;
    uploadChatMedia(chatId: string, file: Express.Multer.File, senderId: string): Promise<MessageResponse>;
    markMessagesAsRead(chatId: string, userId: string, markReadDto?: BulkMarkReadDto): Promise<{
        success: boolean;
        message: string;
    }>;
    markSingleMessageAsRead(chatId: string, messageId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteChat(chatId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    startTyping(chatId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    stopTyping(chatId: string, userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
