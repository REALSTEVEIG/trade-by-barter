import { Test, TestingModule } from '@nestjs/testing';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateOfferDto, CounterOfferDto } from './dto';
import { OfferType } from './dto/offer-types';

describe('OffersController', () => {
  let controller: OffersController;
  let service: OffersService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
  };

  const mockListing = {
    id: 'listing-1',
    title: 'iPhone 13 Pro',
    userId: 'user-2',
    isActive: true,
    status: 'ACTIVE',
    acceptsCash: true,
    acceptsSwap: true,
    isSwapOnly: false,
    priceInKobo: 85000000,
  };

  const mockOfferResponse = {
    id: 'offer-1',
    type: OfferType.CASH,
    status: 'PENDING',
    cashAmount: 80000000,
    displayCashAmount: '₦800,000',
    message: 'I am interested in this item',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    listing: {
      id: 'listing-1',
      title: 'iPhone 13 Pro',
      owner: {
        id: 'user-2',
        firstName: 'Seller',
        lastName: 'User',
        isPhoneVerified: true,
        averageRating: 4.5,
        totalReviews: 10,
      },
    },
    offerer: {
      id: 'user-1',
      firstName: 'Test',
      lastName: 'User',
      isPhoneVerified: true,
      averageRating: 4.0,
      totalReviews: 5,
    },
    isOfferer: true,
    isListingOwner: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffersController],
      providers: [
        {
          provide: OffersService,
          useValue: {
            createOffer: jest.fn(),
            getOffers: jest.fn(),
            getOfferById: jest.fn(),
            acceptOffer: jest.fn(),
            rejectOffer: jest.fn(),
            withdrawOffer: jest.fn(),
            createCounterOffer: jest.fn(),
            getOffersForListing: jest.fn(),
            getOfferStats: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            offer: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            listing: {
              findUnique: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
            },
            notification: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<OffersController>(OffersController);
    service = module.get<OffersService>(OffersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('createOffer', () => {
    it('should create a cash offer successfully', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'listing-1',
        type: OfferType.CASH,
        cashAmount: 80000000,
        message: 'I am interested in this item',
      };

      jest.spyOn(service, 'createOffer').mockResolvedValue(mockOfferResponse);

      const result = await controller.createOffer(mockUser.id, createOfferDto);

      expect(service.createOffer).toHaveBeenCalledWith(mockUser.id, createOfferDto);
      expect(result).toEqual(mockOfferResponse);
    });

    it('should create a swap offer successfully', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'listing-1',
        type: OfferType.SWAP,
        offeredListingIds: ['listing-2'],
        message: 'Would you like to swap?',
      };

      const swapOfferResponse = {
        ...mockOfferResponse,
        type: OfferType.SWAP,
        cashAmount: undefined,
        displayCashAmount: undefined,
        offeredListings: [
          {
            id: 'listing-2',
            title: 'Samsung Galaxy S21',
            category: 'ELECTRONICS',
            condition: 'GOOD',
            price: 70000000,
            displayPrice: '₦700,000',
            images: [],
            owner: mockOfferResponse.offerer,
          },
        ],
      };

      jest.spyOn(service, 'createOffer').mockResolvedValue(swapOfferResponse);

      const result = await controller.createOffer(mockUser.id, createOfferDto);

      expect(service.createOffer).toHaveBeenCalledWith(mockUser.id, createOfferDto);
      expect(result.type).toBe(OfferType.SWAP);
      expect(result.offeredListings).toBeDefined();
    });

    it('should create a hybrid offer successfully', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'listing-1',
        type: OfferType.HYBRID,
        cashAmount: 30000000,
        offeredListingIds: ['listing-2'],
        message: 'My phone plus some cash',
      };

      const hybridOfferResponse = {
        ...mockOfferResponse,
        type: OfferType.HYBRID,
        cashAmount: 30000000,
        displayCashAmount: '₦300,000',
        offeredListings: [
          {
            id: 'listing-2',
            title: 'Samsung Galaxy S21',
            category: 'ELECTRONICS',
            condition: 'GOOD',
            price: 50000000,
            displayPrice: '₦500,000',
            images: [],
            owner: mockOfferResponse.offerer,
          },
        ],
      };

      jest.spyOn(service, 'createOffer').mockResolvedValue(hybridOfferResponse);

      const result = await controller.createOffer(mockUser.id, createOfferDto);

      expect(service.createOffer).toHaveBeenCalledWith(mockUser.id, createOfferDto);
      expect(result.type).toBe(OfferType.HYBRID);
      expect(result.cashAmount).toBe(30000000);
      expect(result.offeredListings).toBeDefined();
    });

    it('should throw BadRequestException for invalid offer data', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'listing-1',
        type: OfferType.CASH,
        // Missing required cashAmount for CASH offer
      };

      jest.spyOn(service, 'createOffer').mockRejectedValue(
        new BadRequestException('Cash amount is required for CASH offers')
      );

      await expect(controller.createOffer(mockUser.id, createOfferDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw ConflictException for duplicate pending offer', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'listing-1',
        type: OfferType.CASH,
        cashAmount: 80000000,
      };

      jest.spyOn(service, 'createOffer').mockRejectedValue(
        new ConflictException('You already have a pending offer on this listing')
      );

      await expect(controller.createOffer(mockUser.id, createOfferDto)).rejects.toThrow(
        ConflictException
      );
    });

    it('should throw NotFoundException for non-existent listing', async () => {
      const createOfferDto: CreateOfferDto = {
        listingId: 'non-existent-listing',
        type: OfferType.CASH,
        cashAmount: 80000000,
      };

      jest.spyOn(service, 'createOffer').mockRejectedValue(
        new NotFoundException('Listing not found or is not available')
      );

      await expect(controller.createOffer(mockUser.id, createOfferDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getOffers', () => {
    it('should get user offers with pagination', async () => {
      const mockResponse = {
        offers: [mockOfferResponse],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      jest.spyOn(service, 'getOffers').mockResolvedValue(mockResponse);

      const result = await controller.getOffers(mockUser.id, 'received', 1, 20);

      expect(service.getOffers).toHaveBeenCalledWith(mockUser.id, 'received', 1, 20);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('acceptOffer', () => {
    it('should accept an offer successfully', async () => {
      const acceptedOffer = {
        ...mockOfferResponse,
        status: 'ACCEPTED',
      };

      jest.spyOn(service, 'acceptOffer').mockResolvedValue(acceptedOffer);

      const result = await controller.acceptOffer(mockUser.id, 'offer-1');

      expect(service.acceptOffer).toHaveBeenCalledWith('offer-1', mockUser.id);
      expect(result.status).toBe('ACCEPTED');
    });

    it('should throw ForbiddenException when non-owner tries to accept', async () => {
      jest.spyOn(service, 'acceptOffer').mockRejectedValue(
        new ForbiddenException('Only the listing owner can accept this offer')
      );

      await expect(controller.acceptOffer(mockUser.id, 'offer-1')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw BadRequestException for non-pending offer', async () => {
      jest.spyOn(service, 'acceptOffer').mockRejectedValue(
        new BadRequestException('Only pending offers can be accepted')
      );

      await expect(controller.acceptOffer(mockUser.id, 'offer-1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('rejectOffer', () => {
    it('should reject an offer successfully', async () => {
      const rejectedOffer = {
        ...mockOfferResponse,
        status: 'REJECTED',
      };

      jest.spyOn(service, 'rejectOffer').mockResolvedValue(rejectedOffer);

      const result = await controller.rejectOffer(mockUser.id, 'offer-1');

      expect(service.rejectOffer).toHaveBeenCalledWith('offer-1', mockUser.id);
      expect(result.status).toBe('REJECTED');
    });
  });

  describe('createCounterOffer', () => {
    it('should create a counteroffer successfully', async () => {
      const counterOfferDto: CounterOfferDto = {
        type: OfferType.CASH,
        cashAmount: 85000000,
        message: 'How about this price?',
      };

      const counterOfferResponse = {
        ...mockOfferResponse,
        id: 'counter-offer-1',
        cashAmount: 85000000,
        displayCashAmount: '₦850,000',
        parentOfferId: 'offer-1',
      };

      jest.spyOn(service, 'createCounterOffer').mockResolvedValue(counterOfferResponse);

      const result = await controller.createCounterOffer(mockUser.id, 'offer-1', counterOfferDto);

      expect(service.createCounterOffer).toHaveBeenCalledWith('offer-1', mockUser.id, counterOfferDto);
      expect(result.parentOfferId).toBe('offer-1');
    });

    it('should throw BadRequestException for maximum counteroffers reached', async () => {
      const counterOfferDto: CounterOfferDto = {
        type: OfferType.CASH,
        cashAmount: 85000000,
      };

      jest.spyOn(service, 'createCounterOffer').mockRejectedValue(
        new BadRequestException('Maximum number of counteroffers reached for this listing')
      );

      await expect(
        controller.createCounterOffer(mockUser.id, 'offer-1', counterOfferDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('withdrawOffer', () => {
    it('should withdraw an offer successfully', async () => {
      const withdrawnOffer = {
        ...mockOfferResponse,
        status: 'WITHDRAWN',
      };

      jest.spyOn(service, 'withdrawOffer').mockResolvedValue(withdrawnOffer);

      const result = await controller.withdrawOffer(mockUser.id, 'offer-1');

      expect(service.withdrawOffer).toHaveBeenCalledWith('offer-1', mockUser.id);
      expect(result.status).toBe('WITHDRAWN');
    });

    it('should throw ForbiddenException when non-offerer tries to withdraw', async () => {
      jest.spyOn(service, 'withdrawOffer').mockRejectedValue(
        new ForbiddenException('Only the offerer can withdraw this offer')
      );

      await expect(controller.withdrawOffer(mockUser.id, 'offer-1')).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('getOfferStats', () => {
    it('should get user offer statistics', async () => {
      const mockStats = {
        totalSent: 15,
        totalReceived: 23,
        pendingSent: 3,
        pendingReceived: 5,
        totalAccepted: 8,
        totalRejected: 12,
        successRate: 53.3,
        averageResponseTime: 18.5,
        totalValueInKobo: 450000000,
        displayTotalValue: '₦4,500,000',
      };

      jest.spyOn(service, 'getOfferStats').mockResolvedValue(mockStats);

      const result = await controller.getOfferStats(mockUser.id);

      expect(service.getOfferStats).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockStats);
    });
  });

  describe('getOffersForListing', () => {
    it('should get offers for a specific listing', async () => {
      const mockResponse = {
        offers: [mockOfferResponse],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      };

      jest.spyOn(service, 'getOffersForListing').mockResolvedValue(mockResponse);

      const result = await controller.getOffersForListing(mockUser.id, 'listing-1', 1, 20);

      expect(service.getOffersForListing).toHaveBeenCalledWith('listing-1', mockUser.id, 1, 20);
      expect(result).toEqual(mockResponse);
    });

    it('should throw ForbiddenException for non-owner listing', async () => {
      jest.spyOn(service, 'getOffersForListing').mockRejectedValue(
        new ForbiddenException('You can only view offers for your own listings')
      );

      await expect(
        controller.getOffersForListing(mockUser.id, 'listing-1', 1, 20)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getOfferById', () => {
    it('should get offer by ID successfully', async () => {
      jest.spyOn(service, 'getOfferById').mockResolvedValue(mockOfferResponse);

      const result = await controller.getOfferById(mockUser.id, 'offer-1');

      expect(service.getOfferById).toHaveBeenCalledWith('offer-1', mockUser.id);
      expect(result).toEqual(mockOfferResponse);
    });

    it('should throw ForbiddenException for unauthorized access', async () => {
      jest.spyOn(service, 'getOfferById').mockRejectedValue(
        new ForbiddenException('You do not have permission to view this offer')
      );

      await expect(controller.getOfferById(mockUser.id, 'offer-1')).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should throw NotFoundException for non-existent offer', async () => {
      jest.spyOn(service, 'getOfferById').mockRejectedValue(new NotFoundException('Offer not found'));

      await expect(controller.getOfferById(mockUser.id, 'non-existent-offer')).rejects.toThrow(
        NotFoundException
      );
    });
  });
});