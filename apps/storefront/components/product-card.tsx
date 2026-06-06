'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';
import {
  StorefrontProduct,
  getDiscountPercent,
  getProductRating,
  getSoldCount,
} from '@/lib/catalog-ui';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();

  const image = getPrimaryImage(product.images);
  const discount = getDiscountPercent(product);
  const rating = getProductRating(product);
  const soldCount = getSoldCount(product);
  
  const cartItem = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: image?.url ?? null,
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(cartItem);
    showToast('Đã thêm vào giỏ hàng.');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    setBuyNowItem(cartItem);
    router.push('/checkout?mode=buy-now');
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden bg-white hover:shadow-xl transition-all duration-300 border border-slate-100 rounded-lg">
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <ProductImage
          src={image?.url}
          alt={product.name}
          className="h-full w-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute left-0 top-3 bg-[#D10024] text-white text-[11px] font-black px-2.5 py-1 rounded-r-full shadow-sm z-10">
            -{discount}%
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute right-3 top-3 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-slate-400 hover:text-red-500 shadow-sm transition-colors z-10">
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4 space-y-2">
        <div className="flex items-center gap-1.5">
           <span className="text-[10px] font-bold text-[#1A2B4C] bg-[#E5C37A]/20 px-2 py-0.5 rounded uppercase tracking-wider">
             {product.brand}
           </span>
           <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 ml-auto">
             <Star className="h-3 w-3 fill-current" />
             {rating}
           </div>
        </div>

        <Link href={`/products/${product.id}`} className="block group-hover:text-[#1A2B4C] transition-colors">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-snug text-slate-900">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col gap-0.5 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-[#D10024]">{formatVnd(product.price)}</span>
            {product.originalPrice && (
              <span className="text-[11px] text-slate-400 line-through font-medium">
                {formatVnd(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-500 font-medium italic">
            Đã bán {soldCount} sản phẩm
          </div>
        </div>

        <div className="mt-auto pt-4 flex gap-2 opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 bg-slate-100 text-slate-700 rounded font-bold text-[11px] uppercase hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            + Giỏ hàng
          </button>
          <button
            onClick={handleBuyNow}
            className="flex-1 h-9 bg-[#1A2B4C] text-[#E5C37A] rounded font-bold text-[11px] uppercase hover:bg-[#253A66] transition-colors"
          >
            Mua ngay
          </button>
        </div>
        
        {/* Mobile-only CTA */}
        <div className="mt-auto pt-2 lg:hidden">
          <button
            onClick={handleBuyNow}
            className="w-full h-9 bg-[#1A2B4C] text-[#E5C37A] rounded font-bold text-[11px] uppercase shadow-md active:scale-[0.98] transition-all"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </article>
  );
}
