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
exports.BulkMarkReadDto = exports.MarkMessageReadDto = exports.SendLocationMessageDto = exports.SendTextMessageDto = exports.SendMessageDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const message_response_dto_1 = require("./message-response.dto");
class SendMessageDto {
    chatId;
    type = message_response_dto_1.MessageType.TEXT;
    content;
    mediaUrl;
    metadata;
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID to send message to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: message_response_dto_1.MessageType,
        description: 'Type of message being sent',
        default: message_response_dto_1.MessageType.TEXT
    }),
    (0, class_validator_1.IsEnum)(message_response_dto_1.MessageType),
    __metadata("design:type", String)
], SendMessageDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message content',
        minLength: 1,
        maxLength: 10000
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Media URL for image/video/audio/document messages' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Additional metadata for special message types (location coordinates, contact info, etc.)',
        example: { latitude: 6.5244, longitude: 3.3792, address: 'Lagos, Nigeria' }
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendMessageDto.prototype, "metadata", void 0);
class SendTextMessageDto {
    chatId;
    content;
}
exports.SendTextMessageDto = SendTextMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID to send message to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Text message content',
        minLength: 1,
        maxLength: 10000
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(1),
    (0, class_validator_1.MaxLength)(10000),
    __metadata("design:type", String)
], SendTextMessageDto.prototype, "content", void 0);
class SendLocationMessageDto {
    chatId;
    latitude;
    longitude;
    address;
}
exports.SendLocationMessageDto = SendLocationMessageDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID to send message to' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SendLocationMessageDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location latitude' }),
    __metadata("design:type", Number)
], SendLocationMessageDto.prototype, "latitude", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Location longitude' }),
    __metadata("design:type", Number)
], SendLocationMessageDto.prototype, "longitude", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Human readable address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendLocationMessageDto.prototype, "address", void 0);
class MarkMessageReadDto {
    messageId;
}
exports.MarkMessageReadDto = MarkMessageReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID to mark as read' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MarkMessageReadDto.prototype, "messageId", void 0);
class BulkMarkReadDto {
    messageIds;
}
exports.BulkMarkReadDto = BulkMarkReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of message IDs to mark as read', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], BulkMarkReadDto.prototype, "messageIds", void 0);
//# sourceMappingURL=send-message.dto.js.map