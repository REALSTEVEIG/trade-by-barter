import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NIGERIAN_TEST_DATA } from '../setup';

export interface TestUser {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  isVerified: boolean;
  accessToken?: string;
}

export interface TestListing {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  condition: string;
  priceInKobo?: number;
  estimatedValue?: number;
  location?: any;
  city: string;
  state: string;
  specificLocation?: string;
  userId: string;
  status: string;
  images?: string[];
  acceptsCash?: boolean;
  acceptsSwap?: boolean;
  isSwapOnly?: boolean;
  swapPreferences?: string[];
}

export class TestDbUtils {
  constructor(private prisma: PrismaService) {}

  async cleanDatabase(): Promise<void> {
    // Clean in reverse order to respect foreign key constraints
    await this.prisma.message.deleteMany();
    await this.prisma.chat.deleteMany();
    await this.prisma.offerItem.deleteMany();
    await this.prisma.offer.deleteMany();
    await this.prisma.favorite.deleteMany();
    await this.prisma.listingImage.deleteMany();
    await this.prisma.listing.deleteMany();
    await this.prisma.walletTransaction.deleteMany();
    await this.prisma.wallet.deleteMany();
    await this.prisma.adminUser.deleteMany();
    await this.prisma.user.deleteMany();
  }

  async createTestUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const userData = {
      email: `test${Date.now()}@example.com`,
      phone: NIGERIAN_TEST_DATA.PHONE_NUMBERS.VALID[0],
      firstName: 'Test',
      lastName: 'User',
      passwordHash: '$2b$10$example.hash',
      isVerified: true,
      phoneVerified: true,
      ...overrides,
    };

    const user = await this.prisma.user.create({
      data: userData,
    });

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      isVerified: user.isVerified,
    };
  }

  async createTestListing(userId: string, overrides: Partial<TestListing> = {}): Promise<TestListing> {
    const listingData = {
      title: 'Test iPhone 12',
      description: 'Like new iPhone 12 for trade',
      category: 'ELECTRONICS',
      condition: 'LIKE_NEW',
      priceInKobo: 25000000,
      city: 'Lagos',
      state: 'Lagos',
      specificLocation: 'Victoria Island',
      status: 'ACTIVE',
      acceptsCash: true,
      acceptsSwap: true,
      isSwapOnly: false,
      userId,
      ...overrides,
    };

    const listing = await this.prisma.listing.create({
      data: listingData,
    });

    return {
      id: listing.id,
      title: listing.title,
      description: listing.description,
      category: listing.category,
      subcategory: listing.subcategory,
      condition: listing.condition,
      priceInKobo: listing.priceInKobo,
      city: listing.city,
      state: listing.state,
      specificLocation: listing.specificLocation,
      userId: listing.userId,
      status: listing.status,
      acceptsCash: listing.acceptsCash,
      acceptsSwap: listing.acceptsSwap,
      isSwapOnly: listing.isSwapOnly,
      swapPreferences: listing.swapPreferences,
    };
  }

  async createTestOffer(fromUserId: string, toUserId: string, listingId: string): Promise<any> {
    return await this.prisma.offer.create({
      data: {
        fromUserId,
        toUserId,
        listingId,
        status: 'PENDING',
        message: 'Test offer message',
        type: 'DIRECT',
      },
    });
  }
}

export class TestAuthUtils {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(user: TestUser): string {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
      phone: user.phone,
    });
  }

  generateAuthHeader(user: TestUser): { Authorization: string } {
    const token = this.generateAccessToken(user);
    return { Authorization: `Bearer ${token}` };
  }
}

export async function createTestApp(moduleMetadata: any): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule(moduleMetadata).compile();

  const app = moduleFixture.createNestApplication();
  
  // Apply same pipes as main app
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  return app;
}

export const testConfig = {
  timeouts: {
    short: 5000,
    medium: 10000,
    long: 30000,
  },
  pagination: {
    defaultLimit: 10,
    maxLimit: 100,
  },
  nigerian: {
    timeZone: 'Africa/Lagos',
    currency: 'NGN',
    phonePrefix: '+234',
  },
};

// Re-export NIGERIAN_TEST_DATA for use in tests
export { NIGERIAN_TEST_DATA } from '../setup';

// Nigerian-specific test helpers
export const nigerianTestHelpers = {
  isValidNigerianPhone: (phone: string): boolean => {
    return NIGERIAN_TEST_DATA.PHONE_NUMBERS.VALID.includes(phone);
  },
  
  formatNaira: (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  },
  
  isBusinessHours: (): boolean => {
    const now = new Date();
    const lagosTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
    const hour = lagosTime.getHours();
    return hour >= 8 && hour <= 18; // 8 AM to 6 PM WAT
  },
};

// Performance test helpers
export const performanceTestHelpers = {
  async measureDatabaseQuery<T>(queryFn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    const start = process.hrtime.bigint();
    const result = await queryFn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1000000; // Convert to milliseconds
    
    return { result, duration };
  },
  
  expectFastDatabaseQuery: (duration: number, maxMs: number = 100) => {
    expect(duration).toBeLessThan(maxMs);
  },
  
  expectReasonableApiResponse: (duration: number, maxMs: number = 2000) => {
    expect(duration).toBeLessThan(maxMs);
  },
};