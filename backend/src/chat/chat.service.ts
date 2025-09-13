import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType, MessageStatus, MessageResponse } from './dto/message-response.dto';
import { ChatType, ChatResponse, UserSummary, MessageSummary } from './dto/chat-response.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  // Nigerian time zone utility
  private getNigerianTime(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
  }

  // Transform user data to UserSummary
  private transformUserToSummary(user: any): UserSummary {
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

  // Get or create chat between two users
  async getOrCreateDirectChat(senderId: string, recipientId: string, listingId?: string, offerId?: string): Promise<ChatResponse> {
    if (senderId === recipientId) {
      throw new BadRequestException('Cannot create chat with yourself');
    }

    // Check if chat already exists between these users
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
      // Create new chat
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

    // Get unread count for current user
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

  // Create chat from DTO
  async createChat(createChatDto: CreateChatDto, senderId: string): Promise<ChatResponse> {
    // Verify recipient exists
    const recipient = await this.prisma.user.findUnique({
      where: { id: createChatDto.recipientId, isActive: true },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    const chat = await this.getOrCreateDirectChat(
      senderId,
      createChatDto.recipientId,
      createChatDto.listingId,
      createChatDto.offerId,
    );

    // Send initial message if provided
    if (createChatDto.initialMessage) {
      await this.sendMessage({
        chatId: chat.id,
        type: MessageType.TEXT,
        content: createChatDto.initialMessage,
      }, senderId);
    }

    return chat;
  }

  // Get user's chats
  async getUserChats(userId: string, pagination: PaginationDto): Promise<PaginatedResult<ChatResponse>> {
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

    // Get unread counts for each chat
    const chatResponses = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await this.prisma.message.count({
          where: {
            chatId: chat.id,
            senderId: { not: userId },
            isRead: false,
            isDeleted: false,
          },
        });
        return this.transformChatToResponse(chat, unreadCount, userId);
      }),
    );

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

  // Get specific chat
  async getChatById(chatId: string, userId: string): Promise<ChatResponse> {
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
      throw new NotFoundException('Chat not found');
    }

    // Check if user is participant
    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new ForbiddenException('Access denied to this chat');
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

  // Send message
  async sendMessage(sendMessageDto: SendMessageDto, senderId: string): Promise<MessageResponse> {
    const { chatId, type, content, mediaUrl, metadata } = sendMessageDto;

    // Verify chat exists and user is participant
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
      include: { sender: true, receiver: true },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.senderId !== senderId && chat.receiverId !== senderId) {
      throw new ForbiddenException('Access denied to this chat');
    }

    // Nigerian context: Filter inappropriate content (basic implementation)
    const filteredContent = this.filterNigerianContent(content);

    // Rate limiting check (30 messages per minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentMessageCount = await this.prisma.message.count({
      where: {
        senderId,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentMessageCount >= 30) {
      throw new BadRequestException('Rate limit exceeded. Please slow down your messaging.');
    }

    // Create message
    const message = await this.prisma.message.create({
      data: {
        chatId,
        senderId,
        content: filteredContent,
        messageType: type as any,
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

    // Update chat's lastMessageAt
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: this.getNigerianTime() },
    });

    // Handle media attachment if provided
    if (mediaUrl && (type === MessageType.IMAGE || type === MessageType.DOCUMENT || type === MessageType.AUDIO || type === MessageType.VIDEO)) {
      await this.attachMediaToMessage(message.id, mediaUrl, type, senderId);
    }

    return this.transformMessageToResponse(message);
  }

  // Get chat messages with pagination
  async getChatMessages(chatId: string, userId: string, pagination: PaginationDto): Promise<PaginatedResult<MessageResponse>> {
    // Verify chat access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new ForbiddenException('Access denied to this chat');
    }

    const { page = 1, limit = 50 } = pagination; // Higher limit for messages
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
        orderBy: { createdAt: 'desc' }, // Most recent first
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

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string, messageIds?: string[]): Promise<void> {
    // Verify chat access
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new ForbiddenException('Access denied to this chat');
    }

    const whereClause: any = {
      chatId,
      senderId: { not: userId }, // Only mark messages not sent by current user
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

  // Delete/leave chat
  async deleteChat(chatId: string, userId: string): Promise<void> {
    const chat = await this.prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new ForbiddenException('Access denied to this chat');
    }

    // Soft delete by marking as inactive
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { isActive: false },
    });
  }

  // Nigerian content filtering (basic implementation)
  private filterNigerianContent(content: string): string {
    // Basic profanity filter for Nigerian context
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

  // Attach media to message
  private async attachMediaToMessage(messageId: string, mediaUrl: string, messageType: MessageType, userId: string): Promise<void> {
    // This would typically involve file processing and storage
    // For now, just create a media record
    const mimeType = this.getMimeTypeFromMessageType(messageType);
    
    await this.prisma.media.create({
      data: {
        messageId,
        userId,
        filename: `message_${messageId}_${Date.now()}`,
        originalName: 'user_upload',
        mimeType,
        size: 0, // Would be calculated from actual file
        url: mediaUrl,
        storageKey: `messages/${messageId}/${Date.now()}`,
        uploadedAt: this.getNigerianTime(),
      },
    });
  }

  // Get MIME type from message type
  private getMimeTypeFromMessageType(messageType: MessageType): string {
    switch (messageType) {
      case MessageType.IMAGE:
        return 'image/jpeg';
      case MessageType.AUDIO:
        return 'audio/mpeg';
      case MessageType.VIDEO:
        return 'video/mp4';
      case MessageType.DOCUMENT:
        return 'application/pdf';
      default:
        return 'application/octet-stream';
    }
  }

  // Transform chat to response DTO
  private transformChatToResponse(chat: any, unreadCount: number, currentUserId: string): ChatResponse {
    const otherUser = chat.senderId === currentUserId ? chat.receiver : chat.sender;
    const participants = [
      this.transformUserToSummary(chat.sender),
      this.transformUserToSummary(chat.receiver),
    ];

    let lastMessage: MessageSummary | undefined = undefined;
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
      type: ChatType.DIRECT, // Default to DIRECT for now
      participants,
      lastMessage,
      unreadCount,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      lastMessageAt: chat.lastMessageAt,
      isActive: chat.isActive,
    };
  }

  // Transform message to response DTO
  private transformMessageToResponse(message: any): MessageResponse {
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
      metadata: undefined, // Would include location data, etc.
      status: message.isRead ? MessageStatus.READ : MessageStatus.SENT,
      sentAt: message.createdAt,
      readBy: [], // Would be populated for group chats
      isRead: message.isRead,
      readAt: message.readAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  // Get user online status (for Socket.IO integration)
  async updateUserLastActive(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: this.getNigerianTime() },
    });
  }

  // Get chat statistics for user
  async getUserChatStats(userId: string): Promise<any> {
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
}