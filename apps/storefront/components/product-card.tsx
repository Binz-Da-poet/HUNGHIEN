'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';

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

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();

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

  return (
    <Link
      href={`/products/${product.id}`}
      className="group flex flex-col justify-between overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <ProductImage src={image?.url} alt={product.name} />
        {product.stock <= 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
            <span className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate-950">HẾT HÀNG</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">{product.brand}</p>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-emerald-700">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-orange-600">{formatVnd(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[10px] text-slate-400 line-through">{formatVnd(product.originalPrice)}</span>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="h-10 rounded-md border border-emerald-700 px-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 disabled:border-slate-200 disabled:text-slate-400 disabled:hover:bg-transparent"
          >
            Thêm giỏ
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={product.stock <= 0}
            className="h-10 rounded-md bg-orange-600 px-2 text-xs font-bold text-white hover:bg-orange-700 disabled:bg-slate-300"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </Link>
  );
}
