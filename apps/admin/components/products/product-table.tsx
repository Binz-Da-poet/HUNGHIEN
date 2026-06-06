import React from 'react';
import { Edit, ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatVnd } from '@/lib/format';
import { ProductImage } from './product-image-manager';
import { UPLOAD_BASE_URL } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number | null;
  brand: string;
  stock: number;
  categoryId: string;
  category?: { id: string; name: string; slug: string } | null;
  images?: ProductImage[];
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

function getImageUrl(url: string) {
  return url.startsWith('http') ? url : `${UPLOAD_BASE_URL}${url}`;
}

function getStockBadge(stock: number) {
  if (stock <= 0) return { label: 'Hết hàng', className: 'bg-red-50 text-red-700' };
  if (stock <= 5) return { label: `Còn ${stock}`, className: 'bg-amber-50 text-amber-700' };
  return { label: stock.toString(), className: 'bg-emerald-50 text-emerald-700' };
}

function Thumbnail({ product }: { product: Product }) {
  const url = product.images?.[0]?.url;

  if (!url || url.includes('picsum.photos')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
        <ImageIcon className="h-4 w-4" />
      </div>
    );
  }

  return <Image src={getImageUrl(url)} alt={product.name} width={96} height={96} unoptimized className="h-full w-full object-cover" />;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white py-14 text-center text-slate-500">
        Không tìm thấy sản phẩm phù hợp.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {products.map((product) => {
          const stockBadge = getStockBadge(product.stock);
          return (
            <article key={product.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-3">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-100">
                  <Thumbnail product={product} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase text-orange-600">{product.brand}</p>
                  <h3 className="mt-1 line-clamp-2 font-bold text-slate-950">{product.name}</h3>
                  <p className="mt-1 text-sm font-extrabold text-slate-950">{formatVnd(product.price)}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className={`rounded-md px-2 py-1 text-xs font-bold ${stockBadge.className}`}>{stockBadge.label}</span>
                    {product.category?.name && (
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{product.category.name}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 text-sm font-bold text-blue-700"
                >
                  <Edit className="h-4 w-4" />
                  Sửa
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-red-200 text-sm font-bold text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Sản phẩm</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Danh mục</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Giá</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Tồn kho</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => {
              const stockBadge = getStockBadge(product.stock);
              return (
                <tr key={product.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-slate-100">
                        <Thumbnail product={product} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{product.name}</p>
                        <p className="mt-1 text-xs font-semibold uppercase text-slate-500">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">{product.category?.name ?? 'Chưa phân loại'}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-950">{formatVnd(product.price)}</td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className={`rounded-md px-2.5 py-1 text-xs font-bold ${stockBadge.className}`}>{stockBadge.label}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-blue-700 hover:bg-blue-50"
                        aria-label="Sửa sản phẩm"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-red-700 hover:bg-red-50"
                        aria-label="Xóa sản phẩm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
