import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageStorageService } from './image-storage.service';
import { BadRequestException } from '@nestjs/common';

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
    $transaction: vi.fn(),
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productImage: {
      findMany: vi.fn(),
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
    vi.resetAllMocks();
    mockPrismaService.$transaction.mockImplementation((callback) => callback(mockPrismaService));

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
      ];
      const savedImages = [
        { url: '/uploads/products/prod1/1-front.jpg', altText: 'front.jpg', sortOrder: 0 },
        { url: '/uploads/products/prod1/2-side.jpg', altText: 'side.jpg', sortOrder: 1 },
      ];
      const returnedImages = [
        { id: 'img1', productId: 'prod1', ...savedImages[0], isPrimary: true },
        { id: 'img2', productId: 'prod1', ...savedImages[1], isPrimary: false },
      ];
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.productImage.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(returnedImages);
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);

      const result = await service.addImages('prod1', files);

      expect(result).toEqual(returnedImages);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'prod1' },
        select: { id: true },
      });
      expect(imageStorage.saveProductImages).toHaveBeenCalledWith('prod1', files);
      expect(mockPrismaService.productImage.createMany).toHaveBeenCalledWith({
        data: [
          { productId: 'prod1', ...savedImages[0], isPrimary: true },
          { productId: 'prod1', ...savedImages[1], isPrimary: false },
        ],
      });
      expect(mockPrismaService.productImage.findMany).toHaveBeenLastCalledWith({
        where: { productId: 'prod1' },
        orderBy: imageOrderBy,
      });
    });

    it('does not store files when the product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.addImages('missing', [
          { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
        ]),
      ).rejects.toThrow();

      expect(mockImageStorageService.saveProductImages).not.toHaveBeenCalled();
      expect(mockPrismaService.productImage.createMany).not.toHaveBeenCalled();
    });

    it('cleans up stored files when metadata creation fails', async () => {
      const savedImages = [
        { url: '/uploads/products/prod1/1-front.jpg', altText: 'front.jpg', sortOrder: 0 },
        { url: '/uploads/products/prod1/2-side.jpg', altText: 'side.jpg', sortOrder: 1 },
      ];
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.productImage.findMany.mockResolvedValueOnce([]);
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);
      mockPrismaService.productImage.createMany.mockRejectedValue(new Error('db failed'));

      await expect(
        service.addImages('prod1', [
          { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
          { originalname: 'side.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('b'), size: 1 },
        ]),
      ).rejects.toThrow('db failed');

      expect(mockImageStorageService.deleteByUrl).toHaveBeenCalledWith(savedImages[0].url);
      expect(mockImageStorageService.deleteByUrl).toHaveBeenCalledWith(savedImages[1].url);
    });

    it('offsets new image sortOrder when the product already has images', async () => {
      const existingImages = [
        { id: 'img1', productId: 'prod1', sortOrder: 0, isPrimary: true },
        { id: 'img2', productId: 'prod1', sortOrder: 1, isPrimary: false },
      ];
      const savedImages = [
        { url: '/uploads/products/prod1/3-back.jpg', altText: 'back.jpg', sortOrder: 0 },
        { url: '/uploads/products/prod1/4-box.jpg', altText: 'box.jpg', sortOrder: 1 },
      ];
      const returnedImages = [
        ...existingImages,
        { id: 'img3', productId: 'prod1', ...savedImages[0], sortOrder: 2, isPrimary: false },
        { id: 'img4', productId: 'prod1', ...savedImages[1], sortOrder: 3, isPrimary: false },
      ];
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.productImage.findMany
        .mockResolvedValueOnce(existingImages)
        .mockResolvedValueOnce(returnedImages);
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);

      const result = await service.addImages('prod1', [
        { originalname: 'back.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
        { originalname: 'box.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('b'), size: 1 },
      ]);

      expect(result).toEqual(returnedImages);
      expect(mockPrismaService.productImage.createMany).toHaveBeenCalledWith({
        data: [
          { productId: 'prod1', ...savedImages[0], sortOrder: 2, isPrimary: false },
          { productId: 'prod1', ...savedImages[1], sortOrder: 3, isPrimary: false },
        ],
      });
    });

    it('uses max existing sortOrder plus one when existing sort orders have gaps', async () => {
      const existingImages = [
        { id: 'img1', productId: 'prod1', sortOrder: 0, isPrimary: true },
        { id: 'img2', productId: 'prod1', sortOrder: 2, isPrimary: false },
      ];
      const savedImages = [
        { url: '/uploads/products/prod1/3-back.jpg', altText: 'back.jpg', sortOrder: 0 },
      ];
      const returnedImages = [
        ...existingImages,
        { id: 'img3', productId: 'prod1', ...savedImages[0], sortOrder: 3, isPrimary: false },
      ];
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.productImage.findMany
        .mockResolvedValueOnce(existingImages)
        .mockResolvedValueOnce(returnedImages);
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);

      const result = await service.addImages('prod1', [
        { originalname: 'back.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
      ]);

      expect(result).toEqual(returnedImages);
      expect(mockPrismaService.productImage.createMany).toHaveBeenCalledWith({
        data: [
          { productId: 'prod1', ...savedImages[0], sortOrder: 3, isPrimary: false },
        ],
      });
    });

    it('does not clean up stored files when metadata was created but final read fails', async () => {
      const savedImages = [
        { url: '/uploads/products/prod1/1-front.jpg', altText: 'front.jpg', sortOrder: 0 },
      ];
      mockPrismaService.product.findUnique.mockResolvedValue({ id: 'prod1' });
      mockPrismaService.productImage.findMany
        .mockResolvedValueOnce([])
        .mockRejectedValueOnce(new Error('read failed'));
      mockImageStorageService.saveProductImages.mockResolvedValue(savedImages);
      mockPrismaService.productImage.createMany.mockResolvedValue({ count: 1 });

      await expect(
        service.addImages('prod1', [
          { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
        ]),
      ).rejects.toThrow('read failed');

      expect(mockPrismaService.productImage.createMany).toHaveBeenCalled();
      expect(mockImageStorageService.deleteByUrl).not.toHaveBeenCalled();
    });
  });

  describe('setPrimaryImage', () => {
    it('clears existing primary images and marks the target image primary in a transaction', async () => {
      const targetImage = { id: 'img2', productId: 'prod1', isPrimary: false };
      mockPrismaService.productImage.findFirst
        .mockResolvedValueOnce(targetImage)
        .mockResolvedValueOnce({ ...targetImage, isPrimary: true });
      mockPrismaService.productImage.updateMany
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 1 });

      const result = await service.setPrimaryImage('prod1', 'img2');

      expect(result).toEqual({ ...targetImage, isPrimary: true });
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.productImage.findFirst).toHaveBeenNthCalledWith(1, {
        where: { id: 'img2', productId: 'prod1' },
      });
      expect(mockPrismaService.productImage.updateMany).toHaveBeenNthCalledWith(1, {
        where: { productId: 'prod1', isPrimary: true },
        data: { isPrimary: false },
      });
      expect(mockPrismaService.productImage.updateMany).toHaveBeenNthCalledWith(2, {
        where: { id: 'img2', productId: 'prod1' },
        data: { isPrimary: true },
      });
    });
  });

  describe('deleteImage', () => {
    it('promotes the next image in the deletion transaction', async () => {
      const deletedImage = {
        id: 'img1',
        productId: 'prod1',
        url: '/uploads/products/prod1/img1.jpg',
        isPrimary: true,
      };
      const nextImage = { id: 'img2', productId: 'prod1', isPrimary: false };
      mockPrismaService.productImage.findFirst
        .mockResolvedValueOnce(deletedImage)
        .mockResolvedValueOnce(nextImage);
      mockPrismaService.productImage.delete.mockResolvedValue(deletedImage);
      mockPrismaService.productImage.updateMany.mockResolvedValue({ count: 1 });

      await service.deleteImage('prod1', 'img1');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockPrismaService.productImage.findFirst).toHaveBeenNthCalledWith(1, {
        where: { id: 'img1', productId: 'prod1' },
      });
      expect(mockPrismaService.productImage.delete).toHaveBeenCalledWith({
        where: { id: 'img1' },
      });
      expect(mockPrismaService.productImage.findFirst).toHaveBeenNthCalledWith(2, {
        where: { productId: 'prod1' },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });
      expect(mockPrismaService.productImage.updateMany).toHaveBeenCalledWith({
        where: { id: 'img2', productId: 'prod1' },
        data: { isPrimary: true },
      });
      expect(mockImageStorageService.deleteByUrl).toHaveBeenCalledWith(deletedImage.url);
    });

    it('does not reject when storage cleanup fails after image deletion', async () => {
      const deletedImage = {
        id: 'img1',
        productId: 'prod1',
        url: '/uploads/products/prod1/img1.jpg',
        isPrimary: false,
      };
      mockPrismaService.productImage.findFirst.mockResolvedValue(deletedImage);
      mockPrismaService.productImage.delete.mockResolvedValue(deletedImage);
      mockImageStorageService.deleteByUrl.mockRejectedValue(new Error('disk failed'));

      await expect(service.deleteImage('prod1', 'img1')).resolves.toBeUndefined();

      expect(mockPrismaService.productImage.delete).toHaveBeenCalledWith({
        where: { id: 'img1' },
      });
      expect(mockImageStorageService.deleteByUrl).toHaveBeenCalledWith(deletedImage.url);
    });
  });
});

describe('ImageStorageService', () => {
  let service: ImageStorageService;

  beforeEach(() => {
    service = new ImageStorageService();
  });

  it('rejects product IDs with path traversal characters', async () => {
    await expect(
      service.saveProductImages('../outside', [
        { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 1 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
