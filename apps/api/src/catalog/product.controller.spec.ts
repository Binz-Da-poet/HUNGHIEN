import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';

describe('ProductController', () => {
  let controller: ProductController;

  const mockProductService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };

  const mockAuthService = {
    validateSession: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return all products', async () => {
    const products = [{ id: '1', name: 'Product 1', slug: 'p1', price: 100, brand: 'B', stock: 1, categoryId: 'c1' }];
    mockProductService.findAll.mockResolvedValue(products);
    
    const result = await controller.findAll();
    
    expect(result).toEqual(products);
    expect(mockProductService.findAll).toHaveBeenCalled();
  });

  it('findOne should return a product', async () => {
    const product = { id: '1', name: 'Product 1' };
    mockProductService.findOne.mockResolvedValue(product);
    
    const result = await controller.findOne('1');
    
    expect(result).toEqual(product);
    expect(mockProductService.findOne).toHaveBeenCalledWith('1');
  });

  it('create should create a product', async () => {
    const dto = { name: 'New', slug: 'new', price: 10, brand: 'B', stock: 1, categoryId: 'c1' };
    const product = { id: '1', ...dto };
    mockProductService.create.mockResolvedValue(product);
    
    const result = await controller.create(dto as any);
    
    expect(result).toEqual(product);
    expect(mockProductService.create).toHaveBeenCalledWith(dto);
  });

  it('update should update a product', async () => {
    const id = '1';
    const dto = { name: 'Updated' };
    const product = { id, name: 'Updated' };
    mockProductService.update.mockResolvedValue(product);
    
    const result = await controller.update(id, dto as any);
    
    expect(result).toEqual(product);
    expect(mockProductService.update).toHaveBeenCalledWith(id, dto);
  });

  it('remove should delete a product', async () => {
    const id = '1';
    mockProductService.remove.mockResolvedValue({ id });
    
    const result = await controller.remove(id);
    
    expect(result).toEqual({ id });
    expect(mockProductService.remove).toHaveBeenCalledWith(id);
  });

  describe('public catalog visibility', () => {
    it('public product list filters only ACTIVE products', async () => {
      const activeProduct = { id: '1', name: 'Active', status: 'ACTIVE' };
      mockProductService.findAll.mockResolvedValue([activeProduct]);

      const result = await controller.findAll();

      expect(result).toEqual([activeProduct]);
      expect(result.every((p: any) => p.status === 'ACTIVE')).toBe(true);
      expect(mockProductService.findAll).toHaveBeenCalled();
    });

    it('public product detail returns 404 for INACTIVE product', async () => {
      mockProductService.findOne.mockRejectedValue(new Error('404'));

      await expect(controller.findOne('inactive-id')).rejects.toThrow('404');
      expect(mockProductService.findOne).toHaveBeenCalledWith('inactive-id');
    });
  });
});
