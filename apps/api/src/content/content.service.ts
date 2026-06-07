import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { ContentQueryDto } from './dto/content-query.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ContentQueryDto) {
    const { type, status, search, skip = 0, take = 10 } = query;
    const where: any = { type };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.contentPost.findMany({
        where,
        skip,
        take,
        orderBy: type === 'NEWS'
          ? { publishedAt: 'desc' }
          : { sortOrder: 'asc' },
      }),
      this.prisma.contentPost.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findById(id: string) {
    const post = await this.prisma.contentPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Bài viết không tồn tại.');
    return post;
  }

  async create(dto: CreateContentDto) {
    this.validateContent(dto.content);

    const data: any = {
      type: dto.type,
      status: dto.status || 'DRAFT',
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl || null,
      sortOrder: dto.sortOrder ?? 0,
    };

    if (dto.status === 'PUBLISHED' && !dto.publishedAt) {
      data.publishedAt = new Date();
    } else if (dto.publishedAt) {
      data.publishedAt = new Date(dto.publishedAt);
    }

    try {
      return await this.prisma.contentPost.create({ data });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Slug đã tồn tại. Vui lòng chọn slug khác.');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateContentDto) {
    const existing = await this.prisma.contentPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Bài viết không tồn tại.');

    if (dto.content) {
      this.validateContent(dto.content);
    }

    const data: any = { ...dto };

    if (dto.status === 'PUBLISHED' && !existing.publishedAt && !dto.publishedAt) {
      data.publishedAt = new Date();
    } else if (dto.publishedAt) {
      data.publishedAt = new Date(dto.publishedAt);
    }

    try {
      return await this.prisma.contentPost.update({ where: { id }, data });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Slug đã tồn tại. Vui lòng chọn slug khác.');
      }
      if (e?.code === 'P2025') {
        throw new NotFoundException('Bài viết không tồn tại.');
      }
      throw e;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.contentPost.delete({ where: { id } });
    } catch (e: any) {
      if (e?.code === 'P2025') {
        throw new NotFoundException('Bài viết không tồn tại.');
      }
      throw e;
    }
  }

  /** Storefront: list published content by type */
  async findPublishedByType(type: 'NEWS' | 'POLICY') {
    const posts = await this.prisma.contentPost.findMany({
      where: { type, status: 'PUBLISHED' },
      orderBy: type === 'NEWS'
        ? { publishedAt: 'desc' }
        : { sortOrder: 'asc' },
      select: {
        id: true,
        type: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        publishedAt: true,
        createdAt: true,
        sortOrder: true,
      },
    });
    return posts;
  }

  /** Storefront: get single published post by type+slug */
  async findPublishedBySlug(type: 'NEWS' | 'POLICY', slug: string) {
    const post = await this.prisma.contentPost.findUnique({
      where: { type_slug: { type, slug } },
    });
    if (!post || post.status !== 'PUBLISHED') {
      throw new NotFoundException('Bài viết không tồn tại.');
    }
    return post;
  }

  private validateContent(content: unknown) {
    if (!content || typeof content !== 'object') {
      throw new BadRequestException('Nội dung không hợp lệ: phải là document Tiptap JSON.');
    }
    const doc = content as Record<string, unknown>;
    if (doc.type !== 'doc') {
      throw new BadRequestException('Nội dung không hợp lệ: root phải là kiểu "doc".');
    }
    if (!Array.isArray(doc.content)) {
      throw new BadRequestException('Nội dung không hợp lệ: thiếu mảng content.');
    }
  }
}
