# Mobile Commerce UI/UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved mobile-first HUNG HIEN admin/storefront redesign with Vietnamese copy, VND prices, product image upload/gallery support, responsive admin workflows, and faster customer checkout.

**Architecture:** Complete the product image data layer first, then expose local upload APIs through NestJS, then connect admin image management, and finally redesign storefront/admin surfaces around shared formatting and responsive components. Product images are stored locally behind a storage service so the API contract can move to cloud storage later without changing UI flows.

**Tech Stack:** Turborepo, pnpm, Next.js 14 App Router, React 18, Tailwind CSS, Zustand, Lucide React, NestJS 10, Prisma, PostgreSQL, Vitest, Zod.

---

## File Structure And Responsibilities

- `packages/shared/src/format/currency.ts`: shared VND currency formatter.
- `packages/shared/src/format/currency.test.ts`: formatter tests.
- `packages/shared/src/schemas/product.ts`: product and product image Zod schemas/types.
- `packages/shared/src/schemas/product.test.ts`: product schema tests.
- `packages/shared/index.ts`: exports schemas and formatting helpers.
- `apps/api/prisma/schema.prisma`: product image schema fields and cascade behavior.
- `apps/api/src/catalog/image-storage.service.ts`: local filesystem image persistence and URL generation.
- `apps/api/src/catalog/product.service.ts`: product queries, image metadata CRUD, primary image behavior, product filters.
- `apps/api/src/catalog/product.controller.ts`: product list filters and image upload/update/delete endpoints.
- `apps/api/src/catalog/catalog.module.ts`: provides `ImageStorageService`.
- `apps/api/src/catalog/product.service.spec.ts`: service tests for filters and image metadata behavior.
- `apps/api/src/catalog/product.controller.spec.ts`: controller tests for image endpoints.
- `apps/api/src/main.ts`: serves local uploads under `/uploads`.
- `apps/admin/lib/format.ts`: admin-facing exports around shared formatting.
- `apps/admin/lib/api.ts`: admin API base URL helper.
- `apps/admin/components/layout/sidebar.tsx`: desktop navigation labels and styling.
- `apps/admin/components/layout/admin-shell.tsx`: responsive shell with desktop sidebar and mobile drawer.
- `apps/admin/app/layout.tsx`: uses `AdminShell`.
- `apps/admin/app/page.tsx`: Vietnamese mobile-first dashboard shortcuts.
- `apps/admin/components/products/product-image-manager.tsx`: upload, preview, primary selection, delete.
- `apps/admin/components/products/product-form.tsx`: responsive product form sections and image manager integration.
- `apps/admin/components/products/product-table.tsx`: desktop table plus mobile card list.
- `apps/admin/app/products/page.tsx`: search/filter controls and responsive page header.
- `apps/admin/app/products/new/page.tsx`: create product flow with clear errors.
- `apps/admin/app/products/[id]/edit/page.tsx`: edit product flow with clear errors.
- `apps/admin/components/orders/order-list.tsx`: desktop table plus mobile order cards.
- `apps/admin/app/orders/page.tsx`: mobile-friendly order filters and feedback.
- `apps/admin/components/categories/category-table.tsx`: desktop table plus mobile category cards.
- `apps/admin/app/categories/page.tsx`: mobile-friendly category page header and dialog behavior.
- `apps/admin/app/globals.css`: admin base background, typography, and overflow guard.
- `apps/storefront/lib/format.ts`: storefront-facing exports around shared formatting.
- `apps/storefront/lib/product-images.ts`: primary-image and fallback helpers.
- `apps/storefront/components/toast-provider.tsx`: lightweight toast UI for cart and checkout feedback.
- `apps/storefront/components/product-image.tsx`: stable image/fallback renderer.
- `apps/storefront/components/site-header.tsx`: responsive storefront header, search entry, cart badge.
- `apps/storefront/components/product-card.tsx`: image-rich mobile commerce product card with `Thêm giỏ` and `Mua ngay`.
- `apps/storefront/store/use-cart.ts`: cart items include image URL and buy-now session state.
- `apps/storefront/app/layout.tsx`: Vietnamese metadata, `lang="vi"`, header/footer, toast provider.
- `apps/storefront/app/page.tsx`: commerce-first home page with search/category/product grid.
- `apps/storefront/app/products/[id]/page.tsx`: gallery detail page with sticky mobile purchase bar.
- `apps/storefront/app/cart/page.tsx`: mobile cart cards and sticky checkout summary.
- `apps/storefront/app/checkout/page.tsx`: guest checkout using cart or buy-now session.
- `apps/storefront/app/checkout/success/page.tsx`: Vietnamese success state.
- `apps/storefront/app/globals.css`: storefront base styles, safe-area helpers, overflow guard.

---

### Task 1: Shared VND Formatting And Product Image Types

**Files:**
- Create: `packages/shared/src/format/currency.ts`
- Create: `packages/shared/src/format/currency.test.ts`
- Modify: `packages/shared/src/schemas/product.ts`
- Modify: `packages/shared/src/schemas/product.test.ts`
- Modify: `packages/shared/index.ts`

- [ ] **Step 1: Add failing tests for VND formatting and product images**

Add `packages/shared/src/format/currency.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { formatVnd } from './currency';

describe('formatVnd', () => {
  it('formats whole numbers as Vietnamese dong', () => {
    expect(formatVnd(12500000)).toBe('12.500.000₫');
  });

  it('formats numeric strings from API responses', () => {
    expect(formatVnd('990000')).toBe('990.000₫');
  });

  it('returns 0 dong for invalid values', () => {
    expect(formatVnd('not-a-number')).toBe('0₫');
  });
});
```

Append these tests to `packages/shared/src/schemas/product.test.ts`:

