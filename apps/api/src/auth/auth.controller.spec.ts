import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminSessionGuard } from './admin-session.guard';
import { UnauthorizedException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    login: vi.fn(),
    logout: vi.fn(),
    validateSession: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    vi.clearAllMocks();
  });

  describe('POST login', () => {
    it('logs in with valid credentials and sets admin_session cookie', async () => {
      const loginDto = { email: 'a@b.com', password: 'password123' };
      const admin = { id: '1', email: 'a@b.com', name: 'Admin' };

      mockAuthService.login.mockResolvedValue({ rawToken: 'token', admin });

      const mockResponse = {
        cookie: vi.fn(),
      } as unknown as Response;

      const result = await controller.login(loginDto, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'password123');
      expect(mockResponse.cookie).toHaveBeenCalledWith('admin_session', 'token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      expect(result).toEqual(admin);
    });

    it('propagates UnauthorizedException from auth service', async () => {
      mockAuthService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      const mockResponse = {
        cookie: vi.fn(),
      } as unknown as Response;

      await expect(
        controller.login({ email: 'bad@b.com', password: 'wrong' }, mockResponse),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('POST logout', () => {
    it('clears admin_session cookie', async () => {
      const mockRequest = {
        cookies: { admin_session: 'some-token' },
      } as unknown as Request;

      const mockResponse = {
        clearCookie: vi.fn(),
      } as unknown as Response;

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest, mockResponse);

      expect(mockAuthService.logout).toHaveBeenCalledWith('some-token');
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('admin_session', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
      expect(result).toEqual({ success: true });
    });

    it('still clears cookie when no session token present', async () => {
      const mockRequest = {
        cookies: {},
      } as unknown as Request;

      const mockResponse = {
        clearCookie: vi.fn(),
      } as unknown as Response;

      const result = await controller.logout(mockRequest, mockResponse);

      expect(mockAuthService.logout).not.toHaveBeenCalled();
      expect(mockResponse.clearCookie).toHaveBeenCalledWith('admin_session', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      });
      expect(result).toEqual({ success: true });
    });
  });

  describe('GET me', () => {
    it('returns the authenticated admin from CurrentAdmin decorator', async () => {
      const admin = { id: '1', email: 'a@b.com', name: 'Admin' };

      const result = await controller.me(admin);

      expect(result).toEqual(admin);
    });

    it('has AdminSessionGuard applied', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, controller.me);
      expect(guards).toBeDefined();
      expect(guards[0]).toBe(AdminSessionGuard);
    });
  });
});
