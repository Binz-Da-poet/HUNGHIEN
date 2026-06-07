import { Test, TestingModule } from '@nestjs/testing';
import { HomepageService } from './homepage.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('HomepageService', () => {
  let service: HomepageService;

  const mockPrismaService = {
    homepageBanner: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    homepageBannerProduct: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    homepageSection: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    featuredCategory: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    featuredProductGroup: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    featuredProductGroupItem: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    featuredBrand: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    storeBenefit: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    storeSettings: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn((cb: any) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomepageService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<HomepageService>(HomepageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBanner', () => {
    it('creates a banner without productIds', async () => {
      const dto = { name: 'Hero', mode: 'SINGLE_IMAGE' };
      const created = { id: 'b1', ...dto };
      mockPrismaService.homepageBanner.create.mockResolvedValue(created);

      const result = await service.createBanner(dto as any);

      expect(result).toEqual(created);
      expect(mockPrismaService.homepageBanner.create).toHaveBeenCalledWith({
        data: { name: 'Hero', mode: 'SINGLE_IMAGE', products: undefined },
      });
    });

    it('creates a banner with productIds', async () => {
      const dto = { name: 'Product Banner', mode: 'PRODUCT_LIST' as const, productIds: ['p1', 'p2'] };
      mockPrismaService.homepageBanner.create.mockResolvedValue({ id: 'b1' });

      await service.createBanner(dto as any);

      expect(mockPrismaService.homepageBanner.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          products: {
            create: [
              { productId: 'p1', sortOrder: 0 },
              { productId: 'p2', sortOrder: 1 },
            ],
          },
        }),
      });
    });
  });

  describe('createFeaturedCategory', () => {
    it('creates a featured category with typed DTO', async () => {
      const dto = { categoryId: 'c1', displayName: 'Điện Thoại' };
      const created = { id: 'fc1', ...dto, isActive: true, sortOrder: 0 };
      mockPrismaService.featuredCategory.create.mockResolvedValue(created);

      const result = await service.createFeaturedCategory(dto);

      expect(result).toEqual(created);
      expect(mockPrismaService.featuredCategory.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('createProductGroup', () => {
    it('creates a product group with items', async () => {
      const dto = {
        name: 'Khuyến Mãi Hot',
        slug: 'khuyen-mai-hot',
        title: 'Ưu đãi lớn',
        items: [{ productId: 'p1' }, { productId: 'p2' }],
      };
      mockPrismaService.featuredProductGroup.create.mockResolvedValue({ id: 'pg1' });

      await service.createProductGroup(dto);

      expect(mockPrismaService.featuredProductGroup.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'Khuyến Mãi Hot',
          slug: 'khuyen-mai-hot',
          title: 'Ưu đãi lớn',
          items: {
            create: [
              { productId: 'p1', sortOrder: 0 },
              { productId: 'p2', sortOrder: 1 },
            ],
          },
        }),
      });
    });
  });

  describe('createFeaturedBrand', () => {
    it('creates a featured brand', async () => {
      const dto = { name: 'Samsung', logoUrl: '/uploads/cms/brands/samsung.png' };
      mockPrismaService.featuredBrand.create.mockResolvedValue({ id: 'fb1', ...dto });

      const result = await service.createFeaturedBrand(dto);

      expect(result).toEqual({ id: 'fb1', ...dto });
      expect(mockPrismaService.featuredBrand.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('createBenefit', () => {
    it('creates a store benefit', async () => {
      const dto = {
        icon: 'Shield',
        title: 'Bảo hành 2 năm',
        description: 'Bảo hành chính hãng toàn quốc',
      };
      mockPrismaService.storeBenefit.create.mockResolvedValue({ id: 'sb1', ...dto });

      const result = await service.createBenefit(dto);

      expect(result).toEqual({ id: 'sb1', ...dto });
      expect(mockPrismaService.storeBenefit.create).toHaveBeenCalledWith({
        data: dto,
      });
    });
  });

  describe('getPublicHomepage', () => {
    it('returns complete homepage data', async () => {
      mockPrismaService.homepageBanner.findMany.mockResolvedValue([]);
      mockPrismaService.homepageSection.findMany.mockResolvedValue([]);
      mockPrismaService.featuredCategory.findMany.mockResolvedValue([]);
      mockPrismaService.featuredProductGroup.findMany.mockResolvedValue([]);
      mockPrismaService.featuredBrand.findMany.mockResolvedValue([]);
      mockPrismaService.storeBenefit.findMany.mockResolvedValue([]);
      mockPrismaService.storeSettings.findUnique.mockResolvedValue({ id: 'main' });

      const result = await service.getPublicHomepage();

      expect(result).toHaveProperty('banners');
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('featuredCategories');
      expect(result).toHaveProperty('productGroups');
      expect(result).toHaveProperty('featuredBrands');
      expect(result).toHaveProperty('benefits');
      expect(result).toHaveProperty('settings');
    });
  });
});
