import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const { method, originalUrl } = req;
    const requestId = req.requestId || '-';
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          this.logger.log(
            `${method} ${originalUrl} ${res.statusCode} ${duration}ms rid=${requestId}`,
          );
        },
        error: () => {
          const duration = Date.now() - start;
          this.logger.warn(
            `${method} ${originalUrl} ${res.statusCode} err ${duration}ms rid=${requestId}`,
          );
        },
      }),
    );
  }
}
