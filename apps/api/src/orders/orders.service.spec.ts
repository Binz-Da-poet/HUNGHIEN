import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('OrdersService', () => {
  let service: OrdersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;

  const mockPrismaService = {
    $transaction: vi.fn(),
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create — atomic checkout', () => {
    const createOrderDto = {
      customerName: 'Nguyễn Văn A',
      phone: '0912345678',
      address: '123 Đường ABC',
      paymentMethod: 'COD' as const,
      items: [{ productId: 'prod1', quantity: 2 }],
    };

    it('creates an order and decrements stock atomically', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 100, stock: 10, status: 'ACTIVE' };
      const createdOrder = { id: 'order1', ...createOrderDto, totalAmount: 200, publicCode: 'HHABCD123456' };

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.product.findMany.mockResolvedValue([product]);
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.create.mockResolvedValue(createdOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(createdOrder);
      expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith({
        where: { id: 'prod1', status: 'ACTIVE', stock: { gte: 2 } },
        data: { stock: { decrement: 2 } },
      });
    });

    it('uses database product price and name (not from request)', async () => {
      const product = { id: 'prod1', name: 'Real Product Name', price: 150, stock: 10, status: 'ACTIVE' };

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.product.findMany.mockResolvedValue([product]);
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.create.mockResolvedValue({ id: 'order1' });

      await service.create(createOrderDto);

      expect(mockPrismaService.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            totalAmount: 300, // 150 * 2
            items: {
              create: [
                expect.objectContaining({
                  productId: 'prod1',
                  productName: 'Real Product Name',
                  priceAtPurchase: 150,
                  quantity: 2,
                }),
              ],
            },
          }),
        }),
      );
    });

    it('rejects inactive products', async () => {
      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.product.findMany.mockResolvedValue([]); // no ACTIVE products found

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createOrderDto)).rejects.toThrow('không khả dụng');
    });

    it('rolls back when stock insufficient (updateMany returns 0)', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 100, stock: 1, status: 'ACTIVE' };

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.product.findMany.mockResolvedValue([product]);
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 0 }); // no rows affected

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createOrderDto)).rejects.toThrow('không đủ tồn kho');
    });

    it('merges duplicate product lines before reserving stock', async () => {
      const dtoWithDuplicates = {
        ...createOrderDto,
        items: [
          { productId: 'prod1', quantity: 1 },
          { productId: 'prod1', quantity: 3 },
          { productId: 'prod2', quantity: 1 },
        ],
      };
      const products = [
        { id: 'prod1', name: 'Product 1', price: 100, stock: 10, status: 'ACTIVE' },
        { id: 'prod2', name: 'Product 2', price: 200, stock: 5, status: 'ACTIVE' },
      ];

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.product.findMany.mockResolvedValue(products);
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.create.mockResolvedValue({ id: 'order1' });

      await service.create(dtoWithDuplicates);

      // Should call updateMany for prod1 with quantity 4 (merged)
      expect(mockPrismaService.product.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'prod1', status: 'ACTIVE', stock: { gte: 4 } },
          data: { stock: { decrement: 4 } },
        }),
      );
    });
  });

  describe('create — idempotency', () => {
    const createOrderDto = {
      customerName: 'Nguyễn Văn A',
      phone: '0912345678',
      address: '123 Đường ABC',
      paymentMethod: 'COD' as const,
      items: [{ productId: 'prod1', quantity: 1 }],
      checkoutAttemptId: '550e8400-e29b-41d4-a716-446655440001',
    };

    it('returns the existing order for a repeated checkoutAttemptId (within TTL)', async () => {
      const existingOrder = {
        id: 'order1',
        publicCode: 'HH1234567890',
        checkoutAttemptId: createOrderDto.checkoutAttemptId,
        checkoutAttemptExpiresAt: new Date(Date.now() + 3600_000), // 1 hour from now
        status: 'PENDING',
      };

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.order.findUnique.mockResolvedValue(existingOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(existingOrder);
      expect(mockPrismaService.product.findMany).not.toHaveBeenCalled();
    });

    it('clears expired checkout attempt key and creates a new order', async () => {
      const expiredOrder = {
        id: 'order1',
        checkoutAttemptId: createOrderDto.checkoutAttemptId,
        checkoutAttemptExpiresAt: new Date(Date.now() - 1000), // expired
      };
      const product = { id: 'prod1', name: 'P1', price: 100, stock: 10, status: 'ACTIVE' };
      const newOrder = { id: 'order2', publicCode: 'HHABCDEF1234' };

      mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
      mockPrismaService.order.findUnique.mockResolvedValue(expiredOrder);
      mockPrismaService.product.findMany.mockResolvedValue([product]);
      mockPrismaService.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.order.create.mockResolvedValue(newOrder);

      const result = await service.create(createOrderDto);

      // Should clear the expired key
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order1' },
        data: { checkoutAttemptId: null, checkoutAttemptExpiresAt: null },
      });
      // Should create a new order
      expect(result).toEqual(newOrder);
    });
  });

  describe('findAll', () => {
    it('finds all orders with pagination and filter', async () => {
      const query = { status: 'PENDING', skip: 0, take: 10 };
      const mockOrders = [{ id: '1', status: 'PENDING' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      await service.findAll(query as any);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        skip: 0,
        take: 10,
        include: { items: true, events: { orderBy: { createdAt: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('supports search by publicCode, name, or phone', async () => {
      const query = { search: 'HH123', skip: 0, take: 10 };
      mockPrismaService.order.findMany.mockResolvedValue([]);

      await service.findAll(query as any);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { publicCode: { contains: 'HH123', mode: 'insensitive' } },
              { customerName: { contains: 'HH123', mode: 'insensitive' } },
              { phoneNormalized: { contains: 'HH123' } },
            ],
          },
        }),
      );
    });
  });

  describe('updateStatus', () => {
    it('updates order status', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({ id: 'order1', status: 'PENDING' });
      mockPrismaService.order.update.mockResolvedValue({ id: 'order1', status: 'CONFIRMED' });

      const result = await service.updateStatus('order1', { status: 'CONFIRMED' });

      expect(result.status).toBe('CONFIRMED');
    });

    it('throws NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus('invalid-id', { status: 'CONFIRMED' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
