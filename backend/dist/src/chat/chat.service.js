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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const message_response_dto_1 = require("./dto/message-response.dto");
const chat_response_dto_1 = require("./dto/chat-response.dto");
let ChatService = class ChatService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getNigerianTime() {
        return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    }
    transformUserToSummary(user) {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName || `${user.firstName} ${user.lastName}`,
            profileImageUrl: user.profileImageUrl,
            lastActiveAt: user.lastActiveAt,
            isActive: user.isActive,
        };
    }
    async getOrCreateDirectChat(senderId, recipientId, listingId, offerId) {
        if (senderId === recipientId) {
            throw new common_1.BadRequestException('Cannot create chat with yourself');
        }
        let chat = await this.prisma.chat.findFirst({
            where: {
                OR: [
                    { senderId, receiverId: recipientId },
                    { senderId: recipientId, receiverId: senderId },
                ],
                isActive: true,
            },
            include: {
                sender: true,
                receiver: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: true,
                        media: true,
                    },
                },
            },
        });
        if (!chat) {
            chat = await this.prisma.chat.create({
                data: {
                    senderId,
                    receiverId: recipientId,
                    lastMessageAt: this.getNigerianTime(),
                    isActive: true,
                },
                include: {
                    sender: true,
                    receiver: true,
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            sender: true,
                            media: true,
                        },
                    },
                },
            });
        }
        const unreadCount = await this.prisma.message.count({
            where: {
                chatId: chat.id,
                senderId: { not: senderId },
                isRead: false,
                isDeleted: false,
            },
        });
        return this.transformChatToResponse(chat, unreadCount, senderId);
    }
    async createChat(createChatDto, senderId) {
        const recipient = await this.prisma.user.findUnique({
            where: { id: createChatDto.recipientId, isActive: true },
        });
        if (!recipient) {
            throw new common_1.NotFoundException('Recipient not found');
        }
        const chat = await this.getOrCreateDirectChat(senderId, createChatDto.recipientId, createChatDto.listingId, createChatDto.offerId);
        if (createChatDto.initialMessage) {
            await this.sendMessage({
                chatId: chat.id,
                type: message_response_dto_1.MessageType.TEXT,
                content: createChatDto.initialMessage,
            }, senderId);
        }
        return chat;
    }
    async getUserChats(userId, pagination) {
        const { page = 1, limit = 20 } = pagination;
        const skip = (page - 1) * limit;
        const [chats, total] = await Promise.all([
            this.prisma.chat.findMany({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId },
                    ],
                    isActive: true,
                },
                include: {
                    sender: true,
                    receiver: true,
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                        include: {
                            sender: true,
                            media: true,
                        },
                    },
                },
                orderBy: { lastMessageAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.chat.count({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId },
                    ],
                    isActive: true,
                },
            }),
        ]);
        const chatResponses = await Promise.all(chats.map(async (chat) => {
            const unreadCount = await this.prisma.message.count({
                where: {
                    chatId: chat.id,
                    senderId: { not: userId },
                    isRead: false,
                    isDeleted: false,
                },
            });
            return this.transformChatToResponse(chat, unreadCount, userId);
        }));
        return {
            items: chatResponses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async getChatById(chatId, userId) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            include: {
                sender: true,
                receiver: true,
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        sender: true,
                        media: true,
                    },
                },
            },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.senderId !== userId && chat.receiverId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this chat');
        }
        const unreadCount = await this.prisma.message.count({
            where: {
                chatId: chat.id,
                senderId: { not: userId },
                isRead: false,
                isDeleted: false,
            },
        });
        return this.transformChatToResponse(chat, unreadCount, userId);
    }
    async sendMessage(sendMessageDto, senderId) {
        const { chatId, type, content, mediaUrl, metadata } = sendMessageDto;
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
            include: { sender: true, receiver: true },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.senderId !== senderId && chat.receiverId !== senderId) {
            throw new common_1.ForbiddenException('Access denied to this chat');
        }
        const filteredContent = this.filterNigerianContent(content);
        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
        const recentMessageCount = await this.prisma.message.count({
            where: {
                senderId,
                createdAt: { gte: oneMinuteAgo },
            },
        });
        if (recentMessageCount >= 30) {
            throw new common_1.BadRequestException('Rate limit exceeded. Please slow down your messaging.');
        }
        const message = await this.prisma.message.create({
            data: {
                chatId,
                senderId,
                content: filteredContent,
                messageType: type,
                isRead: false,
                isDeleted: false,
                createdAt: this.getNigerianTime(),
                updatedAt: this.getNigerianTime(),
            },
            include: {
                sender: true,
                media: true,
            },
        });
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { lastMessageAt: this.getNigerianTime() },
        });
        if (mediaUrl && (type === message_response_dto_1.MessageType.IMAGE || type === message_response_dto_1.MessageType.DOCUMENT || type === message_response_dto_1.MessageType.AUDIO || type === message_response_dto_1.MessageType.VIDEO)) {
            await this.attachMediaToMessage(message.id, mediaUrl, type, senderId);
        }
        return this.transformMessageToResponse(message);
    }
    async getChatMessages(chatId, userId, pagination) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.senderId !== userId && chat.receiverId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this chat');
        }
        const { page = 1, limit = 50 } = pagination;
        const skip = (page - 1) * limit;
        const [messages, total] = await Promise.all([
            this.prisma.message.findMany({
                where: {
                    chatId,
                    isDeleted: false,
                },
                include: {
                    sender: true,
                    media: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.message.count({
                where: {
                    chatId,
                    isDeleted: false,
                },
            }),
        ]);
        const messageResponses = messages.map(message => this.transformMessageToResponse(message));
        return {
            items: messageResponses,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1,
        };
    }
    async markMessagesAsRead(chatId, userId, messageIds) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.senderId !== userId && chat.receiverId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this chat');
        }
        const whereClause = {
            chatId,
            senderId: { not: userId },
            isRead: false,
        };
        if (messageIds && messageIds.length > 0) {
            whereClause.id = { in: messageIds };
        }
        await this.prisma.message.updateMany({
            where: whereClause,
            data: {
                isRead: true,
                readAt: this.getNigerianTime(),
            },
        });
    }
    async deleteChat(chatId, userId) {
        const chat = await this.prisma.chat.findUnique({
            where: { id: chatId },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.senderId !== userId && chat.receiverId !== userId) {
            throw new common_1.ForbiddenException('Access denied to this chat');
        }
        await this.prisma.chat.update({
            where: { id: chatId },
            data: { isActive: false },
        });
    }
    filterNigerianContent(content) {
        const nigerianProfanity = [
            'mumu', 'olodo', 'ode', 'werey', 'oponu'
        ];
        let filtered = content;
        nigerianProfanity.forEach(word => {
            const regex = new RegExp(word, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(word.length));
        });
        return filtered;
    }
    async attachMediaToMessage(messageId, mediaUrl, messageType, userId) {
        const mimeType = this.getMimeTypeFromMessageType(messageType);
        await this.prisma.media.create({
            data: {
                messageId,
                userId,
                filename: `message_${messageId}_${Date.now()}`,
                originalName: 'user_upload',
                mimeType,
                size: 0,
                url: mediaUrl,
                storageKey: `messages/${messageId}/${Date.now()}`,
                uploadedAt: this.getNigerianTime(),
            },
        });
    }
    getMimeTypeFromMessageType(messageType) {
        switch (messageType) {
            case message_response_dto_1.MessageType.IMAGE:
                return 'image/jpeg';
            case message_response_dto_1.MessageType.AUDIO:
                return 'audio/mpeg';
            case message_response_dto_1.MessageType.VIDEO:
                return 'video/mp4';
            case message_response_dto_1.MessageType.DOCUMENT:
                return 'application/pdf';
            default:
                return 'application/octet-stream';
        }
    }
    transformChatToResponse(chat, unreadCount, currentUserId) {
        const otherUser = chat.senderId === currentUserId ? chat.receiver : chat.sender;
        const participants = [
            this.transformUserToSummary(chat.sender),
            this.transformUserToSummary(chat.receiver),
        ];
        let lastMessage = undefined;
        if (chat.messages && chat.messages.length > 0) {
            const msg = chat.messages[0];
            lastMessage = {
                id: msg.id,
                content: msg.content,
                messageType: msg.messageType,
                senderId: msg.senderId,
                createdAt: msg.createdAt,
                isRead: msg.isRead,
            };
        }
        return {
            id: chat.id,
            type: chat_response_dto_1.ChatType.DIRECT,
            participants,
            lastMessage,
            unreadCount,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            lastMessageAt: chat.lastMessageAt,
            isActive: chat.isActive,
        };
    }
    transformMessageToResponse(message) {
        return {
            id: message.id,
            chatId: message.chatId,
            senderId: message.senderId,
            sender: this.transformUserToSummary(message.sender),
            type: message.messageType,
            content: message.content,
            mediaUrl: message.media && message.media.length > 0 ? message.media[0].url : undefined,
            media: message.media ? message.media.map(m => ({
                id: m.id,
                filename: m.filename,
                originalName: m.originalName,
                mimeType: m.mimeType,
                size: m.size,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                uploadedAt: m.uploadedAt,
            })) : undefined,
            metadata: undefined,
            status: message.isRead ? message_response_dto_1.MessageStatus.READ : message_response_dto_1.MessageStatus.SENT,
            sentAt: message.createdAt,
            readBy: [],
            isRead: message.isRead,
            readAt: message.readAt,
            isDeleted: message.isDeleted,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
        };
    }
    async updateUserLastActive(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastActiveAt: this.getNigerianTime() },
        });
    }
    async getUserChatStats(userId) {
        const [totalChats, unreadChats, totalMessages] = await Promise.all([
            this.prisma.chat.count({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId },
                    ],
                    isActive: true,
                },
            }),
            this.prisma.chat.count({
                where: {
                    OR: [
                        { senderId: userId },
                        { receiverId: userId },
                    ],
                    isActive: true,
                    messages: {
                        some: {
                            senderId: { not: userId },
                            isRead: false,
                            isDeleted: false,
                        },
                    },
                },
            }),
            this.prisma.message.count({
                where: {
                    senderId: userId,
                    isDeleted: false,
                },
            }),
        ]);
        return {
            totalChats,
            unreadChats,
            totalMessages,
            totalUnreadMessages: await this.prisma.message.count({
                where: {
                    chat: {
                        OR: [
                            { senderId: userId },
                            { receiverId: userId },
                        ],
                    },
                    senderId: { not: userId },
                    isRead: false,
                    isDeleted: false,
                },
            }),
        };
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map