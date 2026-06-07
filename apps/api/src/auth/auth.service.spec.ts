import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as bcrypt from 'bcryptjs';
import { UnauthorizedException } from '@nestjs/common';

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
  hash: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    adminUser: {
      findUnique: vi.fn(),
    },
    adminSession: {
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('creates a session for valid active admin credentials', async () => {
      const email = 'admin@example.com';
      const password = 'password';
      const admin = { id: 'admin1', email, passwordHash: 'hashed_pass', isActive: true, name: 'Admin' };

      mockPrismaService.adminUser.findUnique.mockResolvedValue(admin);
      mockPrismaService.adminSession.create.mockResolvedValue({ id: 'session1' });
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await service.login(email, password);

      expect(result).toBeDefined();
      expect(result.rawToken).toBeDefined();
      expect(mockPrismaService.adminSession.create).toHaveBeenCalled();
    });

    it('returns the same generic unauthorized error for unknown email and wrong password', async () => {
      mockPrismaService.adminUser.findUnique.mockResolvedValue(null);

      await expect(service.login('unknown@example.com', 'pass')).rejects.toThrow(UnauthorizedException);

      const admin = { id: 'admin1', email: 'a@b.com', passwordHash: 'hash', isActive: true };
      mockPrismaService.adminUser.findUnique.mockResolvedValue(admin);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login('a@b.com', 'wrong')).rejects.toThrow(UnauthorizedException);
    });

    it('rejects inactive admins', async () => {
      const admin = { id: 'admin1', email: 'a@b.com', passwordHash: 'hash', isActive: false };
      mockPrismaService.adminUser.findUnique.mockResolvedValue(admin);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      await expect(service.login('a@b.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateSession', () => {
    it('hashes raw session tokens before persistence/lookup', async () => {
      const rawToken = 'some-raw-token';
      mockPrismaService.adminSession.findUnique.mockResolvedValue({
        id: 'session1',
        expiresAt: new Date(Date.now() + 10000),
        admin: { id: 'admin1', isActive: true },
      });

      await service.validateSession(rawToken);

      expect(mockPrismaService.adminSession.findUnique).toHaveBeenCalled();
      const call = mockPrismaService.adminSession.findUnique.mock.calls[0][0];
      expect(call.where.tokenHash).not.toBe(rawToken);
    });
  });

  describe('logout', () => {
    it('deletes a session on logout', async () => {
      const rawToken = 'some-token';
      
      await service.logout(rawToken);

      expect(mockPrismaService.adminSession.delete).toHaveBeenCalled();
    });
  });
});
