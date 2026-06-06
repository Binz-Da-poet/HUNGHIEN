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
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Ảnh không được vượt quá 5MB.');
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
