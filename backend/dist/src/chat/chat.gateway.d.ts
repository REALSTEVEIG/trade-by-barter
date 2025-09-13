import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { TypingStartDto, TypingStopDto } from './dto/typing-event.dto';
interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
}
export declare class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    private readonly jwtService;
    private readonly prisma;
    server: Server;
    private readonly logger;
    private readonly connectedUsers;
    private readonly socketToUser;
    private readonly typingUsers;
    constructor(chatService: ChatService, jwtService: JwtService, prisma: PrismaService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinChat(client: AuthenticatedSocket, data: {
        chatId: string;
    }): Promise<void>;
    handleLeaveChat(client: AuthenticatedSocket, data: {
        chatId: string;
    }): Promise<void>;
    handleSendMessage(client: AuthenticatedSocket, data: SendMessageDto): Promise<void>;
    handleStartTyping(client: AuthenticatedSocket, data: TypingStartDto): Promise<void>;
    handleStopTyping(client: AuthenticatedSocket, data: TypingStopDto): Promise<void>;
    handleMarkRead(client: AuthenticatedSocket, data: {
        chatId: string;
        messageId?: string;
    }): Promise<void>;
    handleGetOnlineUsers(client: AuthenticatedSocket, data: {
        chatId?: string;
    }): Promise<void>;
    handlePing(client: AuthenticatedSocket): void;
    private extractTokenFromHandshake;
    private verifyToken;
    private broadcastUserPresence;
    private clearUserTyping;
    notifyNewChat(userId: string, chat: any): Promise<void>;
    notifyTradeUpdate(chatId: string, update: any): Promise<void>;
    notifyOfferUpdate(chatId: string, update: any): Promise<void>;
    notifyNigerianHolidayGreeting(userId: string, message: string): Promise<void>;
    notifyNetworkStatus(status: 'good' | 'poor' | 'offline'): Promise<void>;
    getConnectedUsersCount(): number;
    getActiveChatsCount(): number;
    getTypingUsersCount(): number;
}
export {};
