export declare class LoginDto {
    phone: string;
    password: string;
}
export declare class RegisterDto {
    fullName: string;
    phone: string;
    email: string;
    password: string;
    location: string;
    referralCode?: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: UserResponseDto;
}
export declare class UserResponseDto {
    id: string;
    fullName: string;
    phone: string;
    email: string;
    location: string;
    profilePicture: string | null;
    isVerified: boolean;
    reputationScore: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare class VerifyPhoneDto {
    phone: string;
    verificationCode: string;
}
export declare class ResetPasswordDto {
    phone: string;
    resetCode: string;
    newPassword: string;
}
