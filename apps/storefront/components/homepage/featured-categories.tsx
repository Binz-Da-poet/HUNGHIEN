'use client';

import React from 'react';
import Link from 'next/link';
import { FeaturedCategory } from '@/lib/homepage';

interface FeaturedCategoriesProps {
  categories: FeaturedCategory[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories.length) return null;

  return (
    <section className="py-10 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-[#1A2B4C] uppercase tracking-tight flex items-center gap-3">
            <span className="w-2 h-8 bg-[#E5C37A] rounded-sm"></span>
            Danh mục nổi bật
          </h2>
          <Link href="/categories" className="text-xs font-bold text-blue-600 hover:underline uppercase">
            Tất cả danh mục
          </Link>
        </div>
        
        {/* Responsive Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-x-4 gap-y-8">
          {categories.map((item) => (
            <Link 
              key={item.id} 
              href={`/categories/${item.category.slug}`}
              className="group flex flex-col items-center text-center gap-3"
            >
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-3 bg-slate-50 rounded-full group-hover:bg-[#E5C37A]/10 transition-all duration-300 border border-slate-100 group-hover:border-[#E5C37A]/30 shadow-sm group-hover:shadow-md">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.displayName} 
                    className="max-h-full max-w-full object-contain group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 animate-pulse rounded-full" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-black text-slate-800 group-hover:text-[#1A2B4C] uppercase tracking-tighter leading-tight line-clamp-2 min-h-[2.2rem]">
                {item.displayName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
