import { AuthService, AuthResponse } from './auth.service';
import { SignupDto, LoginDto, VerifyOtpDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signup(signupDto: SignupDto): Promise<AuthResponse>;
    login(loginDto: LoginDto): Promise<AuthResponse>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        message: string;
    }>;
    refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<import("./auth.service").AuthTokens>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    resendOtp(phoneNumber: string): Promise<{
        message: string;
    }>;
    getMe(user: any): Promise<any>;
}
