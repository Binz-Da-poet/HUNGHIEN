'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Store } from 'lucide-react';
import { useCart } from '@/store/use-cart';

export function SiteHeader() {
  const itemCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Store className="h-6 w-6 text-emerald-700" />
          <span className="text-base font-bold text-slate-950">HUNG HIEN</span>
        </Link>
        <form action="/" className="min-w-0 flex-1">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              name="search"
              placeholder="Tìm sản phẩm"
              className="h-10 w-full rounded-md border border-slate-300 pl-9 pr-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>
        </form>
        <Link
          href="/cart"
          className="relative inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          aria-label="Giỏ hàng"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs font-bold text-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
