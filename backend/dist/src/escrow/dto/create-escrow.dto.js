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
exports.CreateEscrowDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
class CreateEscrowDto {
    offerId;
    description;
    customAmountInKobo;
    releaseCondition;
}
exports.CreateEscrowDto = CreateEscrowDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the accepted offer to create escrow for',
        example: '550e8400-e29b-41d4-a716-446655440000',
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowDto.prototype, "offerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Optional description for the escrow',
        example: 'Escrow for iPhone 13 trade',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Custom escrow amount in kobo (overrides offer amount)',
        example: 500000,
        minimum: 10000,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(10000, { message: 'Minimum escrow amount is ₦100 (10,000 kobo)' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateEscrowDto.prototype, "customAmountInKobo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Release condition for the escrow',
        example: 'Both parties confirm trade completion',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEscrowDto.prototype, "releaseCondition", void 0);
//# sourceMappingURL=create-escrow.dto.js.map