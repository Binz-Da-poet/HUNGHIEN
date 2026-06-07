import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('AppController', () => {
  let appController: AppController;

  const mockPrisma = {
    isHealthy: vi.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health', () => {
    it('returns status ok when database is healthy', async () => {
      const result = await appController.getHealth();
      expect(result).toEqual({ status: 'ok', database: 'ok' });
    });

    it('throws ServiceUnavailable when database fails', async () => {
      mockPrisma.isHealthy.mockResolvedValueOnce(false);
      await expect(appController.getHealth()).rejects.toThrow('Database unavailable');
    });
  });
});
