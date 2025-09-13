import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { createTestApp, TestDbUtils, TestAuthUtils, NIGERIAN_TEST_DATA } from '../utils/test-utils';
import { ListingCategory, ItemCondition } from '../../src/listings/dto/create-listing.dto';

describe('Complete Barter Transaction Flow (E2E)', () => {
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

  describe('Complete Nigerian Barter Transaction', () => {
    it('should complete full barter transaction between two Nigerian users', async () => {
      // === STEP 1: User A Registration ===
      const userASignup = {
        email: 'adebayo@example.com',
        phoneNumber: '08012345678',
        password: 'SecurePass123!',
        firstName: 'Adebayo',
        lastName: 'Johnson',
        city: 'Lagos',
        state: 'Lagos',
      };

      const userAResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userASignup)
        .expect(201);

      const userA = userAResponse.body.user;
      const userATokens = {
        accessToken: userAResponse.body.accessToken,
        refreshToken: userAResponse.body.refreshToken,
      };

      expect(userA.phoneNumber).toBe('+234 801 234 5678');
      expect(userA.city).toBe('Lagos');
      expect(userA.state).toBe('Lagos');

      // === STEP 2: User A Phone Verification ===
      const userAFromDb = await prisma.user.findUnique({
        where: { id: userA.id },
        select: { phoneOtp: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: userAFromDb!.phoneOtp,
        })
        .expect(200);

      // === STEP 3: User B Registration ===
      const userBSignup = {
        email: 'kemi@example.com',
        phoneNumber: '08087654321',
        password: 'SecurePass456!',
        firstName: 'Kemi',
        lastName: 'Adebola',
        city: 'Abuja',
        state: 'FCT',
      };

      const userBResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(userBSignup)
        .expect(201);

      const userB = userBResponse.body.user;
      const userBTokens = {
        accessToken: userBResponse.body.accessToken,
        refreshToken: userBResponse.body.refreshToken,
      };

      // === STEP 4: User B Phone Verification ===
      const userBFromDb = await prisma.user.findUnique({
        where: { id: userB.id },
        select: { phoneOtp: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08087654321',
          otp: userBFromDb!.phoneOtp,
        })
        .expect(200);

      // === STEP 5: User A Creates iPhone Listing ===
      const iphoneListingData = {
        title: 'iPhone 13 Pro Max 256GB',
        description: 'Excellent condition iPhone 13 Pro Max. Used for 6 months only. Original box, charger, and unused earphones included.',
        category: ListingCategory.ELECTRONICS,
        subcategory: 'Mobile Phones',
        condition: ItemCondition.LIKE_NEW,
        priceInKobo: 45000000, // 450,000 Naira
        acceptsCash: true,
        acceptsSwap: true,
        swapPreferences: ['Electronics', 'Gadgets', 'Laptops'],
        city: 'Lagos',
        state: 'Lagos',
        specificLocation: 'Victoria Island',
      };

      const iphoneListingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send(iphoneListingData)
        .expect(201);

      const iphoneListing = iphoneListingResponse.body;
      expect(iphoneListing.displayPrice).toBe('₦450,000');
      expect(iphoneListing.owner.firstName).toBe('Adebayo');

      // === STEP 6: User B Creates MacBook Listing ===
      const macbookListingData = {
        title: 'MacBook Air M2 512GB',
        description: 'Nearly new MacBook Air with M2 chip. Perfect for students and professionals. Includes original charger and box.',
        category: ListingCategory.ELECTRONICS,
        subcategory: 'Laptops',
        condition: ItemCondition.LIKE_NEW,
        priceInKobo: 50000000, // 500,000 Naira
        acceptsCash: true,
        acceptsSwap: true,
        swapPreferences: ['Electronics', 'Mobile Phones'],
        city: 'Abuja',
        state: 'FCT',
        specificLocation: 'Wuse 2',
      };

      const macbookListingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send(macbookListingData)
        .expect(201);

      const macbookListing = macbookListingResponse.body;
      expect(macbookListing.displayPrice).toBe('₦500,000');

      // === STEP 7: User B Searches for iPhones ===
      const searchResponse = await request(app.getHttpServer())
        .get('/listings/search')
        .query({
          q: 'iPhone',
          category: ListingCategory.ELECTRONICS,
          minPrice: 30000000, // 300,000 Naira
          maxPrice: 60000000, // 600,000 Naira
        })
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      expect(searchResponse.body.listings).toHaveLength(1);
      expect(searchResponse.body.listings[0].title).toContain('iPhone 13 Pro Max');

      // === STEP 8: User B Favorites User A's iPhone ===
      await request(app.getHttpServer())
        .post(`/listings/${iphoneListing.id}/favorite`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      // === STEP 9: User B Makes Swap Offer ===
      const offerData = {
        type: 'SWAP',
        message: 'Hi! I am interested in your iPhone 13 Pro Max. I have a MacBook Air M2 that I would like to swap. Both items are in excellent condition. Let me know if you are interested!',
        swapItemIds: [macbookListing.id],
      };

      const offerResponse = await request(app.getHttpServer())
        .post(`/offers`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send({
          ...offerData,
          listingId: iphoneListing.id,
        })
        .expect(201);

      const offer = offerResponse.body;
      expect(offer.type).toBe('SWAP');
      expect(offer.status).toBe('PENDING');
      expect(offer.fromUser.firstName).toBe('Kemi');
      expect(offer.toUser.firstName).toBe('Adebayo');

      // === STEP 10: User A Views Received Offers ===
      const receivedOffersResponse = await request(app.getHttpServer())
        .get('/offers/received')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(receivedOffersResponse.body.offers).toHaveLength(1);
      expect(receivedOffersResponse.body.offers[0].id).toBe(offer.id);

      // === STEP 11: User A Makes Counter Offer ===
      const counterOfferData = {
        priceAdjustment: 5000000, // Request 50,000 Naira additional
        message: 'Your MacBook looks great! However, since my iPhone is newer, could you add 50,000 Naira to make it fair?',
      };

      const counterOfferResponse = await request(app.getHttpServer())
        .post(`/offers/${offer.id}/counter`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send(counterOfferData)
        .expect(201);

      expect(counterOfferResponse.body.status).toBe('COUNTER_OFFERED');
      expect(counterOfferResponse.body.priceAdjustment).toBe(5000000);

      // === STEP 12: User B Views Counter Offer ===
      const sentOffersResponse = await request(app.getHttpServer())
        .get('/offers/sent')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      const updatedOffer = sentOffersResponse.body.offers[0];
      expect(updatedOffer.status).toBe('COUNTER_OFFERED');

      // === STEP 13: User B Accepts Counter Offer ===
      await request(app.getHttpServer())
        .post(`/offers/${offer.id}/accept`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      // === STEP 14: Verify Offer Status ===
      const finalOfferResponse = await request(app.getHttpServer())
        .get(`/offers/${offer.id}`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      expect(finalOfferResponse.body.status).toBe('ACCEPTED');

      // === STEP 15: Create Chat for Coordination ===
      const chatData = {
        participantId: userA.id,
        initialMessage: 'Great! The swap is accepted. When and where can we meet in Lagos to exchange the items?',
      };

      const chatResponse = await request(app.getHttpServer())
        .post('/chats')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send(chatData)
        .expect(201);

      const chat = chatResponse.body;
      expect(chat.participants).toHaveLength(2);

      // === STEP 16: Exchange Messages ===
      const messageData = {
        content: 'How about Victoria Island tomorrow at 2 PM? We can meet at the Shoprite parking lot.',
        type: 'TEXT',
      };

      const messageResponse = await request(app.getHttpServer())
        .post(`/chats/${chat.id}/messages`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send(messageData)
        .expect(201);

      expect(messageResponse.body.content).toBe(messageData.content);
      expect(messageResponse.body.sender.firstName).toBe('Adebayo');

      // === STEP 17: Confirm Meeting ===
      const confirmationData = {
        content: 'Perfect! See you tomorrow at 2 PM at Shoprite Victoria Island. I will bring my MacBook and 50,000 Naira cash.',
        type: 'TEXT',
      };

      await request(app.getHttpServer())
        .post(`/chats/${chat.id}/messages`)
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send(confirmationData)
        .expect(201);

      // === STEP 18: Get Chat History ===
      const chatHistoryResponse = await request(app.getHttpServer())
        .get(`/chats/${chat.id}/messages`)
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(chatHistoryResponse.body.messages).toHaveLength(3); // Initial + 2 replies
      expect(chatHistoryResponse.body.messages[0].content).toContain('swap is accepted');

      // === STEP 19: Complete Transaction ===
      const transactionData = {
        offerId: offer.id,
        status: 'COMPLETED',
        notes: 'Items exchanged successfully at Victoria Island. Both parties satisfied.',
      };

      const transactionResponse = await request(app.getHttpServer())
        .post('/transactions')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send(transactionData)
        .expect(201);

      expect(transactionResponse.body.status).toBe('COMPLETED');
      expect(transactionResponse.body.offerId).toBe(offer.id);

      // === STEP 20: Leave Reviews ===
      const userAReviewData = {
        targetUserId: userB.id,
        transactionId: transactionResponse.body.id,
        rating: 5,
        comment: 'Excellent trader! Kemi was punctual, honest, and the MacBook was exactly as described. Highly recommended!',
      };

      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .send(userAReviewData)
        .expect(201);

      const userBReviewData = {
        targetUserId: userA.id,
        transactionId: transactionResponse.body.id,
        rating: 5,
        comment: 'Great experience trading with Adebayo! The iPhone was in perfect condition and the transaction was smooth.',
      };

      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .send(userBReviewData)
        .expect(201);

      // === STEP 21: Verify Final State ===
      // Check that listings are now inactive
      const finalListingResponse = await request(app.getHttpServer())
        .get(`/listings/${iphoneListing.id}`)
        .expect(200);

      expect(finalListingResponse.body.status).toBe('TRADED'); // Assuming status is updated

      // Check user stats
      const userAStatsResponse = await request(app.getHttpServer())
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${userATokens.accessToken}`)
        .expect(200);

      expect(userAStatsResponse.body.completedTransactions).toBe(1);
      expect(userAStatsResponse.body.averageRating).toBe(5);

      const userBStatsResponse = await request(app.getHttpServer())
        .get('/users/me/stats')
        .set('Authorization', `Bearer ${userBTokens.accessToken}`)
        .expect(200);

      expect(userBStatsResponse.body.completedTransactions).toBe(1);
      expect(userBStatsResponse.body.averageRating).toBe(5);

      // === VERIFICATION: Complete Transaction Chain ===
      // Verify the entire transaction chain exists in the database
      const dbOffer = await prisma.offer.findUnique({
        where: { id: offer.id },
        include: {
          fromUser: true,
          toUser: true,
          listing: true,
          transaction: true,
        },
      });

      expect(dbOffer).toBeTruthy();
      expect(dbOffer!.status).toBe('ACCEPTED');
      expect(dbOffer!.transaction).toBeTruthy();
      expect(dbOffer!.fromUser.firstName).toBe('Kemi');
      expect(dbOffer!.toUser.firstName).toBe('Adebayo');

      const dbChat = await prisma.chat.findFirst({
        where: {
          participants: {
            some: { userId: userA.id },
          },
        },
        include: {
          messages: true,
          participants: true,
        },
      });

      expect(dbChat).toBeTruthy();
      expect(dbChat!.messages).toHaveLength(3);
      expect(dbChat!.participants).toHaveLength(2);

      const dbReviews = await prisma.review.findMany({
        where: {
          transactionId: transactionResponse.body.id,
        },
      });

      expect(dbReviews).toHaveLength(2);
      expect(dbReviews.every(review => review.rating === 5)).toBe(true);
    });

    it('should handle failed transaction with dispute resolution', async () => {
      // Create two users
      const userA = await testDbUtils.createTestUser();
      const userB = await testDbUtils.createTestUser({ 
        email: 'userb@example.com', 
        phone: '+2348087654321' 
      });

      const userAHeaders = testAuthUtils.generateAuthHeader(userA);
      const userBHeaders = testAuthUtils.generateAuthHeader(userB);

      // Create listing
      const listing = await testDbUtils.createTestListing(userA.id);

      // Create offer
      const offer = await testDbUtils.createTestOffer(userB.id, userA.id, listing.id);

      // Accept offer
      await request(app.getHttpServer())
        .post(`/offers/${offer.id}/accept`)
        .set(userAHeaders)
        .expect(200);

      // Start escrow transaction
      const escrowData = {
        offerId: offer.id,
        amount: 45000000, // 450,000 Naira
        description: 'iPhone 13 Pro Max trade payment',
      };

      const escrowResponse = await request(app.getHttpServer())
        .post('/escrow')
        .set(userBHeaders)
        .send(escrowData)
        .expect(201);

      // User reports issue
      const disputeData = {
        reason: 'ITEM_NOT_AS_DESCRIBED',
        description: 'The iPhone received has a cracked screen which was not mentioned in the listing.',
        evidence: ['photo1.jpg', 'photo2.jpg'],
      };

      const disputeResponse = await request(app.getHttpServer())
        .post(`/escrow/${escrowResponse.body.id}/dispute`)
        .set(userBHeaders)
        .send(disputeData)
        .expect(201);

      expect(disputeResponse.body.status).toBe('DISPUTED');
      expect(disputeResponse.body.reason).toBe('ITEM_NOT_AS_DESCRIBED');

      // Verify escrow is now in dispute
      const escrowStatusResponse = await request(app.getHttpServer())
        .get(`/escrow/${escrowResponse.body.id}`)
        .set(userAHeaders)
        .expect(200);

      expect(escrowStatusResponse.body.status).toBe('DISPUTED');
    });
  });

  describe('Multi-User Nigerian Market Scenarios', () => {
    it('should handle multiple users trading in different Nigerian cities', async () => {
      const cities = Object.values(NIGERIAN_TEST_DATA.LOCATIONS) as Array<{
        state: string;
        city: string;
        area: string;
      }>;

      const users: any[] = [];
      const listings: any[] = [];

      // Create users in different Nigerian cities
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const user = await testDbUtils.createTestUser({
          email: `user${i}@example.com`,
          phone: `+23480123456${i.toString().padStart(2, '0')}`,
          firstName: `User${i}`,
          lastName: 'Nigerian',
        });

        // Update user location
        await prisma.user.update({
          where: { id: user.id },
          data: {
            city: city.city,
            state: city.state,
          },
        });

        users.push({ ...user, city: city.city, state: city.state });

        // Create listing for each user
        const listing = await testDbUtils.createTestListing(user.id, {
          title: `${city.city} Special Item ${i}`,
          description: `Unique item from ${city.city}, ${city.state}`,
          city: city.city,
          state: city.state,
          specificLocation: city.area,
          priceInKobo: (i + 1) * 10000000, // Varying prices
        });

        listings.push(listing);
      }

      // Search by location should return relevant results
      for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const userHeaders = testAuthUtils.generateAuthHeader(users[i]);

        const locationSearchResponse = await request(app.getHttpServer())
          .get('/listings/search')
          .query({ location: city.state })
          .set(userHeaders)
          .expect(200);

        // Should find at least the listing from that state
        expect(locationSearchResponse.body.listings.length).toBeGreaterThan(0);
        
        const relevantListing = locationSearchResponse.body.listings.find(
          (listing: any) => listing.state === city.state
        );
        expect(relevantListing).toBeTruthy();
      }

      // Cross-city offers
      const lagosUser = users.find(user => user.city === 'Lagos');
      const abujaUser = users.find(user => user.city === 'Abuja');

      if (lagosUser && abujaUser) {
        const abujaListing = listings.find(listing => listing.city === 'Abuja');
        
        if (abujaListing) {
          const crossCityOfferData = {
            type: 'CASH',
            amount: abujaListing.priceInKobo,
            message: 'I am interested in your item. I am in Lagos but willing to travel to Abuja for this trade.',
            listingId: abujaListing.id,
          };

          const crossCityOfferResponse = await request(app.getHttpServer())
            .post('/offers')
            .set(testAuthUtils.generateAuthHeader(lagosUser))
            .send(crossCityOfferData)
            .expect(201);

          expect(crossCityOfferResponse.body.fromUser.city).toBe('Lagos');
          expect(crossCityOfferResponse.body.toUser.city).toBe('Abuja');
        }
      }

      // Verify all listings are discoverable through general search
      const allListingsResponse = await request(app.getHttpServer())
        .get('/listings/search')
        .query({ limit: 50 })
        .expect(200);

      expect(allListingsResponse.body.listings.length).toBe(cities.length);
      
      // Verify Naira pricing is formatted correctly for all listings
      allListingsResponse.body.listings.forEach((listing: any) => {
        expect(listing.displayPrice).toMatch(/₦[\d,]+/);
      });
    });

    it('should handle high-value transactions with proper validation', async () => {
      const highValueUser1 = await testDbUtils.createTestUser({
        email: 'highvalue1@example.com',
        phone: '+2348012345678',
      });

      const highValueUser2 = await testDbUtils.createTestUser({
        email: 'highvalue2@example.com',
        phone: '+2348087654321',
      });

      // Create high-value listing (2 million Naira car)
      const highValueListingData = {
        title: 'Toyota Camry 2020',
        description: 'Well-maintained Toyota Camry 2020 model. Full service history, accident-free.',
        category: ListingCategory.VEHICLES,
        subcategory: 'Cars',
        condition: ItemCondition.GOOD,
        priceInKobo: 200000000000, // 2,000,000 Naira
        acceptsCash: true,
        acceptsSwap: false,
        city: 'Lagos',
        state: 'Lagos',
        specificLocation: 'Ikeja',
      };

      const highValueListingResponse = await request(app.getHttpServer())
        .post('/listings')
        .set(testAuthUtils.generateAuthHeader(highValueUser1))
        .send(highValueListingData)
        .expect(201);

      // Verify high-value formatting
      expect(highValueListingResponse.body.displayPrice).toBe('₦2,000,000');

      // Create high-value offer
      const highValueOfferData = {
        type: 'CASH',
        amount: 200000000000,
        message: 'I am seriously interested in your Toyota Camry. I have the full amount ready and can meet for inspection.',
        listingId: highValueListingResponse.body.id,
      };

      const highValueOfferResponse = await request(app.getHttpServer())
        .post('/offers')
        .set(testAuthUtils.generateAuthHeader(highValueUser2))
        .send(highValueOfferData)
        .expect(201);

      expect(highValueOfferResponse.body.amount).toBe(200000000000);

      // Such high-value transactions should require additional verification
      // (This would be implemented in the business logic)
      const offerDetails = await request(app.getHttpServer())
        .get(`/offers/${highValueOfferResponse.body.id}`)
        .set(testAuthUtils.generateAuthHeader(highValueUser1))
        .expect(200);

      expect(offerDetails.body.amount).toBe(200000000000);
    });
  });

  describe('Performance Under Load', () => {
    it('should handle concurrent user activities efficiently', async () => {
      const numberOfUsers = 20;
      const users: any[] = [];

      // Create multiple users concurrently
      const userCreationPromises = Array.from({ length: numberOfUsers }, async (_, i) => {
        const user = await testDbUtils.createTestUser({
          email: `concurrent${i}@example.com`,
          phone: `+2348012345${i.toString().padStart(3, '0')}`,
          firstName: `User${i}`,
        });
        return user;
      });

      const startTime = Date.now();
      const createdUsers = await Promise.all(userCreationPromises);
      const userCreationTime = Date.now() - startTime;

      expect(userCreationTime).toBeLessThan(10000); // Should complete within 10 seconds
      expect(createdUsers).toHaveLength(numberOfUsers);

      users.push(...createdUsers);

      // Create listings concurrently
      const listingCreationPromises = users.map(async (user, i) => {
        const listingData = {
          title: `Concurrent Item ${i}`,
          description: `Item created by user ${i}`,
          category: ListingCategory.ELECTRONICS,
          condition: ItemCondition.GOOD,
          priceInKobo: (i + 1) * 5000000, // 50k, 100k, 150k Naira etc.
          city: 'Lagos',
          state: 'Lagos',
        };

        return request(app.getHttpServer())
          .post('/listings')
          .set(testAuthUtils.generateAuthHeader(user))
          .send(listingData)
          .expect(201);
      });

      const listingStartTime = Date.now();
      const listingResponses = await Promise.all(listingCreationPromises);
      const listingCreationTime = Date.now() - listingStartTime;

      expect(listingCreationTime).toBeLessThan(8000); // Should complete within 8 seconds
      expect(listingResponses).toHaveLength(numberOfUsers);

      // Concurrent searches
      const searchPromises = users.map(user => 
        request(app.getHttpServer())
          .get('/listings/search')
          .query({ limit: 10 })
          .set(testAuthUtils.generateAuthHeader(user))
          .expect(200)
      );

      const searchStartTime = Date.now();
      const searchResponses = await Promise.all(searchPromises);
      const searchTime = Date.now() - searchStartTime;

      expect(searchTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(searchResponses).toHaveLength(numberOfUsers);

      // Verify all searches returned results
      searchResponses.forEach(response => {
        expect(response.body.listings.length).toBeGreaterThan(0);
      });

      // Verify database integrity
      const totalListings = await prisma.listing.count();
      expect(totalListings).toBe(numberOfUsers);

      const totalUsers = await prisma.user.count();
      expect(totalUsers).toBe(numberOfUsers);
    });
  });
});