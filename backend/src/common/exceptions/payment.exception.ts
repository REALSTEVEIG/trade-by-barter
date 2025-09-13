import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST, details?: any) {
    super(
      {
        message,
        details,
        timestamp: new Date().toISOString(),
        type: 'PaymentError',
      },
      statusCode,
    );
  }
}

export class InsufficientFundsException extends PaymentException {
  constructor(available: number, required: number) {
    super(
      'Insufficient funds in wallet',
      HttpStatus.BAD_REQUEST,
      {
        availableAmount: available,
        requiredAmount: required,
        shortfall: required - available,
      }
    );
  }
}

export class PaymentProviderException extends PaymentException {
  constructor(message: string, providerResponse?: any) {
    super(
      `Payment provider error: ${message}`,
      HttpStatus.BAD_GATEWAY,
      {
        providerResponse,
        suggestion: 'Please try again later or contact support',
      }
    );
  }
}

export class InvalidSignatureException extends PaymentException {
  constructor() {
    super(
      'Invalid webhook signature',
      HttpStatus.UNAUTHORIZED,
      {
        suggestion: 'Verify webhook configuration and secret key',
      }
    );
  }
}

export class EscrowException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST, details?: any) {
    super(
      {
        message,
        details,
        timestamp: new Date().toISOString(),
        type: 'EscrowError',
      },
      statusCode,
    );
  }
}

export class InvalidEscrowStateException extends EscrowException {
  constructor(currentState: string, requiredState: string) {
    super(
      'Invalid escrow state for this operation',
      HttpStatus.CONFLICT,
      {
        currentState,
        requiredState,
        suggestion: 'Check escrow status before attempting this operation',
      }
    );
  }
}

export class UnauthorizedEscrowAccessException extends EscrowException {
  constructor() {
    super(
      'Unauthorized access to escrow transaction',
      HttpStatus.FORBIDDEN,
      {
        suggestion: 'Only the buyer, seller, or authorized parties can access this escrow',
      }
    );
  }
}

export class WalletException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST, details?: any) {
    super(
      {
        message,
        details,
        timestamp: new Date().toISOString(),
        type: 'WalletError',
      },
      statusCode,
    );
  }
}

export class WalletNotFoundedException extends WalletException {
  constructor(userId: string) {
    super(
      'Wallet not found for user',
      HttpStatus.NOT_FOUND,
      {
        userId,
        suggestion: 'Initialize wallet by making a deposit',
      }
    );
  }
}

export class TransferException extends WalletException {
  constructor(message: string, details?: any) {
    super(
      `Transfer failed: ${message}`,
      HttpStatus.BAD_REQUEST,
      details
    );
  }
}