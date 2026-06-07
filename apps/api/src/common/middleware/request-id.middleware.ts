import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

const HEADER_NAME = 'x-request-id';

declare module 'express' {
  interface Request {
    requestId?: string;
  }
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = (req.headers[HEADER_NAME] as string) || randomUUID();
    req.requestId = id;
    res.setHeader(HEADER_NAME, id);
    next();
  }
}
