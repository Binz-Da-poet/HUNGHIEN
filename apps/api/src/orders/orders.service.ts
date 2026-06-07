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
    const { status, skip = 0, take = 10, search } = query;
    const where: any = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { publicCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phoneNormalized: { contains: search } },
      ];
    }
    return this.prisma.order.findMany({
      where,
      skip,
      take,
      include: orderInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const { checkoutAttemptId } = createOrderDto;

      // 1. Idempotency: return existing order for the same checkoutAttemptId
      if (checkoutAttemptId) {
        const existing = await tx.order.findUnique({
          where: { checkoutAttemptId },
          include: orderInclude,
        });

        if (existing) {
          // Check if the attempt is still valid (within 24h)
          if (
            existing.checkoutAttemptExpiresAt &&
            existing.checkoutAttemptExpiresAt > new Date()
          ) {
            return existing;
          }
          // Expired — clear the key so this customer can retry
          await tx.order.update({
            where: { id: existing.id },
            data: { checkoutAttemptId: null, checkoutAttemptExpiresAt: null },
          });
        }
      }

      // 2. Merge duplicate product IDs and sum quantities
      const mergedItems = new Map<string, { productId: string; quantity: number }>();
      for (const item of createOrderDto.items) {
        const existing = mergedItems.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          mergedItems.set(item.productId, { productId: item.productId, quantity: item.quantity });
        }
      }

      // 3. Load all products (only ACTIVE)
      const productIds = Array.from(mergedItems.keys());
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, status: 'ACTIVE' },
      });

      // 4. Reject missing/inactive products
      if (products.length !== productIds.length) {
        const foundIds = new Set(products.map((p) => p.id));
        const missing = productIds.filter((id) => !foundIds.has(id));
        throw new BadRequestException(
          `Các sản phẩm sau không khả dụng: ${missing.join(', ')}.`,
        );
      }

      // 5. Conditional atomic stock decrement for each item
      let totalAmount = 0;
      const orderItemsData: {
        productId: string;
        productName: string;
        quantity: number;
        priceAtPurchase: number;
      }[] = [];

      for (const product of products) {
        const merged = mergedItems.get(product.id)!;

        // Atomic conditional decrement — prevents overselling
        const reserved = await tx.product.updateMany({
          where: {
            id: product.id,
            status: 'ACTIVE',
            stock: { gte: merged.quantity },
          },
          data: { stock: { decrement: merged.quantity } },
        });

        if (reserved.count !== 1) {
          throw new BadRequestException(
            `Sản phẩm "${product.name}" không đủ tồn kho (còn ${product.stock}, cần ${merged.quantity}).`,
          );
        }

        const priceAtPurchase = Number(product.price);
        totalAmount += priceAtPurchase * merged.quantity;

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          quantity: merged.quantity,
          priceAtPurchase,
        });
      }

      // 6. Create the order
      const publicCode = createPublicOrderCode();
      const phoneNormalized = normalizeVietnamesePhone(createOrderDto.phone);

      const order = await tx.order.create({
        data: {
          publicCode,
          customerName: createOrderDto.customerName,
          phone: createOrderDto.phone,
          phoneNormalized,
          address: createOrderDto.address,
          note: createOrderDto.note,
          paymentMethod: createOrderDto.paymentMethod,
          totalAmount,
          checkoutAttemptId: checkoutAttemptId || null,
          checkoutAttemptExpiresAt: checkoutAttemptId
            ? new Date(Date.now() + 24 * 60 * 60 * 1000)
            : null,
          items: { create: orderItemsData },
        },
        include: orderInclude,
      });

      // 7. Clear other expired checkout keys
      if (checkoutAttemptId) {
        await tx.order.updateMany({
          where: {
            checkoutAttemptExpiresAt: { lt: new Date() },
            checkoutAttemptId: { not: null },
          },
          data: { checkoutAttemptId: null, checkoutAttemptExpiresAt: null },
        });
      }

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
