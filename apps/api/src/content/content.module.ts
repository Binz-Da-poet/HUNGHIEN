import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { AdminContentController } from './admin-content.controller';
import { StorefrontContentController } from './storefront-content.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminContentController, StorefrontContentController],
  providers: [ContentService, AdminSessionGuard],
})
export class ContentModule {}
