'use client';

import React from 'react';
import { OrderStatusBadge } from './order-status-badge';
import { formatVnd } from '@/lib/format';

interface Order {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: string | number;
  status: string;
  createdAt: string;
}

interface OrderListProps {
  orders: Order[];
  onStatusChange: (id: string, newStatus: string) => void;
}

const AVAILABLE_STATUSES = ['PENDING', 'SHIPPING', 'SUCCESS', 'CANCELLED'];

const statusMap: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  SHIPPING: 'Đang giao',
  SUCCESS: 'Thành công',
  CANCELLED: 'Đã hủy',
};

export function OrderList({ orders, onStatusChange }: OrderListProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Mã ĐH</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Khách hàng</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Ngày</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tổng cộng</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Trạng thái</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Cập nhật Trạng thái</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{order.id.slice(-6)}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {order.customerName}
                <div className="text-xs text-gray-500">{order.phone}</div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                {formatVnd(order.totalAmount)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <select
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  className="rounded-md border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-orange-500"
                >
                  {AVAILABLE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {statusMap[status] || status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="py-10 text-center text-gray-500">Không tìm thấy đơn hàng nào</div>
      )}
    </div>
  );
}
