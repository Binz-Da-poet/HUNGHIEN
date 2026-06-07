import { Injectable, BadRequestException } from '@nestjs/common';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomUUID } from 'node:crypto';

export interface UploadedImageFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface StoredProductImage {
  url: string;
  altText: string;
  sortOrder: number;
}

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Magic bytes for common image formats */
function checkMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 4) return false;
  // JPEG: FF D8 FF
  if (mimeType === 'image/jpeg') {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (mimeType === 'image/png') {
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    );
  }
  // WebP: RIFF....WEBP
  if (mimeType === 'image/webp') {
    if (buffer.length < 12) return false;
    return (
      buffer[0] === 0x52 && // R
      buffer[1] === 0x49 && // I
      buffer[2] === 0x46 && // F
      buffer[3] === 0x46 && // F
      buffer[8] === 0x57 && // W
      buffer[9] === 0x45 && // E
      buffer[10] === 0x42 && // B
      buffer[11] === 0x50   // P
    );
  }
  // GIF: GIF8
  if (mimeType === 'image/gif') {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  }
  return false;
}

@Injectable()
export class ImageStorageService {
  private readonly uploadRoot = join(process.cwd(), 'uploads', 'products');

  async saveProductImages(productId: string, files: UploadedImageFile[]): Promise<StoredProductImage[]> {
    if (files.length === 0) {
      throw new BadRequestException('Vui lòng chọn ít nhất một ảnh sản phẩm.');
    }

    const productDir = join(this.uploadRoot, productId);
    await mkdir(productDir, { recursive: true });

    return Promise.all(
      files.map(async (file, index) => {
        this.assertValidImage(file);
        const extension = this.getSafeExtension(file.originalname, file.mimetype);
        const fileName = `${Date.now()}-${randomUUID()}${extension}`;
        const absolutePath = join(productDir, fileName);
        await writeFile(absolutePath, file.buffer);

        return {
          url: `/uploads/products/${productId}/${fileName}`,
          altText: file.originalname,
          sortOrder: index,
        };
      }),
    );
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!url.startsWith('/uploads/products/')) return;
    const relativePath = url.replace('/uploads/products/', '');
    const absolutePath = join(this.uploadRoot, relativePath);

    try {
      await unlink(absolutePath);
    } catch {
      return;
    }
  }

  async saveCmsImage(namespace: string, file: UploadedImageFile): Promise<{ url: string; altText: string }> {
    const validNamespaces = ['banners', 'featured-categories', 'brands', 'store'];
    if (!validNamespaces.includes(namespace)) {
      throw new BadRequestException('Invalid namespace');
    }

    this.assertValidImage(file);
    const cmsDir = join(process.cwd(), 'uploads', 'cms', namespace);
    await mkdir(cmsDir, { recursive: true });

    const extension = this.getSafeExtension(file.originalname, file.mimetype);
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(cmsDir, fileName);
    await writeFile(absolutePath, file.buffer);

    return {
      url: `/uploads/cms/${namespace}/${fileName}`,
      altText: file.originalname,
    };
  }

  private assertValidImage(file: UploadedImageFile) {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException('File không hợp lệ hoặc đã bị hỏng.');
    }

    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Ảnh không được vượt quá 5MB.');
    }

    if (!checkMagicBytes(file.buffer, file.mimetype)) {
      throw new BadRequestException('Chữ ký file không khớp với định dạng ảnh khai báo.');
    }
  }

  private getSafeExtension(originalName: string, mimetype: string) {
    const extension = extname(originalName).toLowerCase();
    if (extension) return extension;

    if (mimetype === 'image/png') return '.png';
    if (mimetype === 'image/webp') return '.webp';
    if (mimetype === 'image/gif') return '.gif';
    return '.jpg';
  }
}
