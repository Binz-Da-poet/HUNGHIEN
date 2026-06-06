'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BadgeCheck, 
  RotateCcw, 
  ShieldCheck, 
  Star, 
  Truck, 
  ShoppingCart,
  Heart,
  Share2
} from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { getPrimaryImage } from '@/lib/product-images';
import { ProductImage } from '@/components/product-image';
import { useToast } from '@/components/toast-provider';
import { 
  StorefrontProduct, 
  getDiscountPercent, 
  getProductRating, 
  getSoldCount, 
} from '@/lib/catalog-ui';
import { API_BASE_URL } from '@/lib/api';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<StorefrontProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addItem, setBuyNowItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${params.id}`);
        if (!res.ok) {
          if (res.status === 404) return setProduct(null);
          throw new Error('Không thể tải thông tin sản phẩm.');
        }
        const data = await res.json();
        setProduct(data);
        const primary = getPrimaryImage(data.images);
        setActiveImage(primary?.url || null);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto px-4 py-24 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return notFound();
  }

  const discount = getDiscountPercent(product);
  const rating = getProductRating(product);
  const soldCount = getSoldCount(product);
  
  const cartItem = {
    productId: product.id,
    name: product.name,
    price: Number(product.price),
    imageUrl: activeImage,
  };

  const handleAddToCart = () => {
    addItem(cartItem);
    showToast('Đã thêm sản phẩm vào giỏ hàng.');
  };

  const handleBuyNow = () => {
    setBuyNowItem(cartItem);
    router.push('/checkout?mode=buy-now');
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 md:py-12">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 overflow-x-auto no-scrollbar whitespace-nowrap">
          <Link href="/" className="hover:text-[#1A2B4C] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href={`/categories/${product.category?.slug}`} className="hover:text-[#1A2B4C] transition-colors">{product.category?.name}</Link>
          <span>/</span>
          <span className="text-slate-800">{product.name}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left: Gallery */}
          <div className="space-y-6 lg:sticky lg:top-32">
            <div className="aspect-square relative rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden group shadow-inner">
              <ProductImage
                src={activeImage}
                alt={product.name}
                className="h-full w-full object-contain p-10 group-hover:scale-110 transition-transform duration-700"
              />
              {discount > 0 && (
                <div className="absolute left-6 top-6 bg-[#D10024] text-white text-xs font-black px-4 py-2 rounded-full shadow-xl animate-in zoom-in">
                  -{discount}% TIẾT KIỆM
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-5 gap-3">
              {(product.images?.length ? product.images : [{ url: null }]).map((image: any, index: number) => (
                <button
                  key={image.id ?? index}
                  onClick={() => setActiveImage(image.url)}
                  className={`aspect-square rounded-xl border-2 transition-all overflow-hidden bg-slate-50 p-1.5 ${
                    activeImage === image.url ? 'border-[#1A2B4C] shadow-lg scale-105' : 'border-transparent hover:border-slate-200'
                  }`}
                >
                  <ProductImage src={image.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-6">
               <span className="px-4 py-1.5 bg-[#1A2B4C] text-[#E5C37A] text-[11px] font-black uppercase tracking-[0.2em] rounded-md shadow-sm">
                 {product.brand}
               </span>
               <div className="flex items-center gap-3">
                  <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all border border-slate-100 hover:shadow-md"><Heart className="h-5 w-5" /></button>
                  <button className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-blue-500 transition-all border border-slate-100 hover:shadow-md"><Share2 className="h-5 w-5" /></button>
               </div>
            </div>

            <h1 className="text-3xl lg:text-5xl font-black text-[#1A2B4C] leading-[1.1] mb-6 uppercase tracking-tighter">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-10 text-xs font-black border-y border-slate-100 py-5">
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="tracking-tight">{rating} / 5.0 (128)</span>
              </div>
              <div className="w-px h-5 bg-slate-200"></div>
              <div className="text-slate-500 uppercase tracking-widest">Đã bán {soldCount}</div>
              <div className="w-px h-5 bg-slate-200"></div>
              <div className={`uppercase tracking-widest ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `Còn ${product.stock} SP` : 'Hết hàng'}
              </div>
            </div>

            <div className="mb-10 p-8 bg-[#1A2B4C] rounded-[2rem] border border-[#E5C37A]/20 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-1000">
                  <BadgeCheck className="h-32 w-32 text-[#E5C37A]" />
               </div>
               <div className="relative z-10">
                 <div className="text-[#E5C37A]/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Giá ưu đãi tốt nhất</div>
                 <div className="flex items-baseline gap-4 mb-3">
                    <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter">{formatVnd(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-lg text-slate-400 line-through font-bold italic">{formatVnd(product.originalPrice)}</span>
                    )}
                 </div>
                 {product.originalPrice && (
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-[#E5C37A] uppercase tracking-wider">
                      <ShieldCheck className="h-3.5 w-3.5" /> 
                      Tiết kiệm: {formatVnd(Number(product.originalPrice) - Number(product.price))}
                   </div>
                 )}
               </div>
            </div>

            {/* Service Perks */}
            <div className="grid grid-cols-2 gap-4 mb-10">
               <div className="flex flex-col gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#E5C37A]/50 transition-colors">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1A2B4C]"><Truck className="h-5 w-5" /></div>
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Giao hàng hỏa tốc trong 2h</div>
               </div>
               <div className="flex flex-col gap-3 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-[#E5C37A]/50 transition-colors">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#1A2B4C]"><RotateCcw className="h-5 w-5" /></div>
                  <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Bảo hành 1 đổi 1 tận nơi</div>
               </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
               <button
                 onClick={handleAddToCart}
                 disabled={product.stock <= 0}
                 className="flex-1 h-16 bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 <ShoppingCart className="h-5 w-5" />
                 Thêm vào giỏ hàng
               </button>
               <button
                 onClick={handleBuyNow}
                 disabled={product.stock <= 0}
                 className="flex-1 h-16 bg-[#1A2B4C] text-[#E5C37A] rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-[#253A66] transition-all shadow-2xl shadow-[#1A2B4C]/30 disabled:opacity-50 transform hover:-translate-y-1 active:translate-y-0"
               >
                 Mua ngay online
               </button>
            </div>

            {/* Description Section */}
            <div className="border-t border-slate-100 pt-12">
               <div className="flex items-center gap-4 mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#1A2B4C]">Thông số & Mô tả</h3>
                  <div className="flex-1 h-px bg-slate-100"></div>
               </div>
               <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium">
                  {product.description || 'Sản phẩm đang được cập nhật mô tả chi tiết từ Hùng Hiền Điện Máy.'}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
