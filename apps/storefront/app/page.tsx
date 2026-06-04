import React from 'react';
import { ProductCard } from '@/components/product-card';

async function getProducts(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  const url = `http://localhost:3001/api/products${params.toString() ? `?${params}` : ''}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage({ searchParams }: { searchParams: { search?: string } }) {
  const products = await getProducts(searchParams.search);

  return (
    <div className="space-y-6 pb-12">
      <section className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-6">
          <p className="text-sm font-semibold uppercase text-emerald-700">HUNG HIEN</p>
          <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-4xl">
            Mua sắm điện tử, nội thất và gia dụng dễ dàng hơn
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Tìm sản phẩm, xem ảnh rõ ràng, thêm giỏ hoặc mua ngay chỉ trong vài chạm.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-950">
            {searchParams.search ? `Kết quả cho "${searchParams.search}"` : 'Sản phẩm nổi bật'}
          </h2>
          <span className="text-sm text-slate-500">{products.length} sản phẩm</span>
        </div>
        
        {products.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 py-20 text-center text-slate-500">
            Hiện tại không có sản phẩm nào.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
