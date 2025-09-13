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
exports.OnlineUsersDto = exports.UserPresenceDto = exports.TypingEventDto = exports.TypingStopDto = exports.TypingStartDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class TypingStartDto {
    chatId;
    userId;
}
exports.TypingStartDto = TypingStartDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID where user is typing' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingStartDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID who is typing (auto-filled from JWT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingStartDto.prototype, "userId", void 0);
class TypingStopDto {
    chatId;
    userId;
}
exports.TypingStopDto = TypingStopDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID where user stopped typing' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingStopDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID who stopped typing (auto-filled from JWT)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingStopDto.prototype, "userId", void 0);
class TypingEventDto {
    chatId;
    userId;
    isTyping;
    timestamp;
}
exports.TypingEventDto = TypingEventDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Chat ID where typing event occurred' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingEventDto.prototype, "chatId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID who is typing/stopped typing' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TypingEventDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether user is currently typing' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], TypingEventDto.prototype, "isTyping", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Timestamp of the typing event' }),
    __metadata("design:type", Date)
], TypingEventDto.prototype, "timestamp", void 0);
class UserPresenceDto {
    userId;
    isOnline;
    lastSeen;
    status;
}
exports.UserPresenceDto = UserPresenceDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UserPresenceDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether user is online' }),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UserPresenceDto.prototype, "isOnline", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Last seen timestamp if user is offline' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UserPresenceDto.prototype, "lastSeen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Current activity status' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserPresenceDto.prototype, "status", void 0);
class OnlineUsersDto {
    onlineUserIds;
    totalOnline;
}
exports.OnlineUsersDto = OnlineUsersDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Array of online user IDs', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.IsUUID)(undefined, { each: true }),
    __metadata("design:type", Array)
], OnlineUsersDto.prototype, "onlineUserIds", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count of online users' }),
    __metadata("design:type", Number)
], OnlineUsersDto.prototype, "totalOnline", void 0);
//# sourceMappingURL=typing-event.dto.js.map