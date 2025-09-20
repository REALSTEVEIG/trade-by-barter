import { PrismaService } from '../prisma/prisma.service';
import { AwsS3Service } from './aws-s3.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto } from './dto';
import type { ListingResponse, SearchListingsResponse } from './dto';
export declare class ListingsService {
    private readonly prisma;
    private readonly awsS3Service;
    constructor(prisma: PrismaService, awsS3Service: AwsS3Service);
    private formatPrice;
    private getOwnerInfo;
    private formatListingResponse;
    createListing(userId: string, createListingDto: CreateListingDto): Promise<ListingResponse>;
    createListingWithImages(userId: string, createListingDto: CreateListingDto, files?: Express.Multer.File[]): Promise<ListingResponse>;
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
