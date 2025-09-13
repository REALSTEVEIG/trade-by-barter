import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
import * as argon2 from 'argon2';
import { NIGERIAN_TEST_DATA } from '../../test/setup';

// Mock argon2
jest.mock('argon2');
const mockedArgon2 = jest.mocked(argon2);

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    phoneNumber: '+2348012345678',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedPassword',
    isPhoneVerified: false,
    isEmailVerified: false,
    isActive: true,
    isBlocked: false,
    city: 'Lagos',
    state: 'Lagos',
    displayName: null,
    profileImageUrl: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    phoneOtp: '123456',
    phoneOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockJwtService = {
      sign: jest.fn(),
      signAsync: jest.fn(),
      verify: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto: SignupDto = {
      email: 'test@example.com',
      phoneNumber: '08012345678',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      city: 'Lagos',
      state: 'Lagos',
    };

    it('should successfully create a new user with valid Nigerian phone number', async () => {
      // Arrange
      prismaService.user.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      mockedArgon2.hash.mockResolvedValue('hashedPassword');
      jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      configService.get.mockReturnValue('secret');

      // Act
      const result = await service.signup(signupDto);

      // Assert
      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: signupDto.email },
            { phoneNumber: '+234 801 234 5678' },
          ],
        },
      });
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('accessToken');
      expect(result.refreshToken).toBe('refreshToken');
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      prismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        email: signupDto.email,
      });

      // Act & Assert
      await expect(service.signup(signupDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );
    });

    it('should throw ConflictException when phone number already exists', async () => {
      // Arrange
      prismaService.user.findFirst.mockResolvedValue({
        ...mockUser,
        phoneNumber: '+234 801 234 5678',
      });

      // Act & Assert
      await expect(service.signup(signupDto)).rejects.toThrow(
        new ConflictException('User with this phone number already exists')
      );
    });

    it('should throw BadRequestException for invalid Nigerian phone number', async () => {
      // Arrange
      const invalidSignupDto = {
        ...signupDto,
        phoneNumber: '+1234567890', // Non-Nigerian number
      };

      // Act & Assert
      await expect(service.signup(invalidSignupDto)).rejects.toThrow(
        new BadRequestException('Invalid Nigerian phone number format')
      );
    });

    it('should handle phone number validation for various Nigerian formats', async () => {
      // Test multiple valid Nigerian phone number formats
      const validFormats = NIGERIAN_TEST_DATA.PHONE_NUMBERS.VALID;
      
      for (const phoneNumber of validFormats) {
        prismaService.user.findFirst.mockResolvedValue(null);
        prismaService.user.create.mockResolvedValue({
          ...mockUser,
          phoneNumber,
        });
        mockedArgon2.hash.mockResolvedValue('hashedPassword');
        jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');

        const testDto = { ...signupDto, phoneNumber, email: `test${Date.now()}@example.com` };
        
        await expect(service.signup(testDto)).resolves.toBeDefined();
      }
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      identifier: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login with valid email credentials', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      mockedArgon2.hash.mockResolvedValue('hashedRefreshToken');
      jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      configService.get.mockReturnValue('secret');

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.identifier },
        select: expect.any(Object),
      });
      expect(mockedArgon2.verify).toHaveBeenCalledWith(mockUser.password, loginDto.password);
      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('accessToken');
      expect(result.refreshToken).toBe('refreshToken');
    });

    it('should successfully login with valid Nigerian phone number', async () => {
      // Arrange
      const phoneLoginDto = {
        identifier: '08012345678',
        password: 'password123',
      };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      mockedArgon2.hash.mockResolvedValue('hashedRefreshToken');
      jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      configService.get.mockReturnValue('secret');

      // Act
      const result = await service.login(phoneLoginDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phoneNumber: '+234 801 234 5678' },
        select: expect.any(Object),
      });
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(false);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Account is inactive or blocked')
      );
    });

    it('should throw UnauthorizedException when user is blocked', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isBlocked: true,
      });

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Account is inactive or blocked')
      );
    });

    it('should update user last active time on successful login', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      mockedArgon2.hash.mockResolvedValue('hashedRefreshToken');
      jwtService.signAsync.mockResolvedValueOnce('accessToken').mockResolvedValueOnce('refreshToken');
      configService.get.mockReturnValue('secret');

      // Act
      await service.login(loginDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          refreshToken: 'hashedRefreshToken',
          refreshTokenExpiresAt: expect.any(Date),
          lastActiveAt: expect.any(Date),
        },
      });
    });
  });

  describe('verifyOtp', () => {
    const verifyOtpDto: VerifyOtpDto = {
      phoneNumber: '08012345678',
      otp: '123456',
    };

    it('should successfully verify OTP for Nigerian phone number', async () => {
      // Arrange
      const userWithOtp = {
        ...mockUser,
        phoneOtp: '123456',
        phoneOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        isPhoneVerified: false,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithOtp);
      prismaService.user.update.mockResolvedValue(userWithOtp);

      // Act
      const result = await service.verifyOtp(verifyOtpDto);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phoneNumber: '+234 801 234 5678' },
        select: expect.any(Object),
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userWithOtp.id },
        data: {
          isPhoneVerified: true,
          phoneOtp: null,
          phoneOtpExpiresAt: null,
        },
      });
      expect(result.message).toBe('Phone number verified successfully');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should throw BadRequestException when phone is already verified', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isPhoneVerified: true,
      });

      // Act & Assert
      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        new BadRequestException('Phone number is already verified')
      );
    });

    it('should throw BadRequestException when OTP has expired', async () => {
      // Arrange
      const userWithExpiredOtp = {
        ...mockUser,
        phoneOtp: '123456',
        phoneOtpExpiresAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        isPhoneVerified: false,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithExpiredOtp);

      // Act & Assert
      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        new BadRequestException('OTP has expired')
      );
    });

    it('should throw BadRequestException when OTP is invalid', async () => {
      // Arrange
      const userWithDifferentOtp = {
        ...mockUser,
        phoneOtp: '654321', // Different OTP
        phoneOtpExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
        isPhoneVerified: false,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithDifferentOtp);

      // Act & Assert
      await expect(service.verifyOtp(verifyOtpDto)).rejects.toThrow(
        new BadRequestException('Invalid OTP')
      );
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'validRefreshToken',
    };

    const jwtPayload = {
      sub: 'user-1',
      email: 'test@example.com',
      phoneNumber: '+2348012345678',
    };

    it('should successfully refresh tokens with valid refresh token', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(jwtPayload);
      const userWithValidRefreshToken = {
        ...mockUser,
        refreshToken: 'hashedRefreshToken',
        refreshTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithValidRefreshToken);
      mockedArgon2.verify.mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValueOnce('newAccessToken').mockResolvedValueOnce('newRefreshToken');
      configService.get.mockReturnValue('secret');

      // Act
      const result = await service.refreshTokens(refreshTokenDto);

      // Assert
      expect(jwtService.verify).toHaveBeenCalledWith(refreshTokenDto.refreshToken, {
        secret: 'secret',
      });
      expect(result.accessToken).toBe('newAccessToken');
      expect(result.refreshToken).toBe('newRefreshToken');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      // Arrange
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token')
      );
    });

    it('should throw UnauthorizedException when user not found', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(jwtPayload);
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('User not found or inactive')
      );
    });

    it('should throw UnauthorizedException when refresh token has expired', async () => {
      // Arrange
      jwtService.verify.mockReturnValue(jwtPayload);
      const userWithExpiredRefreshToken = {
        ...mockUser,
        refreshToken: 'hashedRefreshToken',
        refreshTokenExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      };
      
      prismaService.user.findUnique.mockResolvedValue(userWithExpiredRefreshToken);

      // Act & Assert
      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Refresh token has expired')
      );
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      // Arrange
      const userId = 'user-1';
      prismaService.user.update.mockResolvedValue(mockUser);

      // Act
      const result = await service.logout(userId);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
      expect(result.message).toBe('Logged out successfully');
    });
  });

  describe('resendOtp', () => {
    it('should successfully resend OTP for unverified Nigerian phone number', async () => {
      // Arrange
      const phoneNumber = '08012345678';
      const userUnverified = {
        ...mockUser,
        isPhoneVerified: false,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userUnverified);
      prismaService.user.update.mockResolvedValue(userUnverified);

      // Act
      const result = await service.resendOtp(phoneNumber);

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { phoneNumber: '+234 801 234 5678' },
        select: expect.any(Object),
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: userUnverified.id },
        data: {
          phoneOtp: expect.any(String),
          phoneOtpExpiresAt: expect.any(Date),
        },
      });
      expect(result.message).toBe('OTP sent successfully');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.resendOtp('08012345678')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should throw BadRequestException when phone is already verified', async () => {
      // Arrange
      const userVerified = {
        ...mockUser,
        isPhoneVerified: true,
      };
      
      prismaService.user.findUnique.mockResolvedValue(userVerified);

      // Act & Assert
      await expect(service.resendOtp('08012345678')).rejects.toThrow(
        new BadRequestException('Phone number is already verified')
      );
    });
  });

  describe('Nigerian phone number validation', () => {
    it('should accept various valid Nigerian phone number formats', () => {
      const validNumbers = [
        '08012345678',
        '07012345678',
        '09012345678',
        '08112345678',
        '08712345678',
        '+2348012345678',
        '+234 801 234 5678',
      ];

      validNumbers.forEach(number => {
        expect(() => {
          // Access the private method through service instance
          (service as any).validateAndFormatPhoneNumber(number);
        }).not.toThrow();
      });
    });

    it('should reject invalid phone number formats', () => {
      const invalidNumbers = [
        '+1234567890', // US number
        '+447012345678', // UK number
        '1234567890', // Too short
        '080123456789', // Too long
        '05012345678', // Invalid Nigerian prefix
      ];

      invalidNumbers.forEach(number => {
        expect(() => {
          (service as any).validateAndFormatPhoneNumber(number);
        }).toThrow(BadRequestException);
      });
    });
  });

  describe('performance tests', () => {
    it('should handle concurrent signup requests efficiently', async () => {
      // Arrange
      const concurrentSignups = Array.from({ length: 10 }, (_, i) => ({
        email: `user${i}@example.com`,
        phoneNumber: `0801234567${i}`,
        password: 'password123',
        firstName: 'User',
        lastName: `${i}`,
        city: 'Lagos',
        state: 'Lagos',
      }));

      prismaService.user.findFirst.mockResolvedValue(null);
      prismaService.user.create.mockImplementation((data) => 
        Promise.resolve({ ...mockUser, ...data.data })
      );
      mockedArgon2.hash.mockResolvedValue('hashedPassword');
      jwtService.signAsync.mockResolvedValue('token');
      configService.get.mockReturnValue('secret');

      // Act
      const start = Date.now();
      const promises = concurrentSignups.map(signup => service.signup(signup));
      await Promise.all(promises);
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
      expect(prismaService.user.create).toHaveBeenCalledTimes(10);
    });
  });
});