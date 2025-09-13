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
exports.BulkMessageStatusDto = exports.MessageReadDto = exports.MessageDeliveredDto = exports.UpdateMessageStatusDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const message_response_dto_1 = require("./message-response.dto");
class UpdateMessageStatusDto {
    messageId;
    status;
    timestamp;
}
exports.UpdateMessageStatusDto = UpdateMessageStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID to update status for' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateMessageStatusDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: message_response_dto_1.MessageStatus,
        description: 'New status for the message'
    }),
    (0, class_validator_1.IsEnum)(message_response_dto_1.MessageStatus),
    __metadata("design:type", String)
], UpdateMessageStatusDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Timestamp when status changed' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], UpdateMessageStatusDto.prototype, "timestamp", void 0);
class MessageDeliveredDto {
    messageId;
    userId;
    deliveredAt;
}
exports.MessageDeliveredDto = MessageDeliveredDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID that was delivered' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MessageDeliveredDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who received the message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MessageDeliveredDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Delivery timestamp' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MessageDeliveredDto.prototype, "deliveredAt", void 0);
class MessageReadDto {
    messageId;
    userId;
    readAt;
}
exports.MessageReadDto = MessageReadDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Message ID that was read' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MessageReadDto.prototype, "messageId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who read the message' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], MessageReadDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Read timestamp' }),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], MessageReadDto.prototype, "readAt", void 0);
class BulkMessageStatusDto {
    messageIds;
    status;
}
exports.BulkMessageStatusDto = BulkMessageStatusDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of message IDs', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], BulkMessageStatusDto.prototype, "messageIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: message_response_dto_1.MessageStatus,
        description: 'Status to apply to all messages'
    }),
    (0, class_validator_1.IsEnum)(message_response_dto_1.MessageStatus),
    __metadata("design:type", String)
], BulkMessageStatusDto.prototype, "status", void 0);
//# sourceMappingURL=message-status.dto.js.map