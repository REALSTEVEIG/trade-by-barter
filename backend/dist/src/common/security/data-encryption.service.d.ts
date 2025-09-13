export declare class DataEncryptionService {
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly tagLength;
    constructor();
    encrypt(text: string, secretKey?: string): {
        encrypted: string;
        iv: string;
    };
    decrypt(encryptedData: {
        encrypted: string;
        iv: string;
    }, secretKey?: string): string;
    hashPassword(password: string, salt?: string): Promise<{
        hash: string;
        salt: string;
    }>;
    verifyPassword(password: string, hash: string, salt: string): Promise<boolean>;
    generateSecureToken(length?: number): string;
    encryptPII(data: string): string;
    decryptPII(encryptedData: string): string;
    private deriveKey;
    generateSessionToken(): string;
    hashData(data: string): string;
}
