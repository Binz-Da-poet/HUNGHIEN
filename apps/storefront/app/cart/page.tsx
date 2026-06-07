'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { formatVnd } from '@/lib/format';
import { ProductImage } from '@/components/product-image';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32">
        <div className="mx-auto max-w-xl rounded-3xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center shadow-sm">
          <div className="mx-auto w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
            <ShoppingBag className="h-10 w-10 text-slate-300" />
          </div>
          <h1 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Giỏ hàng đang trống</h1>
          <p className="mt-4 text-slate-500 font-medium leading-relaxed">Chọn sản phẩm yêu thích, thêm vào giỏ và kiểm tra tổng tiền trước khi đặt hàng.</p>
          <Link
            href="/"
            className="mt-10 inline-flex h-14 items-center rounded-2xl bg-[#1A2B4C] px-10 text-sm font-black text-[#E5C37A] uppercase tracking-widest transition-all hover:bg-[#253A66] shadow-xl shadow-[#1A2B4C]/20"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 pb-32 lg:pb-16">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-3xl font-black text-[#1A2B4C] uppercase tracking-tight">Giỏ hàng của bạn</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Bạn có {items.length} sản phẩm trong giỏ hàng</p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-8">
            {items.map((item) => (
              <article key={item.productId} className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 flex gap-6 items-center group hover:shadow-md transition-shadow">
                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-2 group-hover:scale-105 transition-transform">
                  <ProductImage src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-4">
                    <Link href={`/products/${item.productId}`} className="line-clamp-2 text-sm font-bold text-slate-900 hover:text-[#1A2B4C] transition-colors leading-snug">
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="flex items-end justify-between mt-auto">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-[#D10024]">{formatVnd(item.price)}</span>
                      <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 p-1 w-fit">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#1A2B4C] hover:bg-white rounded-md transition-all"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center text-xs font-black text-slate-800">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-[#1A2B4C] hover:bg-white rounded-md transition-all"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Thành tiền</div>
                      <p className="text-lg font-black text-[#1A2B4C] tracking-tighter">{formatVnd(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="rounded-[2rem] bg-[#1A2B4C] p-8 text-white shadow-2xl lg:sticky lg:top-32 border border-[#E5C37A]/20">
              <h2 className="text-xl font-black uppercase tracking-widest text-[#E5C37A] mb-8 border-b border-white/10 pb-4">Tóm tắt đơn hàng</h2>
              <div className="space-y-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Tạm tính</span>
                  <span className="font-black text-white">{formatVnd(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-wider">Giao hàng</span>
                  <span className="font-black text-[#E5C37A] uppercase">Miễn phí</span>
                </div>
                
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                   <div className="p-2 bg-[#E5C37A] rounded-lg text-[#1A2B4C]"><Truck className="h-4 w-4" /></div>
                   <p className="text-[10px] font-bold uppercase tracking-tight text-[#E5C37A]">Giao hàng hỏa tốc trong 2h</p>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Tổng thanh toán</span>
                    <span className="text-4xl font-black text-[#E5C37A] tracking-tighter">{formatVnd(total)}</span>
                  </div>
                </div>
              </div>
              
              <Link
                href="/checkout"
                className="mt-10 flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#E5C37A] text-[#1A2B4C] font-black uppercase text-sm tracking-widest transition-all hover:bg-white hover:shadow-xl"
              >
                Tiến hành đặt hàng
                <ArrowRight className="h-5 w-5" />
              </Link>

              <div className="mt-8 space-y-3">
                {[
                  { icon: ShieldCheck, text: 'Hàng chính hãng 100%' },
                  { icon: RotateCcw, text: 'Đổi trả miễn phí 7 ngày' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <item.icon className="h-4 w-4 text-[#E5C37A]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Total */}
        <div className="fixed inset-x-0 bottom-16 lg:hidden z-40 px-4 pb-4 pointer-events-none">
           <div className="bg-white p-5 rounded-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center justify-between gap-4 pointer-events-auto">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tổng cộng</span>
                <span className="text-xl font-black text-[#D10024] tracking-tighter">{formatVnd(total)}</span>
              </div>
              <Link href="/checkout" className="flex-1 h-14 bg-[#1A2B4C] text-[#E5C37A] rounded-xl flex items-center justify-center gap-2 font-black uppercase text-xs tracking-widest shadow-lg active:scale-95 transition-transform">
                Thanh toán
                <ArrowRight className="h-4 w-4" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
