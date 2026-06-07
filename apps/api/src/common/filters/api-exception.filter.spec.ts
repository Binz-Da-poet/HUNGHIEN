import { describe, it, expect } from 'vitest';
import { ApiExceptionFilter, mapPrismaError } from './api-exception.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('mapPrismaError', () => {
  it('maps P2002 to 409 CONFLICT', () => {
    const result = mapPrismaError({ code: 'P2002', meta: {} } as any);
    expect(result).toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('maps P2025 to 404 NOT_FOUND', () => {
    const result = mapPrismaError({ code: 'P2025', meta: {} } as any);
    expect(result).toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });

  it('maps unknown Prisma errors to 400', () => {
    const result = mapPrismaError({ code: 'P9999', meta: {} } as any);
    expect(result).toMatchObject({ status: 400, code: 'BAD_REQUEST' });
  });

  it('returns null for non-Prisma errors', () => {
    expect(mapPrismaError(new Error('test'))).toBeNull();
  });
});
