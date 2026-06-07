import { Controller, Get, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { AdminSessionGuard } from '../auth/admin-session.guard';
import { Request } from 'express';

@Controller('admin/orders')
@UseGuards(AdminSessionGuard)
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAllAdmin(@Query() query: AdminOrderQueryDto) {
    return this.ordersService.findAllAdmin(query);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @Req() req: Request & { adminUser?: { id: string } },
  ) {
    return this.ordersService.updateStatus(id, dto, req.adminUser?.id);
  }
}
