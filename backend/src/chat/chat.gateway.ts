import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { TypingStartDto, TypingStopDto } from './dto/typing-event.dto';
import { MessageType } from './dto/message-response.dto';

// JWT payload interface
interface JwtPayload {
  sub: string; // user ID
  email: string;
  iat: number;
  exp: number;
}

// Extended Socket interface with user data
interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// User presence tracking
interface UserPresence {
  userId: string;
  socketId: string;
  lastSeen: Date;
  isOnline: boolean;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:19006'], // web & mobile
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly connectedUsers = new Map<string, UserPresence>(); // userId -> UserPresence
  private readonly socketToUser = new Map<string, string>(); // socketId -> userId
  private readonly typingUsers = new Map<string, Set<string>>(); // chatId -> Set of userIds

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        throw new WsException('Authentication token required');
      }

      // Verify JWT token
      const payload = await this.verifyToken(token);
      if (!payload) {
        throw new WsException('Invalid authentication token');
      }

      // Get user details from database
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
        throw new WsException('User not found or blocked');
      }

      // Attach user to socket
      client.userId = user.id;
      client.user = user;

      // Track user connection
      this.connectedUsers.set(user.id, {
        userId: user.id,
        socketId: client.id,
        lastSeen: new Date(),
        isOnline: true,
      });

      this.socketToUser.set(client.id, user.id);

      // Update user last active
      await this.chatService.updateUserLastActive(user.id);

      // Join user to personal room for direct notifications
      client.join(`user:${user.id}`);

      // Notify about user coming online
      this.broadcastUserPresence(user.id, true);

      this.logger.log(`User ${user.firstName} ${user.lastName} (${user.id}) connected`);

      // Send welcome message with Nigerian context
      client.emit('connected', {
        message: 'Welcome to TradeByBarter Chat! Start negotiating your trades.',
        userId: user.id,
        timestamp: new Date(),
        timezone: 'Africa/Lagos',
      });

    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`);
      client.emit('error', { 
        message: 'Authentication failed',
        code: 'AUTH_FAILED',
        timestamp: new Date(),
      });
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      // Remove from tracking
      this.connectedUsers.delete(userId);
      this.socketToUser.delete(client.id);

      // Update last active timestamp
      await this.chatService.updateUserLastActive(userId);

      // Clear typing indicators for this user
      this.clearUserTyping(userId);

      // Notify about user going offline
      this.broadcastUserPresence(userId, false);

      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const { chatId } = data;
      const userId = client.userId;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      // Verify user has access to this chat
      const chat = await this.chatService.getChatById(chatId, userId);
      if (!chat) {
        throw new WsException('Chat not found or access denied');
      }

      // Join chat room
      client.join(`chat:${chatId}`);

      // Mark messages as read when joining
      await this.chatService.markMessagesAsRead(chatId, userId);

      // Notify other participants
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

    } catch (error) {
      this.logger.error(`Join chat error: ${error.message}`);
      client.emit('error', {
        message: error.message,
        code: 'JOIN_CHAT_FAILED',
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    try {
      const { chatId } = data;
      const userId = client.userId;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      // Leave chat room
      client.leave(`chat:${chatId}`);

      // Clear typing if user was typing
      this.handleStopTyping(client, { chatId });

      // Notify other participants
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

    } catch (error) {
      this.logger.error(`Leave chat error: ${error.message}`);
      client.emit('error', {
        message: error.message,
        code: 'LEAVE_CHAT_FAILED',
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ) {
    try {
      const userId = client.userId;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      // Send message through chat service
      const message = await this.chatService.sendMessage(data, userId);

      // Stop typing indicator for sender
      this.handleStopTyping(client, { chatId: data.chatId });

      // Broadcast message to all chat participants
      this.server.to(`chat:${data.chatId}`).emit('message_received', {
        ...message,
        timestamp: new Date(),
      });

      // Send delivery confirmation to sender
      client.emit('message_sent', {
        messageId: message.id,
        chatId: data.chatId,
        status: 'SENT',
        timestamp: new Date(),
      });

      // Update chat's last message timestamp
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

    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      client.emit('error', {
        message: error.message,
        code: 'SEND_MESSAGE_FAILED',
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('typing_start')
  async handleStartTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingStartDto,
  ) {
    try {
      const userId = client.userId;
      const { chatId } = data;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      // Add user to typing users for this chat
      if (!this.typingUsers.has(chatId)) {
        this.typingUsers.set(chatId, new Set());
      }
      this.typingUsers.get(chatId)!.add(userId);

      // Notify other participants
      client.to(`chat:${chatId}`).emit('user_typing', {
        userId,
        chatId,
        isTyping: true,
        timestamp: new Date(),
      });

      // Auto-stop typing after 3 seconds of inactivity
      setTimeout(() => {
        this.handleStopTyping(client, { chatId });
      }, 3000);

    } catch (error) {
      this.logger.error(`Start typing error: ${error.message}`);
    }
  }

  @SubscribeMessage('typing_stop')
  async handleStopTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingStopDto,
  ) {
    try {
      const userId = client.userId;
      const { chatId } = data;

      if (!userId) {
        return;
      }

      // Remove user from typing users
      if (this.typingUsers.has(chatId)) {
        this.typingUsers.get(chatId)!.delete(userId);
        if (this.typingUsers.get(chatId)!.size === 0) {
          this.typingUsers.delete(chatId);
        }
      }

      // Notify other participants
      client.to(`chat:${chatId}`).emit('user_stopped_typing', {
        userId,
        chatId,
        isTyping: false,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Stop typing error: ${error.message}`);
    }
  }

  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; messageId?: string },
  ) {
    try {
      const userId = client.userId;
      const { chatId, messageId } = data;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      // Mark messages as read
      await this.chatService.markMessagesAsRead(
        chatId,
        userId,
        messageId ? [messageId] : undefined
      );

      // Notify other participants about read receipt
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

    } catch (error) {
      this.logger.error(`Mark read error: ${error.message}`);
      client.emit('error', {
        message: error.message,
        code: 'MARK_READ_FAILED',
        timestamp: new Date(),
      });
    }
  }

  @SubscribeMessage('get_online_users')
  async handleGetOnlineUsers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId?: string },
  ) {
    try {
      const userId = client.userId;

      if (!userId) {
        throw new WsException('User not authenticated');
      }

      const onlineUserIds = Array.from(this.connectedUsers.keys());
      
      client.emit('online_users', {
        onlineUserIds,
        totalOnline: onlineUserIds.length,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Get online users error: ${error.message}`);
    }
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    // Heartbeat for connection health check
    client.emit('pong', { timestamp: new Date() });
  }

  // Helper methods
  private extractTokenFromHandshake(client: Socket): string | null {
    const token = client.handshake.auth?.token || 
                  client.handshake.headers?.authorization?.replace('Bearer ', '') ||
                  client.handshake.query?.token;
    return token as string || null;
  }

  private async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload as JwtPayload;
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      return null;
    }
  }

  private broadcastUserPresence(userId: string, isOnline: boolean) {
    // Broadcast to all connected users
    this.server.emit('user_presence_changed', {
      userId,
      isOnline,
      lastSeen: isOnline ? new Date() : new Date(),
      timestamp: new Date(),
    });
  }

  private clearUserTyping(userId: string) {
    // Clear typing indicators for disconnected user
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

  // Public methods for external use (e.g., from other services)
  public async notifyNewChat(userId: string, chat: any) {
    this.server.to(`user:${userId}`).emit('new_chat_created', {
      chat,
      timestamp: new Date(),
    });
  }

  public async notifyTradeUpdate(chatId: string, update: any) {
    this.server.to(`chat:${chatId}`).emit('trade_update', {
      ...update,
      timestamp: new Date(),
    });
  }

  public async notifyOfferUpdate(chatId: string, update: any) {
    this.server.to(`chat:${chatId}`).emit('offer_update', {
      ...update,
      timestamp: new Date(),
    });
  }

  // Nigerian context specific notifications
  public async notifyNigerianHolidayGreeting(userId: string, message: string) {
    this.server.to(`user:${userId}`).emit('holiday_greeting', {
      message,
      type: 'NIGERIAN_HOLIDAY',
      timestamp: new Date(),
    });
  }

  public async notifyNetworkStatus(status: 'good' | 'poor' | 'offline') {
    // Notify all users about network conditions (helpful for Nigerian users)
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

  // Statistics and monitoring
  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getActiveChatsCount(): number {
    const chatRooms = Array.from(this.server.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('chat:'));
    return chatRooms.length;
  }

  public getTypingUsersCount(): number {
    let totalTyping = 0;
    for (const typingUsers of this.typingUsers.values()) {
      totalTyping += typingUsers.size;
    }
    return totalTyping;
  }
}