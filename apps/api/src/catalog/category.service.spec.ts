import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from './category.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('CategoryService', () => {
  let service: CategoryService;

  const mockPrismaService = {
    category: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return all categories', async () => {
    const categories = [{ id: '1', name: 'Test', slug: 'test', parentId: null }];
    mockPrismaService.category.findMany.mockResolvedValue(categories);
    const result = await service.findAll();
    expect(result).toEqual(categories);
  });

  it('create should create a category', async () => {
    const dto = { name: 'New', slug: 'new' };
    const category = { id: '1', ...dto, parentId: null };
    mockPrismaService.category.create.mockResolvedValue(category);
    const result = await service.create(dto);
    expect(result).toEqual(category);
  });

  it('update should update a category', async () => {
    const id = '1';
    const dto = { name: 'Updated' };
    const category = { id, name: 'Updated', slug: 'test', parentId: null };
    mockPrismaService.category.update.mockResolvedValue(category);
    const result = await service.update(id, dto);
    expect(result).toEqual(category);
    expect(mockPrismaService.category.update).toHaveBeenCalledWith({
      where: { id },
      data: dto,
    });
  });

  it('delete should delete a category', async () => {
    const id = '1';
    const category = { id, name: 'Test', slug: 'test', parentId: null };
    mockPrismaService.category.delete.mockResolvedValue(category);
    const result = await service.delete(id);
    expect(result).toEqual(category);
    expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
      where: { id },
    });
  });
});
