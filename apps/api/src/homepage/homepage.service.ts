import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBannerDto, UpdateBannerDto, CreateSectionDto, UpdateSectionDto, StoreSettingsDto } from './dto/homepage.dto';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getPublicHomepage(now = new Date()) {
    const [
      banners,
      sections,
      featuredCategories,
      productGroups,
      featuredBrands,
      benefits,
      settings,
    ] = await Promise.all([
      this.prisma.homepageBanner.findMany({
        where: {
          isActive: true,
          AND: [
            {
              OR: [
                { startsAt: null },
                { startsAt: { lte: now } },
              ],
            },
            {
              OR: [
                { endsAt: null },
                { endsAt: { gte: now } },
              ],
            },
          ],
        },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true } } },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      this.prisma.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.featuredCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: { category: true },
      }),
      this.prisma.featuredProductGroup.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          items: {
            include: {
              product: {
                include: { images: { where: { isPrimary: true } } },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
      }),
      this.prisma.featuredBrand.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.storeBenefit.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.storeSettings.findUnique({ where: { id: 'main' } }),
    ]);

    return {
      banners,
      sections,
      featuredCategories,
      productGroups,
      featuredBrands,
      benefits,
      settings,
    };
  }

  // Banners
  async findAllBanners() {
    return this.prisma.homepageBanner.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { products: true },
    });
  }

  async createBanner(dto: CreateBannerDto) {
    const { productIds, ...data } = dto;
    return this.prisma.homepageBanner.create({
      data: {
        ...data,
        products: productIds ? {
          create: productIds.map((productId, index) => ({
            productId,
            sortOrder: index,
          })),
        } : undefined,
      },
    });
  }

  async updateBanner(id: string, dto: UpdateBannerDto) {
    const { productIds, ...data } = dto;
    
    return this.prisma.$transaction(async (tx) => {
      if (productIds) {
        await tx.homepageBannerProduct.deleteMany({ where: { bannerId: id } });
        await tx.homepageBannerProduct.createMany({
          data: productIds.map((productId, index) => ({
            bannerId: id,
            productId,
            sortOrder: index,
          })),
        });
      }
      
      return tx.homepageBanner.update({
        where: { id },
        data,
      });
    });
  }

  async deleteBanner(id: string) {
    return this.prisma.homepageBanner.delete({ where: { id } });
  }

  // Sections
  async findAllSections() {
    return this.prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createSection(dto: CreateSectionDto) {
    return this.prisma.homepageSection.create({ data: dto as any });
  }

  async updateSection(id: string, dto: UpdateSectionDto) {
    return this.prisma.homepageSection.update({
      where: { id },
      data: dto as any,
    });
  }

  async deleteSection(id: string) {
    return this.prisma.homepageSection.delete({ where: { id } });
  }

  async reorderSections(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.homepageSection.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    );
  }

  // Store Settings
  async getSettings() {
    return this.prisma.storeSettings.upsert({
      where: { id: 'main' },
      update: {},
      create: { id: 'main' },
    });
  }

  async updateSettings(dto: StoreSettingsDto) {
    return this.prisma.storeSettings.update({
      where: { id: 'main' },
      data: dto as any,
    });
  }

  // Simplified CRUD for others (Categories, Groups, Brands, Benefits)
  async findAllFeaturedCategories() { return this.prisma.featuredCategory.findMany({ orderBy: { sortOrder: 'asc' }, include: { category: true } }); }
  async createFeaturedCategory(data: any) { return this.prisma.featuredCategory.create({ data }); }
  async updateFeaturedCategory(id: string, data: any) { return this.prisma.featuredCategory.update({ where: { id }, data }); }
  async deleteFeaturedCategory(id: string) { return this.prisma.featuredCategory.delete({ where: { id } }); }

  async findAllProductGroups() { return this.prisma.featuredProductGroup.findMany({ orderBy: { sortOrder: 'asc' }, include: { items: { include: { product: true } } } }); }
  async createProductGroup(dto: any) {
    const { items, ...data } = dto;
    return this.prisma.featuredProductGroup.create({
      data: {
        ...data,
        items: items ? { create: items.map((it: any, idx: number) => ({ productId: it.productId, sortOrder: idx })) } : undefined
      }
    });
  }
  async updateProductGroup(id: string, dto: any) {
    const { items, ...data } = dto;
    return this.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.featuredProductGroupItem.deleteMany({ where: { groupId: id } });
        await tx.featuredProductGroupItem.createMany({ data: items.map((it: any, idx: number) => ({ groupId: id, productId: it.productId, sortOrder: idx })) });
      }
      return tx.featuredProductGroup.update({ where: { id }, data });
    });
  }
  async deleteProductGroup(id: string) { return this.prisma.featuredProductGroup.delete({ where: { id } }); }

  async findAllFeaturedBrands() { return this.prisma.featuredBrand.findMany({ orderBy: { sortOrder: 'asc' } }); }
  async createFeaturedBrand(data: any) { return this.prisma.featuredBrand.create({ data }); }
  async updateFeaturedBrand(id: string, data: any) { return this.prisma.featuredBrand.update({ where: { id }, data }); }
  async deleteFeaturedBrand(id: string) { return this.prisma.featuredBrand.delete({ where: { id } }); }

  async findAllBenefits() { return this.prisma.storeBenefit.findMany({ orderBy: { sortOrder: 'asc' } }); }
  async createBenefit(data: any) { return this.prisma.storeBenefit.create({ data }); }
  async updateBenefit(id: string, data: any) { return this.prisma.storeBenefit.update({ where: { id }, data }); }
  async deleteBenefit(id: string) { return this.prisma.storeBenefit.delete({ where: { id } }); }
}
