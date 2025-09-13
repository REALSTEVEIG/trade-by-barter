import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto } from './dto';
import type { ListingResponse, SearchListingsResponse } from './dto';
export declare class ListingsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private formatPrice;
    private getOwnerInfo;
    private formatListingResponse;
    createListing(userId: string, createListingDto: CreateListingDto): Promise<ListingResponse>;
    getListingById(id: string, currentUserId?: string): Promise<ListingResponse>;
    updateListing(id: string, userId: string, updateListingDto: UpdateListingDto): Promise<ListingResponse>;
    deleteListing(id: string, userId: string): Promise<{
        message: string;
    }>;
    searchListings(searchDto: SearchListingsDto, currentUserId?: string): Promise<SearchListingsResponse>;
    toggleFavorite(listingId: string, userId: string): Promise<{
        isFavorite: boolean;
        message: string;
    }>;
    getUserListings(userId: string, currentUserId?: string): Promise<ListingResponse[]>;
}
