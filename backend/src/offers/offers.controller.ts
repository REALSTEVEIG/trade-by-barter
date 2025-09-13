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
  ParseIntPipe,
  DefaultValuePipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { OffersService } from './offers.service';
import {
  CreateOfferDto,
  CounterOfferDto,
  OfferResponse,
  GetOffersResponse,
  OfferStatsResponse,
} from './dto';

@ApiTags('Offers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new offer',
    description: 'Create a new offer on a listing. Supports cash, swap, and hybrid offers.',
  })
  @ApiResponse({
    status: 201,
    description: 'Offer created successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid offer data or business rule violation',
  })
  @ApiResponse({
    status: 404,
    description: 'Listing not found',
  })
  @ApiResponse({
    status: 409,
    description: 'User already has a pending offer on this listing',
  })
  async createOffer(
    @GetUser('id') userId: string,
    @Body() createOfferDto: CreateOfferDto,
  ): Promise<OfferResponse> {
    return this.offersService.createOffer(userId, createOfferDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user offers',
    description: 'Get offers sent or received by the current user with pagination.',
  })
  @ApiQuery({
    name: 'type',
    enum: ['sent', 'received'],
    required: false,
    description: 'Type of offers to retrieve',
    example: 'received',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of offers per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Offers retrieved successfully',
    type: GetOffersResponse,
  })
  async getOffers(
    @GetUser('id') userId: string,
    @Query('type') type: 'sent' | 'received' = 'received',
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<GetOffersResponse> {
    return this.offersService.getOffers(userId, type, page, limit);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get user offer statistics',
    description: 'Get comprehensive statistics about user offers including success rates and total values.',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer statistics retrieved successfully',
    type: OfferStatsResponse,
  })
  async getOfferStats(@GetUser('id') userId: string): Promise<OfferStatsResponse> {
    return this.offersService.getOfferStats(userId);
  }

  @Get('listing/:listingId')
  @ApiOperation({
    summary: 'Get offers for a specific listing',
    description: 'Get all offers for a listing owned by the current user.',
  })
  @ApiParam({
    name: 'listingId',
    description: 'UUID of the listing',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Number of offers per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Listing offers retrieved successfully',
    type: GetOffersResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'User does not own this listing',
  })
  @ApiResponse({
    status: 404,
    description: 'Listing not found',
  })
  async getOffersForListing(
    @GetUser('id') userId: string,
    @Param('listingId') listingId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<GetOffersResponse> {
    return this.offersService.getOffersForListing(listingId, userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get offer by ID',
    description: 'Get detailed information about a specific offer.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the offer',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer retrieved successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to view this offer',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async getOfferById(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OfferResponse> {
    return this.offersService.getOfferById(id, userId);
  }

  @Put(':id/accept')
  @ApiOperation({
    summary: 'Accept an offer',
    description: 'Accept a pending offer. Only the listing owner can accept offers.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the offer to accept',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer accepted successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Offer cannot be accepted (not pending or expired)',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the listing owner can accept offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async acceptOffer(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OfferResponse> {
    return this.offersService.acceptOffer(id, userId);
  }

  @Put(':id/reject')
  @ApiOperation({
    summary: 'Reject an offer',
    description: 'Reject a pending offer. Only the listing owner can reject offers.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the offer to reject',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer rejected successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Offer cannot be rejected (not pending)',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the listing owner can reject offers',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async rejectOffer(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OfferResponse> {
    return this.offersService.rejectOffer(id, userId);
  }

  @Post(':id/counter')
  @ApiOperation({
    summary: 'Create a counteroffer',
    description: 'Create a counteroffer to an existing offer. Only the listing owner can create counteroffers.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the original offer to counter',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 201,
    description: 'Counteroffer created successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid counteroffer data or maximum counteroffers reached',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the listing owner can create counteroffers',
  })
  @ApiResponse({
    status: 404,
    description: 'Original offer not found',
  })
  async createCounterOffer(
    @GetUser('id') userId: string,
    @Param('id') id: string,
    @Body() counterOfferDto: CounterOfferDto,
  ): Promise<OfferResponse> {
    return this.offersService.createCounterOffer(id, userId, counterOfferDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Withdraw an offer',
    description: 'Withdraw a pending offer. Only the offerer can withdraw their own offers.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the offer to withdraw',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({
    status: 200,
    description: 'Offer withdrawn successfully',
    type: OfferResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Offer cannot be withdrawn (not pending)',
  })
  @ApiResponse({
    status: 403,
    description: 'Only the offerer can withdraw their offer',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  async withdrawOffer(
    @GetUser('id') userId: string,
    @Param('id') id: string,
  ): Promise<OfferResponse> {
    return this.offersService.withdrawOffer(id, userId);
  }
}