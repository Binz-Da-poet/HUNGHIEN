import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProductService', () => {
  let service: ProductService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = [
        { id: '1', name: 'Product 1', slug: 'product-1', price: 100, stock: 10 },
      ];
      mockPrismaService.product.findMany.mockResolvedValue(products);
      
      const result = await service.findAll();
      
      expect(result).toEqual(products);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });

    it('should filter by categoryId', async () => {
      await service.findAll({ categoryId: 'cat1' });
      
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat1' },
        include: { category: true, images: true },
      });
    });

    it('should search by name', async () => {
      await service.findAll({ search: 'phone' });
      
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'phone', mode: 'insensitive' } },
            { description: { contains: 'phone', mode: 'insensitive' } },
          ],
        },
        include: { category: true, images: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = { id: '1', name: 'Product 1' };
      mockPrismaService.product.findUnique.mockResolvedValue(product);
      
      const result = await service.findOne('1');
      
      expect(result).toEqual(product);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { category: true, images: true },
      });
    });
  });

  describe('create', () => {
    it('should create a product', async () => {
      const dto = {
        name: 'New Product',
        slug: 'new-product',
        price: 100,
        brand: 'Brand',
        stock: 10,
        categoryId: 'cat1',
      };
      const createdProduct = { id: '1', ...dto };
      mockPrismaService.product.create.mockResolvedValue(createdProduct);
      
      const result = await service.create(dto);
      
      expect(result).toEqual(createdProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: dto,
      });
    });

    it('should validate with Zod (shared schema)', async () => {
      const invalidDto = {
        name: '', // Invalid: min(1)
        slug: 'new-product',
        price: -10, // Invalid: positive()
        brand: 'Brand',
        stock: 10,
        categoryId: 'cat1',
      };
      
      await expect(service.create(invalidDto as any)).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = '1';
      const dto = { name: 'Updated Product' };
      const updatedProduct = { id, name: 'Updated Product' };
      mockPrismaService.product.update.mockResolvedValue(updatedProduct);
      
      const result = await service.update(id, dto);
      
      expect(result).toEqual(updatedProduct);
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id },
        data: dto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      const id = '1';
      mockPrismaService.product.delete.mockResolvedValue({ id });
      
      const result = await service.remove(id);
      
      expect(result).toEqual({ id });
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });
  });
});
