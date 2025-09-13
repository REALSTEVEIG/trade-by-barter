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
exports.UpdateListingDto = exports.ListingStatus = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const class_validator_1 = require("class-validator");
const create_listing_dto_1 = require("./create-listing.dto");
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["DRAFT"] = "DRAFT";
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["SOLD"] = "SOLD";
    ListingStatus["PAUSED"] = "PAUSED";
    ListingStatus["EXPIRED"] = "EXPIRED";
    ListingStatus["REMOVED"] = "REMOVED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
class UpdateListingDto extends (0, mapped_types_1.PartialType)(create_listing_dto_1.CreateListingDto) {
    status;
}
exports.UpdateListingDto = UpdateListingDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ListingStatus, { message: 'Invalid status' }),
    __metadata("design:type", String)
], UpdateListingDto.prototype, "status", void 0);
//# sourceMappingURL=update-listing.dto.js.map