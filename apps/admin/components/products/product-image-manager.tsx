'use client';

import { ImagePlus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
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
            <Image
              src={imageUrl(image.url)}
              alt={image.altText || 'Ảnh sản phẩm'}
              width={320}
              height={320}
              unoptimized
              className="aspect-square w-full object-cover"
            />
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
