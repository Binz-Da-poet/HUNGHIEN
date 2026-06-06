import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../auth/auth.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };

  const mockAuthService = {
    validateSession: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        { provide: CategoryService, useValue: mockCategoryService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll should return all categories', async () => {
    const categories = [{ id: '1', name: 'Test', slug: 'test', parentId: null }];
    mockCategoryService.findAll.mockResolvedValue(categories);
    const result = await controller.findAll();
    expect(result).toEqual(categories);
  });

  it('create should create a category', async () => {
    const dto = { name: 'New', slug: 'new' };
    const category = { id: '1', ...dto, parentId: null };
    mockCategoryService.create.mockResolvedValue(category);
    const result = await controller.create(dto);
    expect(result).toEqual(category);
    expect(mockCategoryService.create).toHaveBeenCalledWith(dto);
  });

  it('update should update a category', async () => {
    const id = '1';
    const dto = { name: 'Updated' };
    const category = { id, name: 'Updated', slug: 'test', parentId: null };
    mockCategoryService.update.mockResolvedValue(category);
    const result = await controller.update(id, dto);
    expect(result).toEqual(category);
    expect(mockCategoryService.update).toHaveBeenCalledWith(id, dto);
  });

  it('remove should delete a category', async () => {
    const id = '1';
    const category = { id, name: 'Test', slug: 'test', parentId: null };
    mockCategoryService.delete.mockResolvedValue(category);
    const result = await controller.remove(id);
    expect(result).toEqual(category);
    expect(mockCategoryService.delete).toHaveBeenCalledWith(id);
  });
});
