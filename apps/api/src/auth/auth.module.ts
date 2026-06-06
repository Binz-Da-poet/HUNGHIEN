import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminSessionGuard } from './admin-session.guard';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AuthService, AdminSessionGuard],
  controllers: [AuthController],
  exports: [AuthService, AdminSessionGuard],
})
export class AuthModule {}
