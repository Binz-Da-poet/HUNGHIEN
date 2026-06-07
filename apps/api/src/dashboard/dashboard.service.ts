import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const [
      totalProducts,
      activeProducts,
      outOfStockProducts,
      paidRevenue,
      pendingOrders,
      unpaidBankTransfers,
      shippingOrders,
      lowStockProducts,
    ] = await Promise.all([
      this.prisma.product.count(),
      this.prisma.product.count({ where: { status: 'ACTIVE' } }),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      this.prisma.order.count({ where: { status: 'PENDING' } }),
      this.prisma.order.count({
        where: { paymentMethod: 'BANK_TRANSFER', paymentStatus: 'UNPAID' },
      }),
      this.prisma.order.count({ where: { status: 'SHIPPING' } }),
      this.prisma.product.count({ where: { stock: { lte: 5, gt: 0 } } }),
    ]);

    const recentOrders = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicCode: true,
        customerName: true,
        phone: true,
        totalAmount: true,
        status: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    const lowStockItems = await this.prisma.product.findMany({
      where: { stock: { lte: 5 } },
      take: 5,
      orderBy: { stock: 'asc' },
      select: {
        id: true,
        name: true,
        stock: true,
        price: true,
      },
    });

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      lowStockProducts,
      paidRevenue: Number(paidRevenue._sum.totalAmount || 0),
      pendingOrders,
      unpaidBankTransfers,
      shippingOrders,
      recentOrders,
      lowStockItems,
    };
  }
}
