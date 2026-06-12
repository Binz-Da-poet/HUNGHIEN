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
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
            {group.title}
          </h2>
          <p className="mt-2 text-sm text-text-secondary font-normal">
            <Link
              href={`/collections/${group.slug}`}
              className="hover:text-brand-primary transition-colors inline-flex items-center gap-1 group"
            >
              Xem tất cả <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </Link>
          </p>
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
