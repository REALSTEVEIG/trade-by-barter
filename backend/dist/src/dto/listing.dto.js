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
exports.PaginationMetaDto = exports.PaginatedListingsDto = exports.SearchListingsDto = exports.UserSummaryDto = exports.CategoryResponseDto = exports.ListingResponseDto = exports.UpdateListingDto = exports.CreateListingDto = exports.ListingStatus = exports.ListingCondition = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var ListingCondition;
(function (ListingCondition) {
    ListingCondition["NEW"] = "new";
    ListingCondition["LIKE_NEW"] = "like_new";
    ListingCondition["GOOD"] = "good";
    ListingCondition["FAIR"] = "fair";
    ListingCondition["POOR"] = "poor";
})(ListingCondition || (exports.ListingCondition = ListingCondition = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "active";
    ListingStatus["PENDING"] = "pending";
    ListingStatus["TRADED"] = "traded";
    ListingStatus["EXPIRED"] = "expired";
    ListingStatus["SUSPENDED"] = "suspended";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
class CreateListingDto {
    title;
    description;
    categoryId;
    condition;
    estimatedValue;
    location;
    images;
    lookingFor;
    tags;
    allowCashOffers;
    allowPartialTrade;
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product title',
        example: 'iPhone 13 Pro Max 256GB - Space Gray',
        maxLength: 100
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Detailed product description',
        example: 'Excellent condition iPhone 13 Pro Max with original box, charger, and screen protector applied. Used for 6 months, no scratches or damages.',
        maxLength: 2000
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category ID',
        example: 'cat_electronics_001'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product condition',
        enum: ListingCondition,
        example: ListingCondition.LIKE_NEW
    }),
    (0, class_validator_1.IsEnum)(ListingCondition),
    __metadata("design:type", String)
], CreateListingDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated value in Nigerian Naira',
        example: 450000,
        minimum: 1000,
        maximum: 50000000
    }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(50000000),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nigerian location for the item',
        example: 'Lagos Island, Lagos'
    }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateListingDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of image URLs',
        example: [
            'https://cdn.tradebybarter.ng/listings/img1.jpg',
            'https://cdn.tradebybarter.ng/listings/img2.jpg'
        ],
        type: [String]
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Items the owner is looking to trade for',
        example: 'MacBook Pro, gaming console, or cash equivalent',
        maxLength: 500
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], CreateListingDto.prototype, "lookingFor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Tags for better searchability',
        example: ['electronics', 'smartphone', 'apple', 'ios'],
        type: [String]
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to allow cash offers',
        example: true,
        default: true
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "allowCashOffers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether to allow partial trades',
        example: false,
        default: false
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "allowPartialTrade", void 0);
class UpdateListingDto {
    title;
    description;
    condition;
    estimatedValue;
    lookingFor;
    tags;
    allowCashOffers;
    allowPartialTrade;
}
exports.UpdateListingDto = UpdateListingDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product title',
        example: 'iPhone 13 Pro Max 256GB - Space Gray (Price Reduced!)'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product description'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product condition',
        enum: ListingCondition
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingCondition),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Estimated value in Naira'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1000),
    (0, class_validator_1.Max)(50000000),
    __metadata("design:type", Number)
], UpdateListingDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'What the owner is looking for'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(500),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "lookingFor", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Updated tags'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], UpdateListingDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Allow cash offers'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateListingDto.prototype, "allowCashOffers", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Allow partial trades'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateListingDto.prototype, "allowPartialTrade", void 0);
class ListingResponseDto {
    id;
    title;
    description;
    category;
    condition;
    estimatedValue;
    location;
    images;
    lookingFor;
    tags;
    status;
    owner;
    viewCount;
    offerCount;
    isFavorited;
    allowCashOffers;
    allowPartialTrade;
    createdAt;
    updatedAt;
    expiresAt;
}
exports.ListingResponseDto = ListingResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique listing identifier',
        example: 'lst_123456789'
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product title',
        example: 'iPhone 13 Pro Max 256GB - Space Gray'
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product description',
        example: 'Excellent condition iPhone 13 Pro Max...'
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category information',
        type: () => CategoryResponseDto
    }),
    __metadata("design:type", CategoryResponseDto)
], ListingResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Product condition',
        enum: ListingCondition,
        example: ListingCondition.LIKE_NEW
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Estimated value in Naira',
        example: 450000
    }),
    __metadata("design:type", Number)
], ListingResponseDto.prototype, "estimatedValue", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nigerian location',
        example: 'Lagos Island, Lagos'
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of image URLs',
        example: ['https://cdn.tradebybarter.ng/listings/img1.jpg']
    }),
    __metadata("design:type", Array)
], ListingResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'What owner is looking for',
        example: 'MacBook Pro or cash equivalent'
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "lookingFor", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing tags',
        example: ['electronics', 'smartphone']
    }),
    __metadata("design:type", Array)
], ListingResponseDto.prototype, "tags", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing status',
        enum: ListingStatus,
        example: ListingStatus.ACTIVE
    }),
    __metadata("design:type", String)
], ListingResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Owner information',
        type: () => UserSummaryDto
    }),
    __metadata("design:type", UserSummaryDto)
], ListingResponseDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of views',
        example: 245
    }),
    __metadata("design:type", Number)
], ListingResponseDto.prototype, "viewCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Number of barter offers received',
        example: 12
    }),
    __metadata("design:type", Number)
], ListingResponseDto.prototype, "offerCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether current user has favorited this listing',
        example: false
    }),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "isFavorited", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether cash offers are allowed',
        example: true
    }),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "allowCashOffers", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether partial trades are allowed',
        example: false
    }),
    __metadata("design:type", Boolean)
], ListingResponseDto.prototype, "allowPartialTrade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing creation timestamp',
        example: '2024-03-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], ListingResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last update timestamp',
        example: '2024-03-20T14:45:00Z'
    }),
    __metadata("design:type", Date)
], ListingResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Listing expiry date',
        example: '2024-06-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], ListingResponseDto.prototype, "expiresAt", void 0);
