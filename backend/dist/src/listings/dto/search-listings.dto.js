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
exports.SearchListingsDto = exports.SortByFilter = exports.TradeTypeFilter = exports.ListingCategoryFilter = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ListingCategoryFilter;
(function (ListingCategoryFilter) {
    ListingCategoryFilter["ELECTRONICS"] = "ELECTRONICS";
    ListingCategoryFilter["FASHION"] = "FASHION";
    ListingCategoryFilter["VEHICLES"] = "VEHICLES";
    ListingCategoryFilter["HOME_GARDEN"] = "HOME_GARDEN";
    ListingCategoryFilter["BOOKS_MEDIA"] = "BOOKS_MEDIA";
    ListingCategoryFilter["HEALTH_BEAUTY"] = "HEALTH_BEAUTY";
    ListingCategoryFilter["SPORTS_RECREATION"] = "SPORTS_RECREATION";
    ListingCategoryFilter["BABY_KIDS"] = "BABY_KIDS";
    ListingCategoryFilter["AUTOMOTIVE"] = "AUTOMOTIVE";
    ListingCategoryFilter["TOYS_GAMES"] = "TOYS_GAMES";
    ListingCategoryFilter["AGRICULTURE"] = "AGRICULTURE";
    ListingCategoryFilter["SERVICES"] = "SERVICES";
    ListingCategoryFilter["ART_CRAFTS"] = "ART_CRAFTS";
    ListingCategoryFilter["MUSICAL_INSTRUMENTS"] = "MUSICAL_INSTRUMENTS";
    ListingCategoryFilter["FURNITURE"] = "FURNITURE";
    ListingCategoryFilter["APPLIANCES"] = "APPLIANCES";
    ListingCategoryFilter["JEWELRY"] = "JEWELRY";
    ListingCategoryFilter["FOOD_BEVERAGES"] = "FOOD_BEVERAGES";
    ListingCategoryFilter["TOOLS"] = "TOOLS";
    ListingCategoryFilter["OTHER"] = "OTHER";
})(ListingCategoryFilter || (exports.ListingCategoryFilter = ListingCategoryFilter = {}));
var TradeTypeFilter;
(function (TradeTypeFilter) {
    TradeTypeFilter["SWAP"] = "swap";
    TradeTypeFilter["CASH"] = "cash";
    TradeTypeFilter["HYBRID"] = "hybrid";
})(TradeTypeFilter || (exports.TradeTypeFilter = TradeTypeFilter = {}));
var SortByFilter;
(function (SortByFilter) {
    SortByFilter["NEWEST"] = "newest";
    SortByFilter["PRICE_ASC"] = "price_asc";
    SortByFilter["PRICE_DESC"] = "price_desc";
    SortByFilter["RELEVANCE"] = "relevance";
    SortByFilter["MOST_VIEWED"] = "most_viewed";
})(SortByFilter || (exports.SortByFilter = SortByFilter = {}));
class SearchListingsDto {
    q;
    category;
    minPrice;
    maxPrice;
    location;
    tradeType;
    sortBy = SortByFilter.NEWEST;
    page = 1;
    limit = 20;
    userId;
    excludeUserId;
}
exports.SearchListingsDto = SearchListingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingCategoryFilter, { message: 'Invalid category' }),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Minimum price must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Minimum price must be positive' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "minPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Maximum price must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Maximum price must be positive' }),
    (0, class_validator_1.Max)(100000000, { message: 'Maximum price cannot exceed 1,000,000 Naira' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "maxPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(TradeTypeFilter, { message: 'Invalid trade type' }),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "tradeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SortByFilter, { message: 'Invalid sort option' }),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "sortBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Page must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Page must be at least 1' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Limit must be a valid number' }),
    (0, class_validator_1.Min)(1, { message: 'Limit must be at least 1' }),
    (0, class_validator_1.Max)(50, { message: 'Limit cannot exceed 50' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], SearchListingsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SearchListingsDto.prototype, "excludeUserId", void 0);
//# sourceMappingURL=search-listings.dto.js.map