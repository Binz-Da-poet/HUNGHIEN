import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.productService.findAll({ categoryId, search });
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('images', 8, { storage: memoryStorage() }))
  uploadImages(@Param('id') id: string, @UploadedFiles() files: Express.Multer.File[]) {
    return this.productService.addImages(id, files);
  }

  @Patch(':id/images/:imageId')
  updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() body: { altText?: string; sortOrder?: number; isPrimary?: boolean },
  ) {
    return this.productService.updateImage(id, imageId, body);
  }

  @Delete(':id/images/:imageId')
  deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    return this.productService.deleteImage(id, imageId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
