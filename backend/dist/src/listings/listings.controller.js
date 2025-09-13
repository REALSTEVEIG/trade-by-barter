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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const get_user_decorator_1 = require("../auth/decorators/get-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const listings_service_1 = require("./listings.service");
const upload_service_1 = require("./upload.service");
const dto_1 = require("./dto");
let ListingsController = class ListingsController {
    listingsService;
    uploadService;
    constructor(listingsService, uploadService) {
        this.listingsService = listingsService;
        this.uploadService = uploadService;
    }
    getCategories() {
        return [
            { value: 'ELECTRONICS', label: 'Electronics', description: 'Phones, laptops, gadgets', popular: true },
            { value: 'FASHION', label: 'Fashion', description: 'Clothing, shoes, accessories', popular: true },
            { value: 'VEHICLES', label: 'Vehicles', description: 'Cars, motorcycles, bicycles', popular: true },
            { value: 'HOME_GARDEN', label: 'Home & Garden', description: 'Furniture, appliances, decor', popular: true },
            { value: 'BOOKS_EDUCATION', label: 'Books & Education', description: 'Textbooks, stationery', popular: false },
            { value: 'HEALTH_BEAUTY', label: 'Health & Beauty', description: 'Cosmetics, skincare', popular: false },
            { value: 'SPORTS_RECREATION', label: 'Sports & Recreation', description: 'Equipment, fitness', popular: false },
            { value: 'BABY_KIDS', label: 'Baby & Kids', description: 'Toys, clothing, equipment', popular: false },
            { value: 'AGRICULTURE', label: 'Agriculture', description: 'Farm equipment, produce', popular: false },
            { value: 'SERVICES', label: 'Services', description: 'Professional services', popular: false },
            { value: 'ART_CRAFTS', label: 'Arts & Crafts', description: 'Handmade items, art supplies', popular: false },
            { value: 'MUSICAL_INSTRUMENTS', label: 'Musical Instruments', description: 'Instruments, equipment', popular: false },
            { value: 'FURNITURE', label: 'Furniture', description: 'Tables, chairs, beds', popular: false },
            { value: 'APPLIANCES', label: 'Appliances', description: 'Kitchen, home appliances', popular: false },
            { value: 'BOOKS', label: 'Books', description: 'Literature, textbooks', popular: false },
            { value: 'SPORTS', label: 'Sports', description: 'Sports equipment', popular: false },
            { value: 'TOYS', label: 'Toys', description: 'Children toys, games', popular: false },
            { value: 'BEAUTY', label: 'Beauty', description: 'Beauty products', popular: false },
            { value: 'OTHER', label: 'Other', description: 'Miscellaneous items', popular: false },
        ];
    }
    getLocations() {
        return [
            { state: 'Lagos', cities: ['Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Ikorodu', 'Alimosho'] },
            { state: 'Abuja (FCT)', cities: ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa'] },
            { state: 'Kano', cities: ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Nasarawa', 'Tarauni'] },
            { state: 'Oyo', cities: ['Ibadan', 'Ogbomoso', 'Oyo', 'Iseyin', 'Iwo', 'Saki'] },
            { state: 'Rivers', cities: ['Port Harcourt', 'Obio-Akpor', 'Okrika', 'Eleme', 'Ikwerre', 'Gokana'] },
            { state: 'Kaduna', cities: ['Kaduna North', 'Kaduna South', 'Chikun', 'Igabi', 'Ikara', 'Jaba'] },
            { state: 'Ogun', cities: ['Abeokuta North', 'Abeokuta South', 'Sagamu', 'Ijebu Ode', 'Ota', 'Ilaro'] },
            { state: 'Plateau', cities: ['Jos North', 'Jos South', 'Jos East', 'Barkin Ladi', 'Riyom', 'Bokkos'] },
            { state: 'Anambra', cities: ['Awka', 'Onitsha', 'Nnewi', 'Ihiala', 'Aguata', 'Anambra East'] },
            { state: 'Imo', cities: ['Owerri Municipal', 'Owerri North', 'Owerri West', 'Okigwe', 'Orlu', 'Orsu'] },
            { state: 'Enugu', cities: ['Enugu East', 'Enugu North', 'Enugu South', 'Nsukka', 'Udi', 'Awgu'] },
            { state: 'Abia', cities: ['Umuahia', 'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano'] },
            { state: 'Akwa Ibom', cities: ['Uyo', 'Ikot Ekpene', 'Eket', 'Oron', 'Abak', 'Etinan'] },
            { state: 'Bayelsa', cities: ['Yenagoa', 'Sagbama', 'Kolokuma/Opokuma', 'Ogbia', 'Nembe', 'Brass'] },
            { state: 'Cross River', cities: ['Calabar Municipal', 'Calabar South', 'Ikom', 'Ogoja', 'Obudu', 'Akamkpa'] },
            { state: 'Delta', cities: ['Warri', 'Asaba', 'Sapele', 'Ughelli', 'Agbor', 'Abraka'] },
            { state: 'Edo', cities: ['Benin City', 'Auchi', 'Ekpoma', 'Uromi', 'Ubiaja', 'Igarra'] },
            { state: 'Osun', cities: ['Osogbo', 'Ile-Ife', 'Ilesa', 'Ede', 'Iwo', 'Ikire'] },
            { state: 'Ondo', cities: ['Akure', 'Ondo', 'Owo', 'Ikare', 'Okitipupa', 'Ore'] },
            { state: 'Ekiti', cities: ['Ado-Ekiti', 'Ikole', 'Oye', 'Ijero', 'Efon', 'Ikere'] },
        ];
    }
    async getMyListings(userId) {
        return this.listingsService.getUserListings(userId, userId);
    }
    async getListingById(id, currentUserId) {
        return this.listingsService.getListingById(id, currentUserId);
    }
    async searchListings(searchDto, currentUserId) {
        return this.listingsService.searchListings(searchDto, currentUserId);
    }
    async createListing(userId, createListingDto) {
        return this.listingsService.createListing(userId, createListingDto);
    }
    async updateListing(id, userId, updateListingDto) {
        return this.listingsService.updateListing(id, userId, updateListingDto);
    }
    async deleteListing(id, userId) {
        return this.listingsService.deleteListing(id, userId);
    }
    async toggleFavorite(listingId, userId) {
        return this.listingsService.toggleFavorite(listingId, userId);
    }
    async uploadImages(listingId, userId, files) {
        if (!files || files.length === 0) {
            throw new Error('No files uploaded');
        }
        return this.uploadService.uploadListingImages(listingId, userId, files);
    }
    async deleteImage(listingId, imageId, userId) {
        return this.uploadService.deleteListingImage(listingId, imageId, userId);
    }
    async getListingImages(listingId) {
        const images = await this.uploadService.getListingImages(listingId);
        return { images };
    }
};
exports.ListingsController = ListingsController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get available listing categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ListingsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('locations'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get Nigerian states and major cities' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Locations retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ListingsController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)('my-listings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user\'s listings' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User listings retrieved successfully' }),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getMyListings", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get listing by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getListingById", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Search listings with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listings retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SearchListingsDto, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "searchListings", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new listing' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Listing created successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid input data' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, get_user_decorator_1.GetUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "createListing", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing updated successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to update this listing' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdateListingDto]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "updateListing", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Listing deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to delete this listing' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "deleteListing", null);
__decorate([
    (0, common_1.Post)(':id/favorite'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Toggle favorite status for listing' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Favorite status toggled successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Listing not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.Post)(':id/images'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images', 5, {
        limits: {
            fileSize: 5 * 1024 * 1024,
            files: 5,
        },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
                callback(new Error('Only image files are allowed!'), false);
            }
            else {
                callback(null, true);
            }
        },
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload images for listing' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Images uploaded successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid file format or size' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to upload images for this listing' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, get_user_decorator_1.GetUser)('id')),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "uploadImages", null);
__decorate([
    (0, common_1.Delete)(':id/images/:imageId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete listing image' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Image deleted successfully' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Not authorized to delete this image' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Image not found' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('imageId', common_1.ParseUUIDPipe)),
    __param(2, (0, get_user_decorator_1.GetUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "deleteImage", null);
__decorate([
    (0, common_1.Get)(':id/images'),
    (0, public_decorator_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get listing images' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Images retrieved successfully' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ListingsController.prototype, "getListingImages", null);
exports.ListingsController = ListingsController = __decorate([
    (0, swagger_1.ApiTags)('listings'),
    (0, common_1.Controller)('listings'),
    __metadata("design:paramtypes", [listings_service_1.ListingsService,
        upload_service_1.UploadService])
], ListingsController);
//# sourceMappingURL=listings.controller.js.map