'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Boxes, CircleDollarSign, Clock3, PackageCheck } from 'lucide-react';
import { getDashboard, DashboardSummary } from '@/lib/dashboard';
import { formatVnd } from '@/lib/format';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const metrics = data
    ? [
        { label: 'Doanh thu (đã TT)', value: formatVnd(data.paidRevenue), detail: 'Chỉ PAID', icon: CircleDollarSign, tone: 'text-emerald-700 bg-emerald-50' },
        { label: 'Đơn chờ xử lý', value: data.pendingOrders.toString(), detail: 'Cần xác nhận sớm', icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
        { label: 'Sản phẩm đang bán', value: data.activeProducts.toString(), detail: `${data.totalProducts} tổng`, icon: PackageCheck, tone: 'text-sky-700 bg-sky-50' },
        { label: 'Sắp hết hàng', value: data.lowStockProducts.toString(), detail: 'Tồn kho ≤ 5', icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
      ]
    : [];

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-orange-600">Hùng Hiền Điện Máy</p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Tổng quan vận hành</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi đơn hàng, doanh thu và tồn kho cần xử lý.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex h-11 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          Thêm sản phẩm
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((item) => (
          <article key={item.label} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-slate-950">{loading ? '...' : item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </div>
              <div className={`rounded-md p-2.5 ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">Đơn hàng gần đây</h2>
              <p className="mt-1 text-xs text-slate-500">Ưu tiên kiểm tra đơn chờ xử lý và đang giao.</p>
            </div>
            <Link href="/orders" className="text-sm font-bold text-orange-700 hover:underline">
              Xem tất cả
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {data?.recentOrders.map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{order.customerName}</p>
                  <p className="mt-1 text-xs text-slate-500">{order.publicCode} · {order.phone}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <p className="text-sm font-extrabold text-slate-950">{formatVnd(order.totalAmount)}</p>
              </div>
            ))}
            {!loading && (!data || data.recentOrders.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Chưa có đơn hàng.</div>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-extrabold text-slate-950">Cảnh báo tồn kho</h2>
              <p className="mt-1 text-xs text-slate-500">Các sản phẩm nên bổ sung sớm.</p>
            </div>
            <Boxes className="h-5 w-5 text-orange-600" />
          </div>
          <div className="divide-y divide-slate-100">
            {data?.lowStockItems.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatVnd(product.price)}</p>
                </div>
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Còn {product.stock}</span>
              </div>
            ))}
            {!loading && (!data || data.lowStockItems.length === 0) && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Tồn kho đang ổn định.</div>
            )}
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-4 text-sm font-bold text-orange-700 hover:bg-orange-50"
          >
            Quản lý sản phẩm
            <Boxes className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
