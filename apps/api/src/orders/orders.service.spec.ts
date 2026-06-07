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
      update: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prisma = module.get<PrismaService>(PrismaService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createOrderDto = {
      customerName: 'John Doe',
      phone: '0123456789',
      address: '123 Street',
      paymentMethod: 'COD',
      items: [
        { productId: 'prod1', quantity: 2 },
      ],
    };

    it('should create an order and update stock successfully', async () => {
      const product = { id: 'prod1', name: 'Product 1', price: 100, stock: 10 };
      const createdOrder = { id: 'order1', ...createOrderDto, totalAmount: 200 };

      // Mock transaction behavior
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });

      mockPrismaService.product.findUnique.mockResolvedValue(product);
      mockPrismaService.order.create.mockResolvedValue(createdOrder);

      const result = await service.create(createOrderDto);

      expect(result).toEqual(createdOrder);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        data: { stock: { decrement: 2 } },
      });
      expect(mockPrismaService.order.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.create(createOrderDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if insufficient stock', async () => {
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1', name: 'Product 1', stock: 1, price: 100 });

      await expect(service.create(createOrderDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should find all orders with pagination and filter', async () => {
      const query = { status: 'PENDING', skip: 0, take: 10 };
      const mockOrders = [{ id: '1', status: 'PENDING' }];
      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAll(query);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        skip: 0,
        take: 10,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockOrders);
    });

    it('should find all orders without status filter', async () => {
      const query = { skip: 10, take: 5 };
      mockPrismaService.order.findMany.mockResolvedValue([]);

      // @ts-expect-error - testing with query params not in order DTO type
      await service.findAll(query);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 5,
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = 'order1';
      const updateStatusDto = { status: 'SHIPPING' };
      const mockOrder = { id: orderId, status: 'PENDING' };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue({
        ...mockOrder,
        status: 'SHIPPING',
      });

      const result = await service.updateStatus(orderId, updateStatusDto);

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: orderId },
      });
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: 'SHIPPING' },
      });
      expect(result.status).toBe('SHIPPING');
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('invalid-id', { status: 'SUCCESS' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
