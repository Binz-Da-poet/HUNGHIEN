'use client';

import React, { useState, useEffect } from 'react';
import { OrderList } from '@/components/orders/order-list';

const API_URL = 'http://localhost:3001/api/orders';
const AVAILABLE_STATUSES = ['ALL', 'PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'];

const statusDisplayMap: Record<string, string> = {
  ALL: 'Tất cả trạng thái',
  PENDING: 'Chờ xử lý',
  SHIPPING: 'Đang giao',
  SUCCESS: 'Thành công',
  CANCELLED: 'Đã hủy',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (status: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = status !== 'ALL' ? `${API_URL}?status=${status}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tải dữ liệu đơn hàng.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || 'Không thể cập nhật trạng thái.');
      }

      setOrders((prevOrders: any) =>
        prevOrders.map((order: any) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
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
      <div className="grid gap-3 sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Đơn hàng</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="status-filter" className="hidden text-sm font-medium text-slate-700 sm:block">
            Lọc theo:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 sm:w-auto"
          >
            {AVAILABLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {statusDisplayMap[status] || status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Đang tải...</div>
      ) : (
        <OrderList orders={orders} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
