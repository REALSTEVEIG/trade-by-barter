import { HttpException, HttpStatus } from '@nestjs/common';
export declare class PaymentException extends HttpException {
    constructor(message: string, statusCode?: HttpStatus, details?: any);
}
export declare class InsufficientFundsException extends PaymentException {
    constructor(available: number, required: number);
}
export declare class PaymentProviderException extends PaymentException {
    constructor(message: string, providerResponse?: any);
}
export declare class InvalidSignatureException extends PaymentException {
    constructor();
}
export declare class EscrowException extends HttpException {
    constructor(message: string, statusCode?: HttpStatus, details?: any);
}
export declare class InvalidEscrowStateException extends EscrowException {
    constructor(currentState: string, requiredState: string);
}
export declare class UnauthorizedEscrowAccessException extends EscrowException {
    constructor();
}
export declare class WalletException extends HttpException {
    constructor(message: string, statusCode?: HttpStatus, details?: any);
}
export declare class WalletNotFoundedException extends WalletException {
    constructor(userId: string);
}
export declare class TransferException extends WalletException {
    constructor(message: string, details?: any);
}
