import React from 'react';
import { HomepageSectionRenderer } from '@/components/homepage/homepage-section-renderer';
import { getHomepage, getVisibleSections } from '@/lib/homepage';
import { ProductCard } from '@/components/product-card';
import { StorefrontProduct } from '@/lib/catalog-ui';
import { Search, BadgePercent } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

async function getSearchResults(search?: string, categoryId?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (categoryId) params.set('categoryId', categoryId);
  const url = `${API_BASE_URL}/products${params.toString() ? `?${params}` : ''}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return (await res.json()) as StorefrontProduct[];
  } catch {
    return [];
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string; sort?: string };
}) {
  const isSearching = !!(searchParams.search || searchParams.category);

  if (isSearching) {
    const products = await getSearchResults(searchParams.search, searchParams.category);
    
    return (
      <div className="pb-12 bg-white min-h-screen">
        <section className="mx-auto max-w-7xl px-4 pt-8">
           <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-8">
              <div className="p-3 bg-[#1A2B4C] text-[#E5C37A] rounded-xl">
                <Search className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">
                  {searchParams.search ? `Kết quả cho "${searchParams.search}"` : 'Danh mục sản phẩm'}
                </h1>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tìm thấy {products.length} sản phẩm phù hợp</p>
              </div>
           </div>

           {products.length === 0 ? (
             <div className="py-32 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <BadgePercent className="mx-auto h-20 w-20 text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900 uppercase">Không tìm thấy sản phẩm nào</h3>
                <p className="text-slate-500 mt-3 font-medium">Thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ.</p>
             </div>
           ) : (
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
             </div>
           )}
        </section>
      </div>
    );
  }

  const payload = await getHomepage();
  const visibleSections = getVisibleSections(payload);

  // If no CMS sections are active, show a simple fallback or just a message
  if (visibleSections.length === 0) {
    const allProducts = await getSearchResults();
    return (
      <div className="pb-12 bg-white">
        <section className="mx-auto max-w-7xl px-4 pt-8">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-[#1A2B4C] uppercase tracking-tight">Tất cả sản phẩm</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-8">
            {allProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] flex flex-col">
      <HomepageSectionRenderer payload={payload} sections={visibleSections} />
    </div>
  );
}
