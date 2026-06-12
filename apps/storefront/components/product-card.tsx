'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';
import {
  StorefrontProduct,
  getDiscountPercent,
  getStockLabel,
  getStockTone,
} from '@/lib/catalog-ui';

interface ProductCardProps {
  product: StorefrontProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();
  const reduce = useReducedMotion();

  const image = getPrimaryImage(product.images);
  const discount = getDiscountPercent(product);

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
    <motion.article
      whileHover={reduce ? undefined : { scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-card bg-surface transition-shadow duration-300 hover:shadow-card-hover"
    >
      <Link href={`/products/${product.id}`} className="relative block aspect-square overflow-hidden bg-slate-50">
        <ProductImage
          src={image?.url}
          alt={product.name}
          className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 && (
          <span className="absolute left-3 top-3 bg-brand-danger text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 gap-2">
        {/* Brand + Stock */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-brand-primary/70 bg-brand-accent/10 px-2 py-0.5 rounded">
            {product.brand}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded ml-auto ${getStockTone(product.stock)}`}>
            {getStockLabel(product.stock)}
          </span>
        </div>

        {/* Product Name */}
        <Link href={`/products/${product.id}`} className="group-hover:text-brand-primary transition-colors">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-text-primary">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-auto pt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-danger">{formatVnd(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-text-tertiary line-through">
              {formatVnd(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Actions (show on hover - desktop) */}
        <div className="mt-3 pt-3 border-t border-border flex gap-2 opacity-0 lg:group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleAddToCart}
            className="flex-1 h-9 bg-slate-100 text-text-secondary rounded-button text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ShoppingCart className="h-3.5 w-3.5" /> Thêm vào giỏ
          </button>
          <button
            onClick={handleBuyNow}
            className="h-9 px-4 bg-brand-primary text-brand-accent rounded-button text-xs font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Mua ngay
          </button>
        </div>
      </div>
    </motion.article>
  );
}
