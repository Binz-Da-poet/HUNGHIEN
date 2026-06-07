'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { trackOrder } from '@/lib/orders';
import { PublicOrderSummary } from '@repo/shared';
import { OrderStatus as OrderStatusComponent } from '@/components/order-status';

export function TrackingForm() {
  const [publicCode, setPublicCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<PublicOrderSummary | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOrder(null);
    setLoading(true);

    try {
      const result = await trackOrder({ publicCode: publicCode.trim(), phone: phone.trim() });
      setOrder(result);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h2 className="text-lg font-bold text-slate-800 text-center">Nhập thông tin đơn hàng</h2>

        <div>
          <label htmlFor="code" className="block text-sm font-medium text-slate-600 mb-1">Mã đơn hàng</label>
          <input
            id="code" type="text" required
            value={publicCode} onChange={(e) => setPublicCode(e.target.value)}
            placeholder="VD: HHABCDEF1234"
            className="w-full h-11 rounded-lg border border-slate-300 px-4 text-sm focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Số điện thoại</label>
          <input
            id="phone" type="tel" required
            value={phone} onChange={(e) => setPhone(e.target.value)}
            placeholder="VD: 0912345678"
            className="w-full h-11 rounded-lg border border-slate-300 px-4 text-sm focus:ring-2 focus:ring-[#1A2B4C] focus:border-transparent outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#1A2B4C] text-[#E5C37A] font-bold text-sm rounded-lg hover:bg-[#253A66] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? 'Đang tra cứu...' : 'Tra cứu đơn hàng'}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </form>

      {order && (
        <div className="mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <OrderStatusComponent order={order} />
        </div>
      )}
    </div>
  );
}
