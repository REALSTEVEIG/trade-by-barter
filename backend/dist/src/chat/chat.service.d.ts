import { PrismaService } from '../prisma/prisma.service';
import { MessageResponse } from './dto/message-response.dto';
import { ChatResponse } from './dto/chat-response.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
export declare class ChatService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private getNigerianTime;
    private transformUserToSummary;
    getOrCreateDirectChat(senderId: string, recipientId: string, listingId?: string, offerId?: string): Promise<ChatResponse>;
    createChat(createChatDto: CreateChatDto, senderId: string): Promise<ChatResponse>;
    getUserChats(userId: string, pagination: PaginationDto): Promise<PaginatedResult<ChatResponse>>;
    getChatById(chatId: string, userId: string): Promise<ChatResponse>;
    sendMessage(sendMessageDto: SendMessageDto, senderId: string): Promise<MessageResponse>;
    getChatMessages(chatId: string, userId: string, pagination: PaginationDto): Promise<PaginatedResult<MessageResponse>>;
    markMessagesAsRead(chatId: string, userId: string, messageIds?: string[]): Promise<void>;
    deleteChat(chatId: string, userId: string): Promise<void>;
    private filterNigerianContent;
    private attachMediaToMessage;
    private getMimeTypeFromMessageType;
    private transformChatToResponse;
    private transformMessageToResponse;
    updateUserLastActive(userId: string): Promise<void>;
    getUserChatStats(userId: string): Promise<any>;
}
