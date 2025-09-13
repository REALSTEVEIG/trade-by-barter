"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const prisma_service_1 = require("../prisma/prisma.service");
const send_message_dto_1 = require("./dto/send-message.dto");
const typing_event_dto_1 = require("./dto/typing-event.dto");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    chatService;
    jwtService;
    prisma;
    server;
    logger = new common_1.Logger(ChatGateway_1.name);
    connectedUsers = new Map();
    socketToUser = new Map();
    typingUsers = new Map();
    constructor(chatService, jwtService, prisma) {
        this.chatService = chatService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    afterInit(server) {
        this.logger.log('Chat WebSocket Gateway initialized');
    }
    async handleConnection(client) {
        try {
            const token = this.extractTokenFromHandshake(client);
            if (!token) {
                throw new websockets_1.WsException('Authentication token required');
            }
            const payload = await this.verifyToken(token);
            if (!payload) {
                throw new websockets_1.WsException('Invalid authentication token');
            }
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub, isActive: true },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    isBlocked: true,
                },
            });
            if (!user || user.isBlocked) {
                throw new websockets_1.WsException('User not found or blocked');
            }
            client.userId = user.id;
            client.user = user;
            this.connectedUsers.set(user.id, {
                userId: user.id,
                socketId: client.id,
                lastSeen: new Date(),
                isOnline: true,
            });
            this.socketToUser.set(client.id, user.id);
            await this.chatService.updateUserLastActive(user.id);
            client.join(`user:${user.id}`);
            this.broadcastUserPresence(user.id, true);
            this.logger.log(`User ${user.firstName} ${user.lastName} (${user.id}) connected`);
            client.emit('connected', {
                message: 'Welcome to TradeByBarter Chat! Start negotiating your trades.',
                userId: user.id,
                timestamp: new Date(),
                timezone: 'Africa/Lagos',
            });
        }
        catch (error) {
            this.logger.error(`Connection failed: ${error.message}`);
            client.emit('error', {
                message: 'Authentication failed',
                code: 'AUTH_FAILED',
                timestamp: new Date(),
            });
            client.disconnect();
        }
    }
    async handleDisconnect(client) {
        const userId = this.socketToUser.get(client.id);
        if (userId) {
            this.connectedUsers.delete(userId);
            this.socketToUser.delete(client.id);
            await this.chatService.updateUserLastActive(userId);
            this.clearUserTyping(userId);
            this.broadcastUserPresence(userId, false);
            this.logger.log(`User ${userId} disconnected`);
        }
    }
    async handleJoinChat(client, data) {
        try {
            const { chatId } = data;
            const userId = client.userId;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            const chat = await this.chatService.getChatById(chatId, userId);
            if (!chat) {
                throw new websockets_1.WsException('Chat not found or access denied');
            }
            client.join(`chat:${chatId}`);
            await this.chatService.markMessagesAsRead(chatId, userId);
            client.to(`chat:${chatId}`).emit('user_joined', {
                userId,
                chatId,
                timestamp: new Date(),
            });
            client.emit('chat_joined', {
                chatId,
                message: 'Successfully joined chat',
                timestamp: new Date(),
            });
            this.logger.log(`User ${userId} joined chat ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Join chat error: ${error.message}`);
            client.emit('error', {
                message: error.message,
                code: 'JOIN_CHAT_FAILED',
                timestamp: new Date(),
            });
        }
    }
    async handleLeaveChat(client, data) {
        try {
            const { chatId } = data;
            const userId = client.userId;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            client.leave(`chat:${chatId}`);
            this.handleStopTyping(client, { chatId });
            client.to(`chat:${chatId}`).emit('user_left', {
                userId,
                chatId,
                timestamp: new Date(),
            });
            client.emit('chat_left', {
                chatId,
                message: 'Successfully left chat',
                timestamp: new Date(),
            });
            this.logger.log(`User ${userId} left chat ${chatId}`);
        }
        catch (error) {
            this.logger.error(`Leave chat error: ${error.message}`);
            client.emit('error', {
                message: error.message,
                code: 'LEAVE_CHAT_FAILED',
                timestamp: new Date(),
            });
        }
    }
    async handleSendMessage(client, data) {
        try {
            const userId = client.userId;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            const message = await this.chatService.sendMessage(data, userId);
            this.handleStopTyping(client, { chatId: data.chatId });
            this.server.to(`chat:${data.chatId}`).emit('message_received', {
                ...message,
                timestamp: new Date(),
            });
            client.emit('message_sent', {
                messageId: message.id,
                chatId: data.chatId,
                status: 'SENT',
                timestamp: new Date(),
            });
            this.server.to(`chat:${data.chatId}`).emit('chat_updated', {
                chatId: data.chatId,
                lastMessageAt: new Date(),
                lastMessage: {
                    id: message.id,
                    content: message.content,
                    type: message.type,
                    senderId: message.senderId,
                },
            });
            this.logger.log(`Message sent in chat ${data.chatId} by user ${userId}`);
        }
        catch (error) {
            this.logger.error(`Send message error: ${error.message}`);
            client.emit('error', {
                message: error.message,
                code: 'SEND_MESSAGE_FAILED',
                timestamp: new Date(),
            });
        }
    }
    async handleStartTyping(client, data) {
        try {
            const userId = client.userId;
            const { chatId } = data;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            if (!this.typingUsers.has(chatId)) {
                this.typingUsers.set(chatId, new Set());
            }
            this.typingUsers.get(chatId).add(userId);
            client.to(`chat:${chatId}`).emit('user_typing', {
                userId,
                chatId,
                isTyping: true,
                timestamp: new Date(),
            });
            setTimeout(() => {
                this.handleStopTyping(client, { chatId });
            }, 3000);
        }
        catch (error) {
            this.logger.error(`Start typing error: ${error.message}`);
        }
    }
    async handleStopTyping(client, data) {
        try {
            const userId = client.userId;
            const { chatId } = data;
            if (!userId) {
                return;
            }
            if (this.typingUsers.has(chatId)) {
                this.typingUsers.get(chatId).delete(userId);
                if (this.typingUsers.get(chatId).size === 0) {
                    this.typingUsers.delete(chatId);
                }
            }
            client.to(`chat:${chatId}`).emit('user_stopped_typing', {
                userId,
                chatId,
                isTyping: false,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Stop typing error: ${error.message}`);
        }
    }
    async handleMarkRead(client, data) {
        try {
            const userId = client.userId;
            const { chatId, messageId } = data;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            await this.chatService.markMessagesAsRead(chatId, userId, messageId ? [messageId] : undefined);
            client.to(`chat:${chatId}`).emit('message_read', {
                userId,
                chatId,
                messageId: messageId || 'all',
                readAt: new Date(),
            });
            client.emit('messages_marked_read', {
                chatId,
                messageId: messageId || 'all',
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Mark read error: ${error.message}`);
            client.emit('error', {
                message: error.message,
                code: 'MARK_READ_FAILED',
                timestamp: new Date(),
            });
        }
    }
    async handleGetOnlineUsers(client, data) {
        try {
            const userId = client.userId;
            if (!userId) {
                throw new websockets_1.WsException('User not authenticated');
            }
            const onlineUserIds = Array.from(this.connectedUsers.keys());
            client.emit('online_users', {
                onlineUserIds,
                totalOnline: onlineUserIds.length,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error(`Get online users error: ${error.message}`);
        }
    }
    handlePing(client) {
        client.emit('pong', { timestamp: new Date() });
    }
    extractTokenFromHandshake(client) {
        const token = client.handshake.auth?.token ||
            client.handshake.headers?.authorization?.replace('Bearer ', '') ||
            client.handshake.query?.token;
        return token || null;
    }
    async verifyToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token);
            return payload;
        }
        catch (error) {
            this.logger.error(`Token verification failed: ${error.message}`);
            return null;
        }
    }
    broadcastUserPresence(userId, isOnline) {
        this.server.emit('user_presence_changed', {
            userId,
            isOnline,
            lastSeen: isOnline ? new Date() : new Date(),
            timestamp: new Date(),
        });
    }
    clearUserTyping(userId) {
        for (const [chatId, typingUsers] of this.typingUsers.entries()) {
            if (typingUsers.has(userId)) {
                typingUsers.delete(userId);
                this.server.to(`chat:${chatId}`).emit('user_stopped_typing', {
                    userId,
                    chatId,
                    isTyping: false,
                    timestamp: new Date(),
                });
                if (typingUsers.size === 0) {
                    this.typingUsers.delete(chatId);
                }
            }
        }
    }
    async notifyNewChat(userId, chat) {
        this.server.to(`user:${userId}`).emit('new_chat_created', {
            chat,
            timestamp: new Date(),
        });
    }
    async notifyTradeUpdate(chatId, update) {
        this.server.to(`chat:${chatId}`).emit('trade_update', {
            ...update,
            timestamp: new Date(),
        });
    }
    async notifyOfferUpdate(chatId, update) {
        this.server.to(`chat:${chatId}`).emit('offer_update', {
            ...update,
            timestamp: new Date(),
        });
    }
    async notifyNigerianHolidayGreeting(userId, message) {
        this.server.to(`user:${userId}`).emit('holiday_greeting', {
            message,
            type: 'NIGERIAN_HOLIDAY',
            timestamp: new Date(),
        });
    }
    async notifyNetworkStatus(status) {
        this.server.emit('network_status', {
            status,
            message: status === 'poor' ?
                'Network connection is slow. Messages may take longer to deliver.' :
                status === 'offline' ?
                    'You are offline. Messages will be sent when connection is restored.' :
                    'Network connection is good.',
            timestamp: new Date(),
        });
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getActiveChatsCount() {
        const chatRooms = Array.from(this.server.sockets.adapter.rooms.keys())
            .filter(room => room.startsWith('chat:'));
        return chatRooms.length;
    }
    getTypingUsersCount() {
        let totalTyping = 0;
        for (const typingUsers of this.typingUsers.values()) {
            totalTyping += typingUsers.size;
        }
        return totalTyping;
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typing_event_dto_1.TypingStartDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleStartTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, typing_event_dto_1.TypingStopDto]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleStopTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('get_online_users'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleGetOnlineUsers", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handlePing", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:19006'],
            credentials: true,
        },
        namespace: '/chat',
    }),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map