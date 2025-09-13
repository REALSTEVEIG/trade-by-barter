import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
export interface JwtPayload {
    sub: string;
    email: string;
    phoneNumber: string;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse extends AuthTokens {
    user: {
        id: string;
        email: string;
        phoneNumber: string;
        firstName: string;
        lastName: string;
        displayName?: string | null;
        profileImageUrl?: string | null;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        city: string;
        state: string;
    };
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    signup(signupDto: SignupDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        message: string;
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    resendOtp(phoneNumber: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private updateRefreshToken;
    private hashPassword;
    private hashRefreshToken;
    private validateAndFormatPhoneNumber;
    private generateOtp;
}
