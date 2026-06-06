'use client';

import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/product-card';
import { ProductGroup } from '@/lib/homepage';

interface ProductGroupSectionProps {
  group: ProductGroup;
}

export function ProductGroupSection({ group }: ProductGroupSectionProps) {
  if (!group.items.length) return null;

  return (
    <section className="py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <h2 
            className="text-xl lg:text-2xl font-black uppercase tracking-tight flex items-center gap-3"
            style={{ color: group.accent || '#1A2B4C' }}
          >
            <span className="w-2 h-8 rounded-sm" style={{ backgroundColor: group.accent || '#1A2B4C' }}></span>
            {group.title}
          </h2>
          <Link 
            href={`/collections/${group.slug}`} 
            className="text-[11px] font-black text-slate-500 hover:text-[#1A2B4C] uppercase tracking-wider flex items-center gap-1 group"
          >
            Xem tất cả <span className="group-hover:translate-x-1 transition-transform font-bold">→</span>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
          {group.items.map((item) => (
            <ProductCard key={item.product.id} product={item.product} />
          ))}
        </div>
      </div>
    </section>
  );
}
