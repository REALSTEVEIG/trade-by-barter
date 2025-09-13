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
exports.MessageHistoryResponse = exports.MessageResponse = exports.MessageType = exports.MessageStatus = exports.ReadReceipt = exports.MediaAttachment = void 0;
const swagger_1 = require("@nestjs/swagger");
const chat_response_dto_1 = require("./chat-response.dto");
class MediaAttachment {
    id;
    filename;
    originalName;
    mimeType;
    size;
    url;
    thumbnailUrl;
    uploadedAt;
}
exports.MediaAttachment = MediaAttachment;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "originalName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "mimeType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MediaAttachment.prototype, "size", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], MediaAttachment.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MediaAttachment.prototype, "uploadedAt", void 0);
class ReadReceipt {
    userId;
    readAt;
    user;
}
exports.ReadReceipt = ReadReceipt;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReadReceipt.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ReadReceipt.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: chat_response_dto_1.UserSummary }),
    __metadata("design:type", chat_response_dto_1.UserSummary)
], ReadReceipt.prototype, "user", void 0);
var MessageStatus;
(function (MessageStatus) {
    MessageStatus["SENT"] = "SENT";
    MessageStatus["DELIVERED"] = "DELIVERED";
    MessageStatus["READ"] = "READ";
})(MessageStatus || (exports.MessageStatus = MessageStatus = {}));
var MessageType;
(function (MessageType) {
    MessageType["TEXT"] = "TEXT";
    MessageType["IMAGE"] = "IMAGE";
    MessageType["AUDIO"] = "AUDIO";
    MessageType["VIDEO"] = "VIDEO";
    MessageType["DOCUMENT"] = "DOCUMENT";
    MessageType["LOCATION"] = "LOCATION";
    MessageType["SYSTEM"] = "SYSTEM";
})(MessageType || (exports.MessageType = MessageType = {}));
class MessageResponse {
    id;
    chatId;
    senderId;
    sender;
    type;
    content;
    mediaUrl;
    media;
    metadata;
    status;
    sentAt;
    readBy;
    isRead;
    readAt;
    isDeleted;
    createdAt;
    updatedAt;
}
exports.MessageResponse = MessageResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponse.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponse.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: chat_response_dto_1.UserSummary }),
    __metadata("design:type", chat_response_dto_1.UserSummary)
], MessageResponse.prototype, "sender", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MessageType }),
    __metadata("design:type", String)
], MessageResponse.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageResponse.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], MessageResponse.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: [MediaAttachment] }),
    __metadata("design:type", Array)
], MessageResponse.prototype, "media", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional message metadata (location, contact info, etc.)' }),
    __metadata("design:type", Object)
], MessageResponse.prototype, "metadata", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: MessageStatus }),
    __metadata("design:type", String)
], MessageResponse.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MessageResponse.prototype, "sentAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [ReadReceipt] }),
    __metadata("design:type", Array)
], MessageResponse.prototype, "readBy", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MessageResponse.prototype, "isRead", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Date)
], MessageResponse.prototype, "readAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MessageResponse.prototype, "isDeleted", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MessageResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MessageResponse.prototype, "updatedAt", void 0);
class MessageHistoryResponse {
    messages;
    total;
    page;
    limit;
    hasNext;
    hasPrev;
}
exports.MessageHistoryResponse = MessageHistoryResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [MessageResponse] }),
    __metadata("design:type", Array)
], MessageHistoryResponse.prototype, "messages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MessageHistoryResponse.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MessageHistoryResponse.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], MessageHistoryResponse.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MessageHistoryResponse.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MessageHistoryResponse.prototype, "hasPrev", void 0);
//# sourceMappingURL=message-response.dto.js.map