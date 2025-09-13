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
exports.OffersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const offer_types_1 = require("./dto/offer-types");
let OffersService = class OffersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    formatPrice(priceInKobo) {
        if (!priceInKobo || priceInKobo === 0)
            return undefined;
        const naira = priceInKobo / 100;
        return `₦${naira.toLocaleString('en-NG')}`;
    }
    async getUserSummary(userId) {
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
            displayName: user.displayName || undefined,
            profileImageUrl: user.profileImageUrl || undefined,
            isPhoneVerified: user.isPhoneVerified,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews,
        };
    }
    async getListingSummary(listingId) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                media: true,
                user: {
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
                },
            },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        const owner = await this.getUserSummary(listing.userId);
        const images = listing.media?.map((media) => media.url) || [];
        return {
            id: listing.id,
            title: listing.title,
            category: listing.category,
            condition: listing.condition,
            price: listing.priceInKobo || undefined,
            displayPrice: this.formatPrice(listing.priceInKobo || undefined),
            images,
            owner,
        };
    }
    async formatOfferResponse(offer, currentUserId) {
        const listing = {
            id: offer.listing.id,
            title: offer.listing.title,
            owner: await this.getUserSummary(offer.listing.userId),
        };
        const offerer = await this.getUserSummary(offer.senderId);
        let offeredListings = [];
        if (offer.offeredListings && offer.offeredListings.length > 0) {
            offeredListings = await Promise.all(offer.offeredListings.map((ol) => this.getListingSummary(ol.listingId)));
        }
        let counterOffers = [];
        if (offer.counterOffers && offer.counterOffers.length > 0) {
            counterOffers = await Promise.all(offer.counterOffers.map((co) => this.formatOfferResponse(co, currentUserId)));
        }
        return {
            id: offer.id,
            type: offer.offerType,
            status: offer.status,
            cashAmount: offer.cashAmountInKobo,
            displayCashAmount: this.formatPrice(offer.cashAmountInKobo),
            message: offer.message,
            expiresAt: offer.expiresAt,
            createdAt: offer.createdAt,
            listing,
            offerer,
            offeredListings: offeredListings.length > 0 ? offeredListings : undefined,
            parentOfferId: offer.parentOfferId,
            counterOffers: counterOffers.length > 0 ? counterOffers : undefined,
            isOfferer: offer.senderId === currentUserId,
            isListingOwner: offer.listing.userId === currentUserId,
        };
    }
    async createOffer(userId, createOfferDto) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: createOfferDto.listingId },
            select: {
                id: true,
                userId: true,
                isActive: true,
                status: true,
                acceptsCash: true,
                acceptsSwap: true,
                isSwapOnly: true,
                priceInKobo: true,
            },
        });
        if (!listing || !listing.isActive || listing.status !== 'ACTIVE') {
            throw new common_1.NotFoundException('Listing not found or is not available');
        }
        if (listing.userId === userId) {
            throw new common_1.BadRequestException('You cannot make an offer on your own listing');
        }
        this.validateOfferType(createOfferDto, listing);
        if (createOfferDto.offeredListingIds && createOfferDto.offeredListingIds.length > 0) {
            await this.validateOfferedListings(userId, createOfferDto.offeredListingIds);
        }
        const existingOffer = await this.prisma.offer.findFirst({
            where: {
                senderId: userId,
                listingId: createOfferDto.listingId,
                status: 'PENDING',
            },
        });
        if (existingOffer) {
            throw new common_1.ConflictException('You already have a pending offer on this listing');
        }
        const expiresAt = createOfferDto.expiresAt
            ? new Date(createOfferDto.expiresAt)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const offerData = {
            offerType: createOfferDto.type,
            cashAmountInKobo: createOfferDto.cashAmount,
            message: createOfferDto.message,
            expiresAt,
            senderId: userId,
            receiverId: listing.userId,
            listingId: createOfferDto.listingId,
        };
        const offer = await this.prisma.offer.create({
            data: offerData,
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        if (createOfferDto.offeredListingIds && createOfferDto.offeredListingIds.length > 0) {
            await this.prisma.offerListing.createMany({
                data: createOfferDto.offeredListingIds.map(listingId => ({
                    offerId: offer.id,
                    listingId,
                })),
            });
            const updatedOffer = await this.prisma.offer.findUnique({
                where: { id: offer.id },
                include: {
                    listing: {
                        include: {
                            user: true,
                        },
                    },
                    offeredListings: {
                        include: {
                            listing: {
                                include: {
                                    media: true,
                                    user: true,
                                },
                            },
                        },
                    },
                },
            });
            await this.createOfferNotification(updatedOffer, 'OFFER_RECEIVED');
            return this.formatOfferResponse(updatedOffer, userId);
        }
        await this.createOfferNotification(offer, 'OFFER_RECEIVED');
        return this.formatOfferResponse(offer, userId);
    }
    validateOfferType(createOfferDto, listing) {
        const { type, cashAmount, offeredListingIds } = createOfferDto;
        if ((type === offer_types_1.OfferType.CASH || type === offer_types_1.OfferType.HYBRID) && !cashAmount) {
            throw new common_1.BadRequestException(`Cash amount is required for ${type} offers`);
        }
        if ((type === offer_types_1.OfferType.SWAP || type === offer_types_1.OfferType.HYBRID) && (!offeredListingIds || offeredListingIds.length === 0)) {
            throw new common_1.BadRequestException(`Offered listings are required for ${type} offers`);
        }
        if (type === offer_types_1.OfferType.CASH && !listing.acceptsCash) {
            throw new common_1.BadRequestException('This listing does not accept cash offers');
        }
        if ((type === offer_types_1.OfferType.SWAP || type === offer_types_1.OfferType.HYBRID) && !listing.acceptsSwap) {
            throw new common_1.BadRequestException('This listing does not accept swap offers');
        }
        if (listing.isSwapOnly && type === offer_types_1.OfferType.CASH) {
            throw new common_1.BadRequestException('This is a swap-only listing');
        }
        if (cashAmount && (cashAmount < 100 || cashAmount > 100000000000)) {
            throw new common_1.BadRequestException('Cash amount must be between ₦1 and ₦1,000,000,000');
        }
    }
    async validateOfferedListings(userId, listingIds) {
        const listings = await this.prisma.listing.findMany({
            where: {
                id: { in: listingIds },
                userId,
                isActive: true,
                status: 'ACTIVE',
            },
        });
        if (listings.length !== listingIds.length) {
            throw new common_1.BadRequestException('One or more offered listings are not available or do not belong to you');
        }
    }
    async createOfferNotification(offer, type) {
        const titles = {
            OFFER_RECEIVED: 'New Offer Received',
            OFFER_ACCEPTED: 'Offer Accepted',
            OFFER_REJECTED: 'Offer Rejected',
            COUNTEROFFER_RECEIVED: 'Counter-offer Received',
            OFFER_EXPIRED: 'Offer Expired',
            OFFER_WITHDRAWN: 'Offer Withdrawn',
        };
        const messages = {
            OFFER_RECEIVED: `You received a new offer on "${offer.listing.title}"`,
            OFFER_ACCEPTED: `Your offer on "${offer.listing.title}" was accepted`,
            OFFER_REJECTED: `Your offer on "${offer.listing.title}" was rejected`,
            COUNTEROFFER_RECEIVED: `You received a counter-offer on "${offer.listing.title}"`,
            OFFER_EXPIRED: `Your offer on "${offer.listing.title}" has expired`,
            OFFER_WITHDRAWN: `An offer on "${offer.listing.title}" was withdrawn`,
        };
        const recipientId = type === 'OFFER_RECEIVED' || type === 'COUNTEROFFER_RECEIVED' || type === 'OFFER_WITHDRAWN'
            ? offer.receiverId
            : offer.senderId;
        await this.prisma.notification.create({
            data: {
                type: type,
                title: titles[type],
                message: messages[type],
                userId: recipientId,
                data: {
                    offerId: offer.id,
                    listingId: offer.listingId,
                },
            },
        });
    }
    async getOffers(userId, type = 'received', page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const where = {
            [type === 'sent' ? 'senderId' : 'receiverId']: userId,
        };
        const [offers, total] = await Promise.all([
            this.prisma.offer.findMany({
                where,
                include: {
                    listing: {
                        include: {
                            user: true,
                        },
                    },
                    offeredListings: {
                        include: {
                            listing: {
                                include: {
                                    media: true,
                                    user: true,
                                },
                            },
                        },
                    },
                    counterOffers: {
                        include: {
                            listing: true,
                            offeredListings: {
                                include: {
                                    listing: {
                                        include: {
                                            media: true,
                                            user: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.offer.count({ where }),
        ]);
        const formattedOffers = await Promise.all(offers.map(offer => this.formatOfferResponse(offer, userId)));
        const totalPages = Math.ceil(total / limit);
        return {
            offers: formattedOffers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async getOfferById(id, userId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
                counterOffers: {
                    include: {
                        listing: true,
                        offeredListings: {
                            include: {
                                listing: {
                                    include: {
                                        media: true,
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.senderId !== userId && offer.receiverId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to view this offer');
        }
        return this.formatOfferResponse(offer, userId);
    }
    async acceptOffer(id, userId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.receiverId !== userId) {
            throw new common_1.ForbiddenException('Only the listing owner can accept this offer');
        }
        if (offer.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending offers can be accepted');
        }
        if (offer.expiresAt && new Date() > offer.expiresAt) {
            throw new common_1.BadRequestException('This offer has expired');
        }
        const updatedOffer = await this.prisma.offer.update({
            where: { id },
            data: { status: 'ACCEPTED' },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        await this.createOfferNotification(updatedOffer, 'OFFER_ACCEPTED');
        return this.formatOfferResponse(updatedOffer, userId);
    }
    async rejectOffer(id, userId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.receiverId !== userId) {
            throw new common_1.ForbiddenException('Only the listing owner can reject this offer');
        }
        if (offer.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending offers can be rejected');
        }
        const updatedOffer = await this.prisma.offer.update({
            where: { id },
            data: { status: 'REJECTED' },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        await this.createOfferNotification(updatedOffer, 'OFFER_REJECTED');
        return this.formatOfferResponse(updatedOffer, userId);
    }
    async withdrawOffer(id, userId) {
        const offer = await this.prisma.offer.findUnique({
            where: { id },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
            },
        });
        if (!offer) {
            throw new common_1.NotFoundException('Offer not found');
        }
        if (offer.senderId !== userId) {
            throw new common_1.ForbiddenException('Only the offerer can withdraw this offer');
        }
        if (offer.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending offers can be withdrawn');
        }
        const updatedOffer = await this.prisma.offer.update({
            where: { id },
            data: { status: 'WITHDRAWN' },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        await this.createOfferNotification(updatedOffer, 'OFFER_WITHDRAWN');
        return this.formatOfferResponse(updatedOffer, userId);
    }
    async createCounterOffer(id, userId, counterOfferDto) {
        const originalOffer = await this.prisma.offer.findUnique({
            where: { id },
            include: {
                listing: true,
                counterOffers: true,
            },
        });
        if (!originalOffer) {
            throw new common_1.NotFoundException('Original offer not found');
        }
        if (originalOffer.receiverId !== userId) {
            throw new common_1.ForbiddenException('Only the listing owner can create counteroffers');
        }
        if (originalOffer.status !== 'PENDING') {
            throw new common_1.BadRequestException('Only pending offers can be countered');
        }
        if (originalOffer.counterOffers.length >= 5) {
            throw new common_1.BadRequestException('Maximum number of counteroffers reached for this listing');
        }
        this.validateOfferType(counterOfferDto, originalOffer.listing);
        if (counterOfferDto.offeredListingIds && counterOfferDto.offeredListingIds.length > 0) {
            await this.validateOfferedListings(userId, counterOfferDto.offeredListingIds);
        }
        const expiresAt = counterOfferDto.expiresAt
            ? new Date(counterOfferDto.expiresAt)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const counterOfferData = {
            offerType: counterOfferDto.type,
            cashAmountInKobo: counterOfferDto.cashAmount,
            message: counterOfferDto.message,
            expiresAt,
            senderId: userId,
            receiverId: originalOffer.senderId,
            listingId: originalOffer.listingId,
            parentOfferId: originalOffer.id,
        };
        const counterOffer = await this.prisma.offer.create({
            data: counterOfferData,
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        if (counterOfferDto.offeredListingIds && counterOfferDto.offeredListingIds.length > 0) {
            await this.prisma.offerListing.createMany({
                data: counterOfferDto.offeredListingIds.map(listingId => ({
                    offerId: counterOffer.id,
                    listingId,
                })),
            });
        }
        await this.prisma.offer.update({
            where: { id: originalOffer.id },
            data: { status: 'COUNTERED' },
        });
        await this.createOfferNotification(counterOffer, 'COUNTEROFFER_RECEIVED');
        const updatedCounterOffer = await this.prisma.offer.findUnique({
            where: { id: counterOffer.id },
            include: {
                listing: {
                    include: {
                        user: true,
                    },
                },
                offeredListings: {
                    include: {
                        listing: {
                            include: {
                                media: true,
                                user: true,
                            },
                        },
                    },
                },
            },
        });
        return this.formatOfferResponse(updatedCounterOffer, userId);
    }
    async getOffersForListing(listingId, userId, page = 1, limit = 20) {
        const listing = await this.prisma.listing.findUnique({
            where: { id: listingId },
            select: { userId: true, isActive: true },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Listing not found');
        }
        if (listing.userId !== userId) {
            throw new common_1.ForbiddenException('You can only view offers for your own listings');
        }
        const skip = (page - 1) * limit;
        const where = {
            listingId,
            parentOfferId: null,
        };
        const [offers, total] = await Promise.all([
            this.prisma.offer.findMany({
                where,
                include: {
                    listing: {
                        include: {
                            user: true,
                        },
                    },
                    offeredListings: {
                        include: {
                            listing: {
                                include: {
                                    media: true,
                                    user: true,
                                },
                            },
                        },
                    },
                    counterOffers: {
                        include: {
                            listing: true,
                            offeredListings: {
                                include: {
                                    listing: {
                                        include: {
                                            media: true,
                                            user: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.offer.count({ where }),
        ]);
        const formattedOffers = await Promise.all(offers.map(offer => this.formatOfferResponse(offer, userId)));
        const totalPages = Math.ceil(total / limit);
        return {
            offers: formattedOffers,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
    async getOfferStats(userId) {
        const [sentOffers, receivedOffers] = await Promise.all([
            this.prisma.offer.findMany({
                where: { senderId: userId },
                select: { status: true, cashAmountInKobo: true, createdAt: true, updatedAt: true },
            }),
            this.prisma.offer.findMany({
                where: { receiverId: userId },
                select: { status: true, cashAmountInKobo: true, createdAt: true, updatedAt: true },
            }),
        ]);
        const totalSent = sentOffers.length;
        const totalReceived = receivedOffers.length;
        const pendingSent = sentOffers.filter(o => o.status === 'PENDING').length;
        const pendingReceived = receivedOffers.filter(o => o.status === 'PENDING').length;
        const acceptedOffers = [...sentOffers, ...receivedOffers].filter(o => o.status === 'ACCEPTED');
        const rejectedOffers = [...sentOffers, ...receivedOffers].filter(o => o.status === 'REJECTED');
        const totalAccepted = acceptedOffers.length;
        const totalRejected = rejectedOffers.length;
        const successRate = totalSent > 0 ? (totalAccepted / totalSent) * 100 : 0;
        const respondedOffers = receivedOffers.filter(o => o.status !== 'PENDING' && o.updatedAt.getTime() !== o.createdAt.getTime());
        const totalResponseTime = respondedOffers.reduce((sum, offer) => {
            return sum + (offer.updatedAt.getTime() - offer.createdAt.getTime());
        }, 0);
        const averageResponseTime = respondedOffers.length > 0
            ? totalResponseTime / respondedOffers.length / (1000 * 60 * 60)
            : 0;
        const totalValueInKobo = acceptedOffers.reduce((sum, offer) => {
            return sum + (offer.cashAmountInKobo || 0);
        }, 0);
        return {
            totalSent,
            totalReceived,
            pendingSent,
            pendingReceived,
            totalAccepted,
            totalRejected,
            successRate: Math.round(successRate * 10) / 10,
            averageResponseTime: Math.round(averageResponseTime * 10) / 10,
            totalValueInKobo,
            displayTotalValue: this.formatPrice(totalValueInKobo) || '₦0',
        };
    }
    async expireOffers() {
        const expiredOffers = await this.prisma.offer.findMany({
            where: {
                status: 'PENDING',
                expiresAt: {
                    lt: new Date(),
                },
            },
            include: {
                listing: true,
            },
        });
        for (const offer of expiredOffers) {
            await this.prisma.offer.update({
                where: { id: offer.id },
                data: { status: 'EXPIRED' },
            });
            await this.createOfferNotification(offer, 'OFFER_EXPIRED');
        }
    }
};
exports.OffersService = OffersService;
exports.OffersService = OffersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OffersService);
//# sourceMappingURL=offers.service.js.map