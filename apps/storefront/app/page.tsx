import React from 'react';
import { ProductCard } from '@/components/product-card';

// Server component to fetch products
async function getProducts() {
  try {
    const res = await fetch('http://localhost:3001/api/products', { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 rounded-xl bg-primary p-8 text-center text-white md:p-16">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">Chào mừng đến với cửa hàng HUNG HIEN</h1>
        <p className="text-lg text-blue-100 md:text-xl">Khám phá bộ sưu tập sản phẩm tuyệt vời của chúng tôi.</p>
      </section>

      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm nổi bật</h2>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">Hiện tại không có sản phẩm nào.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
