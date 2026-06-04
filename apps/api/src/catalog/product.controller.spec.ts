import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  const mockProductService = {
    findAll: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    addImages: vi.fn(),
    updateImage: vi.fn(),
    deleteImage: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        { provide: ProductService, useValue: mockProductService },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
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

  it('uploadImages should pass files to the product service', async () => {
    const files = [{ originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 100 }] as any;
    const images = [{ id: 'img-1', url: '/uploads/products/product-1/front.jpg' }];
    mockProductService.addImages.mockResolvedValue(images);

    const result = await controller.uploadImages('product-1', files);

    expect(result).toEqual(images);
    expect(mockProductService.addImages).toHaveBeenCalledWith('product-1', files);
  });

  it('updateImage should pass metadata to the product service', async () => {
    const dto = { isPrimary: true };
    mockProductService.updateImage.mockResolvedValue({ id: 'img-1', isPrimary: true });

    const result = await controller.updateImage('product-1', 'img-1', dto);

    expect(result).toEqual({ id: 'img-1', isPrimary: true });
    expect(mockProductService.updateImage).toHaveBeenCalledWith('product-1', 'img-1', dto);
  });

  it('deleteImage should remove image metadata', async () => {
    mockProductService.deleteImage.mockResolvedValue({ deleted: true });

    const result = await controller.deleteImage('product-1', 'img-1');

    expect(result).toEqual({ deleted: true });
    expect(mockProductService.deleteImage).toHaveBeenCalledWith('product-1', 'img-1');
  });
});
