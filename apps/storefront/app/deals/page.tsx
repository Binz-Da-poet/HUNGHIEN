import Link from 'next/link';
import { getHomepage } from '@/lib/homepage';
import { ProductCard } from '@/components/product-card';

export default async function DealsPage() {
  const homepage = await getHomepage();
  const dealGroup = homepage.productGroups.find(g => g.slug === 'deals');

  if (!dealGroup || !dealGroup.items.length) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <div className="text-7xl mb-8">🔥</div>
        <h1 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tighter mb-4">Chưa có khuyến mãi nào</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest mb-10">Quay lại sau để không bỏ lỡ ưu đãi hấp dẫn từ Hùng Hiền.</p>
        <Link href="/" className="inline-flex h-14 items-center rounded-2xl bg-[#1A2B4C] px-10 text-sm font-black text-[#E5C37A] uppercase tracking-widest transition-all hover:bg-[#253A66] shadow-xl shadow-[#1A2B4C]/20">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const products = dealGroup.items.map(item => item.product);

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10 pb-32 lg:pb-16">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tighter">
            {dealGroup.title}
          </h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            {products.length} sản phẩm ưu đãi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
