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
exports.LeaveChatDto = exports.JoinChatDto = exports.CreateGroupChatDto = exports.CreateChatDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const chat_response_dto_1 = require("./chat-response.dto");
class CreateChatDto {
    type = chat_response_dto_1.ChatType.DIRECT;
    recipientId;
    initialMessage;
    listingId;
    offerId;
}
exports.CreateChatDto = CreateChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: chat_response_dto_1.ChatType,
        description: 'Type of chat to create',
        default: chat_response_dto_1.ChatType.DIRECT
    }),
    (0, class_validator_1.IsEnum)(chat_response_dto_1.ChatType),
    __metadata("design:type", String)
], CreateChatDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID of the chat recipient (for direct chats)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateChatDto.prototype, "recipientId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Initial message to send when creating the chat' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateChatDto.prototype, "initialMessage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Listing ID if this chat is related to a specific listing' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateChatDto.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Offer ID if this chat is related to a specific offer' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateChatDto.prototype, "offerId", void 0);
class CreateGroupChatDto {
    participantIds;
    name;
    description;
    listingId;
}
exports.CreateGroupChatDto = CreateGroupChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of participant user IDs', type: [String] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], CreateGroupChatDto.prototype, "participantIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Group chat name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Group chat description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Listing ID if this group chat is for a specific trade' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "listingId", void 0);
class JoinChatDto {
    chatId;
}
exports.JoinChatDto = JoinChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID to join' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], JoinChatDto.prototype, "chatId", void 0);
class LeaveChatDto {
    chatId;
}
exports.LeaveChatDto = LeaveChatDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID to leave' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], LeaveChatDto.prototype, "chatId", void 0);
//# sourceMappingURL=create-chat.dto.js.map