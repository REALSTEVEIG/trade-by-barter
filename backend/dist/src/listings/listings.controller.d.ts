import { ListingsService } from './listings.service';
import { UploadService } from './upload.service';
import { LocationsService } from '../common/services/locations.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto } from './dto';
import type { ListingResponse, SearchListingsResponse, CategoryResponse, LocationResponse } from './dto';
export declare class ListingsController {
    private readonly listingsService;
    private readonly uploadService;
    private readonly locationsService;
    constructor(listingsService: ListingsService, uploadService: UploadService, locationsService: LocationsService);
    getCategories(): CategoryResponse[];
    getLocations(): LocationResponse[];
    getMyListings(userId: string): Promise<ListingResponse[]>;
    getListingById(id: string, currentUserId?: string): Promise<ListingResponse>;
    searchListings(searchDto: SearchListingsDto, currentUserId?: string): Promise<SearchListingsResponse>;
    createListing(userId: string, createListingDto: CreateListingDto, files?: Express.Multer.File[]): Promise<ListingResponse>;
    updateListing(id: string, userId: string, updateListingDto: UpdateListingDto): Promise<ListingResponse>;
    deleteListing(id: string, userId: string): Promise<{
        message: string;
    }>;
    toggleFavorite(listingId: string, userId: string): Promise<{
        isFavorite: boolean;
        message: string;
    }>;
    uploadImages(listingId: string, userId: string, files: Express.Multer.File[]): Promise<{
        message: string;
        urls: string[];
    }>;
    deleteImage(listingId: string, imageId: string, userId: string): Promise<{
        message: string;
    }>;
    getListingImages(listingId: string): Promise<{
        images: string[];
    }>;
}
