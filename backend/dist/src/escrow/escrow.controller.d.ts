import { EscrowService } from './escrow.service';
import { CreateEscrowDto } from './dto/create-escrow.dto';
import { EscrowResponseDto, EscrowListResponseDto } from './dto/escrow-response.dto';
import { ReleaseEscrowDto, ReleaseEscrowResponseDto } from './dto/release-escrow.dto';
import { DisputeEscrowDto, DisputeEscrowResponseDto } from './dto/dispute-escrow.dto';
export declare class EscrowController {
    private readonly escrowService;
    private readonly logger;
    constructor(escrowService: EscrowService);
    createEscrow(userId: string, createEscrowData: CreateEscrowDto): Promise<EscrowResponseDto>;
    releaseEscrow(escrowId: string, userId: string, releaseData: ReleaseEscrowDto): Promise<ReleaseEscrowResponseDto>;
    disputeEscrow(escrowId: string, userId: string, disputeData: DisputeEscrowDto): Promise<DisputeEscrowResponseDto>;
    getUserEscrows(userId: string): Promise<EscrowListResponseDto>;
    getEscrowById(escrowId: string, userId: string): Promise<EscrowResponseDto>;
}
