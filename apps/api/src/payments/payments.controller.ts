import { Controller, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentStatusDto } from '../orders/dto/update-payment-status.dto';
import { AdminSessionGuard } from '../auth/admin-session.guard';
import { Request } from 'express';

@Controller('admin/orders')
@UseGuards(AdminSessionGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Patch(':id/payment-status')
  updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @Req() req: Request & { adminUser?: { id: string } },
  ) {
    return this.paymentsService.updatePaymentStatus(id, dto, req.adminUser?.id);
  }
}
