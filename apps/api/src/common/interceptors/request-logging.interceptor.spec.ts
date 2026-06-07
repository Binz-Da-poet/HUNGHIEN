import { vi, describe, beforeEach, it, expect } from 'vitest';
import { of, throwError } from 'rxjs';
import { RequestLoggingInterceptor } from './request-logging.interceptor';
import { Logger } from '@nestjs/common';

describe('RequestLoggingInterceptor', () => {
  let interceptor: RequestLoggingInterceptor;

  beforeEach(() => {
    interceptor = new RequestLoggingInterceptor();
  });

  it('logs method, route, status, duration and request id', async () => {
    const logSpy = vi.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'GET', originalUrl: '/api/test', requestId: 'abc-123' }),
        getResponse: () => ({ statusCode: 200 }),
      }),
    };
    const handler = { handle: () => of('ok') };

    await new Promise<void>((resolve) => {
      const stream = interceptor.intercept(ctx as any, handler as any);
      stream.subscribe({ complete: resolve });
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/GET \/api\/test 200 \d+ms rid=abc-123/),
    );
    logSpy.mockRestore();
  });

  it('logs warning on error', async () => {
    const warnSpy = vi.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    const ctx = {
      switchToHttp: () => ({
        getRequest: () => ({ method: 'POST', originalUrl: '/api/auth/login', requestId: 'x-1' }),
        getResponse: () => ({ statusCode: 500 }),
      }),
    };
    const handler = { handle: () => throwError(() => new Error('fail')) };

    await new Promise<void>((resolve) => {
      const stream = interceptor.intercept(ctx as any, handler as any);
      stream.subscribe({ error: () => resolve() });
    });

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringMatching(/POST \/api\/auth\/login 500 err \d+ms rid=x-1/),
    );
    warnSpy.mockRestore();
  });
});
