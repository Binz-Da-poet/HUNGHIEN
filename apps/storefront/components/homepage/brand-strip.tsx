'use client';

import React from 'react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/scroll-reveal';
import { FeaturedBrand } from '@/lib/homepage';

export function BrandStrip({ brands }: { brands: FeaturedBrand[] }) {
  if (!brands.length) return null;

  return (
    <section className="py-12 md:py-16 bg-surface border-t border-border">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary tracking-tight mb-10">
          Thương hiệu đồng hành
        </h2>

        <div className="flex items-center gap-4 lg:gap-10 overflow-x-auto no-scrollbar py-2">
          {brands.map((brand, i) => (
            <ScrollReveal key={brand.id} index={i}>
              <Link
                key={brand.id}
                href={brand.targetUrl || '#'}
                className="flex-shrink-0 w-28 lg:w-40 h-14 lg:h-20 flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all border border-border rounded-card bg-slate-50/50 hover:bg-surface hover:shadow-card-hover"
              >
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="max-h-full max-w-full object-contain"
                />
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
