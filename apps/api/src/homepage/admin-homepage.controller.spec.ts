import { Test, TestingModule } from '@nestjs/testing';
import { AdminHomepageController } from './admin-homepage.controller';
import { HomepageService } from './homepage.service';
import { ImageStorageService } from '../catalog/image-storage.service';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdminSessionGuard } from '../auth/admin-session.guard';

describe('AdminHomepageController', () => {
  let controller: AdminHomepageController;

  const mockHomepageService = {
    findAllBanners: vi.fn(),
    createBanner: vi.fn(),
    updateBanner: vi.fn(),
    deleteBanner: vi.fn(),
    findAllSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
    reorderSections: vi.fn(),
    getSettings: vi.fn(),
    updateSettings: vi.fn(),
    findAllFeaturedCategories: vi.fn(),
    createFeaturedCategory: vi.fn(),
    updateFeaturedCategory: vi.fn(),
    deleteFeaturedCategory: vi.fn(),
    findAllProductGroups: vi.fn(),
    createProductGroup: vi.fn(),
    updateProductGroup: vi.fn(),
    deleteProductGroup: vi.fn(),
    findAllFeaturedBrands: vi.fn(),
    createFeaturedBrand: vi.fn(),
    updateFeaturedBrand: vi.fn(),
    deleteFeaturedBrand: vi.fn(),
    findAllBenefits: vi.fn(),
    createBenefit: vi.fn(),
    updateBenefit: vi.fn(),
    deleteBenefit: vi.fn(),
  };

  const mockImageStorageService = {
    saveCmsImage: vi.fn(),
  };

  const mockAuthService = {
    validateSession: vi.fn(),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminHomepageController],
      providers: [
        { provide: HomepageService, useValue: mockHomepageService },
        { provide: ImageStorageService, useValue: mockImageStorageService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: PrismaService, useValue: mockPrismaService },
        AdminSessionGuard,
      ],
    }).compile();

    controller = module.get<AdminHomepageController>(AdminHomepageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have AdminSessionGuard applied', () => {
    const guards = Reflect.getMetadata('__guards__', AdminHomepageController);
    expect(guards).toBeDefined();
    expect(guards).toContain(AdminSessionGuard);
  });

  describe('featured categories', () => {
    it('createFeaturedCategory delegates to service', async () => {
      const dto = { categoryId: 'c1', displayName: 'Điện Thoại' };
      mockHomepageService.createFeaturedCategory.mockResolvedValue({ id: 'fc1' });

      const result = await controller.createFeaturedCategory(dto);

      expect(result).toEqual({ id: 'fc1' });
      expect(mockHomepageService.createFeaturedCategory).toHaveBeenCalledWith(dto);
    });
  });

  describe('product groups', () => {
    it('createProductGroup delegates to service', async () => {
      const dto = { name: 'KM', slug: 'km', title: 'Khuyến Mãi' };
      mockHomepageService.createProductGroup.mockResolvedValue({ id: 'pg1' });

      const result = await controller.createProductGroup(dto);

      expect(result).toEqual({ id: 'pg1' });
      expect(mockHomepageService.createProductGroup).toHaveBeenCalledWith(dto);
    });
  });

  describe('brands', () => {
    it('createFeaturedBrand delegates to service', async () => {
      const dto = { name: 'Samsung', logoUrl: '/uploads/brands/samsung.png' };
      mockHomepageService.createFeaturedBrand.mockResolvedValue({ id: 'fb1' });

      const result = await controller.createFeaturedBrand(dto);

      expect(result).toEqual({ id: 'fb1' });
      expect(mockHomepageService.createFeaturedBrand).toHaveBeenCalledWith(dto);
    });
  });

  describe('benefits', () => {
    it('createBenefit delegates to service', async () => {
      const dto = { icon: 'Shield', title: 'BH 2 năm', description: 'Bảo hành toàn quốc' };
      mockHomepageService.createBenefit.mockResolvedValue({ id: 'sb1' });

      const result = await controller.createBenefit(dto);

      expect(result).toEqual({ id: 'sb1' });
      expect(mockHomepageService.createBenefit).toHaveBeenCalledWith(dto);
    });
  });
});
