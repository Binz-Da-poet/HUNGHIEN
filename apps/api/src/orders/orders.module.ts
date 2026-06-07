import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService, AdminSessionGuard],
})
export class OrdersModule {}
