import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';
import { ListTree } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Danh mục sản phẩm - Hùng Hiền Điện Máy',
  description: 'Khám phá tất cả danh mục sản phẩm tại Hùng Hiền Điện Máy.',
};

export const dynamic = 'force-dynamic';

interface Category {
  id: string;
  name: string;
  slug: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/catalog/categories`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-8">Danh mục sản phẩm</h1>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Chưa có danh mục nào.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                  <ListTree className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#1A2B4C] transition-colors">{cat.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{cat.slug}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
