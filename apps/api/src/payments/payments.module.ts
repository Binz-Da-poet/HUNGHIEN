import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, AdminSessionGuard],
})
export class PaymentsModule {}
