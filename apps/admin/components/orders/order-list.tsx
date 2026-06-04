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
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase text-slate-500">Đơn #{order.id.slice(-6)}</p>
                <h3 className="mt-1 font-semibold text-slate-950">{order.customerName}</h3>
                <p className="text-sm text-slate-500">{order.phone}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-slate-500">Ngày</p>
                <p className="font-medium text-slate-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-slate-500">Tổng tiền</p>
                <p className="font-bold text-orange-600">{formatVnd(order.totalAmount)}</p>
              </div>
            </div>
            <select
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
              className="mt-4 h-11 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              {AVAILABLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusMap[status] || status}
                </option>
              ))}
            </select>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Mã ĐH</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Khách hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Ngày</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tổng cộng</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{order.id.slice(-6)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                  {order.customerName}
                  <div className="text-xs text-slate-500">{order.phone}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{formatVnd(order.totalAmount)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
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
      </div>
      {orders.length === 0 && (
        <div className="py-10 text-center text-slate-500">Không tìm thấy đơn hàng nào</div>
      )}
    </div>
  );
}
