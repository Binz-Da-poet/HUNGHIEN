import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';
import { AdminSessionGuard } from './admin-session.guard';
import { CurrentAdmin } from './current-admin.decorator';

@Controller('auth/admin')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { rawToken, admin } = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );

    response.cookie('admin_session', rawToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return admin;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = request.cookies['admin_session'];
    if (token) {
      await this.authService.logout(token);
    }

    response.clearCookie('admin_session', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    });

    return { success: true };
  }

  @Get('me')
  @UseGuards(AdminSessionGuard)
  async me(@CurrentAdmin() admin: any) {
    return admin;
  }
}
