'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatVnd } from '@/lib/format';
import { ProductImage } from './product-image-manager';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: ProductImage[];
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {products.map((product) => (
          <article key={product.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-slate-100">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">Ảnh</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-semibold text-slate-950">{product.name}</h3>
                <p className="mt-1 text-sm font-bold text-orange-600">{formatVnd(product.price)}</p>
                <p className="text-xs text-slate-500">Tồn kho: {product.stock}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-blue-600"
                aria-label="Sửa sản phẩm"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(product.id)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-red-600"
                aria-label="Xóa sản phẩm"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Giá</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tồn kho</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{product.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{formatVnd(product.price)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.stock}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => onEdit(product)} className="mr-3 text-blue-600 hover:text-blue-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(product.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
