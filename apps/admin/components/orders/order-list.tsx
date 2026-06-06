'use client';

import React from 'react';
import { CalendarDays, MapPin, Phone, ShoppingBag } from 'lucide-react';
import { OrderStatusBadge } from './order-status-badge';
import { formatVnd } from '@/lib/format';

export interface OrderListItem {
  id: string;
  customerName: string;
  phone: string;
  address?: string;
  totalAmount: string | number;
  status: string;
  createdAt: string;
  paymentMethod?: string;
  items?: { id: string; quantity: number }[];
}

interface OrderListProps {
  orders: OrderListItem[];
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
  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white py-14 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 font-bold text-slate-950">Không tìm thấy đơn hàng</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi từ khóa hoặc trạng thái lọc.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase text-slate-500">Đơn #{order.id.slice(-6)}</p>
                <h3 className="mt-1 truncate font-bold text-slate-950">{order.customerName}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500">
                  <Phone className="h-3.5 w-3.5" />
                  {order.phone}
                </p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-md bg-slate-50 p-3 text-sm">
              <div>
                <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Ngày đặt
                </p>
                <p className="mt-1 font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Tổng tiền</p>
                <p className="mt-1 font-extrabold text-orange-600">{formatVnd(order.totalAmount)}</p>
              </div>
            </div>

            {order.address && (
              <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                {order.address}
              </p>
            )}

            <select
              value={order.status}
              onChange={(event) => onStatusChange(order.id, event.target.value)}
              className="mt-4 h-11 w-full rounded-md border border-slate-300 px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              aria-label={`Cập nhật trạng thái đơn ${order.id.slice(-6)}`}
            >
              {AVAILABLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {statusMap[status]}
                </option>
              ))}
            </select>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Mã đơn</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Khách hàng</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Ngày đặt</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Tổng tiền</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Trạng thái</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Cập nhật</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-600">#{order.id.slice(-6)}</td>
                <td className="px-5 py-4 text-sm text-slate-900">
                  <p className="font-bold">{order.customerName}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.phone}</p>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                  {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm font-extrabold text-slate-950">{formatVnd(order.totalAmount)}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <OrderStatusBadge status={order.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <select
                    value={order.status}
                    onChange={(event) => onStatusChange(order.id, event.target.value)}
                    className="h-9 rounded-md border border-slate-300 px-2 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    aria-label={`Cập nhật trạng thái đơn ${order.id.slice(-6)}`}
                  >
                    {AVAILABLE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {statusMap[status]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
