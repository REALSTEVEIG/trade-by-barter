import { PrismaService } from '../prisma/prisma.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowResponseDto, EscrowListResponseDto } from './dto/escrow-response.dto';
import { ReleaseEscrowDto, ReleaseEscrowResponseDto } from './dto/release-escrow.dto';
import { DisputeEscrowDto, DisputeEscrowResponseDto } from './dto/dispute-escrow.dto';
export declare class EscrowService {
    private prisma;
    private readonly logger;
    private readonly ESCROW_FEE_PERCENTAGE;
    private readonly AUTO_RELEASE_DAYS;
    constructor(prisma: PrismaService);
    createEscrow(userId: string, createEscrowData: CreateEscrowDto): Promise<EscrowResponseDto>;
    releaseEscrow(escrowId: string, userId: string, releaseData: ReleaseEscrowDto): Promise<ReleaseEscrowResponseDto>;
    disputeEscrow(escrowId: string, userId: string, disputeData: DisputeEscrowDto): Promise<DisputeEscrowResponseDto>;
    getUserEscrows(userId: string): Promise<EscrowListResponseDto>;
    getEscrowById(escrowId: string, userId: string): Promise<EscrowResponseDto>;
    autoReleaseExpiredEscrows(): Promise<void>;
    private mapToEscrowResponse;
}
