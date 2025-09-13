import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto, SortByFilter, TradeTypeFilter } from './dto';
import type { ListingResponse, SearchListingsResponse, ListingOwnerResponse } from './dto';

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatPrice(priceInKobo?: number): string | undefined {
    if (!priceInKobo || priceInKobo === 0) return undefined;
    const naira = priceInKobo / 100;
    return `₦${naira.toLocaleString('en-NG')}`;
  }

  private async getOwnerInfo(userId: string): Promise<ListingOwnerResponse> {
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
      displayName: user.displayName,
      profileImageUrl: user.profileImageUrl,
      isPhoneVerified: user.isPhoneVerified,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
    };
  }

  private async formatListingResponse(
    listing: any, 
    currentUserId?: string
  ): Promise<ListingResponse> {
    const owner = await this.getOwnerInfo(listing.userId);
    const images = listing.media?.map((media: any) => media.url) || [];
    
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

  async createListing(userId: string, createListingDto: CreateListingDto): Promise<ListingResponse> {
    // Validate trade type logic
    if (createListingDto.isSwapOnly && createListingDto.priceInKobo) {
      throw new BadRequestException('Swap-only listings cannot have a price');
    }

    if (!createListingDto.acceptsCash && !createListingDto.acceptsSwap) {
      throw new BadRequestException('Listing must accept either cash or swap');
    }

    const listing = await this.prisma.listing.create({
      data: {
        userId,
        title: createListingDto.title,
        description: createListingDto.description,
        category: createListingDto.category as any,
        subcategory: createListingDto.subcategory,
        condition: createListingDto.condition as any,
        priceInKobo: createListingDto.priceInKobo,
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

  async getListingById(id: string, currentUserId?: string): Promise<ListingResponse> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: {
        media: true,
      },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
    }

    // Increment view count if not the owner
    if (currentUserId !== listing.userId) {
      await this.prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
      listing.viewCount += 1;
    }

    return this.formatListingResponse(listing, currentUserId);
  }

  async updateListing(
    id: string, 
    userId: string, 
    updateListingDto: UpdateListingDto
  ): Promise<ListingResponse> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { id: true, userId: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only update your own listings');
    }

    // Validate trade type logic if price is being updated
    if (updateListingDto.isSwapOnly && updateListingDto.priceInKobo) {
      throw new BadRequestException('Swap-only listings cannot have a price');
    }

    const updatedListing = await this.prisma.listing.update({
      where: { id },
      data: {
        ...updateListingDto,
        category: updateListingDto.category as any,
        condition: updateListingDto.condition as any,
        status: updateListingDto.status as any,
      },
      include: {
        media: true,
      },
    });

    return this.formatListingResponse(updatedListing, userId);
  }

  async deleteListing(id: string, userId: string): Promise<{ message: string }> {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      select: { id: true, userId: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.userId !== userId) {
      throw new ForbiddenException('You can only delete your own listings');
    }

    // Soft delete by marking as inactive
    await this.prisma.listing.update({
      where: { id },
      data: { 
        isActive: false,
        status: 'REMOVED',
      },
    });

    return { message: 'Listing deleted successfully' };
  }

  async searchListings(
    searchDto: SearchListingsDto, 
    currentUserId?: string
  ): Promise<SearchListingsResponse> {
    const { 
      q, 
      category, 
      minPrice, 
      maxPrice, 
      location, 
      tradeType, 
      sortBy = SortByFilter.NEWEST,
      page = 1, 
      limit = 20,
      userId: filterUserId,
    } = searchDto;

    const skip = (page - 1) * limit;
    const where: any = {
      isActive: true,
      status: 'ACTIVE',
    };

    // Text search
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category) {
      where.category = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceInKobo = {};
      if (minPrice !== undefined) where.priceInKobo.gte = minPrice;
      if (maxPrice !== undefined) where.priceInKobo.lte = maxPrice;
    }

    // Location filter
    if (location) {
      where.OR = where.OR || [];
      where.OR.push(
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } }
      );
    }

    // Trade type filter
    if (tradeType) {
      switch (tradeType) {
        case TradeTypeFilter.SWAP:
          where.acceptsSwap = true;
          break;
        case TradeTypeFilter.CASH:
          where.acceptsCash = true;
          break;
        case TradeTypeFilter.HYBRID:
          where.AND = [
            { acceptsCash: true },
            { acceptsSwap: true }
          ];
          break;
      }
    }

    // User filter (for "my listings")
    if (filterUserId) {
      where.userId = filterUserId;
    }

    // Sorting
    const orderBy: any = {};
    switch (sortBy) {
      case SortByFilter.NEWEST:
        orderBy.createdAt = 'desc';
        break;
      case SortByFilter.PRICE_ASC:
        orderBy.priceInKobo = 'asc';
        break;
      case SortByFilter.PRICE_DESC:
        orderBy.priceInKobo = 'desc';
        break;
      case SortByFilter.MOST_VIEWED:
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

    const formattedListings = await Promise.all(
      listings.map(listing => this.formatListingResponse(listing, currentUserId))
    );

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

  async toggleFavorite(listingId: string, userId: string): Promise<{ isFavorite: boolean; message: string }> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, isActive: true },
    });

    if (!listing || !listing.isActive) {
      throw new NotFoundException('Listing not found');
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
      // Remove favorite
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
    } else {
      // Add favorite
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

  async getUserListings(userId: string, currentUserId?: string): Promise<ListingResponse[]> {
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

    return Promise.all(
      listings.map(listing => this.formatListingResponse(listing, currentUserId))
    );
  }
}