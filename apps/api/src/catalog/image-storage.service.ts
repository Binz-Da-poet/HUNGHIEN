import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { extname, join, resolve, sep } from 'path';

export type UploadedImageFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

export type SavedProductImage = {
  url: string;
  altText: string;
  sortOrder: number;
};

@Injectable()
export class ImageStorageService {
  private readonly maxFileSize = 5 * 1024 * 1024;
  private readonly allowedMimeTypes = new Map([
    ['image/jpeg', 'jpg'],
    ['image/png', 'png'],
    ['image/webp', 'webp'],
    ['image/gif', 'gif'],
  ]);

  async saveProductImages(
    productId: string,
    files: UploadedImageFile[],
  ): Promise<SavedProductImage[]> {
    if (!files.length) {
      throw new BadRequestException('Vui lòng chọn ít nhất một hình ảnh');
    }

    files.forEach((file) => this.validateFile(file));

    const uploadDir = join(process.cwd(), 'uploads', 'products', productId);
    await mkdir(uploadDir, { recursive: true });

    return Promise.all(
      files.map(async (file, index) => {
        const extension = this.allowedMimeTypes.get(file.mimetype) ?? this.getOriginalExtension(file);
        const filename = `${Date.now()}-${randomUUID()}.${extension}`;
        const filePath = join(uploadDir, filename);

        await writeFile(filePath, file.buffer);

        return {
          url: `/uploads/products/${productId}/${filename}`,
          altText: file.originalname,
          sortOrder: index,
        };
      }),
    );
  }

  async deleteByUrl(url: string): Promise<void> {
    if (!url.startsWith('/uploads/products/')) {
      return;
    }

    const uploadRoot = resolve(process.cwd(), 'uploads', 'products');
    const relativePath = url.replace('/uploads/products/', '');
    const filePath = resolve(uploadRoot, relativePath);

    if (!filePath.startsWith(`${uploadRoot}${sep}`)) {
      return;
    }

    try {
      await unlink(filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  private validateFile(file: UploadedImageFile) {
    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Định dạng hình ảnh không được hỗ trợ');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Kích thước hình ảnh không được vượt quá 5MB');
    }
  }

  private getOriginalExtension(file: UploadedImageFile) {
    return extname(file.originalname).replace('.', '') || 'jpg';
  }
}
