'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock3, Search, Truck, XCircle } from 'lucide-react';
import { OrderList, OrderListItem } from '@/components/orders/order-list';
import { adminFetch } from '@/lib/admin-api';

const AVAILABLE_STATUSES = ['ALL', 'PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'];

const statusDisplayMap: Record<string, string> = {
  ALL: 'Tất cả trạng thái',
  PENDING: 'Chờ xử lý',
  SHIPPING: 'Đang giao',
  SUCCESS: 'Thành công',
  CANCELLED: 'Đã hủy',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = status !== 'ALL' ? `/orders?status=${status}&take=50` : `/orders?take=50`;
      const data = await adminFetch(endpoint);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải đơn hàng.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return orders;
    return orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(normalized) ||
        order.phone.toLowerCase().includes(normalized) ||
        order.id.toLowerCase().includes(normalized)
    );
  }, [orders, search]);

  const statusCounts = {
    PENDING: orders.filter((order) => order.status === 'PENDING').length,
    SHIPPING: orders.filter((order) => order.status === 'SHIPPING').length,
    SUCCESS: orders.filter((order) => order.status === 'SUCCESS').length,
    CANCELLED: orders.filter((order) => order.status === 'CANCELLED').length,
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminFetch(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });

      setOrders((previousOrders) =>
        previousOrders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
      );

      if (statusFilter !== 'ALL' && newStatus !== statusFilter) {
        fetchOrders(statusFilter);
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái đơn hàng.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">Đơn hàng</h1>
        <p className="mt-2 text-sm text-slate-500">Tìm kiếm, lọc và cập nhật trạng thái giao hàng.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Chờ xử lý', value: statusCounts.PENDING, icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Đang giao', value: statusCounts.SHIPPING, icon: Truck, tone: 'bg-sky-50 text-sky-700' },
          { label: 'Thành công', value: statusCounts.SUCCESS, icon: CheckCircle2, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Đã hủy', value: statusCounts.CANCELLED, icon: XCircle, tone: 'bg-red-50 text-red-700' },
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

      <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm mã đơn, khách hàng hoặc số điện thoại"
            className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          {AVAILABLE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusDisplayMap[status]}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">Đang tải đơn hàng...</div>
      ) : (
        <OrderList orders={filteredOrders} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
