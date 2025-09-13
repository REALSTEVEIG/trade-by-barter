import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class DataEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;

  constructor() {
    // Initialize encryption service for Nigerian data protection compliance
  }

  /**
   * Encrypt sensitive data for Nigerian compliance (NDPR)
   */
  encrypt(text: string, secretKey?: string): {
    encrypted: string;
    iv: string;
  } {
    try {
      const key = this.deriveKey(secretKey || process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
      const iv = crypto.randomBytes(this.ivLength);
      
      const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return {
        encrypted,
        iv: iv.toString('hex'),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data for Nigerian compliance (NDPR)
   */
  decrypt(encryptedData: {
    encrypted: string;
    iv: string;
  }, secretKey?: string): string {
    try {
      const key = this.deriveKey(secretKey || process.env.ENCRYPTION_KEY || 'default-key-change-in-production');
      const iv = Buffer.from(encryptedData.iv, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Hash passwords using secure algorithms
   */
  async hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const finalSalt = salt || crypto.randomBytes(16).toString('hex');
    
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, finalSalt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        resolve({
          hash: derivedKey.toString('hex'),
          salt: finalSalt,
        });
      });
    });
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
    const { hash: computedHash } = await this.hashPassword(password, salt);
    return computedHash === hash;
  }

  /**
   * Generate secure tokens for Nigerian phone verification
   */
  generateSecureToken(length: number = 6): string {
    const digits = '0123456789';
    let token = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, digits.length);
      token += digits[randomIndex];
    }
    
    return token;
  }

  /**
   * Encrypt Nigerian-specific PII (phone numbers, addresses)
   */
  encryptPII(data: string): string {
    const encrypted = this.encrypt(data);
    return `${encrypted.encrypted}:${encrypted.iv}`;
  }

  /**
   * Decrypt Nigerian-specific PII
   */
  decryptPII(encryptedData: string): string {
    const [encrypted, iv] = encryptedData.split(':');
    return this.decrypt({ encrypted, iv });
  }

  private deriveKey(password: string): Buffer {
    return crypto.scryptSync(password, 'tradebybarter-salt', this.keyLength);
  }

  /**
   * Generate secure session tokens
   */
  generateSessionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash data for integrity verification
   */
  hashData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}