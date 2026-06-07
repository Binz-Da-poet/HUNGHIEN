import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePaymentStatusDto } from '../orders/dto/update-payment-status.dto';
import { isValidPaymentTransition } from '../orders/order-transitions';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async updatePaymentStatus(orderId: string, dto: UpdatePaymentStatusDto, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new NotFoundException(`Đơn hàng ${orderId} không tồn tại.`);
      }

      if (!isValidPaymentTransition(order.paymentStatus as PaymentStatus, dto.status as PaymentStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái thanh toán từ "${order.paymentStatus}" sang "${dto.status}".`,
        );
      }

      // Create event
      await tx.orderEvent.create({
        data: {
          orderId,
          type: 'PAYMENT_STATUS_CHANGED',
          fromValue: order.paymentStatus,
          toValue: dto.status,
          adminId: adminId || null,
        },
      });

      return tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: dto.status },
      });
    });
  }
}