class CategoryResponseDto {
    id;
    name;
    icon;
}
exports.CategoryResponseDto = CategoryResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category ID',
        example: 'cat_electronics_001'
    }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category name',
        example: 'Electronics'
    }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Category icon URL',
        example: 'https://cdn.tradebybarter.ng/icons/electronics.svg'
    }),
    __metadata("design:type", String)
], CategoryResponseDto.prototype, "icon", void 0);
class UserSummaryDto {
    id;
    fullName;
    profilePicture;
    location;
    reputationScore;
    isVerified;
    memberSince;
}
exports.UserSummaryDto = UserSummaryDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User ID',
        example: 'usr_123456789'
    }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Full name',
        example: 'Adebayo Oladimeji'
    }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profile picture URL',
        example: 'https://cdn.tradebybarter.ng/profiles/usr_123456789.jpg'
    }),
    __metadata("design:type", Object)
], UserSummaryDto.prototype, "profilePicture", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User location',
        example: 'Lagos'
    }),
    __metadata("design:type", String)
], UserSummaryDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reputation score',
        example: 95
    }),
    __metadata("design:type", Number)
], UserSummaryDto.prototype, "reputationScore", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether user is verified',
        example: true
    }),
    __metadata("design:type", Boolean)
], UserSummaryDto.prototype, "isVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Member since date',
        example: '2024-01-15T10:30:00Z'
    }),
    __metadata("design:type", Date)
], UserSummaryDto.prototype, "memberSince", void 0);
class SearchListingsDto {
    q;
    categoryId;
    location;
    minPrice;
    maxPrice;
    condition;
    sortBy;
    sortOrder;
    page;
    limit;
}
exports.SearchListingsDto = SearchListingsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Search query',
        example: 'iPhone MacBook electronics'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Category ID to filter by',
        example: 'cat_electronics_001'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Nigerian location filter',
        example: 'Lagos'
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Minimum price in Naira',
        example: 50000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "minPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Maximum price in Naira',
        example: 500000
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Max)(50000000),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "maxPrice", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Product condition filter',
        enum: ListingCondition
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingCondition),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "condition", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort by field',
        example: 'createdAt',
        enum: ['createdAt', 'updatedAt', 'price', 'views', 'offers']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "sortBy", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sort order',
        example: 'desc',
        enum: ['asc', 'desc']
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "sortOrder", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Items per page',
        example: 20,
        minimum: 1,
        maximum: 100
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "limit", void 0);
class PaginatedListingsDto {
    data;
    meta;
}
exports.PaginatedListingsDto = PaginatedListingsDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Array of listings',
        type: [ListingResponseDto]
    }),
    __metadata("design:type", Array)
], PaginatedListingsDto.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Pagination metadata',
        type: () => PaginationMetaDto
    }),
    __metadata("design:type", PaginationMetaDto)
], PaginatedListingsDto.prototype, "meta", void 0);
class PaginationMetaDto {
    page;
    limit;
    total;
    totalPages;
    hasNext;
    hasPrev;
}
exports.PaginationMetaDto = PaginationMetaDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Current page number',
        example: 1
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Items per page',
        example: 20
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of items',
        example: 150
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Total number of pages',
        example: 8
    }),
    __metadata("design:type", Number)
], PaginationMetaDto.prototype, "totalPages", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a next page',
        example: true
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasNext", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether there is a previous page',
        example: false
    }),
    __metadata("design:type", Boolean)
], PaginationMetaDto.prototype, "hasPrev", void 0);
//# sourceMappingURL=listing.dto.js.map