'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ShoppingCart, Check, Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/use-cart';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/products/${params.id}`);
        if (!res.ok) {
           if(res.status === 404) return notFound();
           throw new Error('Lỗi tải sản phẩm');
        }
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
    });
    alert('Đã thêm vào giỏ hàng!');
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-20 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="mb-6 flex items-center text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Trở lại sản phẩm
      </Link>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Image Gallery Placeholder */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-xl bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 font-medium text-lg">Chỗ dành cho ảnh chính</span>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
               <div key={i} className="aspect-square w-full rounded-md bg-gray-100 flex items-center justify-center">
                 <span className="text-gray-400 text-xs">Ảnh thu nhỏ</span>
               </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="inline-block rounded bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
              {product.brand}
            </span>
          </div>
          
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>
          
          <div className="mb-6 flex items-end gap-4">
            <span className="text-4xl font-bold text-accent">
              ${Number(product.price).toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${Number(product.originalPrice).toFixed(2)}
              </span>
            )}
          </div>

          <div className="mb-6 border-y py-4">
             <p className="text-gray-700 whitespace-pre-wrap">{product.description || "Không có mô tả."}</p>
          </div>

          <div className="mb-8 flex flex-col gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <span>Còn hàng: <span className="font-semibold text-gray-900">{product.stock} sản phẩm có sẵn</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Bảo hành chính hãng 1 năm</span>
            </div>
          </div>

          <div className="mt-auto">
             <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex w-full items-center justify-center space-x-2 rounded-lg bg-accent px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-accent/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="h-6 w-6" />
                <span>{product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
              </button>
          </div>
        </div>
      </div>
    </div>
  );
}
