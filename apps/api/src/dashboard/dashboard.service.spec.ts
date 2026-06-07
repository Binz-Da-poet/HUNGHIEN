import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  product: { count: vi.fn(), findMany: vi.fn() },
  order: { aggregate: vi.fn(), count: vi.fn(), findMany: vi.fn() },
};

describe('DashboardService', () => {
  let service: DashboardService;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPrisma.product.count.mockResolvedValue(1);
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 5000000 } });
    mockPrisma.order.count.mockResolvedValue(0);
    mockPrisma.order.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  it('returns all expected keys', async () => {
    const result = await service.getSummary();
    expect(result).toHaveProperty('totalProducts');
    expect(result).toHaveProperty('activeProducts');
    expect(result).toHaveProperty('outOfStockProducts');
    expect(result).toHaveProperty('lowStockProducts');
    expect(result).toHaveProperty('paidRevenue');
    expect(result).toHaveProperty('pendingOrders');
    expect(result).toHaveProperty('unpaidBankTransfers');
    expect(result).toHaveProperty('shippingOrders');
    expect(result).toHaveProperty('recentOrders');
    expect(result).toHaveProperty('lowStockItems');
  });

  it('computes paidRevenue from PAID orders only', async () => {
    mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: 7_500_000 } });
    const result = await service.getSummary();
    expect(result.paidRevenue).toBe(7_500_000);
    expect(mockPrisma.order.aggregate).toHaveBeenCalledWith(
      expect.objectContaining({ where: { paymentStatus: 'PAID' } }),
    );
  });

  it('returns 0 when no PAID orders exist', async () => {
    mockPrisma.order.aggregate.mockResolvedValue({ _sum: { totalAmount: null } });
    const result = await service.getSummary();
    expect(result.paidRevenue).toBe(0);
  });

  it('counts PENDING separately from SHIPPING', async () => {
    mockPrisma.order.count.mockImplementation((args: any) => {
      if (args.where?.status === 'PENDING') return Promise.resolve(4);
      if (args.where?.status === 'SHIPPING') return Promise.resolve(2);
      return Promise.resolve(0);
    });
    const result = await service.getSummary();
    expect(result.pendingOrders).toBe(4);
    expect(result.shippingOrders).toBe(2);
  });
});
