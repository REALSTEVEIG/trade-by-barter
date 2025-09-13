import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class RateLimitInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Add rate limiting metadata to request
    request.rateLimitInfo = {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date(),
    };

    return next.handle().pipe(
      catchError((error) => {
        // Handle rate limit errors specifically for Nigerian users
        if (error.status === 429) {
          return throwError(() => new HttpException(
            {
              statusCode: 429,
              message: 'Too many requests. Please wait a moment before trying again.',
              error: 'Rate Limit Exceeded',
              retryAfter: 60,
              info: 'This helps protect our service for all Nigerian users.',
            },
            HttpStatus.TOO_MANY_REQUESTS,
          ));
        }
        return throwError(() => error);
      }),
    );
  }
}