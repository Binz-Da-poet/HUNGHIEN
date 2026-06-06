'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Boxes, PackageCheck, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProductTable } from '@/components/products/product-table';
import { API_BASE_URL } from '@/lib/api';

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  brand: string;
  stock: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  images?: any[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const router = useRouter();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Không thể tải sản phẩm.');
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          product.name.toLowerCase().includes(normalizedSearch) ||
          product.brand.toLowerCase().includes(normalizedSearch) ||
          product.category?.name.toLowerCase().includes(normalizedSearch);
        const matchesStock =
          stockFilter === 'ALL' ||
          (stockFilter === 'LOW' && product.stock <= 5) ||
          (stockFilter === 'OUT' && product.stock <= 0) ||
          (stockFilter === 'IN_STOCK' && product.stock > 0);
        return matchesSearch && matchesStock;
      }),
    [products, search, stockFilter]
  );

  const stats = {
    total: products.length,
    inStock: products.filter((product) => product.stock > 5).length,
    lowStock: products.filter((product) => product.stock > 0 && product.stock <= 5).length,
    outOfStock: products.filter((product) => product.stock <= 0).length,
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa sản phẩm thất bại.');
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error instanceof Error ? error.message : 'Xóa sản phẩm thất bại.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Sản phẩm</h1>
          <p className="mt-2 text-sm text-slate-500">Quản lý giá bán, tồn kho, hình ảnh và danh mục.</p>
        </div>
        <button
          onClick={() => router.push('/products/new')}
          className="inline-flex h-11 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng sản phẩm', value: stats.total, icon: Boxes, tone: 'bg-slate-100 text-slate-700' },
          { label: 'Còn hàng', value: stats.inStock, icon: PackageCheck, tone: 'bg-emerald-50 text-emerald-700' },
          { label: 'Sắp hết hàng', value: stats.lowStock, icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700' },
          { label: 'Hết hàng', value: stats.outOfStock, icon: AlertTriangle, tone: 'bg-red-50 text-red-700' },
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
            placeholder="Tìm theo tên, thương hiệu hoặc danh mục"
            className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
        <select
          value={stockFilter}
          onChange={(event) => setStockFilter(event.target.value)}
          className="h-11 rounded-md border border-slate-300 px-3 text-sm font-medium focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
        >
          <option value="ALL">Tất cả tồn kho</option>
          <option value="IN_STOCK">Còn hàng</option>
          <option value="LOW">Sắp hết hàng</option>
          <option value="OUT">Hết hàng</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">Đang tải sản phẩm...</div>
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={(product) => router.push(`/products/${product.id}/edit`)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
