import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowResponseDto, EscrowListResponseDto, EscrowStatus } from './dto/escrow-response.dto';
import { ReleaseEscrowDto, ReleaseEscrowResponseDto } from './dto/release-escrow.dto';
import { DisputeEscrowDto, DisputeEscrowResponseDto } from './dto/dispute-escrow.dto';
import {
  EscrowException,
  InvalidEscrowStateException,
  UnauthorizedEscrowAccessException,
  InsufficientFundsException,
} from '../common/exceptions/payment.exception';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);
  private readonly ESCROW_FEE_PERCENTAGE = 0.025; // 2.5%
  private readonly AUTO_RELEASE_DAYS = 7;

  constructor(private prisma: PrismaService) {}

  async createEscrow(userId: string, createEscrowData: CreateEscrowDto): Promise<EscrowResponseDto> {
    this.logger.log(`Creating escrow for offer ${createEscrowData.offerId} by user ${userId}`);

    // Get the offer details
    const offer = await this.prisma.offer.findUnique({
      where: { id: createEscrowData.offerId },
      include: {
        sender: { include: { wallet: true } },
        receiver: { include: { wallet: true } },
        listing: true,
      },
    });

    if (!offer) {
      throw new EscrowException('Offer not found', 404);
    }

    // Check if offer is accepted
    if (offer.status !== 'ACCEPTED') {
      throw new InvalidEscrowStateException(offer.status, 'ACCEPTED');
    }

    // Check if escrow already exists for this offer
    const existingEscrow = await this.prisma.escrow.findFirst({
      where: { offerId: offer.id },
    });

    if (existingEscrow) {
      throw new EscrowException('Escrow already exists for this offer', 409);
    }

    // Determine buyer and seller based on offer type
    const isOfferSenderBuyer = offer.offerType === 'CASH' || offer.offerType === 'HYBRID';
    const buyer = isOfferSenderBuyer ? offer.sender : offer.receiver;
    const seller = isOfferSenderBuyer ? offer.receiver : offer.sender;

    // Validate that the user creating escrow is authorized (buyer or seller)
    if (userId !== buyer.id && userId !== seller.id) {
      throw new UnauthorizedEscrowAccessException();
    }

    // Determine escrow amount
    let escrowAmount: number;
    if (createEscrowData.customAmountInKobo) {
      escrowAmount = createEscrowData.customAmountInKobo;
    } else if (offer.cashAmountInKobo) {
      escrowAmount = offer.cashAmountInKobo;
    } else {
      // For swap-only offers, use listing price or default amount
      escrowAmount = offer.listing.priceInKobo || 100000; // Default ₦1,000 for swap protection
    }

    // Calculate escrow fee
    const feeInKobo = Math.floor(escrowAmount * this.ESCROW_FEE_PERCENTAGE);
    const totalAmount = escrowAmount + feeInKobo;

    // Check buyer's wallet balance
    if (!buyer.wallet || buyer.wallet.balanceInKobo < totalAmount) {
      throw new InsufficientFundsException(buyer.wallet?.balanceInKobo || 0, totalAmount);
    }

    const reference = `ESC_${Date.now()}_${uuidv4().substring(0, 8)}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.AUTO_RELEASE_DAYS);

    try {
      // Use transaction to ensure atomicity
      const result = await this.prisma.$transaction(async (tx) => {
        // Create escrow record
        const escrow = await tx.escrow.create({
          data: {
            reference,
            amountInKobo: escrowAmount,
            feeInKobo,
            status: 'CREATED',
            description: createEscrowData.description || `Escrow for ${offer.listing.title}`,
            releaseCondition: createEscrowData.releaseCondition || 'Both parties confirm trade completion',
            expiresAt,
            buyerId: buyer.id,
            sellerId: seller.id,
            offerId: offer.id,
          },
        });

        // Deduct funds from buyer's wallet
        await tx.wallet.update({
          where: { userId: buyer.id },
          data: {
            balanceInKobo: {
              decrement: totalAmount,
            },
            escrowBalanceInKobo: {
              increment: escrowAmount,
            },
            lastTransactionAt: new Date(),
          },
        });

        // Create transaction record for escrow deposit
        await tx.transaction.create({
          data: {
            type: 'ESCROW_DEPOSIT',
            amountInKobo: escrowAmount,
            status: 'COMPLETED',
            paymentMethod: 'WALLET',
            description: `Escrow deposit for ${offer.listing.title}`,
            processingFee: feeInKobo,
            senderId: buyer.id,
            receiverId: seller.id,
            offerId: offer.id,
            escrowId: escrow.id,
          },
        });

        // Update escrow status to FUNDED
        const fundedEscrow = await tx.escrow.update({
          where: { id: escrow.id },
          data: { status: 'FUNDED' },
        });

        return fundedEscrow;
      });

      this.logger.log(`Escrow created successfully: ${reference}`);

      return this.mapToEscrowResponse(result);
    } catch (error) {
      this.logger.error(`Failed to create escrow: ${error.message}`, error.stack);
      
      // Re-throw known exceptions
      if (error instanceof EscrowException ||
          error instanceof InsufficientFundsException ||
          error instanceof UnauthorizedEscrowAccessException ||
          error instanceof InvalidEscrowStateException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new EscrowException('Escrow creation failed', 500, { originalError: error.message });
    }
  }

  async releaseEscrow(
    escrowId: string,
    userId: string,
    releaseData: ReleaseEscrowDto,
  ): Promise<ReleaseEscrowResponseDto> {
    this.logger.log(`Releasing escrow ${escrowId} by user ${userId}`);

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
      include: {
        buyer: { include: { wallet: true } },
        seller: { include: { wallet: true } },
        offer: { include: { listing: true } },
      },
    });

    if (!escrow) {
      throw new EscrowException('Escrow not found', 404);
    }

    // Check if escrow can be released
    if (escrow.status !== 'FUNDED') {
      throw new InvalidEscrowStateException(escrow.status, 'FUNDED');
    }

    // Validate authorization (buyer, seller, or system auto-release)
    if (userId !== escrow.buyerId && userId !== escrow.sellerId && userId !== 'SYSTEM') {
      throw new UnauthorizedEscrowAccessException();
    }

    // For manual release, require confirmation
    if (!releaseData.confirmCompletion) {
      throw new EscrowException('Trade completion confirmation required', 400);
    }

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        // Release funds to seller
        await tx.wallet.update({
          where: { userId: escrow.sellerId },
          data: {
            balanceInKobo: {
              increment: escrow.amountInKobo,
            },
            totalEarnedInKobo: {
              increment: escrow.amountInKobo,
            },
            lastTransactionAt: new Date(),
          },
        });

        // Update buyer's escrow balance
        await tx.wallet.update({
          where: { userId: escrow.buyerId },
          data: {
            escrowBalanceInKobo: {
              decrement: escrow.amountInKobo,
            },
            lastTransactionAt: new Date(),
          },
        });

        // Create transaction record for escrow release
        await tx.transaction.create({
          data: {
            type: 'ESCROW_RELEASE',
            amountInKobo: escrow.amountInKobo,
            status: 'COMPLETED',
            paymentMethod: 'WALLET',
            description: releaseData.reason || `Escrow release for ${escrow.offer.listing.title}`,
            senderId: escrow.buyerId,
            receiverId: escrow.sellerId,
            offerId: escrow.offerId,
            escrowId: escrow.id,
          },
        });

        // Update escrow status
        const releasedEscrow = await tx.escrow.update({
          where: { id: escrowId },
          data: {
            status: 'RELEASED',
            releasedAt: new Date(),
          },
        });

        return releasedEscrow;
      });

      this.logger.log(`Escrow released successfully: ${escrow.reference}`);

      return {
        success: true,
        message: 'Escrow funds released successfully',
        escrowId,
        amountReleased: escrow.amountInKobo,
        recipientId: escrow.sellerId,
        releasedAt: result.releasedAt!.toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to release escrow: ${error.message}`, error.stack);
      
      // Re-throw known exceptions
      if (error instanceof EscrowException ||
          error instanceof UnauthorizedEscrowAccessException ||
          error instanceof InvalidEscrowStateException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new EscrowException('Failed to release escrow', 500, { originalError: error.message });
    }
  }

  async disputeEscrow(
    escrowId: string,
    userId: string,
    disputeData: DisputeEscrowDto,
  ): Promise<DisputeEscrowResponseDto> {
    this.logger.log(`Opening dispute for escrow ${escrowId} by user ${userId}`);

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new EscrowException('Escrow not found', 404);
    }

    // Check if escrow can be disputed
    if (escrow.status !== 'FUNDED') {
      throw new InvalidEscrowStateException(escrow.status, 'FUNDED');
    }

    // Validate authorization (buyer or seller)
    if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
      throw new UnauthorizedEscrowAccessException();
    }

    try {
      const disputedEscrow = await this.prisma.escrow.update({
        where: { id: escrowId },
        data: {
          status: 'DISPUTED',
          disputeReason: disputeData.reason,
          disputeOpenedAt: new Date(),
        },
      });

      const disputeReference = `DISP_${Date.now()}_${uuidv4().substring(0, 6)}`;

      this.logger.log(`Dispute opened successfully: ${disputeReference}`);

      return {
        success: true,
        message: 'Dispute opened successfully. Escrow funds have been frozen.',
        escrowId,
        disputeReference,
        disputeOpenedAt: disputedEscrow.disputeOpenedAt!.toISOString(),
        estimatedResolutionTime: '3-5 business days',
      };
    } catch (error) {
      this.logger.error(`Failed to open dispute: ${error.message}`, error.stack);
      
      // Re-throw known exceptions
      if (error instanceof EscrowException ||
          error instanceof UnauthorizedEscrowAccessException ||
          error instanceof InvalidEscrowStateException) {
        throw error;
      }
      
      // Wrap unknown errors
      throw new EscrowException('Failed to open dispute', 500, { originalError: error.message });
    }
  }

  async getUserEscrows(userId: string): Promise<EscrowListResponseDto> {
    this.logger.log(`Fetching escrows for user ${userId}`);

    const escrows = await this.prisma.escrow.findMany({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
      },
      include: {
        buyer: { select: { id: true, firstName: true, lastName: true } },
        seller: { select: { id: true, firstName: true, lastName: true } },
        offer: { include: { listing: { select: { title: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedEscrows = escrows.map(this.mapToEscrowResponse);
    const total = escrows.length;
    const active = escrows.filter(e => ['CREATED', 'FUNDED', 'DISPUTED'].includes(e.status)).length;
    const completed = escrows.filter(e => ['RELEASED', 'REFUNDED'].includes(e.status)).length;

    return {
      escrows: mappedEscrows,
      total,
      active,
      completed,
    };
  }

  async getEscrowById(escrowId: string, userId: string): Promise<EscrowResponseDto> {
    this.logger.log(`Fetching escrow ${escrowId} for user ${userId}`);

    const escrow = await this.prisma.escrow.findUnique({
      where: { id: escrowId },
    });

    if (!escrow) {
      throw new EscrowException('Escrow not found', 404);
    }

    // Validate authorization
    if (userId !== escrow.buyerId && userId !== escrow.sellerId) {
      throw new UnauthorizedEscrowAccessException();
    }

    return this.mapToEscrowResponse(escrow);
  }

  // Auto-release expired escrows (to be called by a cron job)
  async autoReleaseExpiredEscrows(): Promise<void> {
    this.logger.log('Processing auto-release for expired escrows');

    const expiredEscrows = await this.prisma.escrow.findMany({
      where: {
        status: 'FUNDED',
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    for (const escrow of expiredEscrows) {
      try {
        await this.releaseEscrow(escrow.id, 'SYSTEM', {
          confirmCompletion: true,
          reason: 'Auto-released after expiry period',
        });
        this.logger.log(`Auto-released escrow: ${escrow.reference}`);
      } catch (error) {
        this.logger.error(`Failed to auto-release escrow ${escrow.reference}: ${error.message}`);
      }
    }
  }

  private mapToEscrowResponse(escrow: any): EscrowResponseDto {
    return {
      id: escrow.id,
      reference: escrow.reference,
      amountInKobo: escrow.amountInKobo,
      feeInKobo: escrow.feeInKobo,
      status: escrow.status as EscrowStatus,
      description: escrow.description,
      releaseCondition: escrow.releaseCondition,
      buyerId: escrow.buyerId,
      sellerId: escrow.sellerId,
      offerId: escrow.offerId,
      expiresAt: escrow.expiresAt?.toISOString(),
      releasedAt: escrow.releasedAt?.toISOString(),
      disputeOpenedAt: escrow.disputeOpenedAt?.toISOString(),
      createdAt: escrow.createdAt.toISOString(),
      updatedAt: escrow.updatedAt.toISOString(),
    };
  }
}