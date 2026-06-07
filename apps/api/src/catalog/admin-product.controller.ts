import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { AdminSessionGuard } from '../auth/admin-session.guard';

@Controller('admin/products')
@UseGuards(AdminSessionGuard)
export class AdminProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('search') search?: string) {
    return this.productService.findAllAdmin({ categoryId, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOneAdmin(id);
  }
}
