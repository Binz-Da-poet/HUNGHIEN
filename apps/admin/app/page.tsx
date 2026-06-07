'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Boxes, CircleDollarSign, Clock3, PackageCheck, ShoppingCart } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { formatVnd } from '@/lib/format';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';

interface DashboardProduct {
  id: string;
  name: string;
  stock: number;
  price: number | string;
}

interface DashboardOrder {
  id: string;
  customerName: string;
  phone: string;
  totalAmount: number | string;
  status: string;
  createdAt: string;
}

interface DashboardCategory {
  id: string;
  name: string;
}

export default function DashboardPage() {
  const [products, setProducts] = useState<DashboardProduct[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [categories, setCategories] = useState<DashboardCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [productsData, ordersData, categoriesData] = await Promise.all([
          adminFetch('/products').catch(() => []),
          adminFetch('/orders?take=8').catch(() => []),
          adminFetch('/categories').catch(() => []),
        ]);

        setProducts(Array.isArray(productsData) ? productsData : []);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const revenue = orders
      .filter((order) => order.status !== 'CANCELLED')
      .reduce((total, order) => total + Number(order.totalAmount), 0);
    return {
      revenue,
      pendingOrders: orders.filter((order) => order.status === 'PENDING').length,
      lowStock: products.filter((product) => product.stock <= 5).length,
      inStock: products.filter((product) => product.stock > 0).length,
    };
  }, [orders, products]);

  const lowStockProducts = products.filter((product) => product.stock <= 5).slice(0, 5);

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Doanh thu đơn hiện có', value: formatVnd(metrics.revenue), detail: `${orders.length} đơn gần nhất`, icon: CircleDollarSign, tone: 'text-emerald-700 bg-emerald-50' },
          { label: 'Đơn chờ xử lý', value: metrics.pendingOrders.toString(), detail: 'Cần xác nhận sớm', icon: Clock3, tone: 'text-amber-700 bg-amber-50' },
          { label: 'Sản phẩm còn hàng', value: metrics.inStock.toString(), detail: `${categories.length} danh mục`, icon: PackageCheck, tone: 'text-sky-700 bg-sky-50' },
          { label: 'Sắp hết hàng', value: metrics.lowStock.toString(), detail: 'Tồn kho từ 5 trở xuống', icon: AlertTriangle, tone: 'text-red-700 bg-red-50' },
        ].map((item) => (
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
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{order.customerName}</p>
                  <p className="mt-1 text-xs text-slate-500">#{order.id.slice(-6)} · {order.phone}</p>
                </div>
                <OrderStatusBadge status={order.status} />
                <p className="text-sm font-extrabold text-slate-950">{formatVnd(order.totalAmount)}</p>
              </div>
            ))}
            {!loading && orders.length === 0 && <div className="px-5 py-10 text-center text-sm text-slate-500">Chưa có đơn hàng.</div>}
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
            {lowStockProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatVnd(product.price)}</p>
                </div>
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">Còn {product.stock}</span>
              </div>
            ))}
            {!loading && lowStockProducts.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">Tồn kho đang ổn định.</div>
            )}
          </div>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border-t border-slate-200 px-5 py-4 text-sm font-bold text-orange-700 hover:bg-orange-50"
          >
            Quản lý sản phẩm
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
