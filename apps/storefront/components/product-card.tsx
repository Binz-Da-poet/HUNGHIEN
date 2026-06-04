'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/store/use-cart';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number | string;
    originalPrice?: number | string;
    brand: string;
    stock: number;
    categoryId?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
    });
    alert('Added to cart!');
  };

  return (
    <Link href={`/products/${product.id}`} className="group flex flex-col justify-between overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-square w-full bg-gray-100 p-6 flex items-center justify-center relative">
         {/* Placeholder Image */}
         <div className="text-gray-400 font-medium">Image Placeholder</div>
      </div>
      
      <div className="flex flex-1 flex-col p-4">
        <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary line-clamp-2">
            {product.name}
            </h3>
            <span className="inline-block px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded whitespace-nowrap">
                {product.brand}
            </span>
        </div>
        
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-accent">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-500 line-through">
              ${Number(product.originalPrice).toFixed(2)}
            </span>
          )}
        </div>
        
        <div className="mt-4 mt-auto pt-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="flex w-full items-center justify-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
}
