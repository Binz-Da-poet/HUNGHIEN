'use client';

import React from 'react';
import Link from 'next/link';
import { FeaturedBrand } from '@/lib/homepage';

export function BrandStrip({ brands }: { brands: FeaturedBrand[] }) {
  if (!brands.length) return null;

  return (
    <section className="py-12 bg-white border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight flex items-center gap-3 mb-8">
          <span className="w-2 h-8 bg-[#E5C37A] rounded-sm"></span>
          Thương hiệu đồng hành
        </h2>
        
        <div className="flex items-center gap-4 lg:gap-10 overflow-x-auto no-scrollbar py-2">
          {brands.map((brand) => (
            <Link 
              key={brand.id} 
              href={brand.targetUrl || '#'}
              className="flex-shrink-0 w-28 lg:w-40 h-14 lg:h-20 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-white hover:shadow-md"
            >
              <img 
                src={brand.logoUrl} 
                alt={brand.name} 
                className="max-h-full max-w-full object-contain mix-blend-multiply" 
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
