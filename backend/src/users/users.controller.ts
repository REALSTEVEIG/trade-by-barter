import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { UsersService, UserProfileResponse, PublicUserProfileResponse } from './users.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(ThrottlerGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        phoneNumber: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        displayName: { type: 'string' },
        profileImageUrl: { type: 'string' },
        isPhoneVerified: { type: 'boolean' },
        isEmailVerified: { type: 'boolean' },
        city: { type: 'string' },
        state: { type: 'string' },
        address: { type: 'string' },
        dateOfBirth: { type: 'string' },
        lastActiveAt: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getProfile(@GetUser('id') userId: string): Promise<UserProfileResponse> {
    return this.usersService.getUserProfile(userId);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        phoneNumber: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        displayName: { type: 'string' },
        profileImageUrl: { type: 'string' },
        isPhoneVerified: { type: 'boolean' },
        isEmailVerified: { type: 'boolean' },
        city: { type: 'string' },
        state: { type: 'string' },
        address: { type: 'string' },
        dateOfBirth: { type: 'string' },
        lastActiveAt: { type: 'string' },
        createdAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateProfile(
    @GetUser('id') userId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) updateProfileDto: UpdateProfileDto,
  ): Promise<UserProfileResponse> {
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ 
    summary: 'Upload user avatar',
    description: 'Upload a profile picture for the current user. Accepts image files (JPEG, PNG, WebP) up to 5MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Avatar uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        profileImageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or size',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async uploadAvatar(
    @GetUser('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ message: string; profileImageUrl: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP images are allowed');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 5MB');
    }

    // For now, we'll simulate file upload and return a placeholder URL
    // In a real implementation, you would upload to AWS S3, Cloudinary, etc.
    const timestamp = Date.now();
    const fileExtension = file.originalname.split('.').pop();
    const simulatedUrl = `https://api.tradebybarter.com/uploads/avatars/${userId}_${timestamp}.${fileExtension}`;

    return this.usersService.updateProfileImage(userId, simulatedUrl);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalListings: { type: 'number' },
        activeListings: { type: 'number' },
        completedTransactions: { type: 'number' },
        totalReviews: { type: 'number' },
        averageRating: { type: 'number' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserStats(@GetUser('id') userId: string) {
    return this.usersService.getUserStats(userId);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or passwords do not match',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized or current password is incorrect',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async changePassword(
    @GetUser('id') userId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true })) changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Delete('account')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Delete user account',
    description: 'Soft delete the current user account. This will deactivate the account but preserve data for audit purposes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteAccount(@GetUser('id') userId: string): Promise<{ message: string }> {
    return this.usersService.deleteAccount(userId);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiResponse({
    status: 200,
    description: 'Public user profile retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        displayName: { type: 'string' },
        profileImageUrl: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' },
        isPhoneVerified: { type: 'boolean' },
        createdAt: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID format',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getPublicProfile(
    @Param('id', ParseUUIDPipe) userId: string,
  ): Promise<PublicUserProfileResponse> {
    return this.usersService.getPublicUserProfile(userId);
  }
}