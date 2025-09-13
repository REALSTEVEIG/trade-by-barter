import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EscrowService } from './escrow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowResponseDto, EscrowListResponseDto } from './dto/escrow-response.dto';
import { ReleaseEscrowDto, ReleaseEscrowResponseDto } from './dto/release-escrow.dto';
import { DisputeEscrowDto, DisputeEscrowResponseDto } from './dto/dispute-escrow.dto';

@ApiTags('Escrow')
@Controller('api/v1/escrow')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EscrowController {
  private readonly logger = new Logger(EscrowController.name);

  constructor(private readonly escrowService: EscrowService) {}

  @Post('create')
  @ApiOperation({
    summary: 'Create escrow for accepted offer',
    description: 'Create an escrow account to secure funds for an accepted trade offer',
  })
  @ApiResponse({
    status: 201,
    description: 'Escrow created successfully',
    type: EscrowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or insufficient funds',
  })
  @ApiResponse({
    status: 404,
    description: 'Offer not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to create escrow for this offer',
  })
  async createEscrow(
    @GetUser('id') userId: string,
    @Body() createEscrowData: CreateEscrowDto,
  ): Promise<EscrowResponseDto> {
    this.logger.log(`Escrow creation request from user: ${userId}`);
    return this.escrowService.createEscrow(userId, createEscrowData);
  }

  @Put(':id/release')
  @ApiOperation({
    summary: 'Release escrow funds',
    description: 'Release escrow funds to the seller after trade completion',
  })
  @ApiResponse({
    status: 200,
    description: 'Escrow released successfully',
    type: ReleaseEscrowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or escrow cannot be released',
  })
  @ApiResponse({
    status: 404,
    description: 'Escrow not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to release this escrow',
  })
  async releaseEscrow(
    @Param('id') escrowId: string,
    @GetUser('id') userId: string,
    @Body() releaseData: ReleaseEscrowDto,
  ): Promise<ReleaseEscrowResponseDto> {
    this.logger.log(`Escrow release request for ${escrowId} from user: ${userId}`);
    return this.escrowService.releaseEscrow(escrowId, userId, releaseData);
  }

  @Post(':id/dispute')
  @ApiOperation({
    summary: 'Open dispute for escrow',
    description: 'Open a dispute to freeze escrow funds until resolution',
  })
  @ApiResponse({
    status: 201,
    description: 'Dispute opened successfully',
    type: DisputeEscrowResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or escrow cannot be disputed',
  })
  @ApiResponse({
    status: 404,
    description: 'Escrow not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to dispute this escrow',
  })
  async disputeEscrow(
    @Param('id') escrowId: string,
    @GetUser('id') userId: string,
    @Body() disputeData: DisputeEscrowDto,
  ): Promise<DisputeEscrowResponseDto> {
    this.logger.log(`Escrow dispute request for ${escrowId} from user: ${userId}`);
    return this.escrowService.disputeEscrow(escrowId, userId, disputeData);
  }

  @Get('user')
  @ApiOperation({
    summary: 'Get user escrow accounts',
    description: 'Get all escrow accounts for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'User escrows retrieved successfully',
    type: EscrowListResponseDto,
  })
  async getUserEscrows(
    @GetUser('id') userId: string,
  ): Promise<EscrowListResponseDto> {
    this.logger.log(`User escrows request from user: ${userId}`);
    return this.escrowService.getUserEscrows(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get escrow details',
    description: 'Get detailed information about a specific escrow',
  })
  @ApiResponse({
    status: 200,
    description: 'Escrow details retrieved successfully',
    type: EscrowResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Escrow not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to view this escrow',
  })
  async getEscrowById(
    @Param('id') escrowId: string,
    @GetUser('id') userId: string,
  ): Promise<EscrowResponseDto> {
    this.logger.log(`Escrow details request for ${escrowId} from user: ${userId}`);
    return this.escrowService.getEscrowById(escrowId, userId);
  }
}