```ts
import { ProductImageSchema } from './product';

it('should validate product image metadata', () => {
  const result = ProductImageSchema.safeParse({
    id: 'image-1',
    productId: 'product-1',
    url: '/uploads/products/product-1/image.webp',
    altText: 'Ảnh chính iPhone 15',
    sortOrder: 0,
    isPrimary: true,
  });

  expect(result.success).toBe(true);
});

it('should fail product image metadata without a URL', () => {
  const result = ProductImageSchema.safeParse({
    id: 'image-1',
    productId: 'product-1',
    url: '',
    sortOrder: 0,
    isPrimary: false,
  });

  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: Run tests and verify they fail**

Run: `pnpm --filter @repo/shared test`

Expected: FAIL because `formatVnd` and `ProductImageSchema` are not exported yet.

- [ ] **Step 3: Implement currency formatter**

Create `packages/shared/src/format/currency.ts`:

```ts
export function formatVnd(value: number | string | null | undefined): string {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0₫';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  })
    .format(numericValue)
    .replace(/\s/g, '');
}
```

- [ ] **Step 4: Implement product image schemas and exports**

Update `packages/shared/src/schemas/product.ts` so it contains these exports in addition to the existing `CreateProductSchema`:

```ts
export const ProductImageSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  url: z.string().min(1),
  altText: z.string().optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const ProductSchema = CreateProductSchema.extend({
  id: z.string().min(1),
  originalPrice: z.number().optional().nullable(),
  description: z.string().optional().nullable(),
  images: z.array(ProductImageSchema).default([]),
});

