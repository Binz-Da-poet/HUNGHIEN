import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { AdminProductController } from './admin-product.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageStorageService } from './image-storage.service';
import { AuthModule } from '../auth/auth.module';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CategoryController, ProductController, AdminProductController],
  providers: [CategoryService, ProductService, ImageStorageService, AdminSessionGuard],
  exports: [CategoryService, ProductService, ImageStorageService],
})
export class CatalogModule {}
