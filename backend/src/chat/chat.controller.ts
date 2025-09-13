import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { SendMessageDto, SendTextMessageDto, SendLocationMessageDto, BulkMarkReadDto } from './dto/send-message.dto';
import { PaginationDto, PaginatedResult } from './dto/pagination.dto';
import { ChatResponse, UserSummary } from './dto/chat-response.dto';
import { MessageResponse, MessageHistoryResponse } from './dto/message-response.dto';

@ApiTags('Chat')
@Controller('api/v1/chats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Get user chat conversations',
    description: 'Retrieve all chat conversations for the authenticated user with pagination support. Nigerian users can see their active barter trade discussions.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (max 100)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User chats retrieved successfully',
    type: ChatResponse,
    isArray: true,
  })
  async getUserChats(
    @GetUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<ChatResponse>> {
    return this.chatService.getUserChats(userId, pagination);
  }

  @Get('stats')
  @ApiOperation({ 
    summary: 'Get user chat statistics',
    description: 'Get chat statistics including total chats, unread messages count, and other metrics for the authenticated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat statistics retrieved successfully',
  })
  async getUserChatStats(@GetUser('id') userId: string) {
    return this.chatService.getUserChatStats(userId);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get specific chat details',
    description: 'Retrieve details of a specific chat conversation including participants and recent activity.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat details retrieved successfully',
    type: ChatResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this chat',
  })
  async getChatById(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
  ): Promise<ChatResponse> {
    return this.chatService.getChatById(chatId, userId);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Start new chat conversation',
    description: 'Create a new chat conversation with another user. Can be related to a specific listing or offer for trade negotiations.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Chat created successfully',
    type: ChatResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Recipient not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot create chat with yourself',
  })
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @GetUser('id') senderId: string,
  ): Promise<ChatResponse> {
    return this.chatService.createChat(createChatDto, senderId);
  }

  @Get(':id/messages')
  @ApiOperation({ 
    summary: 'Get chat message history',
    description: 'Retrieve paginated message history for a specific chat conversation. Messages are returned in reverse chronological order (newest first).',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Messages per page (max 100)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat messages retrieved successfully',
    type: MessageHistoryResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this chat',
  })
  async getChatMessages(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<MessageResponse>> {
    return this.chatService.getChatMessages(chatId, userId, pagination);
  }

  @Post(':id/messages')
  @ApiOperation({ 
    summary: 'Send message to chat',
    description: 'Send a new message to a chat conversation. Supports text, images, documents, location sharing, and other media types. Nigerian users can communicate in local languages.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Message sent successfully',
    type: MessageResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this chat',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Rate limit exceeded or invalid message content',
  })
  async sendMessage(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() sendMessageDto: SendMessageDto,
    @GetUser('id') senderId: string,
  ): Promise<MessageResponse> {
    // Override chatId from URL param to ensure consistency
    sendMessageDto.chatId = chatId;
    return this.chatService.sendMessage(sendMessageDto, senderId);
  }

  @Post(':id/messages/text')
  @ApiOperation({ 
    summary: 'Send text message (simplified)',
    description: 'Simplified endpoint for sending text messages. Popular among Nigerian users for quick trade negotiations.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Text message sent successfully',
    type: MessageResponse,
  })
  async sendTextMessage(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() sendTextMessageDto: SendTextMessageDto,
    @GetUser('id') senderId: string,
  ): Promise<MessageResponse> {
    return this.chatService.sendMessage({
      chatId,
      type: 'TEXT' as any,
      content: sendTextMessageDto.content,
    }, senderId);
  }

  @Post(':id/messages/location')
  @ApiOperation({ 
    summary: 'Send location message',
    description: 'Share location for meetup coordination. Essential for Nigerian users arranging physical trade exchanges.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Location message sent successfully',
    type: MessageResponse,
  })
  async sendLocationMessage(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Body() sendLocationDto: SendLocationMessageDto,
    @GetUser('id') senderId: string,
  ): Promise<MessageResponse> {
    return this.chatService.sendMessage({
      chatId,
      type: 'LOCATION' as any,
      content: sendLocationDto.address || `Location: ${sendLocationDto.latitude}, ${sendLocationDto.longitude}`,
      metadata: {
        latitude: sendLocationDto.latitude,
        longitude: sendLocationDto.longitude,
        address: sendLocationDto.address,
      },
    }, senderId);
  }

  @Post(':id/media')
  @ApiOperation({ 
    summary: 'Upload media to chat',
    description: 'Upload and send media files (images, documents, audio) to a chat conversation. Supports Nigerian Naira receipt uploads and product images.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Media uploaded and message sent successfully',
    type: MessageResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid file type or size',
  })
  async uploadChatMedia(
    @Param('id', ParseUUIDPipe) chatId: string,
    @UploadedFile() file: Express.Multer.File,
    @GetUser('id') senderId: string,
  ): Promise<MessageResponse> {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Determine message type from file MIME type
    let messageType: string;
    if (file.mimetype.startsWith('image/')) {
      messageType = 'IMAGE';
    } else if (file.mimetype.startsWith('audio/')) {
      messageType = 'AUDIO';
    } else if (file.mimetype.startsWith('video/')) {
      messageType = 'VIDEO';
    } else {
      messageType = 'DOCUMENT';
    }

    // For now, using a placeholder URL - in production, this would upload to cloud storage
    const mediaUrl = `/uploads/chat/${chatId}/${file.filename}`;

    return this.chatService.sendMessage({
      chatId,
      type: messageType as any,
      content: file.originalname,
      mediaUrl,
      metadata: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    }, senderId);
  }

  @Put(':id/read')
  @ApiOperation({ 
    summary: 'Mark messages as read',
    description: 'Mark messages in a chat as read by the current user. Helps track conversation progress in trade negotiations.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Messages marked as read successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this chat',
  })
  async markMessagesAsRead(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
    @Body() markReadDto?: BulkMarkReadDto,
  ): Promise<{ success: boolean; message: string }> {
    await this.chatService.markMessagesAsRead(
      chatId, 
      userId, 
      markReadDto?.messageIds
    );
    
    return {
      success: true,
      message: 'Messages marked as read successfully',
    };
  }

  @Put(':id/messages/:messageId/read')
  @ApiOperation({ 
    summary: 'Mark specific message as read',
    description: 'Mark a specific message as read by the current user.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiParam({ name: 'messageId', description: 'Message ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message marked as read successfully',
  })
  async markSingleMessageAsRead(
    @Param('id', ParseUUIDPipe) chatId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.chatService.markMessagesAsRead(chatId, userId, [messageId]);
    
    return {
      success: true,
      message: 'Message marked as read successfully',
    };
  }

  @Delete(':id')
  @ApiOperation({ 
    summary: 'Delete/leave chat',
    description: 'Delete or leave a chat conversation. This will hide the chat from the user\'s chat list but preserve the conversation for other participants.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chat deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chat not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied to this chat',
  })
  async deleteChat(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.chatService.deleteChat(chatId, userId);
    
    return {
      success: true,
      message: 'Chat deleted successfully',
    };
  }

  @Put(':id/typing/start')
  @ApiOperation({ 
    summary: 'Start typing indicator',
    description: 'Notify other participants that the user is typing. Creates a real-time typing indicator familiar to WhatsApp users.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Typing indicator started',
  })
  async startTyping(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    // This would be handled primarily by Socket.IO, but can be used for HTTP clients
    await this.chatService.updateUserLastActive(userId);
    
    return {
      success: true,
      message: 'Typing indicator started',
    };
  }

  @Put(':id/typing/stop')
  @ApiOperation({ 
    summary: 'Stop typing indicator',
    description: 'Notify other participants that the user has stopped typing.',
  })
  @ApiParam({ name: 'id', description: 'Chat ID', type: 'string' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Typing indicator stopped',
  })
  async stopTyping(
    @Param('id', ParseUUIDPipe) chatId: string,
    @GetUser('id') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    // This would be handled primarily by Socket.IO, but can be used for HTTP clients
    await this.chatService.updateUserLastActive(userId);
    
    return {
      success: true,
      message: 'Typing indicator stopped',
    };
  }
}