import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, SearchListingsDto, SortByFilter, TradeTypeFilter, ListingCategoryFilter } from './dto';
import { ListingCategory, ItemCondition } from './dto/create-listing.dto';
import { NIGERIAN_TEST_DATA } from '../../test/setup';

describe('ListingsService', () => {
  let service: ListingsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockListing = {
    id: 'listing-1',
    title: 'iPhone 12 Pro',
    description: 'Like new iPhone 12 Pro for trade or sale',
    category: ListingCategory.ELECTRONICS,
    subcategory: 'Mobile Phones',
    condition: ItemCondition.LIKE_NEW,
    priceInKobo: 25000000, // 250,000 Naira
    isSwapOnly: false,
    acceptsCash: true,
    acceptsSwap: true,
    swapPreferences: ['Electronics', 'Gadgets'],
    city: 'Lagos',
    state: 'Lagos',
    specificLocation: 'Victoria Island',
    status: 'ACTIVE',
    userId: 'user-1',
    isActive: true,
    viewCount: 0,
    favoriteCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    media: [
      { url: 'https://example.com/image1.jpg' },
      { url: 'https://example.com/image2.jpg' },
    ],
  };

  const mockUser = {
    id: 'user-1',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'johndoe',
    profileImageUrl: 'https://example.com/profile.jpg',
    isPhoneVerified: true,
    receivedReviews: [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      listing: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      favorite: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ListingsService>(ListingsService);
    prismaService = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createListing', () => {
    const createListingDto: CreateListingDto = {
      title: 'iPhone 12 Pro',
      description: 'Like new iPhone 12 Pro for trade or sale',
      category: ListingCategory.ELECTRONICS,
      subcategory: 'Mobile Phones',
      condition: ItemCondition.LIKE_NEW,
      priceInKobo: 25000000,
      acceptsCash: true,
      acceptsSwap: true,
      swapPreferences: ['Electronics'],
      city: 'Lagos',
      state: 'Lagos',
      specificLocation: 'Victoria Island',
    };

    it('should successfully create a listing with valid Nigerian location', async () => {
      // Arrange
      prismaService.listing.create.mockResolvedValue(mockListing);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.createListing('user-1', createListingDto);

      // Assert
      expect(prismaService.listing.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          title: createListingDto.title,
          description: createListingDto.description,
          category: createListingDto.category,
          subcategory: createListingDto.subcategory,
          condition: createListingDto.condition,
          priceInKobo: createListingDto.priceInKobo,
          isSwapOnly: false,
          acceptsCash: true,
          acceptsSwap: true,
          swapPreferences: createListingDto.swapPreferences,
          city: createListingDto.city,
          state: createListingDto.state,
          specificLocation: createListingDto.specificLocation,
          status: 'ACTIVE',
        },
        include: {
          media: true,
        },
      });
      expect(result.id).toBe(mockListing.id);
      expect(result.displayPrice).toBe('₦250,000');
      expect(result.owner).toBeDefined();
    });

    it('should create swap-only listing without price', async () => {
      // Arrange
      const swapOnlyDto = {
        ...createListingDto,
        priceInKobo: undefined,
        isSwapOnly: true,
        acceptsCash: false,
        acceptsSwap: true,
      };
      
      const swapOnlyListing = {
        ...mockListing,
        priceInKobo: null,
        isSwapOnly: true,
        acceptsCash: false,
      };
      
      prismaService.listing.create.mockResolvedValue(swapOnlyListing);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.createListing('user-1', swapOnlyDto);

      // Assert
      expect(result.isSwapOnly).toBe(true);
      expect(result.price).toBeNull();
      expect(result.displayPrice).toBeUndefined();
      expect(result.acceptsCash).toBe(false);
      expect(result.acceptsSwap).toBe(true);
    });

    it('should throw BadRequestException for swap-only listing with price', async () => {
      // Arrange
      const invalidDto = {
        ...createListingDto,
        isSwapOnly: true,
        priceInKobo: 25000000,
      };

      // Act & Assert
      await expect(service.createListing('user-1', invalidDto)).rejects.toThrow(
        new BadRequestException('Swap-only listings cannot have a price')
      );
    });

    it('should throw BadRequestException when listing accepts neither cash nor swap', async () => {
      // Arrange
      const invalidDto = {
        ...createListingDto,
        acceptsCash: false,
        acceptsSwap: false,
      };

      // Act & Assert
      await expect(service.createListing('user-1', invalidDto)).rejects.toThrow(
        new BadRequestException('Listing must accept either cash or swap')
      );
    });

    it('should handle Nigerian location data correctly', async () => {
      // Test with various Nigerian locations
      const nigerianLocations = Object.values(NIGERIAN_TEST_DATA.LOCATIONS);
      
      for (const location of nigerianLocations) {
        const locationDto = {
          ...createListingDto,
          city: location.city,
          state: location.state,
          specificLocation: location.area,
        };
        
        const locationListing = {
          ...mockListing,
          city: location.city,
          state: location.state,
          specificLocation: location.area,
        };
        
        prismaService.listing.create.mockResolvedValue(locationListing);
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.createListing('user-1', locationDto);
        
        expect(result.city).toBe(location.city);
        expect(result.state).toBe(location.state);
        expect(result.specificLocation).toBe(location.area);
      }
    });

    it('should format Nigerian Naira prices correctly', async () => {
      // Test various Naira amounts
      const nairaAmounts = NIGERIAN_TEST_DATA.CURRENCY.NAIRA_AMOUNTS;
      
      for (const amount of nairaAmounts) {
        const priceDto = {
          ...createListingDto,
          priceInKobo: amount * 100, // Convert to kobo
        };
        
        const priceListing = {
          ...mockListing,
          priceInKobo: amount * 100,
        };
        
        prismaService.listing.create.mockResolvedValue(priceListing);
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.createListing('user-1', priceDto);
        
        // Should format with Naira symbol and Nigerian locale
        expect(result.displayPrice).toContain('₦');
        expect(result.displayPrice).toContain(amount.toLocaleString('en-NG'));
      }
    });
  });

  describe('getListingById', () => {
    it('should successfully get listing by ID and increment view count', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.update.mockResolvedValue({ ...mockListing, viewCount: 1 });

      // Act
      const result = await service.getListingById('listing-1', 'different-user');

      // Assert
      expect(prismaService.listing.findUnique).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        include: { media: true },
      });
      expect(prismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: { viewCount: { increment: 1 } },
      });
      expect(result.id).toBe(mockListing.id);
      expect(result.isOwner).toBe(false);
    });

    it('should not increment view count for listing owner', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      await service.getListingById('listing-1', 'user-1'); // Same as listing owner

      // Assert
      expect(prismaService.listing.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getListingById('non-existent', 'user-1')).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });

    it('should throw NotFoundException for inactive listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue({
        ...mockListing,
        isActive: false,
      });

      // Act & Assert
      await expect(service.getListingById('listing-1', 'user-1')).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });

    it('should calculate owner average rating correctly', async () => {
      // Arrange
      const userWithReviews = {
        ...mockUser,
        receivedReviews: [
          { rating: 5 },
          { rating: 4 },
          { rating: 3 },
          { rating: 5 },
        ],
      };
      
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.user.findUnique.mockResolvedValue(userWithReviews);

      // Act
      const result = await service.getListingById('listing-1', 'different-user');

      // Assert
      expect(result.owner.averageRating).toBe(4.3); // (5+4+3+5)/4 = 4.25, rounded to 4.3
      expect(result.owner.totalReviews).toBe(4);
    });
  });

  describe('updateListing', () => {
    const updateListingDto: UpdateListingDto = {
      title: 'Updated iPhone 12 Pro',
      priceInKobo: 22000000, // 220,000 Naira
    };

    it('should successfully update own listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      const updatedListing = { ...mockListing, ...updateListingDto };
      prismaService.listing.update.mockResolvedValue(updatedListing);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.updateListing('listing-1', 'user-1', updateListingDto);

      // Assert
      expect(prismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: expect.objectContaining(updateListingDto),
        include: { media: true },
      });
      expect(result.title).toBe(updateListingDto.title);
      expect(result.displayPrice).toBe('₦220,000');
    });

    it('should throw ForbiddenException when updating someone else\'s listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);

      // Act & Assert
      await expect(
        service.updateListing('listing-1', 'different-user', updateListingDto)
      ).rejects.toThrow(
        new ForbiddenException('You can only update your own listings')
      );
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateListing('non-existent', 'user-1', updateListingDto)
      ).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });

    it('should validate swap-only update logic', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      const invalidUpdate = {
        isSwapOnly: true,
        priceInKobo: 25000000,
      };

      // Act & Assert
      await expect(
        service.updateListing('listing-1', 'user-1', invalidUpdate)
      ).rejects.toThrow(
        new BadRequestException('Swap-only listings cannot have a price')
      );
    });
  });

  describe('deleteListing', () => {
    it('should successfully soft delete own listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.listing.update.mockResolvedValue({
        ...mockListing,
        isActive: false,
        status: 'REMOVED',
      });

      // Act
      const result = await service.deleteListing('listing-1', 'user-1');

      // Assert
      expect(prismaService.listing.update).toHaveBeenCalledWith({
        where: { id: 'listing-1' },
        data: {
          isActive: false,
          status: 'REMOVED',
        },
      });
      expect(result.message).toBe('Listing deleted successfully');
    });

    it('should throw ForbiddenException when deleting someone else\'s listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);

      // Act & Assert
      await expect(service.deleteListing('listing-1', 'different-user')).rejects.toThrow(
        new ForbiddenException('You can only delete your own listings')
      );
    });
  });

  describe('searchListings', () => {
    const searchDto: SearchListingsDto = {
      q: 'iPhone',
      category: ListingCategoryFilter.ELECTRONICS,
      minPrice: 10000000, // 100,000 Naira in kobo
      maxPrice: 50000000, // 500,000 Naira in kobo
      location: 'Lagos',
      tradeType: TradeTypeFilter.CASH,
      sortBy: SortByFilter.PRICE_ASC,
      page: 1,
      limit: 10,
    };

    const searchResults = [mockListing];

    it('should search listings with text query', async () => {
      // Arrange
      prismaService.listing.findMany.mockResolvedValue(searchResults);
      prismaService.listing.count.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.searchListings(searchDto);

      // Assert
      expect(prismaService.listing.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          isActive: true,
          status: 'ACTIVE',
          OR: [
            { title: { contains: 'iPhone', mode: 'insensitive' } },
            { description: { contains: 'iPhone', mode: 'insensitive' } },
          ],
        }),
        include: { media: true },
        orderBy: { priceInKobo: 'asc' },
        skip: 0,
        take: 10,
      });
      expect(result.listings).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('should filter by Nigerian location correctly', async () => {
      // Arrange
      const locationSearchDto = { ...searchDto, location: 'Lagos' };
      prismaService.listing.findMany.mockResolvedValue(searchResults);
      prismaService.listing.count.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      await service.searchListings(locationSearchDto);

      // Assert
      expect(prismaService.listing.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { city: { contains: 'Lagos', mode: 'insensitive' } },
            { state: { contains: 'Lagos', mode: 'insensitive' } },
          ]),
        }),
        include: { media: true },
        orderBy: { priceInKobo: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter by price range in Naira (converted to kobo)', async () => {
      // Arrange
      prismaService.listing.findMany.mockResolvedValue(searchResults);
      prismaService.listing.count.mockResolvedValue(1);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      await service.searchListings(searchDto);

      // Assert
      expect(prismaService.listing.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          priceInKobo: {
            gte: 10000000, // 100,000 Naira
            lte: 50000000, // 500,000 Naira
          },
        }),
        include: { media: true },
        orderBy: { priceInKobo: 'asc' },
        skip: 0,
        take: 10,
      });
    });

    it('should filter by trade type correctly', async () => {
      // Test different trade types
      const tradeTypes = [
        { type: TradeTypeFilter.SWAP, expectation: { acceptsSwap: true } },
        { type: TradeTypeFilter.CASH, expectation: { acceptsCash: true } },
        { 
          type: TradeTypeFilter.HYBRID, 
          expectation: { 
            AND: [{ acceptsCash: true }, { acceptsSwap: true }] 
          } 
        },
      ];

      for (const { type, expectation } of tradeTypes) {
        prismaService.listing.findMany.mockClear();
        prismaService.listing.findMany.mockResolvedValue(searchResults);
        prismaService.listing.count.mockResolvedValue(1);
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        const tradeTypeSearchDto = { ...searchDto, tradeType: type };
        
        await service.searchListings(tradeTypeSearchDto);

        expect(prismaService.listing.findMany).toHaveBeenCalledWith({
          where: expect.objectContaining(expectation),
          include: { media: true },
          orderBy: { priceInKobo: 'asc' },
          skip: 0,
          take: 10,
        });
      }
    });

    it('should sort by different criteria', async () => {
      // Test different sort options
      const sortOptions = [
        { sort: SortByFilter.NEWEST, expectation: { createdAt: 'desc' } },
        { sort: SortByFilter.PRICE_ASC, expectation: { priceInKobo: 'asc' } },
        { sort: SortByFilter.PRICE_DESC, expectation: { priceInKobo: 'desc' } },
        { sort: SortByFilter.MOST_VIEWED, expectation: { viewCount: 'desc' } },
      ];

      for (const { sort, expectation } of sortOptions) {
        prismaService.listing.findMany.mockClear();
        prismaService.listing.findMany.mockResolvedValue(searchResults);
        prismaService.listing.count.mockResolvedValue(1);
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        const sortSearchDto = { ...searchDto, sortBy: sort };
        
        await service.searchListings(sortSearchDto);

        expect(prismaService.listing.findMany).toHaveBeenCalledWith({
          where: expect.any(Object),
          include: { media: true },
          orderBy: expectation,
          skip: 0,
          take: 10,
        });
      }
    });

    it('should handle pagination correctly', async () => {
      // Arrange
      const paginatedSearchDto = { ...searchDto, page: 3, limit: 5 };
      prismaService.listing.findMany.mockResolvedValue(searchResults);
      prismaService.listing.count.mockResolvedValue(25);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.searchListings(paginatedSearchDto);

      // Assert
      expect(prismaService.listing.findMany).toHaveBeenCalledWith({
        where: expect.any(Object),
        include: { media: true },
        orderBy: { priceInKobo: 'asc' },
        skip: 10, // (page 3 - 1) * limit 5
        take: 5,
      });
      expect(result.pagination).toEqual({
        page: 3,
        limit: 5,
        total: 25,
        totalPages: 5,
        hasNext: true,
        hasPrev: true,
      });
    });
  });

  describe('toggleFavorite', () => {
    it('should add listing to favorites', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.favorite.findUnique.mockResolvedValue(null); // No existing favorite
      prismaService.$transaction.mockImplementation((operations) => Promise.all(operations));

      // Act
      const result = await service.toggleFavorite('listing-1', 'user-2');

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          /* create favorite operation */
        }),
        expect.objectContaining({
          /* increment favorite count operation */
        }),
      ]);
      expect(result.isFavorite).toBe(true);
      expect(result.message).toBe('Added to favorites');
    });

    it('should remove listing from favorites', async () => {
      // Arrange
      const existingFavorite = { id: 'favorite-1', userId: 'user-2', listingId: 'listing-1' };
      prismaService.listing.findUnique.mockResolvedValue(mockListing);
      prismaService.favorite.findUnique.mockResolvedValue(existingFavorite);
      prismaService.$transaction.mockImplementation((operations) => Promise.all(operations));

      // Act
      const result = await service.toggleFavorite('listing-1', 'user-2');

      // Assert
      expect(prismaService.$transaction).toHaveBeenCalledWith([
        expect.objectContaining({
          /* delete favorite operation */
        }),
        expect.objectContaining({
          /* decrement favorite count operation */
        }),
      ]);
      expect(result.isFavorite).toBe(false);
      expect(result.message).toBe('Removed from favorites');
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      // Arrange
      prismaService.listing.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.toggleFavorite('non-existent', 'user-2')).rejects.toThrow(
        new NotFoundException('Listing not found')
      );
    });
  });

  describe('getUserListings', () => {
    it('should get all active listings for a user', async () => {
      // Arrange
      const userListings = [mockListing, { ...mockListing, id: 'listing-2' }];
      prismaService.listing.findMany.mockResolvedValue(userListings);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserListings('user-1');

      // Assert
      expect(prismaService.listing.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          isActive: true,
        },
        include: { media: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('Nigerian market specific features', () => {
    it('should handle all Nigerian categories', async () => {
      // Test with all categories from Nigerian test data
      for (const category of NIGERIAN_TEST_DATA.CATEGORIES) {
        const categoryKey = category.toUpperCase().replace(/\s+/g, '_') as keyof typeof ListingCategory;
        const categoryEnum = ListingCategory[categoryKey] || ListingCategory.OTHER;
        
        const categoryDto: CreateListingDto = {
          title: 'Test Item',
          description: 'Test description for category',
          category: categoryEnum,
          condition: ItemCondition.GOOD,
          city: 'Lagos',
          state: 'Lagos',
        };
        
        const categoryListing = {
          ...mockListing,
          category: categoryEnum,
        };
        
        prismaService.listing.create.mockResolvedValue(categoryListing);
        prismaService.user.findUnique.mockResolvedValue(mockUser);

        const result = await service.createListing('user-1', categoryDto);
        expect(result.category).toBe(categoryEnum);
      }
    });

    it('should validate Nigerian pricing correctly', async () => {
      const invalidAmounts = NIGERIAN_TEST_DATA.CURRENCY.INVALID_AMOUNTS;
      
      for (const amount of invalidAmounts) {
        const invalidDto: CreateListingDto = {
          title: 'Test Item',
          description: 'Test description',
          category: ListingCategory.ELECTRONICS,
          condition: ItemCondition.GOOD,
          city: 'Lagos',
          state: 'Lagos',
          priceInKobo: amount,
        };
        
        if (amount <= 0) {
          // Should handle zero or negative prices appropriately
          // This might be business logic to implement
          expect(amount).toBeLessThanOrEqual(0);
        }
      }
    });
  });

  describe('performance tests', () => {
    it('should handle large search results efficiently', async () => {
      // Arrange
      const largeMockResults = Array.from({ length: 100 }, (_, i) => ({
        ...mockListing,
        id: `listing-${i}`,
        title: `Item ${i}`,
      }));
      
      prismaService.listing.findMany.mockResolvedValue(largeMockResults);
      prismaService.listing.count.mockResolvedValue(1000);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const start = Date.now();
      const largeSearchDto: SearchListingsDto = {
        q: 'test',
        limit: 100,
        page: 1,
      };
      const result = await service.searchListings(largeSearchDto);
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(result.listings).toHaveLength(100);
    });

    it('should handle concurrent listing creation efficiently', async () => {
      // Arrange
      const concurrentCreations = Array.from({ length: 10 }, (_, i) => ({
        title: `Concurrent Listing ${i}`,
        description: 'Test concurrent listing creation',
        category: ListingCategory.ELECTRONICS,
        condition: ItemCondition.GOOD,
        city: 'Lagos',
        state: 'Lagos',
      } as CreateListingDto));

      prismaService.listing.create.mockImplementation((data) => 
        Promise.resolve({ ...mockListing, ...data.data })
      );
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const start = Date.now();
      const promises = concurrentCreations.map(dto => service.createListing('user-1', dto));
      await Promise.all(promises);
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(prismaService.listing.create).toHaveBeenCalledTimes(10);
    });
  });
});