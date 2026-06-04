import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ImageStorageService } from './image-storage.service';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController, ProductController],
  providers: [CategoryService, ProductService, ImageStorageService],
  exports: [CategoryService, ProductService, ImageStorageService],
})
export class CatalogModule {}
