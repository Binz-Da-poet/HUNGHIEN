'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/products/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) return setProduct(null);
          throw new Error('Không thể tải thông tin sản phẩm.');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-slate-500">
        Đang tải sản phẩm...
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  const primaryImage = getPrimaryImage(product.images);
  const cartItem = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: primaryImage?.url ?? null,
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    showToast('Đã thêm sản phẩm vào giỏ hàng.');
  };

  const handleBuyNow = () => {
    setBuyNowItem(cartItem);
    router.push('/checkout?mode=buy-now');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <Link href="/" className="mb-6 inline-flex items-center text-sm font-medium text-slate-500 hover:text-emerald-700">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại
      </Link>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <ProductImage src={primaryImage?.url} alt={product.name} className="overflow-hidden rounded-md shadow-sm" />
          <div className="grid grid-cols-4 gap-2">
            {(product.images?.length ? product.images : [{ url: null }]).slice(0, 4).map((image: any, index: number) => (
              <ProductImage
                key={image.id ?? index}
                src={image.url}
                alt={product.name}
                className="cursor-pointer rounded-md border border-slate-200 hover:border-emerald-500"
              />
            ))}
          </div>
        </div>

        <section className="pb-24 lg:pb-0">
          <p className="text-sm font-bold uppercase tracking-wider text-emerald-700">{product.brand}</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-4xl">{product.name}</h1>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-orange-600">{formatVnd(product.price)}</span>
            {product.originalPrice && (
              <span className="text-base text-slate-400 line-through">{formatVnd(product.originalPrice)}</span>
            )}
          </div>
          <p className="mt-4 inline-flex items-center rounded-md bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800">
            Còn hàng: {product.stock} sản phẩm
          </p>
          <div className="mt-8 border-t border-slate-200 pt-8">
            <h2 className="text-base font-bold text-slate-950">Mô tả sản phẩm</h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {product.description || 'Sản phẩm đang được cập nhật mô tả.'}
            </div>
          </div>

          <div className="mt-10 hidden grid-cols-2 gap-4 lg:grid">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="h-12 rounded-md border border-emerald-700 font-bold text-emerald-700 hover:bg-emerald-50 disabled:border-slate-200 disabled:text-slate-400"
            >
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="h-12 rounded-md bg-orange-600 font-bold text-white hover:bg-orange-700 disabled:bg-slate-300"
            >
              Mua ngay
            </button>
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 lg:hidden">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="h-12 rounded-md border border-emerald-700 font-bold text-emerald-700 disabled:border-slate-200 disabled:text-slate-400"
          >
            Thêm giỏ
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="h-12 rounded-md bg-orange-600 font-bold text-white disabled:bg-slate-300"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
