'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/products/${params.id}`);
        if (!res.ok) throw new Error('Lỗi tải sản phẩm');
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`http://localhost:3001/api/products/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Lỗi cập nhật sản phẩm');
      }

      router.push('/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Lỗi cập nhật sản phẩm. Kiểm tra console để biết chi tiết.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Sửa sản phẩm</h1>
      </div>

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
