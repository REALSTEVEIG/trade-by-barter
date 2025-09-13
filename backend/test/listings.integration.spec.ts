import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, TestDbUtils, TestAuthUtils, NIGERIAN_TEST_DATA } from './utils/test-utils';
import { ListingCategory, ItemCondition } from '../src/listings/dto/create-listing.dto';
import { ListingCategoryFilter, TradeTypeFilter, SortByFilter } from '../src/listings/dto/search-listings.dto';

describe('Listings Controller (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testDbUtils: TestDbUtils;
  let testAuthUtils: TestAuthUtils;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);
    prisma = app.get<PrismaService>(PrismaService);
    testDbUtils = new TestDbUtils(prisma);
    testAuthUtils = new TestAuthUtils(app.get('JwtService'));

    await app.init();
  });

  beforeEach(async () => {
    await testDbUtils.cleanDatabase();
  });

  afterAll(async () => {
    await testDbUtils.cleanDatabase();
    await app.close();
  });

  describe('POST /listings', () => {
    let testUser: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    const validListingData = {
      title: 'iPhone 12 Pro Max 256GB',
      description: 'Like new iPhone 12 Pro Max in excellent condition. Original box and accessories included.',
      category: ListingCategory.ELECTRONICS,
      subcategory: 'Mobile Phones',
      condition: ItemCondition.LIKE_NEW,
      priceInKobo: 35000000, // 350,000 Naira
      acceptsCash: true,
      acceptsSwap: true,
      swapPreferences: ['Electronics', 'Gadgets'],
      city: 'Lagos',
      state: 'Lagos',
      specificLocation: 'Victoria Island',
    };

    it('should successfully create a listing with valid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/listings')
        .set(authHeaders)
        .send(validListingData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        title: validListingData.title,
        description: validListingData.description,
        category: ListingCategory.ELECTRONICS,
        condition: ItemCondition.LIKE_NEW,
        price: 35000000,
        displayPrice: expect.stringContaining('₦350,000'),
        city: 'Lagos',
        state: 'Lagos',
        owner: {
          id: testUser.id,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        },
        isOwner: true,
        isFavorite: false,
      });

      // Verify listing was created in database
      const listing = await prisma.listing.findFirst({
        where: { title: validListingData.title },
      });
      expect(listing).toBeTruthy();
      expect(listing!.userId).toBe(testUser.id);
    });

    it('should create swap-only listing without price', async () => {
      const swapOnlyData = {
        ...validListingData,
        priceInKobo: undefined,
        isSwapOnly: true,
        acceptsCash: false,
        acceptsSwap: true,
      };

      const response = await request(app.getHttpServer())
        .post('/listings')
        .set(authHeaders)
        .send(swapOnlyData)
        .expect(201);

      expect(response.body.isSwapOnly).toBe(true);
      expect(response.body.price).toBeNull();
      expect(response.body.acceptsCash).toBe(false);
      expect(response.body.acceptsSwap).toBe(true);
    });

    it('should handle various Nigerian locations correctly', async () => {
      const nigerianLocations = Object.values(NIGERIAN_TEST_DATA.LOCATIONS) as Array<{
        state: string;
        city: string;
        area: string;
      }>;

      for (let i = 0; i < nigerianLocations.length; i++) {
        const location = nigerianLocations[i];
        const locationListingData = {
          ...validListingData,
          title: `Test Item ${i}`,
          city: location.city,
          state: location.state,
          specificLocation: location.area,
        };

        const response = await request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(locationListingData)
          .expect(201);

        expect(response.body.city).toBe(location.city);
        expect(response.body.state).toBe(location.state);
        expect(response.body.specificLocation).toBe(location.area);
      }
    });

    it('should format Nigerian Naira prices correctly', async () => {
      const nairaAmounts = NIGERIAN_TEST_DATA.CURRENCY.NAIRA_AMOUNTS;

      for (let i = 0; i < nairaAmounts.length; i++) {
        const amount = nairaAmounts[i];
        const priceListingData = {
          ...validListingData,
          title: `Priced Item ${i}`,
          priceInKobo: amount * 100, // Convert to kobo
        };

        const response = await request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(priceListingData)
          .expect(201);

        expect(response.body.price).toBe(amount * 100);
        expect(response.body.displayPrice).toContain('₦');
        expect(response.body.displayPrice).toContain(amount.toLocaleString('en-NG'));
      }
    });

    it('should reject swap-only listing with price', async () => {
      const invalidData = {
        ...validListingData,
        isSwapOnly: true,
        priceInKobo: 25000000,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set(authHeaders)
        .send(invalidData)
        .expect(400);
    });

    it('should reject listing that accepts neither cash nor swap', async () => {
      const invalidData = {
        ...validListingData,
        acceptsCash: false,
        acceptsSwap: false,
      };

      await request(app.getHttpServer())
        .post('/listings')
        .set(authHeaders)
        .send(invalidData)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/listings')
        .send(validListingData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const requiredFields = ['title', 'description', 'category', 'condition', 'city', 'state'];

      for (const field of requiredFields) {
        const incompleteData = { ...validListingData };
        delete incompleteData[field as keyof typeof incompleteData];

        await request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(incompleteData)
          .expect(400);
      }
    });
  });

  describe('GET /listings/:id', () => {
    let testUser: any;
    let otherUser: any;
    let testListing: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      otherUser = await testDbUtils.createTestUser({ email: 'other@example.com', phone: '+2348012345679' });
      testListing = await testDbUtils.createTestListing(testUser.id);
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    it('should successfully get listing details', async () => {
      const response = await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testListing.id,
        title: testListing.title,
        description: testListing.description,
        owner: {
          id: testUser.id,
          firstName: testUser.firstName,
          lastName: testUser.lastName,
        },
        isOwner: true,
        viewCount: expect.any(Number),
      });
    });

    it('should increment view count for non-owner', async () => {
      const otherUserHeaders = testAuthUtils.generateAuthHeader(otherUser);

      const response = await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set(otherUserHeaders)
        .expect(200);

      expect(response.body.isOwner).toBe(false);
      expect(response.body.viewCount).toBeGreaterThan(0);
    });

    it('should not increment view count for owner', async () => {
      const initialViewCount = testListing.viewCount || 0;

      await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .set(authHeaders)
        .expect(200);

      // Check database directly to verify view count wasn't incremented
      const updatedListing = await prisma.listing.findUnique({
        where: { id: testListing.id },
        select: { viewCount: true },
      });

      expect(updatedListing!.viewCount).toBe(initialViewCount);
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .get('/listings/non-existent-id')
        .set(authHeaders)
        .expect(404);
    });

    it('should work without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/listings/${testListing.id}`)
        .expect(200);

      expect(response.body.id).toBe(testListing.id);
      expect(response.body.isOwner).toBe(false);
    });
  });

  describe('GET /listings/search', () => {
    let testUser: any;
    let testListings: any[];
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      authHeaders = testAuthUtils.generateAuthHeader(testUser);

      // Create multiple test listings
      testListings = await Promise.all([
        testDbUtils.createTestListing(testUser.id, {
          title: 'iPhone 12 Pro',
          category: 'ELECTRONICS',
          priceInKobo: 25000000,
          city: 'Lagos',
          state: 'Lagos',
        }),
        testDbUtils.createTestListing(testUser.id, {
          title: 'Samsung Galaxy S21',
          category: 'ELECTRONICS',
          priceInKobo: 20000000,
          city: 'Abuja',
          state: 'FCT',
        }),
        testDbUtils.createTestListing(testUser.id, {
          title: 'Nike Air Jordan',
          category: 'FASHION',
          priceInKobo: 15000000,
          city: 'Lagos',
          state: 'Lagos',
        }),
      ]);
    });

    it('should search listings by text query', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ q: 'iPhone' })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(1);
      expect(response.body.listings[0].title).toContain('iPhone');
      expect(response.body.pagination.total).toBe(1);
    });

    it('should filter by category', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ category: ListingCategoryFilter.ELECTRONICS })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(2);
      response.body.listings.forEach((listing: any) => {
        expect(listing.category).toBe('ELECTRONICS');
      });
    });

    it('should filter by price range in Naira', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({
          minPrice: 18000000, // 180,000 Naira
          maxPrice: 30000000, // 300,000 Naira
        })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(2);
      response.body.listings.forEach((listing: any) => {
        expect(listing.price).toBeGreaterThanOrEqual(18000000);
        expect(listing.price).toBeLessThanOrEqual(30000000);
      });
    });

    it('should filter by Nigerian location', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ location: 'Lagos' })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(2);
      response.body.listings.forEach((listing: any) => {
        expect(['Lagos'].includes(listing.city) || ['Lagos'].includes(listing.state)).toBe(true);
      });
    });

    it('should sort by price ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ sortBy: SortByFilter.PRICE_ASC })
        .set(authHeaders)
        .expect(200);

      const prices = response.body.listings.map((listing: any) => listing.price);
      const sortedPrices = [...prices].sort((a, b) => a - b);
      expect(prices).toEqual(sortedPrices);
    });

    it('should sort by price descending', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ sortBy: SortByFilter.PRICE_DESC })
        .set(authHeaders)
        .expect(200);

      const prices = response.body.listings.map((listing: any) => listing.price);
      const sortedPrices = [...prices].sort((a, b) => b - a);
      expect(prices).toEqual(sortedPrices);
    });

    it('should handle pagination correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ page: 1, limit: 2 })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(2);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 2,
        total: 3,
        totalPages: 2,
        hasNext: true,
        hasPrev: false,
      });
    });

    it('should filter by trade type', async () => {
      // Update one listing to be swap-only
      await prisma.listing.update({
        where: { id: testListings[0].id },
        data: {
          acceptsCash: false,
          acceptsSwap: true,
          isSwapOnly: true,
        },
      });

      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ tradeType: TradeTypeFilter.SWAP })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings.length).toBeGreaterThan(0);
      response.body.listings.forEach((listing: any) => {
        expect(listing.acceptsSwap).toBe(true);
      });
    });

    it('should work without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ q: 'iPhone' })
        .expect(200);

      expect(response.body.listings).toHaveLength(1);
    });

    it('should handle empty search results', async () => {
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ q: 'nonexistentitem' })
        .set(authHeaders)
        .expect(200);

      expect(response.body.listings).toHaveLength(0);
      expect(response.body.pagination.total).toBe(0);
    });
  });

  describe('PUT /listings/:id', () => {
    let testUser: any;
    let otherUser: any;
    let testListing: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      otherUser = await testDbUtils.createTestUser({ email: 'other@example.com', phone: '+2348012345679' });
      testListing = await testDbUtils.createTestListing(testUser.id);
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    const updateData = {
      title: 'Updated iPhone 12 Pro',
      priceInKobo: 22000000, // 220,000 Naira
      description: 'Updated description with new information',
    };

    it('should successfully update own listing', async () => {
      const response = await request(app.getHttpServer())
        .put(`/listings/${testListing.id}`)
        .set(authHeaders)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testListing.id,
        title: updateData.title,
        price: updateData.priceInKobo,
        description: updateData.description,
        displayPrice: expect.stringContaining('₦220,000'),
      });

      // Verify update in database
      const updatedListing = await prisma.listing.findUnique({
        where: { id: testListing.id },
      });
      expect(updatedListing!.title).toBe(updateData.title);
    });

    it('should reject updating someone else\'s listing', async () => {
      const otherUserHeaders = testAuthUtils.generateAuthHeader(otherUser);

      await request(app.getHttpServer())
        .put(`/listings/${testListing.id}`)
        .set(otherUserHeaders)
        .send(updateData)
        .expect(403);
    });

    it('should reject swap-only update with price', async () => {
      const invalidUpdate = {
        isSwapOnly: true,
        priceInKobo: 25000000,
      };

      await request(app.getHttpServer())
        .put(`/listings/${testListing.id}`)
        .set(authHeaders)
        .send(invalidUpdate)
        .expect(400);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .put(`/listings/${testListing.id}`)
        .send(updateData)
        .expect(401);
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .put('/listings/non-existent-id')
        .set(authHeaders)
        .send(updateData)
        .expect(404);
    });
  });

  describe('DELETE /listings/:id', () => {
    let testUser: any;
    let otherUser: any;
    let testListing: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      otherUser = await testDbUtils.createTestUser({ email: 'other@example.com', phone: '+2348012345679' });
      testListing = await testDbUtils.createTestListing(testUser.id);
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    it('should successfully soft delete own listing', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .set(authHeaders)
        .expect(200);

      expect(response.body.message).toBe('Listing deleted successfully');

      // Verify soft delete in database
      const deletedListing = await prisma.listing.findUnique({
        where: { id: testListing.id },
      });
      expect(deletedListing!.isActive).toBe(false);
      expect(deletedListing!.status).toBe('REMOVED');
    });

    it('should reject deleting someone else\'s listing', async () => {
      const otherUserHeaders = testAuthUtils.generateAuthHeader(otherUser);

      await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .set(otherUserHeaders)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/listings/${testListing.id}`)
        .expect(401);
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .delete('/listings/non-existent-id')
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('POST /listings/:id/favorite', () => {
    let testUser: any;
    let otherUser: any;
    let testListing: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      otherUser = await testDbUtils.createTestUser({ email: 'other@example.com', phone: '+2348012345679' });
      testListing = await testDbUtils.createTestListing(testUser.id);
      authHeaders = testAuthUtils.generateAuthHeader(otherUser);
    });

    it('should successfully add listing to favorites', async () => {
      const response = await request(app.getHttpServer())
        .post(`/listings/${testListing.id}/favorite`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        isFavorite: true,
        message: 'Added to favorites',
      });

      // Verify favorite was created in database
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: otherUser.id,
          listingId: testListing.id,
        },
      });
      expect(favorite).toBeTruthy();
    });

    it('should successfully remove listing from favorites', async () => {
      // First add to favorites
      await request(app.getHttpServer())
        .post(`/listings/${testListing.id}/favorite`)
        .set(authHeaders)
        .expect(200);

      // Then remove from favorites
      const response = await request(app.getHttpServer())
        .post(`/listings/${testListing.id}/favorite`)
        .set(authHeaders)
        .expect(200);

      expect(response.body).toMatchObject({
        isFavorite: false,
        message: 'Removed from favorites',
      });

      // Verify favorite was removed from database
      const favorite = await prisma.favorite.findFirst({
        where: {
          userId: otherUser.id,
          listingId: testListing.id,
        },
      });
      expect(favorite).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post(`/listings/${testListing.id}/favorite`)
        .expect(401);
    });

    it('should return 404 for non-existent listing', async () => {
      await request(app.getHttpServer())
        .post('/listings/non-existent-id/favorite')
        .set(authHeaders)
        .expect(404);
    });
  });

  describe('Performance and Load Testing', () => {
    let testUser: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    it('should handle concurrent listing creation efficiently', async () => {
      const concurrentListings = Array.from({ length: 10 }, (_, i) => ({
        title: `Concurrent Listing ${i}`,
        description: 'Test concurrent listing creation',
        category: ListingCategory.ELECTRONICS,
        condition: ItemCondition.GOOD,
        priceInKobo: 10000000 + (i * 1000000),
        city: 'Lagos',
        state: 'Lagos',
      }));

      const start = Date.now();
      const promises = concurrentListings.map(listingData =>
        request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(listingData)
          .expect(201)
      );

      await Promise.all(promises);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all listings were created
      const listingCount = await prisma.listing.count({
        where: { userId: testUser.id },
      });
      expect(listingCount).toBe(10);
    });

    it('should handle large search results efficiently', async () => {
      // Create many listings
      const manyListings = Array.from({ length: 50 }, (_, i) => ({
        title: `Test Item ${i}`,
        description: 'Performance test listing',
        category: 'ELECTRONICS',
        condition: 'GOOD',
        priceInKobo: 10000000,
        city: 'Lagos',
        state: 'Lagos',
        userId: testUser.id,
        status: 'ACTIVE',
      }));

      await prisma.listing.createMany({
        data: manyListings,
      });

      const start = Date.now();
      const response = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ limit: 50 })
        .set(authHeaders)
        .expect(200);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
      expect(response.body.listings.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Nigerian Market Features', () => {
    let testUser: any;
    let authHeaders: any;

    beforeEach(async () => {
      testUser = await testDbUtils.createTestUser();
      authHeaders = testAuthUtils.generateAuthHeader(testUser);
    });

    it('should handle all Nigerian categories', async () => {
      const nigerianCategories = NIGERIAN_TEST_DATA.CATEGORIES;
      
      for (let i = 0; i < nigerianCategories.length; i++) {
        const category = nigerianCategories[i];
        const categoryKey = category.toUpperCase().replace(/\s+/g, '_') as keyof typeof ListingCategory;
        const categoryEnum = ListingCategory[categoryKey] || ListingCategory.OTHER;
        
        const categoryListingData = {
          title: `${category} Item`,
          description: `Test ${category} listing`,
          category: categoryEnum,
          condition: ItemCondition.GOOD,
          priceInKobo: 10000000,
          city: 'Lagos',
          state: 'Lagos',
        };

        const response = await request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(categoryListingData)
          .expect(201);

        expect(response.body.category).toBe(categoryEnum);
      }
    });

    it('should validate Nigerian pricing patterns', async () => {
      const nairaAmounts = NIGERIAN_TEST_DATA.CURRENCY.NAIRA_AMOUNTS;

      for (const amount of nairaAmounts) {
        const priceListingData = {
          title: `Naira Test Item`,
          description: 'Testing Nigerian pricing',
          category: ListingCategory.ELECTRONICS,
          condition: ItemCondition.GOOD,
          priceInKobo: amount * 100, // Convert to kobo
          city: 'Lagos',
          state: 'Lagos',
        };

        const response = await request(app.getHttpServer())
          .post('/listings')
          .set(authHeaders)
          .send(priceListingData)
          .expect(201);

        // Should format with Nigerian locale
        expect(response.body.displayPrice).toContain('₦');
        expect(response.body.displayPrice).toMatch(/₦[\d,]+/);
      }
    });

    it('should search across Nigerian locations effectively', async () => {
      const locations = Object.values(NIGERIAN_TEST_DATA.LOCATIONS) as Array<{
        state: string;
        city: string;
        area: string;
      }>;

      // Create listings in different Nigerian locations
      for (let i = 0; i < locations.length; i++) {
        const location = locations[i];
        await testDbUtils.createTestListing(testUser.id, {
          title: `Item in ${location.city}`,
          city: location.city,
          state: location.state,
          specificLocation: location.area,
        });
      }

      // Search by different location criteria
      for (const location of locations) {
        const response = await request(app.getHttpServer())
          .get('/listings/search')
          .query({ location: location.state })
          .set(authHeaders)
          .expect(200);

        expect(response.body.listings.length).toBeGreaterThan(0);
        const matchingListing = response.body.listings.find((listing: any) => 
          listing.state === location.state || listing.city === location.city
        );
        expect(matchingListing).toBeTruthy();
      }
    });
  });
});