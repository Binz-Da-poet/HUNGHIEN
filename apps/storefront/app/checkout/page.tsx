'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/store/use-cart';
import Link from 'next/link';
import { formatVnd } from '@/lib/format';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    note: '',
    paymentMethod: 'COD',
  });

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p>Giỏ hàng của bạn đang trống.</p>
        <Link href="/" className="mt-4 text-primary hover:underline">Về Trang chủ</Link>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      items: items.map(item => ({
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
        const errData = await res.json();
        throw new Error(errData.message || 'Thanh toán thất bại');
      }

      clearCart();
      router.push('/checkout/success');
    } catch (error: any) {
      console.error(error);
      alert(`Thanh toán thất bại: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Thanh toán</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">Thông tin giao hàng</h2>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tên</label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Địa chỉ giao hàng</label>
                <textarea
                  name="address"
                  required
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Ghi chú đơn hàng (Tùy chọn)</label>
                <textarea
                  name="note"
                  rows={2}
                  value={formData.note}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 border-b pb-2 mt-8 pt-4">Phương thức thanh toán</h2>
            <div>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="COD">Thanh toán khi nhận hàng (COD)</option>
                <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
              </select>
            </div>
          </form>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm sticky top-24">
            <h2 className="mb-4 text-lg font-bold text-gray-900 border-b pb-2">Tóm tắt đơn hàng</h2>
            
            <ul className="mb-4 max-h-60 overflow-y-auto divide-y text-sm">
              {items.map(item => (
                <li key={item.productId} className="py-2 flex justify-between">
                  <span className="text-gray-600 truncate pr-2">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">{formatVnd(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t pt-4 text-gray-600">
              <div className="flex justify-between font-bold text-gray-900 text-lg">
                <span>Tổng cộng</span>
                <span>{formatVnd(getTotal())}</span>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="mt-6 w-full rounded-md bg-accent px-4 py-3 font-bold text-white transition-colors hover:bg-accent/90 disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
