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
exports.ListingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const aws_s3_service_1 = require("./aws-s3.service");
const dto_1 = require("./dto");
let ListingsService = class ListingsService {
    prisma;
    awsS3Service;
    constructor(prisma, awsS3Service) {
        this.prisma = prisma;
        this.awsS3Service = awsS3Service;
    }
    formatPrice(priceInKobo) {
        if (!priceInKobo || priceInKobo === 0)
            return undefined;
        const naira = priceInKobo / 100;
        return `₦${naira.toLocaleString('en-NG')}`;
    }
    async getOwnerInfo(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                displayName: true,
                profileImageUrl: true,
                isPhoneVerified: true,
                receivedReviews: {
                    select: { rating: true },
                },
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const totalReviews = user.receivedReviews.length;
        const averageRating = totalReviews > 0
            ? user.receivedReviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
            : 0;
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            profileImageUrl: user.profileImageUrl,
            isPhoneVerified: user.isPhoneVerified,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
        };
    }
    async formatListingResponse(listing, currentUserId) {
        const owner = await this.getOwnerInfo(listing.userId);
        const images = listing.media?.map((media) => media.url) || [];
        let isFavorite = false;
        if (currentUserId) {
            const favorite = await this.prisma.favorite.findUnique({
                where: {
                    userId_listingId: {
                        userId: currentUserId,
                        listingId: listing.id,
                    },
                },
            });
            isFavorite = !!favorite;
        }
        return {
            id: listing.id,
            title: listing.title,
            description: listing.description,
            category: listing.category,
            subcategory: listing.subcategory,
            condition: listing.condition,
            price: listing.priceInKobo,
            displayPrice: this.formatPrice(listing.priceInKobo),
            isSwapOnly: listing.isSwapOnly,
            acceptsCash: listing.acceptsCash,
            acceptsSwap: listing.acceptsSwap,
            swapPreferences: listing.swapPreferences,
            city: listing.city,
            state: listing.state,
            specificLocation: listing.specificLocation,
            status: listing.status,
            images,
            owner,
            createdAt: listing.createdAt.toISOString(),
            updatedAt: listing.updatedAt.toISOString(),
            viewCount: listing.viewCount,
            favoriteCount: listing.favoriteCount,
            isFavorite,
            isOwner: listing.userId === currentUserId,
        };
    }
    async createListing(userId, createListingDto) {
        if (!createListingDto.acceptsCash && !createListingDto.acceptsSwap) {
            throw new common_1.BadRequestException('Listing must accept either cash or swap');
        }
        let finalPrice = createListingDto.priceInKobo;
        if (createListingDto.isSwapOnly) {
            finalPrice = undefined;
        }
        else if (createListingDto.acceptsCash && !finalPrice) {
            throw new common_1.BadRequestException('Cash listings must have a price');
        }
        const listing = await this.prisma.listing.create({
            data: {
                userId,
                title: createListingDto.title,
                description: createListingDto.description || '',
                category: createListingDto.category,
                subcategory: createListingDto.subcategory,
                condition: createListingDto.condition,
                priceInKobo: finalPrice,
                isSwapOnly: createListingDto.isSwapOnly || false,
                acceptsCash: createListingDto.acceptsCash ?? true,
                acceptsSwap: createListingDto.acceptsSwap ?? true,
                swapPreferences: createListingDto.swapPreferences || [],
                city: createListingDto.city,
                state: createListingDto.state,
                specificLocation: createListingDto.specificLocation,
                status: 'ACTIVE',
            },
            include: {
                media: true,
            },
        });
        return this.formatListingResponse(listing, userId);
    }
    async createListingWithImages(userId, createListingDto, files) {
        if (!createListingDto.acceptsCash && !createListingDto.acceptsSwap) {
            throw new common_1.BadRequestException('Listing must accept either cash or swap');
        }
        let finalPrice = createListingDto.priceInKobo;
        if (createListingDto.isSwapOnly) {
            finalPrice = undefined;
        }
        else if (createListingDto.acceptsCash && !finalPrice) {
            throw new common_1.BadRequestException('Cash listings must have a price');
        }
        if (files && files.length > 6) {
            throw new common_1.BadRequestException('Maximum 6 images allowed per listing');
        }
        const result = await this.prisma.$transaction(async (prisma) => {
            const listing = await prisma.listing.create({
                data: {
                    userId,
                    title: createListingDto.title,
                    description: createListingDto.description || '',
                    category: createListingDto.category,
                    subcategory: createListingDto.subcategory,
                    condition: createListingDto.condition,
                    priceInKobo: finalPrice,
                    isSwapOnly: createListingDto.isSwapOnly || false,
                    acceptsCash: createListingDto.acceptsCash ?? true,
                    acceptsSwap: createListingDto.acceptsSwap ?? true,
                    swapPreferences: createListingDto.swapPreferences || [],
                    city: createListingDto.city,
                    state: createListingDto.state,
                    specificLocation: createListingDto.specificLocation,
                    status: 'ACTIVE',
                },
            });
            if (files && files.length > 0) {
                const mediaRecords = [];
                for (const file of files) {
                    if (file.size > 5 * 1024 * 1024) {
                        throw new common_1.BadRequestException('File size cannot exceed 5MB');
                    }
                    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
                    if (!allowedTypes.includes(file.mimetype)) {
                        throw new common_1.BadRequestException('Only JPEG, PNG, and WebP images are allowed');
                    }
                    const s3Result = await this.awsS3Service.uploadFile(file, 'listings');
                    mediaRecords.push({
                        filename: s3Result.filename,
                        originalName: file.originalname,
                        mimeType: file.mimetype,
                        size: file.size,
                        url: s3Result.url,
                        storageKey: s3Result.key,
                        listingId: listing.id,
                        userId: userId,
                    });
                }
                if (mediaRecords.length > 0) {
                    await prisma.media.createMany({
                        data: mediaRecords,
                    });
                }
            }
            return prisma.listing.findUnique({
                where: { id: listing.id },
                include: { media: true },
            });
        });
        if (!result) {
            throw new common_1.BadRequestException('Failed to create listing');
        }
        return this.formatListingResponse(result, userId);
    }
    async getListingById(id, currentUserId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            include: {
                media: true,
            },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (currentUserId !== listing.userId) {
            await this.prisma.listing.update({
                where: { id },
                data: { viewCount: { increment: 1 } },
            });
            listing.viewCount += 1;
        }
        return this.formatListingResponse(listing, currentUserId);
    }
    async updateListing(id, userId, updateListingDto) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            select: { id: true, userId: true, isActive: true },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only update your own listings');
        }
        let finalPrice = updateListingDto.priceInKobo;
        if (updateListingDto.isSwapOnly) {
            finalPrice = undefined;
        }
        else if (updateListingDto.acceptsCash && !finalPrice && finalPrice !== 0) {
            throw new common_1.BadRequestException('Cash listings must have a price');
        }
        const updatedListing = await this.prisma.listing.update({
            where: { id },
            data: {
                ...updateListingDto,
                priceInKobo: finalPrice,
                category: updateListingDto.category,
                condition: updateListingDto.condition,
                status: updateListingDto.status,
            },
            include: {
                media: true,
            },
        });
        return this.formatListingResponse(updatedListing, userId);
    }
    async deleteListing(id, userId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id },
            select: { id: true, userId: true, isActive: true },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own listings');
        }
        await this.prisma.listing.update({
            where: { id },
            data: {
                isActive: false,
                status: 'REMOVED',
            },
        });
        return { message: 'Listing deleted successfully' };
    }
    async searchListings(searchDto, currentUserId) {
        const { q, category, minPrice, maxPrice, location, tradeType, sortBy = dto_1.SortByFilter.NEWEST, page = 1, limit = 20, userId: filterUserId, } = searchDto;
        const skip = (page - 1) * limit;
        const where = {
            isActive: true,
            status: 'ACTIVE',
        };
        if (q) {
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = category;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.priceInKobo = {};
            if (minPrice !== undefined)
                where.priceInKobo.gte = minPrice;
            if (maxPrice !== undefined)
                where.priceInKobo.lte = maxPrice;
        }
        if (location) {
            where.OR = where.OR || [];
            where.OR.push({ city: { contains: location, mode: 'insensitive' } }, { state: { contains: location, mode: 'insensitive' } });
        }
        if (tradeType) {
            switch (tradeType) {
                case dto_1.TradeTypeFilter.SWAP:
                    where.acceptsSwap = true;
                    break;
                case dto_1.TradeTypeFilter.CASH:
                    where.acceptsCash = true;
                    break;
                case dto_1.TradeTypeFilter.HYBRID:
                    where.AND = [
                        { acceptsCash: true },
                        { acceptsSwap: true }
                    ];
                    break;
            }
        }
        if (filterUserId) {
            where.userId = filterUserId;
        }
        const orderBy = {};
        switch (sortBy) {
            case dto_1.SortByFilter.NEWEST:
                orderBy.createdAt = 'desc';
                break;
            case dto_1.SortByFilter.PRICE_ASC:
                orderBy.priceInKobo = 'asc';
                break;
            case dto_1.SortByFilter.PRICE_DESC:
                orderBy.priceInKobo = 'desc';
                break;
            case dto_1.SortByFilter.MOST_VIEWED:
                orderBy.viewCount = 'desc';
                break;
            default:
                orderBy.createdAt = 'desc';
        }
        const [listings, total] = await Promise.all([
            this.prisma.listing.findMany({
                where,
                include: {
                    media: true,
                },
                orderBy,
                skip,
                take: limit,
            }),
            this.prisma.listing.count({ where }),
        ]);
        const formattedListings = await Promise.all(listings.map(listing => this.formatListingResponse(listing, currentUserId)));
        const totalPages = Math.ceil(total / limit);
        return {
            listings: formattedListings,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
            filters: {
                category,
                minPrice,
                maxPrice,
                location,
                tradeType,
            },
        };
    }
    async toggleFavorite(listingId, userId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { id: true, isActive: true },
        });
        if (!listing || !listing.isActive) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const existingFavorite = await this.prisma.favorite.findUnique({
            where: {
                userId_listingId: {
                    userId,
                    listingId,
                },
            },
        });
        if (existingFavorite) {
            await this.prisma.$transaction([
                this.prisma.favorite.delete({
                    where: { id: existingFavorite.id },
                }),
                this.prisma.listing.update({
                    where: { id: listingId },
                    data: { favoriteCount: { decrement: 1 } },
                }),
            ]);
            return { isFavorite: false, message: 'Removed from favorites' };
        }
        else {
            await this.prisma.$transaction([
                this.prisma.favorite.create({
                    data: { userId, listingId },
                }),
                this.prisma.listing.update({
                    where: { id: listingId },
                    data: { favoriteCount: { increment: 1 } },
                }),
            ]);
            return { isFavorite: true, message: 'Added to favorites' };
        }
    }
    async getUserListings(userId, currentUserId) {
        const listings = await this.prisma.listing.findMany({
            where: {
                userId,
                isActive: true,
            },
            include: {
                media: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return Promise.all(listings.map(listing => this.formatListingResponse(listing, currentUserId)));
    }
};
exports.ListingsService = ListingsService;
exports.ListingsService = ListingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        aws_s3_service_1.AwsS3Service])
], ListingsService);
//# sourceMappingURL=listings.service.js.map