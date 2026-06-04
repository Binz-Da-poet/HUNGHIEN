import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSchema } from '@repo/shared';
import { ImageStorageService, UploadedImageFile } from './image-storage.service';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private imageStorage: ImageStorageService,
  ) {}

  async findAll(query?: { categoryId?: string; search?: string }) {
    const where: any = {};
    if (query?.categoryId) {
      where.categoryId = query.categoryId;
    }
    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { brand: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
      },
    });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async create(data: any) {
    // Validate with Zod and get sanitized data
    const validatedData = CreateProductSchema.parse(data);

    return this.prisma.product.create({
      data: validatedData as any,
    });
  }

  async update(id: string, data: any) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }

  async addImages(productId: string, files: UploadedImageFile[]) {
    const existingImages = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    const storedImages = await this.imageStorage.saveProductImages(productId, files);
    const nextSortOrder = existingImages.length;

    await this.prisma.productImage.createMany({
      data: storedImages.map((image, index) => ({
        productId,
        url: image.url,
        altText: image.altText,
        sortOrder: nextSortOrder + index,
        isPrimary: existingImages.length === 0 && index === 0,
      })),
    });

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async updateImage(productId: string, imageId: string, data: { altText?: string; sortOrder?: number; isPrimary?: boolean }) {
    if (data.isPrimary) {
      return this.setPrimaryImage(productId, imageId);
    }

    return this.prisma.productImage.update({
      where: { id: imageId, productId },
      data: {
        altText: data.altText,
        sortOrder: data.sortOrder,
      },
    });
  }

  async setPrimaryImage(productId: string, imageId: string) {
    await this.prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    return this.prisma.productImage.update({
      where: { id: imageId, productId },
      data: { isPrimary: true },
    });
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findUnique({
      where: { id: imageId, productId },
    });

    if (!image) return null;

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });
    await this.imageStorage.deleteByUrl(image.url);

    if (image.isPrimary) {
      const nextImage = await this.prisma.productImage.findMany({
        where: { productId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        take: 1,
      });

      if (nextImage[0]) {
        await this.prisma.productImage.update({
          where: { id: nextImage[0].id },
          data: { isPrimary: true },
        });
      }
    }

    return { deleted: true };
  }
}
