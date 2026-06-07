import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageStorageService, UploadedImageFile } from './image-storage.service';
import { BadRequestException } from '@nestjs/common';
import { mkdir, writeFile, unlink } from 'node:fs/promises';

vi.mock('node:fs/promises', () => ({
  mkdir: vi.fn(),
  writeFile: vi.fn(),
  unlink: vi.fn(),
}));

function makeBuffer(bytes: number[]): Buffer {
  return Buffer.from(bytes);
}

function makeFile(
  overrides: Partial<UploadedImageFile> = {},
): UploadedImageFile {
  return {
    originalname: 'test.jpg',
    mimetype: 'image/jpeg',
    buffer: makeBuffer([0xff, 0xd8, 0xff, 0xe0]),
    size: 1024,
    ...overrides,
  };
}

describe('ImageStorageService', () => {
  let service: ImageStorageService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ImageStorageService();
  });

  describe('magic byte verification', () => {
    it('accepts a valid JPEG file', async () => {
      const file = makeFile({
        mimetype: 'image/jpeg',
        buffer: makeBuffer([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).resolves.toBeDefined();
    });

    it('rejects a PNG disguised as JPEG', async () => {
      const file = makeFile({
        mimetype: 'image/jpeg',
        buffer: makeBuffer([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts a valid PNG file', async () => {
      const file = makeFile({
        originalname: 'icon.png',
        mimetype: 'image/png',
        buffer: makeBuffer([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]),
      });
      await expect(
        service.saveCmsImage('store', file),
      ).resolves.toBeDefined();
    });

    it('rejects a JPEG disguised as PNG', async () => {
      const file = makeFile({
        mimetype: 'image/png',
        buffer: makeBuffer([0xff, 0xd8, 0xff, 0xe0]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts a valid WebP file', async () => {
      const file = makeFile({
        originalname: 'photo.webp',
        mimetype: 'image/webp',
        buffer: makeBuffer([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
      });
      await expect(
        service.saveCmsImage('brands', file),
      ).resolves.toBeDefined();
    });

    it('rejects a non-WebP file with WebP mime type', async () => {
      const file = makeFile({
        mimetype: 'image/webp',
        buffer: makeBuffer([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('accepts a valid GIF file', async () => {
      const file = makeFile({
        originalname: 'anim.gif',
        mimetype: 'image/gif',
        buffer: makeBuffer([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]),
      });
      await expect(
        service.saveCmsImage('featured-categories', file),
      ).resolves.toBeDefined();
    });

    it('rejects a non-GIF file with GIF mime type', async () => {
      const file = makeFile({
        mimetype: 'image/gif',
        buffer: makeBuffer([0x00, 0x00, 0x00, 0x00]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects a file larger than 5MB', async () => {
      const file = makeFile({
        size: 6 * 1024 * 1024,
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an unsupported mime type', async () => {
      const file = makeFile({
        mimetype: 'application/pdf',
        buffer: makeBuffer([0x25, 0x50, 0x44, 0x46]),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects an empty buffer', async () => {
      const file = makeFile({
        buffer: Buffer.alloc(0),
      });
      await expect(
        service.saveCmsImage('banners', file),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('namespace validation', () => {
    it('rejects an invalid namespace', async () => {
      const file = makeFile();
      await expect(
        service.saveCmsImage('invalid-ns', file),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteByUrl', () => {
    it('deletes a product image file', async () => {
      await service.deleteByUrl('/uploads/products/p1/img.jpg');
      expect(unlink).toHaveBeenCalled();
    });

    it('ignores non-uploads paths', async () => {
      await service.deleteByUrl('/other/path.jpg');
      expect(unlink).not.toHaveBeenCalled();
    });
  });

  describe('saveProductImages', () => {
    it('throws if no files are provided', async () => {
      await expect(service.saveProductImages('p1', [])).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
