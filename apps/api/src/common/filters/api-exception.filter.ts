import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string;
  errors?: string[];
  path: string;
  timestamp: string;
}

export function mapPrismaError(error: any): { status: number; code: string } | null {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return null;
  }
  switch (error.code) {
    case 'P2002': return { status: 409, code: 'CONFLICT' };
    case 'P2025': return { status: 404, code: 'NOT_FOUND' };
    case 'P2003': return { status: 400, code: 'RELATION_CONSTRAINT' };
    default: return { status: 400, code: 'BAD_REQUEST' };
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'Lỗi hệ thống, vui lòng thử lại sau.';
    let errors: string[] | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'object' && res !== null) {
        const r = res as any;
        message = r.message || exception.message;
        if (Array.isArray(r.message)) {
          errors = r.message;
          message = 'Dữ liệu không hợp lệ.';
        }
      }
      code = HttpStatus[status] || 'UNKNOWN';
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const mapped = mapPrismaError(exception);
      status = mapped.status;
      code = mapped.code;
      message = formatVietnamesePrismaMessage(exception);
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });

    if (status >= 500) {
      console.error(exception);
    }
  }
}

function formatVietnamesePrismaMessage(error: Prisma.PrismaClientKnownRequestError): string {
  switch (error.code) {
    case 'P2002': return 'Dữ liệu đã tồn tại.';
    case 'P2025': return 'Không tìm thấy dữ liệu.';
    case 'P2003': return 'Dữ liệu liên quan không hợp lệ.';
    default: return 'Lỗi dữ liệu, vui lòng thử lại.';
  }
}
