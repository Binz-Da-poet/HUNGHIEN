import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageStorageService } from './image-storage.service';

describe('ProductService', () => {
  let service: ProductService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prisma: PrismaService;
  let imageStorage: ImageStorageService;

  const imageOrderBy = [
    { isPrimary: 'desc' },
    { sortOrder: 'asc' },
    { createdAt: 'asc' },
  ];

  const mockPrismaService = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productImage: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      createMany: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const mockImageStorageService = {
    saveProductImages: vi.fn(),
    deleteByUrl: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ImageStorageService, useValue: mockImageStorageService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prisma = module.get<PrismaService>(PrismaService);
    imageStorage = module.get<ImageStorageService>(ImageStorageService);
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
        include: { category: true, images: { orderBy: imageOrderBy } },
      });
    });

    it('should search by name', async () => {
      await service.findAll({ search: 'phone' });
      
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'phone', mode: 'insensitive' } },
            { description: { contains: 'phone', mode: 'insensitive' } },
            { brand: { contains: 'phone', mode: 'insensitive' } },
          ],
        },
        include: { category: true, images: { orderBy: imageOrderBy } },
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
        include: { category: true, images: { orderBy: imageOrderBy } },
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

  describe('addImages', () => {
    it('marks the first uploaded image primary when the product has no images', async () => {
      const files = [
        { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
        { originalname: 'side.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('b'), size: 1 },
      ] as any[];
      const savedImages = [
        { url: '/uploads/products/prod1/1-front.jpg', altText: 'front.jpg', sortOrder: 0 },
        { url: '/uploads/products/prod1/2-side.jpg', altText: 'side.jpg', sortOrder: 1 },
      ];
      const returnedImages = [
        { id: 'img1', productId: 'prod1', ...savedImages[0], isPrimary: true },
        { id: 'img2', productId: 'prod1', ...savedImages[1], isPrimary: false },
      ];
      mockPrismaService.productImage.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(returnedImages);
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);

      const result = await service.addImages('prod1', files);

      expect(result).toEqual(returnedImages);
      expect(imageStorage.saveProductImages).toHaveBeenCalledWith('prod1', files);
      expect(mockPrismaService.productImage.createMany).toHaveBeenCalledWith({
        data: [
          { productId: 'prod1', ...savedImages[0], isPrimary: true, sortOrder: 0 },
          { productId: 'prod1', ...savedImages[1], isPrimary: false, sortOrder: 1 },
        ],
      });
      expect(mockPrismaService.productImage.findMany).toHaveBeenLastCalledWith({
        where: { productId: 'prod1' },
        orderBy: imageOrderBy,
      });
    });
  });

  describe('setPrimaryImage', () => {
    it('clears existing primary images before marking the target image primary', async () => {
      const targetImage = { id: 'img2', productId: 'prod1', isPrimary: false };
      mockPrismaService.productImage.update.mockResolvedValue({
        ...targetImage,
        isPrimary: true,
      });

      const result = await service.setPrimaryImage('prod1', 'img2');

      expect(result).toEqual({ ...targetImage, isPrimary: true });
      expect(mockPrismaService.productImage.updateMany).toHaveBeenCalledWith({
        where: { productId: 'prod1' },
        data: { isPrimary: false },
      });
      expect(mockPrismaService.productImage.update).toHaveBeenCalledWith({
        where: { id: 'img2', productId: 'prod1' },
        data: { isPrimary: true },
      });
    });
  });

  describe('deleteImage', () => {
    it('promotes the next image when deleting the primary image', async () => {
      const deletedImage = {
        id: 'img1',
        productId: 'prod1',
        url: '/uploads/products/prod1/img1.jpg',
        isPrimary: true,
      };
      const nextImage = { id: 'img2', productId: 'prod1', isPrimary: false };
      mockPrismaService.productImage.findUnique.mockResolvedValue(deletedImage);
      mockPrismaService.productImage.findMany.mockResolvedValue([nextImage]);
      mockPrismaService.productImage.delete.mockResolvedValue(deletedImage);
      mockPrismaService.productImage.update.mockResolvedValue({
        ...nextImage,
        isPrimary: true,
      });

      await service.deleteImage('prod1', 'img1');

      expect(mockPrismaService.productImage.findUnique).toHaveBeenCalledWith({
        where: { id: 'img1', productId: 'prod1' },
      });
      expect(mockPrismaService.productImage.delete).toHaveBeenCalledWith({
        where: { id: 'img1' },
      });
      expect(mockImageStorageService.deleteByUrl).toHaveBeenCalledWith(deletedImage.url);
      expect(mockPrismaService.productImage.findMany).toHaveBeenCalledWith({
        where: { productId: 'prod1' },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take: 1,
      });
      expect(mockPrismaService.productImage.update).toHaveBeenCalledWith({
        where: { id: 'img2' },
        data: { isPrimary: true },
      });
    });
  });
});
