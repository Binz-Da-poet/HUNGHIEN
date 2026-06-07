import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  contentPost: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
  },
};

describe('ContentService', () => {
  let service: ContentService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();
    service = module.get<ContentService>(ContentService);
  });

  describe('findAll', () => {
    it('returns paginated content by type', async () => {
      mockPrismaService.contentPost.findMany.mockResolvedValue([{ id: '1', title: 'Post 1' }]);
      mockPrismaService.contentPost.count.mockResolvedValue(1);

      const result = await service.findAll({ type: 'NEWS', skip: 0, take: 10 });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('filters by status', async () => {
      mockPrismaService.contentPost.findMany.mockResolvedValue([]);
      mockPrismaService.contentPost.count.mockResolvedValue(0);

      await service.findAll({ type: 'POLICY', status: 'PUBLISHED', skip: 0, take: 10 });

      expect(mockPrismaService.contentPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { type: 'POLICY', status: 'PUBLISHED' } }),
      );
    });

    it('sorts NEWS by publishedAt desc', async () => {
      mockPrismaService.contentPost.findMany.mockResolvedValue([]);
      mockPrismaService.contentPost.count.mockResolvedValue(0);

      await service.findAll({ type: 'NEWS', skip: 0, take: 10 });

      expect(mockPrismaService.contentPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { publishedAt: 'desc' } }),
      );
    });

    it('sorts POLICY by sortOrder asc', async () => {
      mockPrismaService.contentPost.findMany.mockResolvedValue([]);
      mockPrismaService.contentPost.count.mockResolvedValue(0);

      await service.findAll({ type: 'POLICY', skip: 0, take: 10 });

      expect(mockPrismaService.contentPost.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: { sortOrder: 'asc' } }),
      );
    });
  });

  describe('create', () => {
    const validDoc = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }] };

    it('creates a draft and auto-sets status', async () => {
      mockPrismaService.contentPost.create.mockResolvedValue({ id: '1', status: 'DRAFT' });

      const result = await service.create({
        type: 'NEWS',
        title: 'Test',
        slug: 'test',
        excerpt: 'desc',
        content: validDoc,
      } as any);

      expect(result.status).toBe('DRAFT');
    });

    it('sets publishedAt when publishing a new post', async () => {
      mockPrismaService.contentPost.create.mockResolvedValue({ id: '1', status: 'PUBLISHED', publishedAt: new Date() });

      const result = await service.create({
        type: 'NEWS',
        status: 'PUBLISHED',
        title: 'Test',
        slug: 'test',
        excerpt: 'desc',
        content: validDoc,
      } as any);

      expect(result.status).toBe('PUBLISHED');
    });

    it('rejects invalid rich text content', async () => {
      await expect(
        service.create({
          type: 'NEWS',
          title: 'Test',
          slug: 'test',
          excerpt: 'desc',
          content: { type: 'paragraph', content: [] },
        } as any),
      ).rejects.toThrow('Nội dung không hợp lệ');
    });

    it('returns 409 on duplicate slug', async () => {
      const prismaError = Object.assign(new Error('Unique constraint'), {
        code: 'P2002',
      });
      mockPrismaService.contentPost.create.mockRejectedValue(prismaError);

      await expect(
        service.create({
          type: 'NEWS',
          title: 'Test',
          slug: 'existing',
          excerpt: 'desc',
          content: validDoc,
        } as any),
      ).rejects.toThrow('Slug đã tồn tại');
    });
  });

  describe('update', () => {
    it('updates content with valid rich text', async () => {
      mockPrismaService.contentPost.findUnique.mockResolvedValue({ id: '1', type: 'NEWS', slug: 'test', publishedAt: null });
      mockPrismaService.contentPost.update.mockResolvedValue({ id: '1', title: 'Updated' });

      const result = await service.update('1', { title: 'Updated' } as any);

      expect(result.title).toBe('Updated');
    });

    it('throws NotFound if post does not exist', async () => {
      mockPrismaService.contentPost.findUnique.mockResolvedValue(null);

      await expect(service.update('x', { title: 'X' } as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes a post', async () => {
      mockPrismaService.contentPost.delete.mockResolvedValue({ id: '1' });
      await service.delete('1');
      expect(mockPrismaService.contentPost.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('throws NotFound on missing id', async () => {
      const prismaError = Object.assign(new Error('Record not found'), { code: 'P2025' });
      mockPrismaService.contentPost.delete.mockRejectedValue(prismaError);

      await expect(service.delete('x')).rejects.toThrow('Bài viết không tồn tại');
    });
  });

  describe('findPublishedByType', () => {
    it('lists only published posts', async () => {
      mockPrismaService.contentPost.findMany.mockResolvedValue([{ id: '1', title: 'News' }]);

      const result = await service.findPublishedByType('NEWS');

      expect(result).toHaveLength(1);
    });
  });

  describe('findPublishedBySlug', () => {
    it('returns published post by slug', async () => {
      mockPrismaService.contentPost.findUnique.mockResolvedValue({
        id: '1', type: 'NEWS', slug: 'test', status: 'PUBLISHED',
      });

      const result = await service.findPublishedBySlug('NEWS', 'test');

      expect(result.slug).toBe('test');
    });

    it('throws NotFound for draft post', async () => {
      mockPrismaService.contentPost.findUnique.mockResolvedValue({
        id: '1', type: 'NEWS', slug: 'test', status: 'DRAFT',
      });

      await expect(service.findPublishedBySlug('NEWS', 'test')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFound for missing post', async () => {
      mockPrismaService.contentPost.findUnique.mockResolvedValue(null);

      await expect(service.findPublishedBySlug('NEWS', 'missing')).rejects.toThrow(NotFoundException);
    });
  });
});
