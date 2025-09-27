import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { ListingsService } from './listings.service';
import { UploadService } from './upload.service';
import { LocationsService } from '../common/services/locations.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto } from './dto';
import type { ListingResponse, SearchListingsResponse, CategoryResponse, LocationResponse } from './dto';
import { ListingCategory } from '@prisma/client';

@ApiTags('listings')
@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly uploadService: UploadService,
    private readonly locationsService: LocationsService,
  ) {}

  @Get('categories')
  @Public()
  @ApiOperation({ summary: 'Get available listing categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  getCategories(): CategoryResponse[] {
    const categoryMappings: Record<ListingCategory, { label: string; description: string; popular: boolean }> = {
      [ListingCategory.ELECTRONICS]: { label: 'Electronics', description: 'Phones, laptops, gadgets', popular: true },
      [ListingCategory.FASHION]: { label: 'Fashion', description: 'Clothing, shoes, accessories', popular: true },
      [ListingCategory.VEHICLES]: { label: 'Vehicles', description: 'Cars, motorcycles, bicycles', popular: true },
      [ListingCategory.HOME_GARDEN]: { label: 'Home & Garden', description: 'Furniture, appliances, decor', popular: true },
      [ListingCategory.BOOKS_MEDIA]: { label: 'Books & Media', description: 'Books, magazines, media', popular: true },
      [ListingCategory.BEAUTY_HEALTH]: { label: 'Beauty & Health', description: 'Cosmetics, health products', popular: true },
      [ListingCategory.SPORTS_RECREATION]: { label: 'Sports & Recreation', description: 'Equipment, fitness, outdoor', popular: false },
      [ListingCategory.AUTOMOTIVE]: { label: 'Automotive', description: 'Car parts, accessories', popular: false },
      [ListingCategory.TOYS_GAMES]: { label: 'Toys & Games', description: 'Children toys, board games', popular: false },
      [ListingCategory.JEWELRY_ACCESSORIES]: { label: 'Jewelry & Accessories', description: 'Watches, rings, accessories', popular: false },
      [ListingCategory.ARTS_CRAFTS]: { label: 'Arts & Crafts', description: 'Handmade items, art supplies', popular: false },
      [ListingCategory.MUSICAL_INSTRUMENTS]: { label: 'Musical Instruments', description: 'Instruments, equipment', popular: false },
      [ListingCategory.FOOD_BEVERAGES]: { label: 'Food & Beverages', description: 'Food items, drinks', popular: false },
      [ListingCategory.TOOLS_EQUIPMENT]: { label: 'Tools & Equipment', description: 'Hand tools, power tools', popular: false },
      [ListingCategory.SERVICES]: { label: 'Services', description: 'Professional services', popular: false },
      [ListingCategory.HOME_APPLIANCES]: { label: 'Home Appliances', description: 'Kitchen, home appliances', popular: false },
      [ListingCategory.PET_SUPPLIES]: { label: 'Pet Supplies', description: 'Pet food, toys, accessories', popular: false },
      [ListingCategory.OFFICE_SUPPLIES]: { label: 'Office Supplies', description: 'Stationery, office equipment', popular: false },
      [ListingCategory.OTHER]: { label: 'Other', description: 'Miscellaneous items', popular: false },
    };

    return Object.entries(categoryMappings).map(([value, config]) => ({
      value: value as ListingCategory,
      label: config.label,
      description: config.description,
      popular: config.popular,
    }));
  }

  @Get('locations')
  @Public()
  @ApiOperation({ summary: 'Get Nigerian states and major cities' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  getLocations(): LocationResponse[] {
    const locations = this.locationsService.getAllLocations();
    
    return Object.keys(locations).map(state => ({
      state: this.locationsService.getDisplayStateName(state),
      cities: locations[state].slice(0, 6) // Limit to first 6 cities for compatibility
    }));
  }

  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user\'s listings' })
  @ApiResponse({ status: 200, description: 'User listings retrieved successfully' })
  async getMyListings(@GetUser('id') userId: string): Promise<ListingResponse[]> {
    return this.listingsService.getUserListings(userId, userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get listing by ID' })
  @ApiResponse({ status: 200, description: 'Listing retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async getListingById(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') currentUserId?: string,
  ): Promise<ListingResponse> {
    return this.listingsService.getListingById(id, currentUserId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search listings with filters' })
  @ApiResponse({ status: 200, description: 'Listings retrieved successfully' })
  async searchListings(
    @Query() searchDto: SearchListingsDto,
    @GetUser('id') currentUserId?: string,
  ): Promise<SearchListingsResponse> {
    return this.listingsService.searchListings(searchDto, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 6, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: 6, // Maximum 6 files
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        callback(new Error('Only image files are allowed!'), false);
      } else {
        callback(null, true);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new listing with images' })
  @ApiResponse({ status: 201, description: 'Listing created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @HttpCode(HttpStatus.CREATED)
  async createListing(
    @GetUser('id') userId: string,
    @Body() createListingDto: CreateListingDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ): Promise<ListingResponse> {
    return this.listingsService.createListingWithImages(userId, createListingDto, files);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update listing' })
  @ApiResponse({ status: 200, description: 'Listing updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to update this listing' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async updateListing(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
    @Body() updateListingDto: UpdateListingDto,
  ): Promise<ListingResponse> {
    return this.listingsService.updateListing(id, userId, updateListingDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing' })
  @ApiResponse({ status: 200, description: 'Listing deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this listing' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async deleteListing(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.listingsService.deleteListing(id, userId);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle favorite status for listing' })
  @ApiResponse({ status: 200, description: 'Favorite status toggled successfully' })
  @ApiResponse({ status: 404, description: 'Listing not found' })
  async toggleFavorite(
    @Param('id', ParseUUIDPipe) listingId: string,
    @GetUser('id') userId: string,
  ): Promise<{ isFavorite: boolean; message: string }> {
    return this.listingsService.toggleFavorite(listingId, userId);
  }

  @Post(':id/images')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FilesInterceptor('images', 5, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: 5, // Maximum 5 files
    },
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        callback(new Error('Only image files are allowed!'), false);
      } else {
        callback(null, true);
      }
    },
  }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload images for listing' })
  @ApiResponse({ status: 201, description: 'Images uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file format or size' })
  @ApiResponse({ status: 403, description: 'Not authorized to upload images for this listing' })
  @HttpCode(HttpStatus.CREATED)
  async uploadImages(
    @Param('id', ParseUUIDPipe) listingId: string,
    @GetUser('id') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ message: string; urls: string[] }> {
    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }
    return this.uploadService.uploadListingImages(listingId, userId, files);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete listing image' })
  @ApiResponse({ status: 200, description: 'Image deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to delete this image' })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async deleteImage(
    @Param('id', ParseUUIDPipe) listingId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @GetUser('id') userId: string,
  ): Promise<{ message: string }> {
    return this.uploadService.deleteListingImage(listingId, imageId, userId);
  }

  @Get(':id/images')
  @Public()
  @ApiOperation({ summary: 'Get listing images' })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully' })
  async getListingImages(
    @Param('id', ParseUUIDPipe) listingId: string,
  ): Promise<{ images: string[] }> {
    const images = await this.uploadService.getListingImages(listingId);
    return { images };
  }
}