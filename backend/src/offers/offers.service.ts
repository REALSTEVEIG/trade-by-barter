import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto, CounterOfferDto, OfferResponse, GetOffersResponse, OfferStatsResponse } from './dto';
import { OfferType, OfferStatus } from './dto/offer-types';
import type { UserSummary, ListingSummary } from './dto/offer-types';

@Injectable()
export class OffersService {
  constructor(private readonly prisma: PrismaService) {}

  private formatPrice(priceInKobo?: number): string | undefined {
    if (!priceInKobo || priceInKobo === 0) return undefined;
    const naira = priceInKobo / 100;
    return `₦${naira.toLocaleString('en-NG')}`;
  }

  private async getUserSummary(userId: string): Promise<UserSummary> {
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
      throw new NotFoundException('User not found');
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

  private async getListingSummary(listingId: string): Promise<ListingSummary> {
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
      throw new NotFoundException('Listing not found');
    }

    const owner = await this.getUserSummary(listing.userId);
    const images = listing.media?.map((media: any) => media.url) || [];

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

  private async formatOfferResponse(offer: any, currentUserId: string): Promise<OfferResponse> {
    const listing = {
      id: offer.listing.id,
      title: offer.listing.title,
      owner: await this.getUserSummary(offer.listing.userId),
    };

    const offerer = await this.getUserSummary(offer.senderId);

    // Get offered listings for SWAP and HYBRID offers
    let offeredListings: ListingSummary[] = [];
    if (offer.offeredListings && offer.offeredListings.length > 0) {
      offeredListings = await Promise.all(
        offer.offeredListings.map((ol: any) => this.getListingSummary(ol.listingId))
      );
    }

    // Get counteroffers
    let counterOffers: OfferResponse[] = [];
    if (offer.counterOffers && offer.counterOffers.length > 0) {
      counterOffers = await Promise.all(
        offer.counterOffers.map((co: any) => this.formatOfferResponse(co, currentUserId))
      );
    }

    return {
      id: offer.id,
      type: offer.offerType as OfferType,
      status: offer.status as OfferStatus,
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

  async createOffer(userId: string, createOfferDto: CreateOfferDto): Promise<OfferResponse> {
    // Validate listing exists and is active
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
      throw new NotFoundException('Listing not found or is not available');
    }

    // Prevent self-offers
    if (listing.userId === userId) {
      throw new BadRequestException('You cannot make an offer on your own listing');
    }

    // Validate offer type against listing preferences
    this.validateOfferType(createOfferDto, listing);

    // Validate offered listings for SWAP and HYBRID offers
    if (createOfferDto.offeredListingIds && createOfferDto.offeredListingIds.length > 0) {
      await this.validateOfferedListings(userId, createOfferDto.offeredListingIds);
    }

    // Check for existing pending offer from same user
    const existingOffer = await this.prisma.offer.findFirst({
      where: {
        senderId: userId,
        listingId: createOfferDto.listingId,
        status: 'PENDING',
      },
    });

    if (existingOffer) {
      throw new ConflictException('You already have a pending offer on this listing');
    }

    // Set expiration date (default: 7 days from now)
    const expiresAt = createOfferDto.expiresAt 
      ? new Date(createOfferDto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create the offer
    const offerData: any = {
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

    // Add offered listings for SWAP and HYBRID offers
    if (createOfferDto.offeredListingIds && createOfferDto.offeredListingIds.length > 0) {
      await this.prisma.offerListing.createMany({
        data: createOfferDto.offeredListingIds.map(listingId => ({
          offerId: offer.id,
          listingId,
        })),
      });

      // Refetch offer with offered listings
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

      // Create notification for listing owner
      await this.createOfferNotification(updatedOffer!, 'OFFER_RECEIVED');

      return this.formatOfferResponse(updatedOffer!, userId);
    }

    // Create notification for listing owner
    await this.createOfferNotification(offer, 'OFFER_RECEIVED');

    return this.formatOfferResponse(offer, userId);
  }

  private validateOfferType(createOfferDto: CreateOfferDto, listing: any): void {
    const { type, cashAmount, offeredListingIds } = createOfferDto;

    // Validate cash amount for CASH and HYBRID offers
    if ((type === OfferType.CASH || type === OfferType.HYBRID) && !cashAmount) {
      throw new BadRequestException(`Cash amount is required for ${type} offers`);
    }

    // Validate offered listings for SWAP and HYBRID offers
    if ((type === OfferType.SWAP || type === OfferType.HYBRID) && (!offeredListingIds || offeredListingIds.length === 0)) {
      throw new BadRequestException(`Offered listings are required for ${type} offers`);
    }

    // Validate against listing trade preferences
    if (type === OfferType.CASH && !listing.acceptsCash) {
      throw new BadRequestException('This listing does not accept cash offers');
    }

    if ((type === OfferType.SWAP || type === OfferType.HYBRID) && !listing.acceptsSwap) {
      throw new BadRequestException('This listing does not accept swap offers');
    }

    if (listing.isSwapOnly && type === OfferType.CASH) {
      throw new BadRequestException('This is a swap-only listing');
    }

    // Validate cash amount range
    if (cashAmount && (cashAmount < 100 || cashAmount > 100000000000)) {
      throw new BadRequestException('Cash amount must be between ₦1 and ₦1,000,000,000');
    }
  }

  private async validateOfferedListings(userId: string, listingIds: string[]): Promise<void> {
    const listings = await this.prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        userId,
        isActive: true,
        status: 'ACTIVE',
      },
    });

    if (listings.length !== listingIds.length) {
      throw new BadRequestException('One or more offered listings are not available or do not belong to you');
    }
  }

  private async createOfferNotification(offer: any, type: string): Promise<void> {
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
        type: type as any,
        title: titles[type as keyof typeof titles],
        message: messages[type as keyof typeof messages],
        userId: recipientId,
        data: {
          offerId: offer.id,
          listingId: offer.listingId,
        },
      },
    });
  }

  async getOffers(
    userId: string, 
    type: 'sent' | 'received' = 'received', 
    page = 1, 
    limit = 20
  ): Promise<GetOffersResponse> {
    const skip = (page - 1) * limit;
    const where: any = {
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

    const formattedOffers = await Promise.all(
      offers.map(offer => this.formatOfferResponse(offer, userId))
    );

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

  async getOfferById(id: string, userId: string): Promise<OfferResponse> {
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
      throw new NotFoundException('Offer not found');
    }

    // Check if user has access to this offer
    if (offer.senderId !== userId && offer.receiverId !== userId) {
      throw new ForbiddenException('You do not have permission to view this offer');
    }

    return this.formatOfferResponse(offer, userId);
  }

  async acceptOffer(id: string, userId: string): Promise<OfferResponse> {
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
      throw new NotFoundException('Offer not found');
    }

    // Only listing owner can accept offers
    if (offer.receiverId !== userId) {
      throw new ForbiddenException('Only the listing owner can accept this offer');
    }

    // Can only accept pending offers
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be accepted');
    }

    // Check if offer has expired
    if (offer.expiresAt && new Date() > offer.expiresAt) {
      throw new BadRequestException('This offer has expired');
    }

    // Update offer status
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

    // Create notification for offerer
    await this.createOfferNotification(updatedOffer, 'OFFER_ACCEPTED');

    // TODO: Create transaction record and update listing status if needed

    return this.formatOfferResponse(updatedOffer, userId);
  }

  async rejectOffer(id: string, userId: string): Promise<OfferResponse> {
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
      throw new NotFoundException('Offer not found');
    }

    // Only listing owner can reject offers
    if (offer.receiverId !== userId) {
      throw new ForbiddenException('Only the listing owner can reject this offer');
    }

    // Can only reject pending offers
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be rejected');
    }

    // Update offer status
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

    // Create notification for offerer
    await this.createOfferNotification(updatedOffer, 'OFFER_REJECTED');

    return this.formatOfferResponse(updatedOffer, userId);
  }

  async withdrawOffer(id: string, userId: string): Promise<OfferResponse> {
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
      throw new NotFoundException('Offer not found');
    }

    // Only offerer can withdraw offers
    if (offer.senderId !== userId) {
      throw new ForbiddenException('Only the offerer can withdraw this offer');
    }

    // Can only withdraw pending offers
    if (offer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be withdrawn');
    }

    // Update offer status
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

    // Create notification for listing owner
    await this.createOfferNotification(updatedOffer, 'OFFER_WITHDRAWN');

    return this.formatOfferResponse(updatedOffer, userId);
  }

  async createCounterOffer(id: string, userId: string, counterOfferDto: CounterOfferDto): Promise<OfferResponse> {
    const originalOffer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        listing: true,
        counterOffers: true,
      },
    });

    if (!originalOffer) {
      throw new NotFoundException('Original offer not found');
    }

    // Only listing owner can create counteroffers
    if (originalOffer.receiverId !== userId) {
      throw new ForbiddenException('Only the listing owner can create counteroffers');
    }

    // Can only counter pending offers
    if (originalOffer.status !== 'PENDING') {
      throw new BadRequestException('Only pending offers can be countered');
    }

    // Check maximum counteroffer limit (5 per listing)
    if (originalOffer.counterOffers.length >= 5) {
      throw new BadRequestException('Maximum number of counteroffers reached for this listing');
    }

    // Validate counteroffer type and data
    this.validateOfferType(counterOfferDto as any, originalOffer.listing);

    // Validate offered listings for SWAP and HYBRID counteroffers
    if (counterOfferDto.offeredListingIds && counterOfferDto.offeredListingIds.length > 0) {
      await this.validateOfferedListings(userId, counterOfferDto.offeredListingIds);
    }

    // Set expiration date (default: 7 days from now)
    const expiresAt = counterOfferDto.expiresAt 
      ? new Date(counterOfferDto.expiresAt)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create counteroffer
    const counterOfferData: any = {
      offerType: counterOfferDto.type,
      cashAmountInKobo: counterOfferDto.cashAmount,
      message: counterOfferDto.message,
      expiresAt,
      senderId: userId, // Listing owner becomes the sender
      receiverId: originalOffer.senderId, // Original offerer becomes receiver
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

    // Add offered listings for SWAP and HYBRID counteroffers
    if (counterOfferDto.offeredListingIds && counterOfferDto.offeredListingIds.length > 0) {
      await this.prisma.offerListing.createMany({
        data: counterOfferDto.offeredListingIds.map(listingId => ({
          offerId: counterOffer.id,
          listingId,
        })),
      });
    }

    // Update original offer status to COUNTERED
    await this.prisma.offer.update({
      where: { id: originalOffer.id },
      data: { status: 'COUNTERED' },
    });

    // Create notification for original offerer
    await this.createOfferNotification(counterOffer, 'COUNTEROFFER_RECEIVED');

    // Refetch counteroffer with all relations
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

    return this.formatOfferResponse(updatedCounterOffer!, userId);
  }

  async getOffersForListing(listingId: string, userId: string, page = 1, limit = 20): Promise<GetOffersResponse> {
    // Verify user owns the listing
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { userId: true, isActive: true },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only view offers for your own listings');
    }

    const skip = (page - 1) * limit;
    const where = {
      listingId,
      parentOfferId: null, // Only get root offers, not counteroffers
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

    const formattedOffers = await Promise.all(
      offers.map(offer => this.formatOfferResponse(offer, userId))
    );

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

  async getOfferStats(userId: string): Promise<OfferStatsResponse> {
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

    // Calculate average response time for received offers
    const respondedOffers = receivedOffers.filter(o => 
      o.status !== 'PENDING' && o.updatedAt.getTime() !== o.createdAt.getTime()
    );
    
    const totalResponseTime = respondedOffers.reduce((sum, offer) => {
      return sum + (offer.updatedAt.getTime() - offer.createdAt.getTime());
    }, 0);

    const averageResponseTime = respondedOffers.length > 0 
      ? totalResponseTime / respondedOffers.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Calculate total value of accepted offers
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

  // TODO: Implement offer expiration cleanup job
  async expireOffers(): Promise<void> {
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

      // Create notification for offerer
      await this.createOfferNotification(offer, 'OFFER_EXPIRED');
    }
  }
}