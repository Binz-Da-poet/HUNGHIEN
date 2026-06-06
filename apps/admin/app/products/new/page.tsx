'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function NewProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Không thể tạo sản phẩm.');
      }

      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Lỗi tạo sản phẩm.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/products" className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Quay lại danh sách sản phẩm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Tạo sản phẩm mới</h1>
          <p className="mt-2 text-sm text-slate-500">Thêm thông tin bán hàng, tồn kho và hình ảnh sản phẩm.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <ProductForm 
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/products')} 
      />
    </div>
  );
}
