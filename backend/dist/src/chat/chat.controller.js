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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const chat_service_1 = require("./chat.service");
const create_chat_dto_1 = require("./dto/create-chat.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const pagination_dto_1 = require("./dto/pagination.dto");
const chat_response_dto_1 = require("./dto/chat-response.dto");
const message_response_dto_1 = require("./dto/message-response.dto");
let ChatController = class ChatController {
    chatService;
    constructor(chatService) {
        this.chatService = chatService;
    }
    async getUserChats(userId, pagination) {
        return this.chatService.getUserChats(userId, pagination);
    }
    async getUserChatStats(userId) {
        return this.chatService.getUserChatStats(userId);
    }
    async getChatById(chatId, userId) {
        return this.chatService.getChatById(chatId, userId);
    }
    async createChat(createChatDto, senderId) {
        return this.chatService.createChat(createChatDto, senderId);
    }
    async getChatMessages(chatId, userId, pagination) {
        return this.chatService.getChatMessages(chatId, userId, pagination);
    }
    async sendMessage(chatId, sendMessageDto, senderId) {
        sendMessageDto.chatId = chatId;
        return this.chatService.sendMessage(sendMessageDto, senderId);
    }
    async sendTextMessage(chatId, sendTextMessageDto, senderId) {
        return this.chatService.sendMessage({
            chatId,
            type: 'TEXT',
            content: sendTextMessageDto.content,
        }, senderId);
    }
    async sendLocationMessage(chatId, sendLocationDto, senderId) {
        return this.chatService.sendMessage({
            chatId,
            type: 'LOCATION',
            content: sendLocationDto.address || `Location: ${sendLocationDto.latitude}, ${sendLocationDto.longitude}`,
            metadata: {
                latitude: sendLocationDto.latitude,
                longitude: sendLocationDto.longitude,
                address: sendLocationDto.address,
            },
        }, senderId);
    }
    async uploadChatMedia(chatId, file, senderId) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        let messageType;
        if (file.mimetype.startsWith('image/')) {
            messageType = 'IMAGE';
        }
        else if (file.mimetype.startsWith('audio/')) {
            messageType = 'AUDIO';
        }
        else if (file.mimetype.startsWith('video/')) {
            messageType = 'VIDEO';
        }
        else {
            messageType = 'DOCUMENT';
        }
        const mediaUrl = `/uploads/chat/${chatId}/${file.filename}`;
        return this.chatService.sendMessage({
            chatId,
            type: messageType,
            content: file.originalname,
            mediaUrl,
            metadata: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
            },
        }, senderId);
    }
    async markMessagesAsRead(chatId, userId, markReadDto) {
        await this.chatService.markMessagesAsRead(chatId, userId, markReadDto?.messageIds);
        return {
            success: true,
            message: 'Messages marked as read successfully',
        };
    }
    async markSingleMessageAsRead(chatId, messageId, userId) {
        await this.chatService.markMessagesAsRead(chatId, userId, [messageId]);
        return {
            success: true,
            message: 'Message marked as read successfully',
        };
    }
    async deleteChat(chatId, userId) {
        await this.chatService.deleteChat(chatId, userId);
        return {
            success: true,
            message: 'Chat deleted successfully',
        };
    }
    async startTyping(chatId, userId) {
        await this.chatService.updateUserLastActive(userId);
        return {
            success: true,
            message: 'Typing indicator started',
        };
    }
    async stopTyping(chatId, userId) {
        await this.chatService.updateUserLastActive(userId);
        return {
            success: true,
            message: 'Typing indicator stopped',
        };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user chat conversations',
        description: 'Retrieve all chat conversations for the authenticated user with pagination support. Nigerian users can see their active barter trade discussions.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Items per page (max 100)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User chats retrieved successfully',
        type: chat_response_dto_1.ChatResponse,
        isArray: true,
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserChats", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user chat statistics',
        description: 'Get chat statistics including total chats, unread messages count, and other metrics for the authenticated user.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat statistics retrieved successfully',
    }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserChatStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get specific chat details',
        description: 'Retrieve details of a specific chat conversation including participants and recent activity.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat details retrieved successfully',
        type: chat_response_dto_1.ChatResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Chat not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Access denied to this chat',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatById", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Start new chat conversation',
        description: 'Create a new chat conversation with another user. Can be related to a specific listing or offer for trade negotiations.',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Chat created successfully',
        type: chat_response_dto_1.ChatResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Recipient not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Cannot create chat with yourself',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chat_dto_1.CreateChatDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createChat", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get chat message history',
        description: 'Retrieve paginated message history for a specific chat conversation. Messages are returned in reverse chronological order (newest first).',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Page number (1-based)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Messages per page (max 100)' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat messages retrieved successfully',
        type: message_response_dto_1.MessageHistoryResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Chat not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Access denied to this chat',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatMessages", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send message to chat',
        description: 'Send a new message to a chat conversation. Supports text, images, documents, location sharing, and other media types. Nigerian users can communicate in local languages.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Message sent successfully',
        type: message_response_dto_1.MessageResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Chat not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Access denied to this chat',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Rate limit exceeded or invalid message content',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_message_dto_1.SendMessageDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)(':id/messages/text'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send text message (simplified)',
        description: 'Simplified endpoint for sending text messages. Popular among Nigerian users for quick trade negotiations.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Text message sent successfully',
        type: message_response_dto_1.MessageResponse,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_message_dto_1.SendTextMessageDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendTextMessage", null);
__decorate([
    (0, common_1.Post)(':id/messages/location'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send location message',
        description: 'Share location for meetup coordination. Essential for Nigerian users arranging physical trade exchanges.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Location message sent successfully',
        type: message_response_dto_1.MessageResponse,
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, send_message_dto_1.SendLocationMessageDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendLocationMessage", null);
__decorate([
    (0, common_1.Post)(':id/media'),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload media to chat',
        description: 'Upload and send media files (images, documents, audio) to a chat conversation. Supports Nigerian Naira receipt uploads and product images.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'Media uploaded and message sent successfully',
        type: message_response_dto_1.MessageResponse,
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.BAD_REQUEST,
        description: 'Invalid file type or size',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "uploadChatMedia", null);
__decorate([
    (0, common_1.Put)(':id/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark messages as read',
        description: 'Mark messages in a chat as read by the current user. Helps track conversation progress in trade negotiations.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Messages marked as read successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Chat not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Access denied to this chat',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, send_message_dto_1.BulkMarkReadDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Put)(':id/messages/:messageId/read'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mark specific message as read',
        description: 'Mark a specific message as read by the current user.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiParam)({ name: 'messageId', description: 'Message ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Message marked as read successfully',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('messageId', common_1.ParseUUIDPipe)),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markSingleMessageAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Delete/leave chat',
        description: 'Delete or leave a chat conversation. This will hide the chat from the user\'s chat list but preserve the conversation for other participants.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Chat deleted successfully',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'Chat not found',
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.FORBIDDEN,
        description: 'Access denied to this chat',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteChat", null);
__decorate([
    (0, common_1.Put)(':id/typing/start'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start typing indicator',
        description: 'Notify other participants that the user is typing. Creates a real-time typing indicator familiar to WhatsApp users.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Typing indicator started',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "startTyping", null);
__decorate([
    (0, common_1.Put)(':id/typing/stop'),
    (0, swagger_1.ApiOperation)({
        summary: 'Stop typing indicator',
        description: 'Notify other participants that the user has stopped typing.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Chat ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Typing indicator stopped',
    }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "stopTyping", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('Chat'),
    (0, common_1.Controller)('api/v1/chats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map