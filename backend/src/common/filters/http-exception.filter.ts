import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let details: any = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
        details = { ...(exceptionResponse as any) };
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma database errors
      const prismaError = this.handlePrismaError(exception);
      status = prismaError.status;
      message = prismaError.message;
      details = prismaError.details;
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      details = {
        originalError: exception.message,
        suggestion: 'Please try again later or contact support',
      };
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
      details = {
        suggestion: 'Please try again later or contact support',
      };
    }

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : exception,
    );

    // Construct error response
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...details,
    };

    // Remove sensitive information in production
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.originalError;
      if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
        errorResponse.message = 'Internal server error';
      }
    }

    response.status(status).json(errorResponse);
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    details: any;
  } {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          message: 'Resource already exists',
          details: {
            constraint: error.meta?.target,
            suggestion: 'Use unique values for the specified fields',
          },
        };

      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Resource not found',
          details: {
            suggestion: 'Verify the resource exists and try again',
          },
        };

      case 'P2003':
        // Foreign key constraint violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid reference to related resource',
          details: {
            field: error.meta?.field_name,
            suggestion: 'Ensure the referenced resource exists',
          },
        };

      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid data: missing required relation',
          details: {
            relation: error.meta?.relation_name,
            suggestion: 'Provide the required related data',
          },
        };

      case 'P2000':
        // Value too long
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Input value is too long',
          details: {
            column: error.meta?.column_name,
            suggestion: 'Reduce the length of the input value',
          },
        };

      case 'P2001':
        // Record does not exist
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'The record does not exist',
          details: {
            suggestion: 'Verify the record ID and try again',
          },
        };

      case 'P2015':
        // Related record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Related record not found',
          details: {
            suggestion: 'Ensure the related record exists',
          },
        };

      case 'P2016':
        // Query interpretation error
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Query interpretation error',
          details: {
            suggestion: 'Check your request parameters',
          },
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database operation failed',
          details: {
            code: error.code,
            suggestion: 'Please try again later',
          },
        };
    }
  }
}