'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/products/product-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error('Lỗi tạo sản phẩm');
      }

      router.push('/products');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Lỗi tạo sản phẩm. Kiểm tra console để biết chi tiết.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/products" className="text-gray-500 hover:text-gray-900">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Tạo sản phẩm mới</h1>
      </div>

      <ProductForm 
        onSubmit={handleSubmit} 
        onCancel={() => router.push('/products')} 
      />
    </div>
  );
}
