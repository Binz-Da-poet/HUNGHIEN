import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { StorefrontProduct, StorefrontCategory } from '@/lib/catalog-ui';
import { API_BASE_URL } from '@/lib/api';
import { LayoutGrid } from 'lucide-react';

interface Props {
  params: { slug: string };
}

async function getCategories(): Promise<StorefrontCategory[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
      cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function getProductsByCategory(categoryId: string): Promise<StorefrontProduct[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products?categoryId=${categoryId}`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 60 },
      cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const categories = await getCategories();
  const category = categories.find(c => c.slug === params.slug);
  if (!category) return { title: 'Danh mục | Hùng Hiền' };
  return {
    title: `${category.name} | Hùng Hiền Điện Máy`,
    description: `Mua ${category.name} chính hãng giá tốt tại Hùng Hiền Điện Máy. Giao nhanh, bảo hành uy tín.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const categories = await getCategories();
  const category = categories.find(c => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(category.id);

  return (
    <div className="pb-16 bg-white min-h-screen">
      {/* Header */}
      <section className="bg-[#1A2B4C]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 text-[#E5C37A] rounded-xl">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-black text-white uppercase tracking-tight">
                {category.name}
              </h1>
              <p className="text-sm font-bold text-[#E5C37A]/70 mt-1 uppercase tracking-widest">
                {products.length} sản phẩm
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="mx-auto max-w-7xl px-4 pt-10">
        {products.length === 0 ? (
          <div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <LayoutGrid className="mx-auto h-20 w-20 text-slate-200 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 uppercase">Chưa có sản phẩm</h3>
            <p className="text-slate-500 mt-3 font-medium">
              Danh mục này hiện chưa có sản phẩm. Vui lòng quay lại sau.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8">
            {products.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
