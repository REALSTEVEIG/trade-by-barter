import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        displayName: string | null;
        profileImageUrl: string | null;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        city: string;
        state: string;
        isActive: boolean;
        isBlocked: boolean;
        lastActiveAt: Date;
    }>;
}
export {};
