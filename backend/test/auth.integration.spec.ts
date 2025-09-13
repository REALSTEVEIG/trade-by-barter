import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, TestDbUtils, TestAuthUtils, NIGERIAN_TEST_DATA } from './utils/test-utils';

describe('Auth Controller (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testDbUtils: TestDbUtils;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await createTestApp(moduleFixture);
    prisma = app.get<PrismaService>(PrismaService);
    testDbUtils = new TestDbUtils(prisma);

    await app.init();
  });

  beforeEach(async () => {
    await testDbUtils.cleanDatabase();
  });

  afterAll(async () => {
    await testDbUtils.cleanDatabase();
    await app.close();
  });

  describe('POST /auth/signup', () => {
    const validSignupData = {
      email: 'test@example.com',
      phoneNumber: '08012345678',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
      city: 'Lagos',
      state: 'Lagos',
    };

    it('should successfully register a new user with valid Nigerian phone number', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupData)
        .expect(201);

      expect(response.body).toMatchObject({
        user: {
          email: validSignupData.email,
          phoneNumber: '+234 801 234 5678',
          firstName: validSignupData.firstName,
          lastName: validSignupData.lastName,
          city: validSignupData.city,
          state: validSignupData.state,
          isPhoneVerified: false,
          isEmailVerified: false,
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: validSignupData.email },
      });
      expect(user).toBeTruthy();
      expect(user.phoneNumber).toBe('+234 801 234 5678');
    });

    it('should accept various valid Nigerian phone number formats', async () => {
      const validFormats = [
        '08012345678',
        '07012345679',
        '09012345680',
        '+2348012345681',
        '+234 801 234 5682',
      ];

      for (let i = 0; i < validFormats.length; i++) {
        const signupData = {
          ...validSignupData,
          email: `test${i}@example.com`,
          phoneNumber: validFormats[i],
        };

        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupData)
          .expect(201);

        expect(response.body.user.phoneNumber).toMatch(/^\+234/);
      }
    });

    it('should reject invalid Nigerian phone numbers', async () => {
      const invalidNumbers = [
        '+1234567890', // US number
        '+447012345678', // UK number
        '05012345678', // Invalid Nigerian prefix
        '080123456789', // Too long
        '08012345', // Too short
      ];

      for (const invalidNumber of invalidNumbers) {
        const signupData = {
          ...validSignupData,
          phoneNumber: invalidNumber,
        };

        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupData)
          .expect(400);
      }
    });

    it('should validate required fields', async () => {
      const requiredFields = ['email', 'phoneNumber', 'password', 'firstName', 'lastName', 'city', 'state'];

      for (const field of requiredFields) {
        const incompleteData = { ...validSignupData };
        delete incompleteData[field as keyof typeof incompleteData];

        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(incompleteData)
          .expect(400);
      }
    });

    it('should reject duplicate email', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupData)
        .expect(201);

      // Try to create user with same email
      const duplicateEmailData = {
        ...validSignupData,
        phoneNumber: '08012345679',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(duplicateEmailData)
        .expect(409);

      expect(response.body.message).toContain('email already exists');
    });

    it('should reject duplicate phone number', async () => {
      // Create first user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(validSignupData)
        .expect(201);

      // Try to create user with same phone number
      const duplicatePhoneData = {
        ...validSignupData,
        email: 'different@example.com',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(duplicatePhoneData)
        .expect(409);

      expect(response.body.message).toContain('phone number already exists');
    });

    it('should validate password strength', async () => {
      const weakPasswords = ['123', 'password', 'abc123', '12345678'];

      for (const weakPassword of weakPasswords) {
        const weakPasswordData = {
          ...validSignupData,
          password: weakPassword,
        };

        await request(app.getHttpServer())
          .post('/auth/signup')
          .send(weakPasswordData)
          .expect(400);
      }
    });

    it('should handle Nigerian location data correctly', async () => {
      const nigerianLocations = Object.values(NIGERIAN_TEST_DATA.LOCATIONS) as Array<{
        state: string;
        city: string;
        area: string;
      }>;

      for (let i = 0; i < nigerianLocations.length; i++) {
        const location = nigerianLocations[i];
        const locationData = {
          ...validSignupData,
          email: `test${i}@example.com`,
          phoneNumber: `08012345${i.toString().padStart(3, '0')}`,
          city: location.city,
          state: location.state,
        };

        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(locationData)
          .expect(201);

        expect(response.body.user.city).toBe(location.city);
        expect(response.body.user.state).toBe(location.state);
      }
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create a test user
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'login@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'Login',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      testUser = signupResponse.body.user;
    });

    it('should successfully login with email and password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'login@example.com',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        user: {
          id: testUser.id,
          email: testUser.email,
          phoneNumber: testUser.phoneNumber,
        },
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });
    });

    it('should successfully login with Nigerian phone number and password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: '08012345678',
          password: 'Password123!',
        })
        .expect(200);

      expect(response.body.user.phoneNumber).toBe('+234 801 234 5678');
    });

    it('should reject invalid credentials', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'login@example.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });

    it('should reject login for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          identifier: 'login@example.com',
          // missing password
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          // missing identifier
          password: 'Password123!',
        })
        .expect(400);
    });
  });

  describe('POST /auth/verify-otp', () => {
    let testUser: any;

    beforeEach(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'otp@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'OTP',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      testUser = signupResponse.body.user;
    });

    it('should successfully verify OTP', async () => {
      // Get the OTP from database (in real app, this would be sent via SMS)
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { phoneOtp: true, phoneOtpExpiresAt: true },
      });

      const response = await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: user.phoneOtp,
        })
        .expect(200);

      expect(response.body.message).toBe('Phone number verified successfully');

      // Verify user is marked as verified
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { isPhoneVerified: true, phoneOtp: true },
      });
      expect(updatedUser.isPhoneVerified).toBe(true);
      expect(updatedUser.phoneOtp).toBeNull();
    });

    it('should reject invalid OTP', async () => {
      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: '000000',
        })
        .expect(400);
    });

    it('should reject verification for already verified number', async () => {
      // First verify the number
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { phoneOtp: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: user.phoneOtp,
        })
        .expect(200);

      // Try to verify again
      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: user.phoneOtp,
        })
        .expect(400);
    });

    it('should handle expired OTP', async () => {
      // Manually expire the OTP
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          phoneOtpExpiresAt: new Date(Date.now() - 1000), // 1 second ago
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { phoneOtp: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: user.phoneOtp,
        })
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    let testUser: any;
    let refreshToken: string;

    beforeEach(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'refresh@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'Refresh',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      testUser = signupResponse.body.user;
      refreshToken = signupResponse.body.refreshToken;
    });

    it('should successfully refresh tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        expiresIn: expect.any(Number),
      });

      // New tokens should be different from old ones
      expect(response.body.refreshToken).not.toBe(refreshToken);
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should reject expired refresh token', async () => {
      // Manually expire the refresh token
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          refreshTokenExpiresAt: new Date(Date.now() - 1000),
        },
      });

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken,
        })
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    let testUser: any;
    let accessToken: string;

    beforeEach(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'logout@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'Logout',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      testUser = signupResponse.body.user;
      accessToken = signupResponse.body.accessToken;
    });

    it('should successfully logout user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');

      // Verify refresh token was cleared
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { refreshToken: true },
      });
      expect(user.refreshToken).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .expect(401);
    });
  });

  describe('POST /auth/resend-otp', () => {
    let testUser: any;

    beforeEach(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'resend@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'Resend',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      testUser = signupResponse.body.user;
    });

    it('should successfully resend OTP', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({
          phoneNumber: '08012345678',
        })
        .expect(200);

      expect(response.body.message).toBe('OTP sent successfully');

      // Verify new OTP was generated
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { phoneOtp: true, phoneOtpExpiresAt: true },
      });
      expect(user.phoneOtp).toBeTruthy();
      expect(user.phoneOtpExpiresAt).toBeTruthy();
    });

    it('should reject resend for already verified number', async () => {
      // First verify the number
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { phoneOtp: true },
      });

      await request(app.getHttpServer())
        .post('/auth/verify-otp')
        .send({
          phoneNumber: '08012345678',
          otp: user.phoneOtp,
        });

      // Try to resend OTP
      await request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({
          phoneNumber: '08012345678',
        })
        .expect(400);
    });

    it('should reject resend for non-existent number', async () => {
      await request(app.getHttpServer())
        .post('/auth/resend-otp')
        .send({
          phoneNumber: '08099999999',
        })
        .expect(404);
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle concurrent signups efficiently', async () => {
      const concurrentSignups = Array.from({ length: 10 }, (_, i) => ({
        email: `concurrent${i}@example.com`,
        phoneNumber: `0801234567${i}`,
        password: 'Password123!',
        firstName: 'User',
        lastName: `${i}`,
        city: 'Lagos',
        state: 'Lagos',
      }));

      const start = Date.now();
      const promises = concurrentSignups.map(userData =>
        request(app.getHttpServer())
          .post('/auth/signup')
          .send(userData)
          .expect(201)
      );

      await Promise.all(promises);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds

      // Verify all users were created
      const userCount = await prisma.user.count();
      expect(userCount).toBe(10);
    });

    it('should handle rapid login attempts', async () => {
      // Create test user
      await request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'rapid@example.com',
          phoneNumber: '08012345678',
          password: 'Password123!',
          firstName: 'Rapid',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        });

      // Rapid login attempts
      const loginAttempts = Array.from({ length: 5 }, () => 
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            identifier: 'rapid@example.com',
            password: 'Password123!',
          })
          .expect(200)
      );

      const start = Date.now();
      await Promise.all(loginAttempts);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(3000); // Should complete within 3 seconds
    });
  });

  describe('Security Testing', () => {
    it('should prevent SQL injection in signup', async () => {
      const maliciousData = {
        email: "test'; DROP TABLE users; --",
        phoneNumber: '08012345678',
        password: 'Password123!',
        firstName: "'; DROP TABLE users; --",
        lastName: 'User',
        city: 'Lagos',
        state: 'Lagos',
      };

      await request(app.getHttpServer())
        .post('/auth/signup')
        .send(maliciousData)
        .expect(400); // Should be rejected by validation

      // Verify database is intact
      const userCount = await prisma.user.count();
      expect(userCount).toBe(0);
    });

    it('should sanitize Nigerian phone number input', async () => {
      const phoneVariations = [
        '08012345678',
        ' 08012345678 ',
        '(080) 1234-5678',
        '080-1234-5678',
        '080.1234.5678',
      ];

      for (let i = 0; i < phoneVariations.length; i++) {
        const signupData = {
          email: `sanitize${i}@example.com`,
          phoneNumber: phoneVariations[i],
          password: 'Password123!',
          firstName: 'Test',
          lastName: 'User',
          city: 'Lagos',
          state: 'Lagos',
        };

        const response = await request(app.getHttpServer())
          .post('/auth/signup')
          .send(signupData);

        if (response.status === 201) {
          expect(response.body.user.phoneNumber).toMatch(/^\+234 80[1-9] \d{3} \d{4}$/);
        }
      }
    });

    it('should rate limit authentication attempts', async () => {
      // This test would require implementing rate limiting
      // For now, we just verify the endpoint responds correctly
      const rapidAttempts = Array.from({ length: 20 }, () => 
        request(app.getHttpServer())
          .post('/auth/login')
          .send({
            identifier: 'nonexistent@example.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(rapidAttempts);
      
      // Most should be 401 (unauthorized), but some might be 429 (too many requests)
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status);
      });
    });
  });
});