export type ProductImageInput = z.infer<typeof ProductImageSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
```

Update `packages/shared/index.ts`:

```ts
export * from './src/schemas/product';
export * from './src/format/currency';
```

- [ ] **Step 5: Run tests and build shared package**

Run: `pnpm --filter @repo/shared test`

Expected: PASS.

Run: `pnpm --filter @repo/shared build`

Expected: PASS.

- [ ] **Step 6: Commit shared utilities**

```bash
git add packages/shared/src/format/currency.ts packages/shared/src/format/currency.test.ts packages/shared/src/schemas/product.ts packages/shared/src/schemas/product.test.ts packages/shared/index.ts
git commit -m "feat: add shared product image types and VND formatting"
```

---

### Task 2: Prisma Product Image Schema

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

- [ ] **Step 1: Update Prisma image fields**

Modify `ProductImage` in `apps/api/prisma/schema.prisma`:

```prisma
model ProductImage {
  id        String   @id @default(cuid())
  productId String
  url       String
  altText   String?
  sortOrder Int      @default(0)
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

- [ ] **Step 2: Create migration and generate Prisma client**

Run: `pnpm --filter api exec prisma migrate dev --name product-image-gallery`

Expected: migration file is created and Prisma client generation succeeds.

If the local database is not running, start the database configured in `.env`, then rerun the same command.

- [ ] **Step 3: Verify generated client builds**

Run: `pnpm --filter api build`

Expected: PASS.

- [ ] **Step 4: Commit Prisma image schema**

```bash
git add apps/api/prisma/schema.prisma apps/api/prisma/migrations
git commit -m "feat: extend product image schema"
```

---

### Task 3: Backend Product Image Service

**Files:**
- Create: `apps/api/src/catalog/image-storage.service.ts`
- Modify: `apps/api/src/catalog/catalog.module.ts`
- Modify: `apps/api/src/catalog/product.service.ts`
- Modify: `apps/api/src/catalog/product.service.spec.ts`

- [ ] **Step 1: Add failing service tests for image metadata**

Extend `mockPrismaService` in `apps/api/src/catalog/product.service.spec.ts`:

```ts
productImage: {
  createMany: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
},
```

Add this provider to the test module:

```ts
{
  provide: ImageStorageService,
  useValue: {
    saveProductImages: vi.fn(),
    deleteByUrl: vi.fn(),
  },
}
```

Import the service:

```ts
import { ImageStorageService } from './image-storage.service';
```

Add tests:

```ts
describe('addImages', () => {
  it('saves uploaded image metadata and marks the first image primary when product has no images', async () => {
    const files = [
      { originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 100 },
      { originalname: 'side.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('b'), size: 100 },
    ] as any[];

    const storage = (service as any).imageStorage as ImageStorageService;
    vi.mocked(storage.saveProductImages).mockResolvedValue([
      { url: '/uploads/products/product-1/front.jpg', altText: 'front.jpg', sortOrder: 0 },
      { url: '/uploads/products/product-1/side.jpg', altText: 'side.jpg', sortOrder: 1 },
    ]);
    mockPrismaService.productImage.findMany.mockResolvedValueOnce([]);
    mockPrismaService.productImage.createMany.mockResolvedValue({ count: 2 });
    mockPrismaService.productImage.findMany.mockResolvedValueOnce([
      { id: 'img-1', productId: 'product-1', url: '/uploads/products/product-1/front.jpg', isPrimary: true, sortOrder: 0 },
      { id: 'img-2', productId: 'product-1', url: '/uploads/products/product-1/side.jpg', isPrimary: false, sortOrder: 1 },
    ]);

    const result = await service.addImages('product-1', files);

    expect(mockPrismaService.productImage.createMany).toHaveBeenCalledWith({
      data: [
        {
          productId: 'product-1',
          url: '/uploads/products/product-1/front.jpg',
          altText: 'front.jpg',
          sortOrder: 0,
          isPrimary: true,
        },
        {
          productId: 'product-1',
          url: '/uploads/products/product-1/side.jpg',
          altText: 'side.jpg',
          sortOrder: 1,
          isPrimary: false,
        },
      ],
    });
    expect(result).toHaveLength(2);
  });
});

describe('setPrimaryImage', () => {
  it('clears existing primary images before marking a new primary image', async () => {
    mockPrismaService.productImage.updateMany.mockResolvedValue({ count: 1 });
    mockPrismaService.productImage.update.mockResolvedValue({ id: 'img-2', isPrimary: true });

    await service.setPrimaryImage('product-1', 'img-2');

    expect(mockPrismaService.productImage.updateMany).toHaveBeenCalledWith({
      where: { productId: 'product-1' },
      data: { isPrimary: false },
    });
    expect(mockPrismaService.productImage.update).toHaveBeenCalledWith({
      where: { id: 'img-2', productId: 'product-1' },
      data: { isPrimary: true },
    });
  });
});

describe('deleteImage', () => {
  it('promotes the next image when deleting the primary image', async () => {
    mockPrismaService.productImage.findUnique.mockResolvedValue({
      id: 'img-1',
      productId: 'product-1',
      url: '/uploads/products/product-1/front.jpg',
      isPrimary: true,
    });
    mockPrismaService.productImage.delete.mockResolvedValue({ id: 'img-1' });
    mockPrismaService.productImage.findMany.mockResolvedValue([{ id: 'img-2', sortOrder: 1 }]);
    mockPrismaService.productImage.update.mockResolvedValue({ id: 'img-2', isPrimary: true });

    await service.deleteImage('product-1', 'img-1');

    expect(mockPrismaService.productImage.update).toHaveBeenCalledWith({
      where: { id: 'img-2' },
      data: { isPrimary: true },
    });
  });
});
```

- [ ] **Step 2: Run service tests and verify they fail**

Run: `pnpm --filter api test -- product.service.spec.ts`

Expected: FAIL because `ImageStorageService`, `addImages`, `setPrimaryImage`, and `deleteImage` do not exist.

- [ ] **Step 3: Implement local image storage service**

Create `apps/api/src/catalog/image-storage.service.ts`:

```ts
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
```

- [ ] **Step 4: Implement image service methods**

Update `apps/api/src/catalog/product.service.ts` constructor:

```ts
constructor(
  private prisma: PrismaService,
  private imageStorage: ImageStorageService,
) {}
```

Add import:

```ts
import { ImageStorageService, UploadedImageFile } from './image-storage.service';
```

Use ordered images in `findAll` and `findOne`:

```ts
include: {
  category: true,
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }] },
},
```

Add service methods:

```ts
async addImages(productId: string, files: UploadedImageFile[]) {
  const existingImages = await this.prisma.productImage.findMany({
    where: { productId },
    orderBy: { sortOrder: 'asc' },
  });
  const storedImages = await this.imageStorage.saveProductImages(productId, files);
  const nextSortOrder = existingImages.length;

  await this.prisma.productImage.createMany({
    data: storedImages.map((image, index) => ({
      productId,
      url: image.url,
      altText: image.altText,
      sortOrder: nextSortOrder + index,
      isPrimary: existingImages.length === 0 && index === 0,
    })),
  });

  return this.prisma.productImage.findMany({
    where: { productId },
    orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'asc' }],
  });
}

async updateImage(productId: string, imageId: string, data: { altText?: string; sortOrder?: number; isPrimary?: boolean }) {
  if (data.isPrimary) {
    return this.setPrimaryImage(productId, imageId);
  }

  return this.prisma.productImage.update({
    where: { id: imageId, productId },
    data: {
      altText: data.altText,
      sortOrder: data.sortOrder,
    },
  });
}

async setPrimaryImage(productId: string, imageId: string) {
  await this.prisma.productImage.updateMany({
    where: { productId },
    data: { isPrimary: false },
  });

  return this.prisma.productImage.update({
    where: { id: imageId, productId },
    data: { isPrimary: true },
  });
}

async deleteImage(productId: string, imageId: string) {
  const image = await this.prisma.productImage.findUnique({
    where: { id: imageId, productId },
  });

  if (!image) return null;

  await this.prisma.productImage.delete({
    where: { id: imageId },
  });
  await this.imageStorage.deleteByUrl(image.url);

  if (image.isPrimary) {
    const nextImage = await this.prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      take: 1,
    });

    if (nextImage[0]) {
      await this.prisma.productImage.update({
        where: { id: nextImage[0].id },
        data: { isPrimary: true },
      });
    }
  }

  return { deleted: true };
}
```

- [ ] **Step 5: Register image storage service**

Update `apps/api/src/catalog/catalog.module.ts`:

```ts
providers: [CategoryService, ProductService, ImageStorageService],
exports: [CategoryService, ProductService, ImageStorageService],
```

Add import:

```ts
import { ImageStorageService } from './image-storage.service';
```

- [ ] **Step 6: Run service tests and build API**

Run: `pnpm --filter api test -- product.service.spec.ts`

Expected: PASS.

Run: `pnpm --filter api build`

Expected: PASS.

- [ ] **Step 7: Commit backend image service**

```bash
git add apps/api/src/catalog/image-storage.service.ts apps/api/src/catalog/catalog.module.ts apps/api/src/catalog/product.service.ts apps/api/src/catalog/product.service.spec.ts
git commit -m "feat: add product image service"
```

---

### Task 4: Backend Upload Controller And Static Files

**Files:**
- Modify: `apps/api/src/catalog/product.controller.ts`
- Modify: `apps/api/src/catalog/product.controller.spec.ts`
- Modify: `apps/api/src/main.ts`

- [ ] **Step 1: Add failing controller tests for image endpoints**

Update `mockProductService` in `apps/api/src/catalog/product.controller.spec.ts`:

```ts
addImages: vi.fn(),
updateImage: vi.fn(),
deleteImage: vi.fn(),
```

Add tests:

```ts
it('uploadImages should pass files to the product service', async () => {
  const files = [{ originalname: 'front.jpg', mimetype: 'image/jpeg', buffer: Buffer.from('a'), size: 100 }] as any;
  const images = [{ id: 'img-1', url: '/uploads/products/product-1/front.jpg' }];
  mockProductService.addImages.mockResolvedValue(images);

  const result = await controller.uploadImages('product-1', files);

  expect(result).toEqual(images);
  expect(mockProductService.addImages).toHaveBeenCalledWith('product-1', files);
});

it('updateImage should pass metadata to the product service', async () => {
  const dto = { isPrimary: true };
  mockProductService.updateImage.mockResolvedValue({ id: 'img-1', isPrimary: true });

  const result = await controller.updateImage('product-1', 'img-1', dto);

  expect(result).toEqual({ id: 'img-1', isPrimary: true });
  expect(mockProductService.updateImage).toHaveBeenCalledWith('product-1', 'img-1', dto);
});

it('deleteImage should remove image metadata', async () => {
  mockProductService.deleteImage.mockResolvedValue({ deleted: true });

  const result = await controller.deleteImage('product-1', 'img-1');

  expect(result).toEqual({ deleted: true });
  expect(mockProductService.deleteImage).toHaveBeenCalledWith('product-1', 'img-1');
});
```

- [ ] **Step 2: Run controller tests and verify they fail**

Run: `pnpm --filter api test -- product.controller.spec.ts`

Expected: FAIL because controller image methods do not exist.

- [ ] **Step 3: Add upload endpoints**

Update controller imports in `apps/api/src/catalog/product.controller.ts`:

```ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
```

Add endpoint methods before `@Get(':id')`:

```ts
@Post(':id/images')
@UseInterceptors(FilesInterceptor('images', 8, { storage: memoryStorage() }))
uploadImages(@Param('id') id: string, @UploadedFiles() files: any[]) {
  return this.productService.addImages(id, files);
}

@Patch(':id/images/:imageId')
updateImage(
  @Param('id') id: string,
  @Param('imageId') imageId: string,
  @Body() body: { altText?: string; sortOrder?: number; isPrimary?: boolean },
) {
  return this.productService.updateImage(id, imageId, body);
}

@Delete(':id/images/:imageId')
deleteImage(@Param('id') id: string, @Param('imageId') imageId: string) {
  return this.productService.deleteImage(id, imageId);
}
```

- [ ] **Step 4: Serve local uploads**

Update `apps/api/src/main.ts` imports:

```ts
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
```

Update bootstrap app creation:

```ts
const app = await NestFactory.create<NestExpressApplication>(AppModule);
```

Add static serving before `app.setGlobalPrefix('api')`:

```ts
app.useStaticAssets(join(process.cwd(), 'uploads'), {
  prefix: '/uploads',
});
```

- [ ] **Step 5: Add multer typings when TypeScript requires them**

Run: `pnpm --filter api add multer`

Run: `pnpm --filter api add -D @types/multer`

Expected: `apps/api/package.json` and `pnpm-lock.yaml` update.

- [ ] **Step 6: Run API tests and build**

Run: `pnpm --filter api test`

Expected: PASS.

Run: `pnpm --filter api build`

Expected: PASS.

- [ ] **Step 7: Commit controller upload API**

```bash
git add apps/api/src/catalog/product.controller.ts apps/api/src/catalog/product.controller.spec.ts apps/api/src/main.ts apps/api/package.json pnpm-lock.yaml
git commit -m "feat: expose product image upload endpoints"
```

---

### Task 5: Admin Responsive Shell And Dashboard

**Files:**
- Create: `apps/admin/components/layout/admin-shell.tsx`
- Modify: `apps/admin/components/layout/sidebar.tsx`
- Modify: `apps/admin/app/layout.tsx`
- Modify: `apps/admin/app/page.tsx`
- Modify: `apps/admin/app/globals.css`
- Create: `apps/admin/lib/format.ts`
- Create: `apps/admin/lib/api.ts`

- [ ] **Step 1: Add admin utility files**

Create `apps/admin/lib/format.ts`:

```ts
export { formatVnd } from '@repo/shared';
```

Create `apps/admin/lib/api.ts`:

```ts
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';
export const UPLOAD_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
```

- [ ] **Step 2: Build responsive admin shell**

Create `apps/admin/components/layout/admin-shell.tsx`:

```tsx
'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Sidebar } from './sidebar';

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <Sidebar onNavigate={() => setOpen(false)} />
      </div>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <div>
          <p className="text-xs font-medium uppercase text-slate-500">Admin</p>
          <p className="text-sm font-bold text-slate-950">HUNG HIEN</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
          aria-label="Mở menu quản trị"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu quản trị"
          />
          <aside className="relative h-full w-72 max-w-[85vw] bg-slate-950">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md text-white"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <main className="px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Update sidebar labels**

Update `Sidebar` props and labels in `apps/admin/components/layout/sidebar.tsx`:

```tsx
interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Danh mục', href: '/categories', icon: ListTree },
  { name: 'Sản phẩm', href: '/products', icon: Package },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <span className="text-base font-bold text-orange-400">HUNG HIEN ADMIN</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className="group flex items-center rounded-md px-3 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 4: Wire shell into admin layout**

Update `apps/admin/app/layout.tsx` body:

```tsx
<html lang="vi">
  <body className={inter.className}>
    <AdminShell>{children}</AdminShell>
  </body>
</html>
```

Import:

```ts
import { AdminShell } from '@/components/layout/admin-shell';
```

- [ ] **Step 5: Replace dashboard with Vietnamese shortcuts**

Replace `apps/admin/app/page.tsx` content with a mobile-first dashboard containing these cards:

```tsx
const shortcuts = [
  { label: 'Thêm sản phẩm', href: '/products/new', icon: PackagePlus },
  { label: 'Xem đơn hàng', href: '/orders', icon: ShoppingCart },
  { label: 'Quản lý danh mục', href: '/categories', icon: ListTree },
  { label: 'Kiểm tra tồn kho', href: '/products?stock=low', icon: AlertTriangle },
];
```

Use `Link` cards with `rounded-md border border-slate-200 bg-white p-4 shadow-sm`, not fake sales metrics.

- [ ] **Step 6: Add admin base CSS**

Update `apps/admin/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    overflow-x: hidden;
  }

  body {
    min-height: 100vh;
    overflow-x: hidden;
    background: #f8fafc;
    color: #0f172a;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}
```

- [ ] **Step 7: Verify admin build**

Run: `pnpm --filter admin build`

Expected: PASS.

- [ ] **Step 8: Commit admin shell**

```bash
git add apps/admin/components/layout/admin-shell.tsx apps/admin/components/layout/sidebar.tsx apps/admin/app/layout.tsx apps/admin/app/page.tsx apps/admin/app/globals.css apps/admin/lib/format.ts apps/admin/lib/api.ts
git commit -m "feat: add responsive admin shell"
```

---

### Task 6: Admin Product Image Management

**Files:**
- Create: `apps/admin/components/products/product-image-manager.tsx`
- Modify: `apps/admin/components/products/product-form.tsx`
- Modify: `apps/admin/app/products/new/page.tsx`
- Modify: `apps/admin/app/products/[id]/edit/page.tsx`

- [ ] **Step 1: Define admin product image manager**

Create `apps/admin/components/products/product-image-manager.tsx`:

```tsx
'use client';

import { ImagePlus, Star, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { API_BASE_URL, UPLOAD_BASE_URL } from '@/lib/api';

export interface ProductImage {
  id: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

interface ProductImageManagerProps {
  productId?: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

function imageUrl(url: string) {
  return url.startsWith('http') ? url : `${UPLOAD_BASE_URL}${url}`;
}

export function ProductImageManager({ productId, images, onImagesChange }: ProductImageManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImages = async (files: FileList | null) => {
    if (!productId || !files?.length) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('images', file));

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || 'Không thể tải ảnh lên.');
      }

      onImagesChange(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải ảnh lên.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const setPrimary = async (imageId: string) => {
    if (!productId) return;
    const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPrimary: true }),
    });

    if (response.ok) {
      onImagesChange(images.map((image) => ({ ...image, isPrimary: image.id === imageId })));
    } else {
      setError('Không thể đặt ảnh chính.');
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!productId) return;
    const response = await fetch(`${API_BASE_URL}/products/${productId}/images/${imageId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      onImagesChange(images.filter((image) => image.id !== imageId));
    } else {
      setError('Không thể xóa ảnh.');
    }
  };

  return (
    <section className="rounded-md border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-950">Ảnh sản phẩm</h3>
          <p className="text-sm text-slate-500">Tải nhiều ảnh, chọn một ảnh chính để hiển thị ngoài storefront.</p>
        </div>
        <button
          type="button"
          disabled={!productId || uploading}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <ImagePlus className="h-4 w-4" />
          {uploading ? 'Đang tải' : 'Tải ảnh'}
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => uploadImages(event.target.files)}
      />

      {!productId && (
        <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
          Lưu sản phẩm trước, sau đó bạn có thể tải ảnh lên.
        </div>
      )}

      {error && <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div key={image.id} className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
            <img src={imageUrl(image.url)} alt={image.altText || 'Ảnh sản phẩm'} className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between gap-2 p-2">
              <button
                type="button"
                onClick={() => setPrimary(image.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-700"
              >
                <Star className={image.isPrimary ? 'h-4 w-4 fill-orange-500 text-orange-500' : 'h-4 w-4'} />
                Chính
              </button>
              <button type="button" onClick={() => deleteImage(image.id)} className="text-red-600" aria-label="Xóa ảnh">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Update product form props and sections**

Update product type in `apps/admin/components/products/product-form.tsx` to include images:

```ts
import { ProductImage, ProductImageManager } from './product-image-manager';

interface Product {
  id?: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  brand: string;
  stock: number;
  categoryId: string;
  description?: string;
  images?: ProductImage[];
}
```

Add local image state:

```ts
const [images, setImages] = useState<ProductImage[]>(initialData?.images ?? []);
```

Sync image state when `initialData` changes:

```ts
setImages(initialData.images ?? []);
```

Replace broken Vietnamese labels with:

- `Tên sản phẩm`
- `Đường dẫn`
- `Giá bán`
- `Giá gốc`
- `Thương hiệu`
- `Tồn kho`
- `Danh mục`
- `Mô tả`
- `Hủy`
- `Cập nhật sản phẩm`
- `Tạo sản phẩm`

Render `ProductImageManager` after the form fields:

```tsx
<ProductImageManager
  productId={initialData?.id}
  images={images}
  onImagesChange={setImages}
/>
```

- [ ] **Step 3: Show form errors without alerts**

In `new/page.tsx` and `edit/page.tsx`, add:

```ts
const [error, setError] = useState<string | null>(null);
```

Before each fetch:

```ts
setError(null);
```

When a response fails:

```ts
const body = await res.json().catch(() => null);
throw new Error(body?.message || 'Không thể lưu sản phẩm.');
```

Render the error above `ProductForm`:

```tsx
{error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
```

- [ ] **Step 4: Verify admin build**

Run: `pnpm --filter admin build`

Expected: PASS.

- [ ] **Step 5: Commit product image manager**

```bash
git add apps/admin/components/products/product-image-manager.tsx apps/admin/components/products/product-form.tsx apps/admin/app/products/new/page.tsx apps/admin/app/products/[id]/edit/page.tsx
git commit -m "feat: add admin product image management"
```

---

### Task 7: Admin Responsive Products, Orders, And Categories

**Files:**
- Modify: `apps/admin/components/products/product-table.tsx`
- Modify: `apps/admin/app/products/page.tsx`
- Modify: `apps/admin/components/orders/order-list.tsx`
- Modify: `apps/admin/app/orders/page.tsx`
- Modify: `apps/admin/components/categories/category-table.tsx`
- Modify: `apps/admin/app/categories/page.tsx`

- [ ] **Step 1: Update product list for desktop table and mobile cards**

In `apps/admin/components/products/product-table.tsx`, add `images?: ProductImage[]` to `Product`, import `formatVnd`, and render:

```tsx
<div className="space-y-3 md:hidden">
  {products.map((product) => (
    <article key={product.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
          {product.images?.[0]?.url ? (
            <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Ảnh</div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-semibold text-slate-950">{product.name}</h3>
          <p className="mt-1 text-sm font-bold text-orange-600">{formatVnd(product.price)}</p>
          <p className="text-xs text-slate-500">Tồn kho: {product.stock}</p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" onClick={() => onEdit(product)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-blue-600" aria-label="Sửa sản phẩm">
          <Edit className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => onDelete(product.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-red-600" aria-label="Xóa sản phẩm">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  ))}
</div>
```

Wrap the existing table with `className="hidden overflow-x-auto rounded-md border border-slate-200 md:block"` and use `formatVnd(product.price)` in the price cell.

- [ ] **Step 2: Add product search and filters**

In `apps/admin/app/products/page.tsx`, add state:

```ts
const [search, setSearch] = useState('');
const [stockFilter, setStockFilter] = useState('ALL');
```

Filter before rendering:

```ts
const filteredProducts = products.filter((product) => {
  const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
  const matchesStock = stockFilter === 'ALL' || (stockFilter === 'LOW' ? product.stock <= 5 : product.stock > 0);
  return matchesSearch && matchesStock;
});
```

Render controls:

```tsx
<div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_auto]">
  <input
    value={search}
    onChange={(event) => setSearch(event.target.value)}
    placeholder="Tìm sản phẩm"
    className="h-11 rounded-md border border-slate-300 px-3 text-sm"
  />
  <select
    value={stockFilter}
    onChange={(event) => setStockFilter(event.target.value)}
    className="h-11 rounded-md border border-slate-300 px-3 text-sm"
  >
    <option value="ALL">Tất cả tồn kho</option>
    <option value="IN_STOCK">Còn hàng</option>
    <option value="LOW">Sắp hết hàng</option>
  </select>
</div>
```

- [ ] **Step 3: Convert order list to mobile cards**

In `apps/admin/components/orders/order-list.tsx`, keep the desktop table hidden below `md`, and add a mobile card list that shows:

```tsx
<article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
  <div className="flex items-start justify-between gap-3">
    <div>
      <p className="text-xs font-medium uppercase text-slate-500">Đơn #{order.id.slice(-6)}</p>
      <h3 className="mt-1 font-semibold text-slate-950">{order.customerName}</h3>
      <p className="text-sm text-slate-500">{order.phone}</p>
    </div>
    <OrderStatusBadge status={order.status} />
  </div>
  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
    <div>
      <p className="text-slate-500">Ngày</p>
      <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
    </div>
    <div>
      <p className="text-slate-500">Tổng tiền</p>
      <p className="font-bold text-orange-600">{formatVnd(order.totalAmount)}</p>
    </div>
  </div>
  <select value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value)} className="mt-4 h-11 w-full rounded-md border border-slate-300 px-3 text-sm">
    {AVAILABLE_STATUSES.map((status) => (
      <option key={status} value={status}>{statusMap[status] || status}</option>
    ))}
  </select>
</article>
```

- [ ] **Step 4: Clean order page filters and messages**

In `apps/admin/app/orders/page.tsx`, replace broken labels with:

- `Đơn hàng`
- `Lọc theo`
- `Tất cả`
- `Chờ xử lý`
- `Đang giao`
- `Thành công`
- `Đã hủy`

Make the header `className="grid gap-3 sm:flex sm:items-center sm:justify-between"`, and make the select `className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm sm:w-auto"`.

- [ ] **Step 5: Convert category table to mobile cards**

In `apps/admin/components/categories/category-table.tsx`, add a mobile list with name, slug, edit and delete icon buttons. Hide the desktop table below `md`.

- [ ] **Step 6: Verify admin build**

Run: `pnpm --filter admin build`

Expected: PASS.

- [ ] **Step 7: Commit responsive admin lists**

```bash
git add apps/admin/components/products/product-table.tsx apps/admin/app/products/page.tsx apps/admin/components/orders/order-list.tsx apps/admin/app/orders/page.tsx apps/admin/components/categories/category-table.tsx apps/admin/app/categories/page.tsx
git commit -m "feat: improve admin mobile lists"
```

---

### Task 8: Storefront Shared UI Foundation

**Files:**
- Create: `apps/storefront/lib/format.ts`
- Create: `apps/storefront/lib/product-images.ts`
- Create: `apps/storefront/components/toast-provider.tsx`
- Create: `apps/storefront/components/product-image.tsx`
- Create: `apps/storefront/components/site-header.tsx`
- Modify: `apps/storefront/store/use-cart.ts`
- Modify: `apps/storefront/app/layout.tsx`
- Modify: `apps/storefront/app/globals.css`

- [ ] **Step 1: Add formatting and image helpers**

Create `apps/storefront/lib/format.ts`:

```ts
export { formatVnd } from '@repo/shared';
```

Create `apps/storefront/lib/product-images.ts`:

```ts
export interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export function getPrimaryImage(images?: ProductImage[] | null): ProductImage | null {
  if (!images?.length) return null;
  return images.find((image) => image.isPrimary) ?? images[0];
}

export function resolveApiImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(/\/api$/, '');
  return `${apiOrigin}${url}`;
}
```

- [ ] **Step 2: Add toast provider**

Create `apps/storefront/components/toast-provider.tsx`:

```tsx
'use client';

import { createContext, useContext, useMemo, useState } from 'react';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      showToast(nextMessage: string) {
        setMessage(nextMessage);
        window.setTimeout(() => setMessage(null), 2200);
      },
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message && (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-md bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-4 sm:w-80">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used within ToastProvider');
  return value;
}
```

- [ ] **Step 3: Add stable product image component**

Create `apps/storefront/components/product-image.tsx`:

```tsx
import { ImageIcon } from 'lucide-react';
import { resolveApiImageUrl } from '@/lib/product-images';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const resolvedSrc = resolveApiImageUrl(src);

  if (!resolvedSrc) {
    return (
      <div className={`flex aspect-square w-full items-center justify-center bg-slate-100 text-slate-400 ${className}`}>
        <div className="text-center">
          <ImageIcon className="mx-auto h-8 w-8" />
          <span className="mt-2 block text-xs font-medium">Đang cập nhật ảnh</span>
        </div>
      </div>
    );
  }

  return <img src={resolvedSrc} alt={alt} className={`aspect-square w-full object-cover ${className}`} />;
}
```

- [ ] **Step 4: Extend cart store for image and buy-now session**

Update `CartItem` in `apps/storefront/store/use-cart.ts`:

```ts
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
}
```

Add store fields:

```ts
buyNowItem: CartItem | null;
setBuyNowItem: (item: Omit<CartItem, 'quantity'>) => void;
clearBuyNowItem: () => void;
```

Add implementations:

```ts
buyNowItem: null,
setBuyNowItem: (item) => set({ buyNowItem: { ...item, quantity: 1 } }),
clearBuyNowItem: () => set({ buyNowItem: null }),
```

Keep normal `items` unchanged when `setBuyNowItem` runs.

- [ ] **Step 5: Add responsive storefront header**

Create `apps/storefront/components/site-header.tsx` with logo, search field, and cart link:

```tsx
'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Store } from 'lucide-react';
import { useCart } from '@/store/use-cart';

export function SiteHeader() {
  const itemCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Store className="h-6 w-6 text-emerald-700" />
          <span className="text-base font-bold text-slate-950">HUNG HIEN</span>
        </Link>
        <form action="/" className="min-w-0 flex-1">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input name="search" placeholder="Tìm sản phẩm" className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm" />
          </label>
        </form>
        <Link href="/cart" className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700" aria-label="Giỏ hàng">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
```

- [ ] **Step 6: Wire layout and base CSS**

Update `apps/storefront/app/layout.tsx`:

```tsx
<html lang="vi">
  <body className="flex min-h-screen flex-col bg-slate-50 text-slate-950">
    <ToastProvider>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
        <div className="mx-auto max-w-7xl">HUNG HIEN - Mua sắm điện tử, nội thất và gia dụng.</div>
      </footer>
    </ToastProvider>
  </body>
</html>
```

Use metadata:

```ts
export const metadata: Metadata = {
  title: 'Cửa hàng HUNG HIEN',
  description: 'Mua sắm điện tử, nội thất và gia dụng tại HUNG HIEN.',
};
```

Update `apps/storefront/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    overflow-x: hidden;
  }

  body {
    overflow-x: hidden;
  }

  button,
  input,
  select,
  textarea {
    font: inherit;
  }
}
```

- [ ] **Step 7: Verify storefront build**

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 8: Commit storefront foundation**

```bash
git add apps/storefront/lib/format.ts apps/storefront/lib/product-images.ts apps/storefront/components/toast-provider.tsx apps/storefront/components/product-image.tsx apps/storefront/components/site-header.tsx apps/storefront/store/use-cart.ts apps/storefront/app/layout.tsx apps/storefront/app/globals.css
git commit -m "feat: add storefront mobile UI foundation"
```

---

### Task 9: Storefront Product Discovery And Detail Purchase Flow

**Files:**
- Modify: `apps/storefront/components/product-card.tsx`
- Modify: `apps/storefront/app/page.tsx`
- Modify: `apps/storefront/app/products/[id]/page.tsx`

- [ ] **Step 1: Update product card with image, VND, and buy-now**

In `apps/storefront/components/product-card.tsx`, use these fields:

```ts
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | string;
    originalPrice?: number | string | null;
    brand: string;
    stock: number;
    images?: { url: string; isPrimary?: boolean; altText?: string | null }[];
  };
}
```

Use `formatVnd`, `getPrimaryImage`, `ProductImage`, `useToast`, `useRouter`, and add handlers:

```ts
const image = getPrimaryImage(product.images);
const cartItem = {
  productId: product.id,
  name: product.name,
  price: Number(product.price),
  imageUrl: image?.url ?? null,
};

const handleAddToCart = (event: React.MouseEvent) => {
  event.preventDefault();
  addItem(cartItem);
  showToast('Đã thêm sản phẩm vào giỏ hàng.');
};

const handleBuyNow = (event: React.MouseEvent) => {
  event.preventDefault();
  setBuyNowItem(cartItem);
  router.push('/checkout?mode=buy-now');
};
```

Render two buttons:

```tsx
<div className="grid grid-cols-2 gap-2">
  <button type="button" onClick={handleAddToCart} disabled={product.stock <= 0} className="h-10 rounded-md border border-emerald-700 px-2 text-sm font-semibold text-emerald-700 disabled:border-slate-200 disabled:text-slate-400">
    Thêm giỏ
  </button>
  <button type="button" onClick={handleBuyNow} disabled={product.stock <= 0} className="h-10 rounded-md bg-orange-600 px-2 text-sm font-semibold text-white disabled:bg-slate-300">
    Mua ngay
  </button>
</div>
```

- [ ] **Step 2: Redesign home page**

In `apps/storefront/app/page.tsx`, read `searchParams`:

```ts
export default async function HomePage({ searchParams }: { searchParams: { search?: string } }) {
  const products = await getProducts(searchParams.search);
```

Update `getProducts`:

```ts
async function getProducts(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const url = `http://localhost:3001/api/products${params.toString() ? `?${params}` : ''}`;
```

Replace the hero with commerce controls:

```tsx
<section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
  <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
    <p className="text-sm font-semibold uppercase text-emerald-700">HUNG HIEN</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-4xl">Mua sắm điện tử, nội thất và gia dụng dễ dàng hơn</h1>
    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">Tìm sản phẩm, xem ảnh rõ ràng, thêm giỏ hoặc mua ngay chỉ trong vài chạm.</p>
  </div>
</section>
```

Use a responsive product grid:

```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
  {products.map((product: any) => <ProductCard key={product.id} product={product} />)}
</div>
```

- [ ] **Step 3: Redesign product detail page**

In `apps/storefront/app/products/[id]/page.tsx`, replace alerts with toast, use `formatVnd`, compute primary image, and render:

```tsx
<div className="grid gap-6 lg:grid-cols-2">
  <div className="space-y-3">
    <ProductImage src={primaryImage?.url} alt={product.name} className="overflow-hidden rounded-md" />
    <div className="grid grid-cols-4 gap-2">
      {(product.images?.length ? product.images : [{ url: null }]).slice(0, 4).map((image: any, index: number) => (
        <ProductImage key={image.id ?? index} src={image.url} alt={product.name} className="rounded-md" />
      ))}
    </div>
  </div>
  <section className="pb-24 lg:pb-0">
    <p className="text-sm font-semibold text-emerald-700">{product.brand}</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">{product.name}</h1>
    <div className="mt-4 flex items-baseline gap-3">
      <span className="text-3xl font-bold text-orange-600">{formatVnd(product.price)}</span>
      {product.originalPrice && <span className="text-sm text-slate-400 line-through">{formatVnd(product.originalPrice)}</span>}
    </div>
    <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-800">Còn hàng: {product.stock} sản phẩm</p>
    <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-700">{product.description || 'Sản phẩm đang được cập nhật mô tả.'}</div>
  </section>
</div>
<div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 lg:hidden">
  <div className="grid grid-cols-2 gap-2">
    <button type="button" onClick={handleAddToCart} className="h-12 rounded-md border border-emerald-700 font-semibold text-emerald-700">Thêm giỏ</button>
    <button type="button" onClick={handleBuyNow} className="h-12 rounded-md bg-orange-600 font-semibold text-white">Mua ngay</button>
  </div>
</div>
```

- [ ] **Step 4: Verify storefront build**

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 5: Commit storefront product flow**

```bash
git add apps/storefront/components/product-card.tsx apps/storefront/app/page.tsx apps/storefront/app/products/[id]/page.tsx
git commit -m "feat: redesign storefront product purchase flow"
```

---

### Task 10: Storefront Cart And Checkout Mobile Flow

**Files:**
- Modify: `apps/storefront/app/cart/page.tsx`
- Modify: `apps/storefront/app/checkout/page.tsx`
- Modify: `apps/storefront/app/checkout/success/page.tsx`

- [ ] **Step 1: Redesign cart as mobile cards**

In `apps/storefront/app/cart/page.tsx`, render each item as:

```tsx
<article className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
  <div className="flex gap-3">
    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
      <ProductImage src={item.imageUrl} alt={item.name} />
    </div>
    <div className="min-w-0 flex-1">
      <Link href={`/products/${item.productId}`} className="line-clamp-2 font-semibold text-slate-950">{item.name}</Link>
      <p className="mt-1 text-sm font-bold text-orange-600">{formatVnd(item.price)}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center rounded-md border border-slate-200">
          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="h-10 w-10"><Minus className="mx-auto h-4 w-4" /></button>
          <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
          <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="h-10 w-10"><Plus className="mx-auto h-4 w-4" /></button>
        </div>
        <button type="button" onClick={() => removeItem(item.productId)} className="h-10 w-10 text-red-600" aria-label="Xóa sản phẩm"><Trash2 className="mx-auto h-5 w-5" /></button>
      </div>
    </div>
  </div>
</article>
```

Use `formatVnd(getTotal())` in the summary and a sticky mobile checkout link.

- [ ] **Step 2: Support cart checkout and buy-now checkout**

In `apps/storefront/app/checkout/page.tsx`, use `useSearchParams`:

```ts
const searchParams = useSearchParams();
const mode = searchParams.get('mode');
const checkoutItems = mode === 'buy-now' && buyNowItem ? [buyNowItem] : items;
const checkoutTotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);
```

On success:

```ts
if (mode === 'buy-now') {
  clearBuyNowItem();
} else {
  clearCart();
}
router.push('/checkout/success');
```

Use inline error state:

```ts
const [error, setError] = useState<string | null>(null);
```

Render:

```tsx
{error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
```

Use VND in order summary and Vietnamese labels:

- `Họ và tên`
- `Số điện thoại`
- `Địa chỉ giao hàng`
- `Ghi chú cho đơn hàng`
- `Thanh toán khi nhận hàng (COD)`
- `Chuyển khoản ngân hàng`
- `Đặt hàng`

- [ ] **Step 3: Update checkout success copy**

Replace `apps/storefront/app/checkout/success/page.tsx` text with valid Vietnamese:

```tsx
<h1 className="mb-4 text-3xl font-bold text-slate-950">Cảm ơn bạn đã đặt hàng!</h1>
<p className="mx-auto mb-8 max-w-lg text-base text-slate-600">
  HUNG HIEN đã nhận đơn hàng và sẽ liên hệ xác nhận thông tin giao hàng trong thời gian sớm nhất.
</p>
```

- [ ] **Step 4: Verify storefront build**

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 5: Commit cart and checkout redesign**

```bash
git add apps/storefront/app/cart/page.tsx apps/storefront/app/checkout/page.tsx apps/storefront/app/checkout/success/page.tsx
git commit -m "feat: improve mobile cart and checkout"
```

---

### Task 11: Full Verification And Visual QA

**Files:**
- Modify only files that fail verification in previous tasks.

- [ ] **Step 1: Run all package checks**

Run: `pnpm --filter @repo/shared test`

Expected: PASS.

Run: `pnpm --filter api test`

Expected: PASS.

Run: `pnpm --filter @repo/shared build`

Expected: PASS.

Run: `pnpm --filter api build`

Expected: PASS.

Run: `pnpm --filter admin build`

Expected: PASS.

Run: `pnpm --filter storefront build`

Expected: PASS.

- [ ] **Step 2: Start local services**

Run API: `pnpm --filter api dev`

Expected: API listens on `http://localhost:3001`.

Run admin: `pnpm --filter admin dev`

Expected: admin listens on `http://localhost:3002`.

Run storefront: `pnpm --filter storefront dev`

Expected: storefront listens on `http://localhost:3000`.

- [ ] **Step 3: Verify storefront manually**

Open `http://localhost:3000` at 390px, 768px, and desktop widths.

Check:

- Header search and cart badge stay visible.
- Product cards show image or fallback image panel.
- Product cards show VND prices.
- `Thêm giỏ` adds item without browser alert.
- `Mua ngay` opens checkout without clearing the existing cart.
- Product detail gallery holds a stable square frame.
- Mobile sticky purchase bar does not cover important text.
- Cart has no horizontal scrolling.
- Checkout keeps entered values when API submission fails.

- [ ] **Step 4: Verify admin manually**

Open `http://localhost:3002` at 390px, 768px, and desktop widths.

Check:

- Mobile top bar opens and closes drawer navigation.
- Dashboard uses Vietnamese shortcuts, not fake English metrics.
- Products page search and stock filters work.
- Product list uses cards on mobile and table on desktop.
- Edit product page displays image manager.
- Uploading an image shows a preview.
- Selecting primary image updates the primary marker.
- Deleting the primary image promotes another image when available.
- Orders page uses cards on mobile and status changes show feedback.
- Categories page uses cards on mobile.

- [ ] **Step 5: Resolve verification failures through the owning task**

If verification fails, return to the task that owns the failing file, make the smallest fix there, rerun that task's verification command, and use that task's explicit commit command. If every check passes without edits, do not create an empty commit.

---

## Plan Self-Review

- Spec coverage: backend image schema, local upload, admin responsive layout, admin image management, storefront mobile purchase flow, Vietnamese copy, VND formatting, loading/error feedback, and responsive verification are covered by Tasks 1-11.
- Scope control: cloud storage, authentication redesign, customer accounts, coupons, analytics, and product comparison remain out of scope.
- Dirty worktree rule: do not stage `.env`; every commit command stages explicit files.
- Type consistency: product image fields use `url`, `altText`, `sortOrder`, and `isPrimary` consistently across shared types, Prisma, API, admin, and storefront.
