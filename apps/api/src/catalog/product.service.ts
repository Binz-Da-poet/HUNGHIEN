import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductSchema } from '@repo/shared';
import { ImageStorageService, UploadedImageFile } from './image-storage.service';
import { PrismaService } from '../prisma/prisma.service';

const productImageOrderBy = [
  { isPrimary: 'desc' as const },
  { sortOrder: 'asc' as const },
  { createdAt: 'asc' as const },
];

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
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        images: { orderBy: productImageOrderBy },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: { orderBy: productImageOrderBy },
      },
    });
  }

  async create(data: any) {
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
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      throw new NotFoundException('Khong tim thay san pham');
    }

    const existingImages = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: productImageOrderBy,
    });
    const savedImages = await this.imageStorage.saveProductImages(productId, files);
    const nextSortOrder =
      existingImages.length === 0
        ? 0
        : Math.max(...existingImages.map((image) => image.sortOrder)) + 1;
    const imageData = savedImages.map((image, index) => ({
      productId,
      ...image,
      sortOrder: nextSortOrder + index,
      isPrimary: existingImages.length === 0 && index === 0,
    }));

    try {
      await this.prisma.productImage.createMany({
        data: imageData,
      });
    } catch (error) {
      await Promise.allSettled(savedImages.map((image) => this.imageStorage.deleteByUrl(image.url)));
      throw error;
    }

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: productImageOrderBy,
    });
  }

  async updateImage(
    productId: string,
    imageId: string,
    data: { altText?: string; sortOrder?: number; isPrimary?: boolean },
  ) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Khong tim thay hinh anh san pham');
    }

    const updateData: { altText?: string; sortOrder?: number } = {};
    if (data.altText !== undefined) {
      updateData.altText = data.altText;
    }
    if (data.sortOrder !== undefined) {
      updateData.sortOrder = data.sortOrder;
    }

    let updatedImage = image;
    if (Object.keys(updateData).length > 0) {
      updatedImage = await this.prisma.productImage.update({
        where: { id: imageId },
        data: updateData,
      });
    }

    if (data.isPrimary) {
      return this.setPrimaryImage(productId, imageId);
    }

    return updatedImage;
  }

  async setPrimaryImage(productId: string, imageId: string) {
    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.findFirst({
        where: { id: imageId, productId },
      });

      if (!image) {
        throw new NotFoundException('Khong tim thay hinh anh san pham');
      }

      await tx.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });

      const updateResult = await tx.productImage.updateMany({
        where: { id: imageId, productId },
        data: { isPrimary: true },
      });
      if (updateResult.count !== 1) {
        throw new NotFoundException('Khong tim thay hinh anh san pham');
      }

      return tx.productImage.findFirst({
        where: { id: imageId, productId },
      });
    });
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.prisma.$transaction(async (tx) => {
      const imageToDelete = await tx.productImage.findFirst({
        where: { id: imageId, productId },
      });

      if (!imageToDelete) {
        throw new NotFoundException('Khong tim thay hinh anh san pham');
      }

      await tx.productImage.delete({
        where: { id: imageId },
      });

      if (imageToDelete.isPrimary) {
        const nextImage = await tx.productImage.findFirst({
          where: { productId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        });

        if (nextImage) {
          await tx.productImage.updateMany({
            where: { id: nextImage.id, productId },
            data: { isPrimary: true },
          });
        }
      }

      return imageToDelete;
    });

    try {
      await this.imageStorage.deleteByUrl(image.url);
    } catch {
      // Storage cleanup is best-effort after the DB transaction has committed.
    }
  }
}
