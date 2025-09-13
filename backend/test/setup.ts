import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';

// Global test variables
declare global {
  var __TEST_APP__: INestApplication;
  var __TEST_PRISMA__: PrismaService;
}

// Setup for all tests
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/tradebybarter_test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '24h';
  process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
});

// Cleanup after all tests
afterAll(async () => {
  if (global.__TEST_APP__) {
    await global.__TEST_APP__.close();
  }
});

// Mock external services
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
    disconnect: jest.fn(),
  }));
});

jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
        Key: 'test-file.jpg',
      }),
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
  })),
}));

// Nigerian context test data
export const NIGERIAN_TEST_DATA = {
  PHONE_NUMBERS: {
    VALID: ['+2348012345678', '+2347012345678', '+2349012345678'],
    INVALID: ['+1234567890', '+447012345678', '+33123456789'],
  },
  LOCATIONS: {
    LAGOS: { state: 'Lagos', city: 'Lagos', area: 'Victoria Island' },
    ABUJA: { state: 'FCT', city: 'Abuja', area: 'Wuse 2' },
    KANO: { state: 'Kano', city: 'Kano', area: 'Fagge' },
  },
  CURRENCY: {
    NAIRA_AMOUNTS: [1000, 5000, 10000, 50000, 100000],
    INVALID_AMOUNTS: [-100, 0, 0.5],
  },
  CATEGORIES: [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Vehicles',
    'Real Estate',
    'Services',
  ],
};

// Test performance helpers
export const performanceHelpers = {
  measureTime: async (fn: () => Promise<any>) => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  },
  
  expectFastResponse: (duration: number, maxMs: number = 1000) => {
    expect(duration).toBeLessThan(maxMs);
  },
};

// Network simulation helpers for Nigerian context
export const networkHelpers = {
  simulateSlowNetwork: () => {
    jest.setTimeout(10000); // Increase timeout for slow network simulation
  },
  
  simulateNetworkError: () => {
    throw new Error('Network Error: Poor connectivity simulation');
  },
};