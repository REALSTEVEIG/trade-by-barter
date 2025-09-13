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
exports.ChatResponse = exports.ChatType = exports.ListingSummary = exports.MessageSummary = exports.UserSummary = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserSummary {
    id;
    firstName;
    lastName;
    displayName;
    profileImageUrl;
    lastActiveAt;
    isActive;
}
exports.UserSummary = UserSummary;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSummary.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSummary.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSummary.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserSummary.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserSummary.prototype, "profileImageUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserSummary.prototype, "lastActiveAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserSummary.prototype, "isActive", void 0);
class MessageSummary {
    id;
    content;
    messageType;
    senderId;
    createdAt;
    isRead;
}
exports.MessageSummary = MessageSummary;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageSummary.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageSummary.prototype, "content", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT', 'LOCATION'] }),
    __metadata("design:type", String)
], MessageSummary.prototype, "messageType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], MessageSummary.prototype, "senderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], MessageSummary.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], MessageSummary.prototype, "isRead", void 0);
class ListingSummary {
    id;
    title;
    priceInKobo;
    isSwapOnly;
    imageUrl;
}
exports.ListingSummary = ListingSummary;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ListingSummary.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ListingSummary.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Number)
], ListingSummary.prototype, "priceInKobo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ListingSummary.prototype, "isSwapOnly", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ListingSummary.prototype, "imageUrl", void 0);
var ChatType;
(function (ChatType) {
    ChatType["DIRECT"] = "DIRECT";
    ChatType["GROUP"] = "GROUP";
    ChatType["TRADE"] = "TRADE";
})(ChatType || (exports.ChatType = ChatType = {}));
class ChatResponse {
    id;
    type;
    participants;
    lastMessage;
    unreadCount;
    createdAt;
    updatedAt;
    lastMessageAt;
    isActive;
    listingId;
    offerId;
    listing;
}
exports.ChatResponse = ChatResponse;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ChatResponse.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ChatType }),
    __metadata("design:type", String)
], ChatResponse.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [UserSummary] }),
    __metadata("design:type", Array)
], ChatResponse.prototype, "participants", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: MessageSummary }),
    __metadata("design:type", MessageSummary)
], ChatResponse.prototype, "lastMessage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ChatResponse.prototype, "unreadCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ChatResponse.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ChatResponse.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ChatResponse.prototype, "lastMessageAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], ChatResponse.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ChatResponse.prototype, "listingId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], ChatResponse.prototype, "offerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: ListingSummary }),
    __metadata("design:type", ListingSummary)
], ChatResponse.prototype, "listing", void 0);
//# sourceMappingURL=chat-response.dto.js.map