'use client';

import React, { useState, useEffect } from 'react';
import { OrderList } from '@/components/orders/order-list';

const API_URL = 'http://localhost:3001/api/orders';
const AVAILABLE_STATUSES = ['ALL', 'PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async (status: string) => {
    setLoading(true);
    try {
      const url = status !== 'ALL' ? `${API_URL}?status=${status}` : API_URL;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
        throw new Error('Failed to update status');
      }

      // Optimistically update UI
      setOrders((prevOrders: any) =>
        prevOrders.map((order: any) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
      
      // If we are filtering by a specific status and it changed, we might want to refetch
      if (statusFilter !== 'ALL' && newStatus !== statusFilter) {
        fetchOrders(statusFilter);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Error updating order status. Check console for details.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
            Filter by:
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
          >
            {AVAILABLE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <OrderList orders={orders} onStatusChange={handleStatusChange} />
      )}
    </div>
  );
}
