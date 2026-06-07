import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrderQueryDto } from './dto/admin-order-query.dto';
import { TrackOrderDto } from './dto/track-order.dto';
import { createPublicOrderCode } from './order-code';
import { normalizeVietnamesePhone } from './phone-normalizer';
import { isValidOrderTransition } from './order-transitions';

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

  /** Returns a public summary — no internal id/events/admin data */
  async track(dto: TrackOrderDto) {
    const normalizedPhone = normalizeVietnamesePhone(dto.phone);
    const order = await this.prisma.order.findFirst({
      where: {
        publicCode: dto.publicCode.trim(),
        phoneNormalized: normalizedPhone,
      },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại mã đơn và số điện thoại.');
    }

    // Include bank transfer info for unpaid bank-transfer orders
    let bankTransfer: { bankName: string; bankAccountNumber: string; bankAccountHolder: string; transferContent: string; instructions: string | null; qrImageUrl: string | null } | undefined = undefined;
    if (order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus === 'UNPAID') {
      const settings = await this.prisma.storeSettings.findFirst();
      if (settings?.bankAccountNumber) {
        bankTransfer = {
          bankName: settings.bankName || 'Ngân hàng',
          bankAccountNumber: settings.bankAccountNumber,
          bankAccountHolder: settings.bankAccountHolder || 'Chủ tài khoản',
          transferContent: settings.bankTransferTemplate?.replace('{code}', order.publicCode) || order.publicCode,
          instructions: settings.bankTransferInstructions || null,
          qrImageUrl: settings.bankQrImageUrl || null,
        };
      }
    }

    const summary = this.toPublicSummary(order);
    if (bankTransfer) {
      (summary as any).bankTransfer = bankTransfer;
    }
    return summary;
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        events: { orderBy: { createdAt: 'asc' }, include: { admin: { select: { name: true } } } },
      },
    });
    if (!order) throw new NotFoundException(`Đơn hàng ${id} không tồn tại.`);
    return order;
  }

  async findAllAdmin(query: AdminOrderQueryDto) {
    const { status, paymentStatus, search, skip = 0, take = 10 } = query;
    const where: any = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) {
      where.OR = [
        { publicCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phoneNormalized: { contains: search } },
      ];
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          items: true,
          events: { orderBy: { createdAt: 'asc' }, take: 1 },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { orders, total, skip, take };
  }

  private toPublicSummary(order: any) {
    return {
      publicCode: order.publicCode,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: Number(order.totalAmount),
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      note: order.note || null,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item: any) => ({
        productName: item.productName,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
      })),
    };
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto, adminId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        throw new NotFoundException(`Đơn hàng ${id} không tồn tại.`);
      }

      const newStatus = updateOrderStatusDto.status;

      if (!isValidOrderTransition(order.status as OrderStatus, newStatus as OrderStatus)) {
        throw new BadRequestException(
          `Không thể chuyển trạng thái từ "${order.status}" sang "${newStatus}".`,
        );
      }

      // Restore stock on first cancellation
      if (newStatus === 'CANCELLED' && !order.stockRestoredAt) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      // Create event
      await tx.orderEvent.create({
        data: {
          orderId: id,
          type: 'ORDER_STATUS_CHANGED',
          fromValue: order.status,
          toValue: newStatus,
          adminId: adminId || null,
        },
      });

      // Update order
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: newStatus,
          stockRestoredAt:
            newStatus === 'CANCELLED' && !order.stockRestoredAt
              ? new Date()
              : order.stockRestoredAt,
        },
        include: orderInclude,
      });

      return updated;
    });
  }
}
