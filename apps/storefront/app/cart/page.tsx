'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/store/use-cart';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { formatVnd } from '@/lib/format';
import { ProductImage } from '@/components/product-image';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-slate-950">Giỏ hàng đang trống</h1>
        <p className="mb-8 text-slate-500">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link
          href="/"
          className="inline-flex h-12 items-center rounded-md bg-emerald-700 px-8 font-bold text-white transition-colors hover:bg-emerald-800"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-32 lg:pb-8">
      <h1 className="mb-8 text-2xl font-bold text-slate-950">Giỏ hàng của bạn</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => (
            <article key={item.productId} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex gap-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-slate-100">
                  <ProductImage src={item.imageUrl} alt={item.name} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/products/${item.productId}`}
                      className="line-clamp-2 text-sm font-semibold text-slate-950 hover:text-emerald-700"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-400 hover:text-red-600"
                      aria-label="Xóa sản phẩm"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-bold text-orange-600">{formatVnd(item.price)}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-slate-200">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="flex h-10 w-10 items-center justify-center text-slate-500 hover:text-emerald-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="flex h-10 w-10 items-center justify-center text-slate-500 hover:text-emerald-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-950">{formatVnd(item.price * item.quantity)}</p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-slate-950">Tóm tắt đơn hàng</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Tạm tính</span>
                <span className="font-medium text-slate-950">{formatVnd(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Giao hàng</span>
                <span className="text-emerald-600 font-medium">Miễn phí</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-base font-bold text-slate-950">Tổng tiền</span>
                  <span className="text-xl font-bold text-orange-600">{formatVnd(getTotal())}</span>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-emerald-700 font-bold text-white transition-colors hover:bg-emerald-800"
            >
              Thanh toán ngay
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase">Tổng cộng</p>
            <p className="text-lg font-bold text-orange-600">{formatVnd(getTotal())}</p>
          </div>
          <Link
            href="/checkout"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-md bg-emerald-700 font-bold text-white"
          >
            Thanh toán
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
