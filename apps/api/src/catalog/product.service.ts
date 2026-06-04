import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSchema } from '@repo/shared';
import { ImageStorageService, UploadedImageFile } from './image-storage.service';

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
      orderBy: productImageOrderBy,
    });
    const savedImages = await this.imageStorage.saveProductImages(productId, files);

    await this.prisma.productImage.createMany({
      data: savedImages.map((image, index) => ({
        productId,
        ...image,
        isPrimary: existingImages.length === 0 && index === 0,
      })),
    });

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
      throw new NotFoundException('Không tìm thấy hình ảnh sản phẩm');
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
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Không tìm thấy hình ảnh sản phẩm');
    }

    await this.prisma.productImage.updateMany({
      where: { productId, isPrimary: true },
      data: { isPrimary: false },
    });

    return this.prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Không tìm thấy hình ảnh sản phẩm');
    }

    await this.prisma.productImage.delete({
      where: { id: imageId },
    });
    await this.imageStorage.deleteByUrl(image.url);

    if (image.isPrimary) {
      const nextImage = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      });

      if (nextImage) {
        await this.prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }
  }
}
