"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const library_1 = require("@prisma/client/runtime/library");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status;
        let message;
        let details = {};
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                message = exceptionResponse.message || exception.message;
                details = { ...exceptionResponse };
            }
            else {
                message = exceptionResponse;
            }
        }
        else if (exception instanceof library_1.PrismaClientKnownRequestError) {
            const prismaError = this.handlePrismaError(exception);
            status = prismaError.status;
            message = prismaError.message;
            details = prismaError.details;
        }
        else if (exception instanceof Error) {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Internal server error';
            details = {
                originalError: exception.message,
                suggestion: 'Please try again later or contact support',
            };
        }
        else {
            status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            message = 'Unknown error occurred';
            details = {
                suggestion: 'Please try again later or contact support',
            };
        }
        this.logger.error(`${request.method} ${request.url} - ${status} - ${message}`, exception instanceof Error ? exception.stack : exception);
        const errorResponse = {
            success: false,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            message,
            ...details,
        };
        if (process.env.NODE_ENV === 'production') {
            delete errorResponse.originalError;
            if (status === common_1.HttpStatus.INTERNAL_SERVER_ERROR) {
                errorResponse.message = 'Internal server error';
            }
        }
        response.status(status).json(errorResponse);
    }
    handlePrismaError(error) {
        switch (error.code) {
            case 'P2002':
                return {
                    status: common_1.HttpStatus.CONFLICT,
                    message: 'Resource already exists',
                    details: {
                        constraint: error.meta?.target,
                        suggestion: 'Use unique values for the specified fields',
                    },
                };
            case 'P2025':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'Resource not found',
                    details: {
                        suggestion: 'Verify the resource exists and try again',
                    },
                };
            case 'P2003':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid reference to related resource',
                    details: {
                        field: error.meta?.field_name,
                        suggestion: 'Ensure the referenced resource exists',
                    },
                };
            case 'P2014':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Invalid data: missing required relation',
                    details: {
                        relation: error.meta?.relation_name,
                        suggestion: 'Provide the required related data',
                    },
                };
            case 'P2000':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Input value is too long',
                    details: {
                        column: error.meta?.column_name,
                        suggestion: 'Reduce the length of the input value',
                    },
                };
            case 'P2001':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'The record does not exist',
                    details: {
                        suggestion: 'Verify the record ID and try again',
                    },
                };
            case 'P2015':
                return {
                    status: common_1.HttpStatus.NOT_FOUND,
                    message: 'Related record not found',
                    details: {
                        suggestion: 'Ensure the related record exists',
                    },
                };
            case 'P2016':
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Query interpretation error',
                    details: {
                        suggestion: 'Check your request parameters',
                    },
                };
            default:
                return {
                    status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    message: 'Database operation failed',
                    details: {
                        code: error.code,
                        suggestion: 'Please try again later',
                    },
                };
        }
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map