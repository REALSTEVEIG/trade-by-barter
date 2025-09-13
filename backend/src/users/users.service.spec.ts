import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import * as argon2 from 'argon2';
import { NIGERIAN_TEST_DATA } from '../../test/setup';

// Mock argon2
jest.mock('argon2');
const mockedArgon2 = jest.mocked(argon2);

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user-1',
    email: 'john.doe@example.com',
    phoneNumber: '+2348012345678',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'johndoe',
    profileImageUrl: 'https://example.com/profile.jpg',
    isPhoneVerified: true,
    isEmailVerified: false,
    city: 'Lagos',
    state: 'Lagos',
    address: '123 Victoria Island, Lagos',
    dateOfBirth: new Date('1990-01-01'),
    password: 'hashedPassword',
    isActive: true,
    isBlocked: false,
    lastActiveAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserStats = {
    totalListings: 5,
    activeListings: 3,
    completedTransactions: 2,
    reviews: [
      { rating: 5 },
      { rating: 4 },
      { rating: 5 },
    ],
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      listing: {
        count: jest.fn(),
      },
      transaction: {
        count: jest.fn(),
      },
      review: {
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('getUserProfile', () => {
    it('should successfully get user profile', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getUserProfile('user-1');

      // Assert
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          firstName: true,
          lastName: true,
          displayName: true,
          profileImageUrl: true,
          isPhoneVerified: true,
          isEmailVerified: true,
          city: true,
          state: true,
          address: true,
          dateOfBirth: true,
          lastActiveAt: true,
          createdAt: true,
          isActive: true,
          isBlocked: true,
        },
      });
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect(result.phoneNumber).toBe(mockUser.phoneNumber);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserProfile('non-existent')).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });

    it('should throw NotFoundException when user is inactive', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      // Act & Assert
      await expect(service.getUserProfile('user-1')).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });

    it('should throw NotFoundException when user is blocked', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isBlocked: true,
      });

      // Act & Assert
      await expect(service.getUserProfile('user-1')).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });
  });

  describe('getPublicUserProfile', () => {
    it('should successfully get public user profile with limited information', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.getPublicUserProfile('user-1');

      // Assert
      expect(result.id).toBe(mockUser.id);
      expect(result.firstName).toBe(mockUser.firstName);
      expect(result.lastName).toBe(mockUser.lastName);
      expect(result.isPhoneVerified).toBe(mockUser.isPhoneVerified);
      // Should not include sensitive information
      expect(result).not.toHaveProperty('email');
      expect(result).not.toHaveProperty('phoneNumber');
      expect(result).not.toHaveProperty('address');
    });

    it('should throw NotFoundException for inactive user', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      // Act & Assert
      await expect(service.getPublicUserProfile('user-1')).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });
  });

  describe('updateProfile', () => {
    const updateProfileDto: UpdateProfileDto = {
      firstName: 'Jane',
      lastName: 'Smith',
      displayName: 'janesmith',
      city: 'Abuja',
      state: 'FCT',
      address: '456 Wuse 2, Abuja',
      dateOfBirth: '1995-05-15',
    };

    it('should successfully update user profile with Nigerian location', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, ...updateProfileDto, dateOfBirth: new Date('1995-05-15') };
      prismaService.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await service.updateProfile('user-1', updateProfileDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          ...updateProfileDto,
          dateOfBirth: new Date('1995-05-15'),
        },
        select: expect.any(Object),
      });
      expect(result.firstName).toBe(updateProfileDto.firstName);
      expect(result.city).toBe(updateProfileDto.city);
      expect(result.state).toBe(updateProfileDto.state);
    });

    it('should handle Nigerian locations correctly', async () => {
      // Test with various Nigerian locations
      const nigerianLocations = Object.values(NIGERIAN_TEST_DATA.LOCATIONS);
      
      for (const location of nigerianLocations) {
        const locationUpdate = {
          city: location.city,
          state: location.state,
          address: `Test address in ${location.area}`,
        };
        
        prismaService.user.findUnique.mockResolvedValue(mockUser);
        const updatedUser = { ...mockUser, ...locationUpdate };
        prismaService.user.update.mockResolvedValue(updatedUser);

        const result = await service.updateProfile('user-1', locationUpdate);
        
        expect(result.city).toBe(location.city);
        expect(result.state).toBe(location.state);
      }
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProfile('non-existent', updateProfileDto)).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });

    it('should convert dateOfBirth string to Date object', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        dateOfBirth: new Date('1995-05-15'),
      });

      // Act
      await service.updateProfile('user-1', updateProfileDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          dateOfBirth: new Date('1995-05-15'),
        }),
        select: expect.any(Object),
      });
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456',
    };

    it('should successfully change password with valid current password', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      mockedArgon2.hash.mockResolvedValue('newHashedPassword');
      prismaService.user.update.mockResolvedValue(mockUser);

      // Act
      const result = await service.changePassword('user-1', changePasswordDto);

      // Assert
      expect(mockedArgon2.verify).toHaveBeenCalledWith(mockUser.password, changePasswordDto.currentPassword);
      expect(mockedArgon2.hash).toHaveBeenCalledWith(changePasswordDto.newPassword);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'newHashedPassword',
          refreshToken: null,
          refreshTokenExpiresAt: null,
        },
      });
      expect(result.message).toBe('Password changed successfully');
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      // Arrange
      const mismatchedDto = {
        ...changePasswordDto,
        confirmPassword: 'differentPassword',
      };

      // Act & Assert
      await expect(service.changePassword('user-1', mismatchedDto)).rejects.toThrow(
        new BadRequestException('New password and confirmation do not match')
      );
    });

    it('should throw UnauthorizedException when current password is incorrect', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(false);

      // Act & Assert
      await expect(service.changePassword('user-1', changePasswordDto)).rejects.toThrow(
        new UnauthorizedException('Current password is incorrect')
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.changePassword('non-existent', changePasswordDto)).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });

    it('should clear refresh tokens on password change for security', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      mockedArgon2.verify.mockResolvedValue(true);
      mockedArgon2.hash.mockResolvedValue('newHashedPassword');
      prismaService.user.update.mockResolvedValue(mockUser);

      // Act
      await service.changePassword('user-1', changePasswordDto);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          refreshToken: null,
          refreshTokenExpiresAt: null,
        }),
      });
    });
  });

  describe('updateProfileImage', () => {
    const imageUrl = 'https://example.com/new-profile.jpg';

    it('should successfully update profile image', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        profileImageUrl: imageUrl,
      });

      // Act
      const result = await service.updateProfileImage('user-1', imageUrl);

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { profileImageUrl: imageUrl },
      });
      expect(result.message).toBe('Profile image updated successfully');
      expect(result.profileImageUrl).toBe(imageUrl);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.updateProfileImage('non-existent', imageUrl)).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });
  });

  describe('deleteAccount', () => {
    it('should successfully soft delete user account', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      // Act
      const result = await service.deleteAccount('user-1');

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          isActive: false,
          refreshToken: null,
          refreshTokenExpiresAt: null,
          phoneOtp: null,
          phoneOtpExpiresAt: null,
        },
      });
      expect(result.message).toBe('Account deleted successfully');
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteAccount('non-existent')).rejects.toThrow(
        new NotFoundException('User not found')
      );
    });

    it('should clear sensitive data on account deletion', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      // Act
      await service.deleteAccount('user-1');

      // Assert
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: expect.objectContaining({
          isActive: false,
          refreshToken: null,
          refreshTokenExpiresAt: null,
          phoneOtp: null,
          phoneOtpExpiresAt: null,
        }),
      });
    });
  });

  describe('getUserStats', () => {
    it('should successfully get user statistics', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.count
        .mockResolvedValueOnce(5) // totalListings
        .mockResolvedValueOnce(3); // activeListings
      prismaService.transaction.count.mockResolvedValue(2);
      prismaService.review.findMany.mockResolvedValue(mockUserStats.reviews);

      // Act
      const result = await service.getUserStats('user-1');

      // Assert
      expect(result.totalListings).toBe(5);
      expect(result.activeListings).toBe(3);
      expect(result.completedTransactions).toBe(2);
      expect(result.totalReviews).toBe(3);
      expect(result.averageRating).toBe(4.7); // (5+4+5)/3 = 4.67, rounded to 4.7
    });

    it('should handle user with no reviews correctly', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.count
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(1);
      prismaService.transaction.count.mockResolvedValue(0);
      prismaService.review.findMany.mockResolvedValue([]);

      // Act
      const result = await service.getUserStats('user-1');

      // Assert
      expect(result.totalReviews).toBe(0);
      expect(result.averageRating).toBe(0);
    });

    it('should calculate average rating correctly with decimal precision', async () => {
      // Arrange
      const reviewsWithDecimals = [
        { rating: 5 },
        { rating: 3 },
        { rating: 4 },
        { rating: 2 },
      ];
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);
      prismaService.transaction.count.mockResolvedValue(5);
      prismaService.review.findMany.mockResolvedValue(reviewsWithDecimals);

      // Act
      const result = await service.getUserStats('user-1');

      // Assert
      expect(result.averageRating).toBe(3.5); // (5+3+4+2)/4 = 3.5
    });

    it('should count transactions for both sender and receiver', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.count
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);
      prismaService.transaction.count.mockResolvedValue(7);
      prismaService.review.findMany.mockResolvedValue([]);

      // Act
      await service.getUserStats('user-1');

      // Assert
      expect(prismaService.transaction.count).toHaveBeenCalledWith({
        where: {
          OR: [{ senderId: 'user-1' }, { receiverId: 'user-1' }],
          status: 'COMPLETED',
        },
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      prismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.getUserStats('non-existent')).rejects.toThrow(
        new NotFoundException('User not found or account is inactive')
      );
    });
  });

  describe('Nigerian market specific features', () => {
    it('should handle Nigerian phone number display in profile', async () => {
      // Arrange
      const nigerianUser = {
        ...mockUser,
        phoneNumber: '+2348012345678',
      };
      
      prismaService.user.findUnique.mockResolvedValue(nigerianUser);

      // Act
      const result = await service.getUserProfile('user-1');

      // Assert
      expect(result.phoneNumber).toBe('+2348012345678');
    });

    it('should handle various Nigerian states correctly', async () => {
      const nigerianStates = ['Lagos', 'FCT', 'Kano', 'Rivers', 'Oyo', 'Kaduna'];
      
      for (const state of nigerianStates) {
        const stateUser = {
          ...mockUser,
          state,
          city: state === 'FCT' ? 'Abuja' : state,
        };
        
        prismaService.user.findUnique.mockResolvedValue(stateUser);
        
        const result = await service.getUserProfile('user-1');
        expect(result.state).toBe(state);
      }
    });

    it('should validate Nigerian context in profile updates', async () => {
      // Test updating to Nigerian locations
      const nigerianLocationUpdate = {
        city: 'Port Harcourt',
        state: 'Rivers',
        address: '123 Trans Amadi, Port Harcourt',
      };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, ...nigerianLocationUpdate };
      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('user-1', nigerianLocationUpdate);
      
      expect(result.city).toBe('Port Harcourt');
      expect(result.state).toBe('Rivers');
    });
  });

  describe('performance tests', () => {
    it('should handle multiple profile updates efficiently', async () => {
      // Arrange
      const updates = Array.from({ length: 10 }, (_, i) => ({
        displayName: `user${i}`,
        city: 'Lagos',
        state: 'Lagos',
      }));

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockImplementation((data) => 
        Promise.resolve({ ...mockUser, ...data.data })
      );

      // Act
      const start = Date.now();
      const promises = updates.map(update => service.updateProfile('user-1', update));
      await Promise.all(promises);
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(2000); // Should complete within 2 seconds
      expect(prismaService.user.update).toHaveBeenCalledTimes(10);
    });

    it('should efficiently calculate stats for users with many reviews', async () => {
      // Arrange
      const manyReviews = Array.from({ length: 100 }, (_, i) => ({
        rating: (i % 5) + 1, // Ratings from 1-5
      }));

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.listing.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30);
      prismaService.transaction.count.mockResolvedValue(25);
      prismaService.review.findMany.mockResolvedValue(manyReviews);

      // Act
      const start = Date.now();
      const result = await service.getUserStats('user-1');
      const duration = Date.now() - start;

      // Assert
      expect(duration).toBeLessThan(1000); // Should complete within 1 second
      expect(result.totalReviews).toBe(100);
      expect(result.averageRating).toBeGreaterThan(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string updates gracefully', async () => {
      // Arrange
      const emptyUpdate = {
        displayName: '',
        address: '',
      };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...emptyUpdate,
      });

      // Act
      const result = await service.updateProfile('user-1', emptyUpdate);

      // Assert
      expect(result.displayName).toBe('');
      expect(result.address).toBe('');
    });

    it('should handle null dateOfBirth correctly', async () => {
      // Arrange
      const updateWithNullDate = {
        firstName: 'Test',
        dateOfBirth: undefined,
      };
      
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        firstName: 'Test',
        dateOfBirth: null,
      });

      // Act
      const result = await service.updateProfile('user-1', updateWithNullDate);

      // Assert
      expect(result.firstName).toBe('Test');
      expect(result.dateOfBirth).toBeNull();
    });
  });
});