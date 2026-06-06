'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/store/use-cart';
import Link from 'next/link';
import { formatVnd } from '@/lib/format';
import { ShieldCheck, Truck, ArrowLeft, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const { items, buyNowItem, clearCart, clearBuyNowItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutItems = mode === 'buy-now' && buyNowItem ? [buyNowItem] : items;
  const checkoutTotal = checkoutItems.reduce((total, item) => total + item.price * (item.quantity || 1), 0);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  });

  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-32 text-center">
        <p className="text-slate-500 font-bold uppercase tracking-widest mb-6">Giỏ hàng của bạn đang trống</p>
        <Link href="/" className="inline-flex h-14 items-center bg-[#1A2B4C] text-[#E5C37A] px-8 rounded-xl font-black uppercase text-sm tracking-widest shadow-xl">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      items: checkoutItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity || 1,
      })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Thanh toán thất bại.');
      }

      if (mode === 'buy-now') {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      router.push('/checkout/success');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Thanh toán thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        <Link href="/cart" className="inline-flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-[#1A2B4C] transition-colors mb-8">
           <ArrowLeft className="h-3 w-3" /> Quay lại giỏ hàng
        </Link>
        
        <h1 className="text-3xl lg:text-4xl font-black text-[#1A2B4C] uppercase tracking-tighter mb-10">Thanh toán</h1>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-start">
          <div className="lg:col-span-7 space-y-10">
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#1A2B4C] text-[#E5C37A] rounded-full flex items-center justify-center font-black text-sm">1</div>
                  <h2 className="text-lg font-black text-[#1A2B4C] uppercase tracking-tight">Thông tin người nhận</h2>
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Họ và tên</label>
                    <input
                      type="text"
                      name="customerName"
                      required
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full h-12 bg-white rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#1A2B4C] outline-none"
                      placeholder="Nhập tên người nhận hàng"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Số điện thoại</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-12 bg-white rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#1A2B4C] outline-none"
                      placeholder="Số điện thoại liên hệ"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Địa chỉ giao hàng</label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#1A2B4C] outline-none"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ghi chú (Tùy chọn)</label>
                    <textarea
                      name="note"
                      rows={2}
                      value={formData.note}
                      onChange={handleChange}
                      className="w-full bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#1A2B4C] outline-none"
                      placeholder="Yêu cầu khác..."
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-[#1A2B4C] text-[#E5C37A] rounded-full flex items-center justify-center font-black text-sm">2</div>
                  <h2 className="text-lg font-black text-[#1A2B4C] uppercase tracking-tight">Phương thức thanh toán</h2>
                </div>
                
                <div className="space-y-3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                  <label className="flex cursor-pointer items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-[#1A2B4C] transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#1A2B4C] focus:ring-[#1A2B4C]"
                    />
                    <div>
                      <span className="block text-sm font-black text-[#1A2B4C] uppercase tracking-tighter">Thanh toán khi nhận hàng (COD)</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Bạn chỉ trả tiền khi đã nhận và kiểm tra hàng</span>
                    </div>
                  </label>
                  <label className="flex cursor-pointer items-center gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-[#1A2B4C] transition-all">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === 'BANK_TRANSFER'}
                      onChange={handleChange}
                      className="h-4 w-4 text-[#1A2B4C] focus:ring-[#1A2B4C]"
                    />
                    <div>
                      <span className="block text-sm font-black text-[#1A2B4C] uppercase tracking-tighter">Chuyển khoản ngân hàng</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Chuyển khoản qua QR hoặc số tài khoản</span>
                    </div>
                  </label>
                </div>
              </section>
            </form>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-[2.5rem] bg-[#1A2B4C] p-8 lg:p-10 text-white shadow-2xl lg:sticky lg:top-32 border border-[#E5C37A]/20">
              <h2 className="text-xl font-black uppercase tracking-widest text-[#E5C37A] mb-8 border-b border-white/10 pb-4">Đơn hàng của bạn</h2>
              
              <ul className="mb-8 space-y-5 max-h-[30vh] overflow-y-auto pr-2 no-scrollbar">
                {checkoutItems.map((item) => (
                  <li key={item.productId} className="flex justify-between gap-6 items-start">
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-black text-white leading-snug line-clamp-2 uppercase tracking-tighter">{item.name}</div>
                      <div className="text-[10px] text-[#E5C37A] font-bold mt-1 uppercase tracking-widest">{item.quantity || 1} sản phẩm</div>
                    </div>
                    <span className="text-sm font-black text-white whitespace-nowrap">{formatVnd(item.price * (item.quantity || 1))}</span>
                  </li>
                ))}
              </ul>
              
              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Tạm tính</span>
                  <span className="text-white">{formatVnd(checkoutTotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <span>Giao hàng</span>
                  <span className="text-[#E5C37A]">Miễn phí</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-[10px] font-black text-[#E5C37A] uppercase tracking-[0.3em] pb-1">Tổng cộng</span>
                  <span className="text-4xl font-black text-[#E5C37A] tracking-tighter">{formatVnd(checkoutTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-xs font-bold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="mt-10 flex h-16 w-full items-center justify-center rounded-2xl bg-[#E5C37A] text-[#1A2B4C] text-lg font-black uppercase tracking-[0.1em] transition-all hover:bg-white hover:shadow-xl disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Đặt hàng ngay'}
              </button>
              
              <div className="mt-10 grid grid-cols-1 gap-3 pt-6 border-t border-white/5">
                {[
                  { icon: ShieldCheck, text: 'Bảo mật thông tin 100%' },
                  { icon: Truck, text: 'Giao hàng hỏa tốc 2h' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                    <item.icon className="h-4 w-4 text-[#E5C37A]" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-32 text-center text-slate-400 font-black uppercase tracking-widest animate-pulse">Đang tải...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
