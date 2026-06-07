'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Search, Truck, Ban } from 'lucide-react';
import { OrderList, OrderListItem } from '@/components/orders/order-list';
import { adminFetch } from '@/lib/admin-api';

const STATUSES = ['', 'PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const;

const statusDisplayMap: Record<string, string> = {
  '': 'Tất cả trạng thái',
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPING: 'Đang giao',
  COMPLETED: 'Hoàn thành',
  CANCELLED: 'Đã hủy',
};

export default function OrdersPage() {
  const [data, setData] = useState<{ orders: OrderListItem[]; total: number }>({ orders: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      params.set('take', '50');

      const endpoint = `/admin/orders?${params.toString()}`;
      const result = await adminFetch(endpoint);
      setData({ orders: result.orders || [], total: result.total || 0 });
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải đơn hàng.');
      setData({ orders: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminFetch(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status: newStatus } : o)),
      }));
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái.');
    }
  };

  const handlePaymentStatusChange = async (id: string, newPaymentStatus: string) => {
    try {
      await adminFetch(`/admin/orders/${id}/payment-status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newPaymentStatus }),
      });

      setData((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, paymentStatus: newPaymentStatus } : o)),
      }));
    } catch (err) {
      console.error('Failed to update payment status:', err);
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái thanh toán.');
    }
  };

  const statusCounts = {
    PENDING: data.orders.filter((o) => o.status === 'PENDING').length,
    CONFIRMED: data.orders.filter((o) => o.status === 'CONFIRMED').length,
    SHIPPING: data.orders.filter((o) => o.status === 'SHIPPING').length,
    COMPLETED: data.orders.filter((o) => o.status === 'COMPLETED').length,
    CANCELLED: data.orders.filter((o) => o.status === 'CANCELLED').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Đơn hàng</h1>
        <p className="mt-2 text-sm text-slate-500">Tìm kiếm, lọc và cập nhật trạng thái đơn hàng.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: 'Chờ xác nhận', value: statusCounts.PENDING, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Đã xác nhận', value: statusCounts.CONFIRMED, icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700' },
          { label: 'Đang giao', value: statusCounts.SHIPPING, icon: Truck, tone: 'bg-purple-50 text-purple-700' },
          { label: 'Hoàn thành', value: statusCounts.COMPLETED, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Đã hủy', value: statusCounts.CANCELLED, icon: Ban, tone: 'bg-red-50 text-red-700' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500">{item.label}</p>
              <p className="mt-1 text-2xl font-extrabold text-slate-950">{item.value}</p>
            </div>
            <div className={`rounded-md p-2.5 ${item.tone}`}>
              <item.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn, khách hàng hoặc số điện thoại"
            className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{statusDisplayMap[s]}</option>
          ))}
        </select>
        <button type="submit" className="h-11 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors">
          Tìm
        </button>
      </form>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">Đang tải đơn hàng...</div>
      ) : (
        <OrderList
          orders={data.orders}
          onStatusChange={handleStatusChange}
          onPaymentStatusChange={handlePaymentStatusChange}
        />
      )}
    </div>
  );
}
