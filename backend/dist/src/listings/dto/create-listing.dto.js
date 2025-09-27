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
exports.CreateListingDto = exports.ItemCondition = exports.ListingCategory = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var ListingCategory;
(function (ListingCategory) {
    ListingCategory["ELECTRONICS"] = "ELECTRONICS";
    ListingCategory["FASHION"] = "FASHION";
    ListingCategory["VEHICLES"] = "VEHICLES";
    ListingCategory["HOME_GARDEN"] = "HOME_GARDEN";
    ListingCategory["BOOKS_MEDIA"] = "BOOKS_MEDIA";
    ListingCategory["HEALTH_BEAUTY"] = "HEALTH_BEAUTY";
    ListingCategory["SPORTS_RECREATION"] = "SPORTS_RECREATION";
    ListingCategory["BABY_KIDS"] = "BABY_KIDS";
    ListingCategory["AUTOMOTIVE"] = "AUTOMOTIVE";
    ListingCategory["TOYS_GAMES"] = "TOYS_GAMES";
    ListingCategory["AGRICULTURE"] = "AGRICULTURE";
    ListingCategory["SERVICES"] = "SERVICES";
    ListingCategory["ART_CRAFTS"] = "ART_CRAFTS";
    ListingCategory["MUSICAL_INSTRUMENTS"] = "MUSICAL_INSTRUMENTS";
    ListingCategory["FURNITURE"] = "FURNITURE";
    ListingCategory["APPLIANCES"] = "APPLIANCES";
    ListingCategory["JEWELRY"] = "JEWELRY";
    ListingCategory["FOOD_BEVERAGES"] = "FOOD_BEVERAGES";
    ListingCategory["TOOLS"] = "TOOLS";
    ListingCategory["OTHER"] = "OTHER";
})(ListingCategory || (exports.ListingCategory = ListingCategory = {}));
var ItemCondition;
(function (ItemCondition) {
    ItemCondition["NEW"] = "NEW";
    ItemCondition["LIKE_NEW"] = "LIKE_NEW";
    ItemCondition["GOOD"] = "GOOD";
    ItemCondition["FAIR"] = "FAIR";
    ItemCondition["POOR"] = "POOR";
})(ItemCondition || (exports.ItemCondition = ItemCondition = {}));
class CreateListingDto {
    title;
    description;
    category;
    subcategory;
    condition;
    priceInKobo;
    isSwapOnly = false;
    isCashOnly = false;
    acceptsCash = true;
    acceptsSwap = true;
    swapPreferences = [];
    city;
    state;
    specificLocation;
}
exports.CreateListingDto = CreateListingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(3, 100, { message: 'Title must be between 3 and 100 characters' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 2000, { message: 'Description must be between 1 and 2000 characters' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ListingCategory, { message: 'Invalid category' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50),
    __metadata("design:type", String)
], CreateListingDto.prototype, "subcategory", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ItemCondition, { message: 'Invalid condition' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "condition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Price must be a valid number' }),
    (0, class_validator_1.Min)(0, { message: 'Price must be a positive number' }),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (value === '' || value === null || value === undefined)
            return undefined;
        const parsed = parseFloat(value);
        if (isNaN(parsed))
            return undefined;
        return Math.round(parsed * 100);
    }),
    __metadata("design:type", Number)
], CreateListingDto.prototype, "priceInKobo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "isSwapOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "isCashOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "acceptsCash", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateListingDto.prototype, "acceptsSwap", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (!value)
            return [];
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [value];
            }
            catch {
                return [value];
            }
        }
        return Array.isArray(value) ? value : [value];
    }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.ArrayMaxSize)(10, { message: 'Maximum 10 swap preferences allowed' }),
    __metadata("design:type", Array)
], CreateListingDto.prototype, "swapPreferences", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50, { message: 'City is required' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "city", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 50, { message: 'State is required' }),
    __metadata("design:type", String)
], CreateListingDto.prototype, "state", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => value === '' ? undefined : value),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 200),
    __metadata("design:type", String)
], CreateListingDto.prototype, "specificLocation", void 0);
//# sourceMappingURL=create-listing.dto.js.map