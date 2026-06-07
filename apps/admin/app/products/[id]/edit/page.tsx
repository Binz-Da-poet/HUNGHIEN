'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { adminFetch } from '@/lib/admin-api';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await adminFetch(`/admin/products/${params.id}`);
        setProduct(data);
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    setError(null);
    try {
      await adminFetch(`/products/${params.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      router.push('/products');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật sản phẩm.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Link href="/products" className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Quay lại danh sách sản phẩm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Sửa sản phẩm</h1>
          <p className="mt-2 text-sm text-slate-500">Cập nhật thông tin, tồn kho và hình ảnh đang hiển thị.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : product ? (
        <ProductForm 
          initialData={product}
          onSubmit={handleSubmit} 
          onCancel={() => router.push('/products')} 
        />
      ) : (
        <div className="text-center py-10 text-red-500">Không tìm thấy sản phẩm</div>
      )}
    </div>
  );
}
