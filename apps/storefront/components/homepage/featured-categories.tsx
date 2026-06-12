'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/scroll-reveal';
import { FeaturedCategory } from '@/lib/homepage';

interface FeaturedCategoriesProps {
  categories: FeaturedCategory[];
}

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (!categories.length) return null;

  return (
    <section className="py-16 md:py-24 bg-surface">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            Danh mục nổi bật
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-normal">
            Khám phá các dòng sản phẩm được ưa chuộng nhất
          </p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-10 gap-x-4 gap-y-8">
          {categories.map((item, i) => (
            <ScrollReveal key={item.id} index={i}>
              <Link
                key={item.id}
                href={`/categories/${item.category.slug}`}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center p-3 bg-slate-50 rounded-full group-hover:bg-brand-accent/10 transition-all duration-300 border border-border group-hover:border-brand-accent/30">
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
                <span className="text-[10px] sm:text-[11px] font-medium text-text-primary group-hover:text-brand-primary leading-tight line-clamp-2 min-h-[2.2rem]">
                  {item.displayName}
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
