'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/store/use-cart';
import { Trash2, Minus, Plus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h1>
        <p className="mb-8 text-gray-500">Có vẻ như bạn chưa thêm gì vào giỏ hàng.</p>
        <Link href="/" className="inline-flex rounded-md bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Giỏ hàng</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="rounded-xl border bg-white shadow-sm">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.productId} className="flex items-center gap-4 p-4 sm:p-6">
                  <div className="h-24 w-24 flex-shrink-0 rounded-md bg-gray-100 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Hình ảnh</span>
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between">
                      <Link href={`/products/${item.productId}`} className="font-semibold text-gray-900 hover:text-primary">
                        {item.name}
                      </Link>
                      <p className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-md border">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-red-500 transition-colors hover:text-red-700 p-2"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-gray-900">Tóm tắt đơn hàng</h2>
            
            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Phí giao hàng</span>
                <span>Được tính khi thanh toán</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold text-gray-900 text-lg">
                <span>Tổng cộng</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center space-x-2 rounded-md bg-accent px-4 py-3 font-bold text-white transition-colors hover:bg-accent/90"
            >
              <span>Thanh toán</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
