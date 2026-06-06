import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Injectable()
export class AdminSessionGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies['admin_session'];

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    const admin = await this.authService.validateSession(token);
    if (!admin) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    // Attach admin to request for use in decorators
    (request as any).admin = admin;

    return true;
  }
}
