import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductSchema } from '@repo/shared';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

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
        images: true,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
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
}
