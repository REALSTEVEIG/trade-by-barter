"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferException = exports.WalletNotFoundedException = exports.WalletException = exports.UnauthorizedEscrowAccessException = exports.InvalidEscrowStateException = exports.EscrowException = exports.InvalidSignatureException = exports.PaymentProviderException = exports.InsufficientFundsException = exports.PaymentException = void 0;
const common_1 = require("@nestjs/common");
class PaymentException extends common_1.HttpException {
    constructor(message, statusCode = common_1.HttpStatus.BAD_REQUEST, details) {
        super({
            message,
            details,
            timestamp: new Date().toISOString(),
            type: 'PaymentError',
        }, statusCode);
    }
}
exports.PaymentException = PaymentException;
class InsufficientFundsException extends PaymentException {
    constructor(available, required) {
        super('Insufficient funds in wallet', common_1.HttpStatus.BAD_REQUEST, {
            availableAmount: available,
            requiredAmount: required,
            shortfall: required - available,
        });
    }
}
exports.InsufficientFundsException = InsufficientFundsException;
class PaymentProviderException extends PaymentException {
    constructor(message, providerResponse) {
        super(`Payment provider error: ${message}`, common_1.HttpStatus.BAD_GATEWAY, {
            providerResponse,
            suggestion: 'Please try again later or contact support',
        });
    }
}
exports.PaymentProviderException = PaymentProviderException;
class InvalidSignatureException extends PaymentException {
    constructor() {
        super('Invalid webhook signature', common_1.HttpStatus.UNAUTHORIZED, {
            suggestion: 'Verify webhook configuration and secret key',
        });
    }
}
exports.InvalidSignatureException = InvalidSignatureException;
class EscrowException extends common_1.HttpException {
    constructor(message, statusCode = common_1.HttpStatus.BAD_REQUEST, details) {
        super({
            message,
            details,
            timestamp: new Date().toISOString(),
            type: 'EscrowError',
        }, statusCode);
    }
}
exports.EscrowException = EscrowException;
class InvalidEscrowStateException extends EscrowException {
    constructor(currentState, requiredState) {
        super('Invalid escrow state for this operation', common_1.HttpStatus.CONFLICT, {
            currentState,
            requiredState,
            suggestion: 'Check escrow status before attempting this operation',
        });
    }
}
exports.InvalidEscrowStateException = InvalidEscrowStateException;
class UnauthorizedEscrowAccessException extends EscrowException {
    constructor() {
        super('Unauthorized access to escrow transaction', common_1.HttpStatus.FORBIDDEN, {
            suggestion: 'Only the buyer, seller, or authorized parties can access this escrow',
        });
    }
}
exports.UnauthorizedEscrowAccessException = UnauthorizedEscrowAccessException;
class WalletException extends common_1.HttpException {
    constructor(message, statusCode = common_1.HttpStatus.BAD_REQUEST, details) {
        super({
            message,
            details,
            timestamp: new Date().toISOString(),
            type: 'WalletError',
        }, statusCode);
    }
}
exports.WalletException = WalletException;
class WalletNotFoundedException extends WalletException {
    constructor(userId) {
        super('Wallet not found for user', common_1.HttpStatus.NOT_FOUND, {
            userId,
            suggestion: 'Initialize wallet by making a deposit',
        });
    }
}
exports.WalletNotFoundedException = WalletNotFoundedException;
class TransferException extends WalletException {
    constructor(message, details) {
        super(`Transfer failed: ${message}`, common_1.HttpStatus.BAD_REQUEST, details);
    }
}
exports.TransferException = TransferException;
//# sourceMappingURL=payment.exception.js.map