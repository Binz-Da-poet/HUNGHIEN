import { Module } from '@nestjs/common';
import { HomepageService } from './homepage.service';
import { PrismaModule } from '../prisma/prisma.module';
import { StorefrontHomepageController } from './storefront-homepage.controller';
import { AdminHomepageController } from './admin-homepage.controller';
import { CatalogModule } from '../catalog/catalog.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, CatalogModule, AuthModule],
  providers: [HomepageService],
  controllers: [StorefrontHomepageController, AdminHomepageController],
  exports: [HomepageService],
})
export class HomepageModule {}
