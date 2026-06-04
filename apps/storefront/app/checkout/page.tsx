'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/store/use-cart';
import Link from 'next/link';
import { formatVnd } from '@/lib/format';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const { items, buyNowItem, clearCart, clearBuyNowItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkoutItems = mode === 'buy-now' && buyNowItem ? [buyNowItem] : items;
  const checkoutTotal = checkoutItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  });

  if (checkoutItems.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <p className="text-slate-600">Giỏ hàng của bạn đang trống.</p>
        <Link href="/" className="mt-4 inline-block font-bold text-emerald-700 hover:underline">
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
        quantity: item.quantity,
      })),
    };

    try {
      const res = await fetch('http://localhost:3001/api/orders', {
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
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-950">Thông tin đặt hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-950">1. Người nhận hàng</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Họ và tên</label>
                  <input
                    type="text"
                    name="customerName"
                    required
                    value={formData.customerName}
                    onChange={handleChange}
                    className="mt-1 h-11 block w-full rounded-md border border-slate-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Nhập tên người nhận"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 h-11 block w-full rounded-md border border-slate-300 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Địa chỉ giao hàng</label>
                  <textarea
                    name="address"
                    required
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Ghi chú (Tùy chọn)</label>
                  <textarea
                    name="note"
                    rows={2}
                    value={formData.note}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Ghi chú thêm cho người giao hàng"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-lg font-bold text-slate-950">2. Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={formData.paymentMethod === 'COD'}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-900">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-md border border-slate-200 p-3 hover:bg-slate-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="BANK_TRANSFER"
                    checked={formData.paymentMethod === 'BANK_TRANSFER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-slate-900">Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </section>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h2 className="mb-5 text-lg font-bold text-slate-950">Tóm tắt đơn hàng</h2>
            <ul className="mb-6 space-y-3">
              {checkoutItems.map((item) => (
                <li key={item.productId} className="flex justify-between gap-4 text-sm">
                  <div className="flex-1 text-slate-600">
                    <span className="font-bold text-slate-950">{item.quantity}x</span> {item.name}
                  </div>
                  <span className="font-bold text-slate-950">{formatVnd(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-slate-950">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-orange-600">{formatVnd(checkoutTotal)}</span>
              </div>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-xs font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="mt-6 flex h-14 w-full items-center justify-center rounded-md bg-orange-600 text-lg font-bold text-white transition-colors hover:bg-orange-700 disabled:bg-slate-300"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
            </button>
            <p className="mt-4 text-center text-xs text-slate-500">
              Bằng cách nhấn Đặt hàng, bạn đồng ý với các điều khoản mua hàng của HUNG HIEN.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center">Đang tải...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
