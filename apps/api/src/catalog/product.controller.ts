import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFiles,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AdminSessionGuard } from '../auth/admin-session.guard';
import { UploadedImageFile } from './image-storage.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AdminSessionGuard)
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.productService.findAll({ categoryId, search });
  }

  @Post(':id/images')
  @UseGuards(AdminSessionGuard)
  @UseInterceptors(
    FilesInterceptor('images', 8, {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024, files: 8 },
    }),
  )
  uploadImages(@Param('id') id: string, @UploadedFiles() files: UploadedImageFile[]) {
    return this.productService.addImages(id, files);
  }

  @Patch(':id/images/:imageId')
  @UseGuards(AdminSessionGuard)
  updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() body: UpdateProductImageDto,
  ) {
    return this.productService.updateImage(id, imageId, body);
  }

  @Delete(':id/images/:imageId')
  @UseGuards(AdminSessionGuard)
  deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productService.deleteImage(id, imageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminSessionGuard)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AdminSessionGuard)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
