import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { createPublicOrderCode } from './order-code';
import { normalizeVietnamesePhone } from './phone-normalizer';

const orderInclude = {
  items: true,
  events: { orderBy: { createdAt: 'asc' as const } },
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: OrderQueryDto) {
    const { status, skip = 0, take = 10 } = query;
    return this.prisma.order.findMany({
      where: status ? { status } : {},
      skip,
      take,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItemsData: {
        productId: string;
        productName: string;
        quantity: number;
        priceAtPurchase: number;
      }[] = [];

      for (const item of createOrderDto.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Sản phẩm ${item.productId} không tồn tại.`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm "${product.name}" không đủ tồn kho.`);
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });

        const priceAtPurchase = Number(product.price);
        totalAmount += priceAtPurchase * item.quantity;

        orderItemsData.push({
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          priceAtPurchase,
        });
      }

      const publicCode = createPublicOrderCode();

      const order = await tx.order.create({
        data: {
          publicCode,
          customerName: createOrderDto.customerName,
          phone: createOrderDto.phone,
          phoneNormalized: normalizeVietnamesePhone(createOrderDto.phone),
          address: createOrderDto.address,
          note: createOrderDto.note,
          paymentMethod: createOrderDto.paymentMethod,
          totalAmount,
          checkoutAttemptId: createOrderDto.checkoutAttemptId,
          checkoutAttemptExpiresAt: createOrderDto.checkoutAttemptId
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : undefined,
          items: { create: orderItemsData },
        },
        include: orderInclude,
      });

      return order;
    });
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Đơn hàng ${id} không tồn tại.`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: updateOrderStatusDto.status },
    });
  }
}
