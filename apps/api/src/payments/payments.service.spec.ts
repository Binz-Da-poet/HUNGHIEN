import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockPrismaService = {
    $transaction: vi.fn(),
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    orderEvent: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('allows UNPAID → PAID', async () => {
    const order = { id: 'o1', paymentStatus: 'UNPAID' };
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
    mockPrismaService.order.findUnique.mockResolvedValue(order);
    mockPrismaService.order.update.mockResolvedValue({ ...order, paymentStatus: 'PAID' });

    const result = await service.updatePaymentStatus('o1', { status: 'PAID' });

    expect(result).toEqual({ ...order, paymentStatus: 'PAID' });
    expect(mockPrismaService.orderEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'PAYMENT_STATUS_CHANGED',
          fromValue: 'UNPAID',
          toValue: 'PAID',
        }),
      }),
    );
  });

  it('rejects invalid transition PAID → UNPAID', async () => {
    const order = { id: 'o1', paymentStatus: 'PAID' };
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
    mockPrismaService.order.findUnique.mockResolvedValue(order);

    await expect(
      service.updatePaymentStatus('o1', { status: 'UNPAID' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects REFUNDED → PAID', async () => {
    const order = { id: 'o1', paymentStatus: 'REFUNDED' };
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
    mockPrismaService.order.findUnique.mockResolvedValue(order);

    await expect(
      service.updatePaymentStatus('o1', { status: 'PAID' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException for unknown order', async () => {
    mockPrismaService.$transaction.mockImplementation(async (cb: any) => cb(mockPrismaService));
    mockPrismaService.order.findUnique.mockResolvedValue(null);

    await expect(
      service.updatePaymentStatus('unknown', { status: 'PAID' }),
    ).rejects.toThrow(NotFoundException);
  });
});
