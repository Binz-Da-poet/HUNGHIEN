'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  MapPin, 
  User, 
  LayoutGrid,
  FileText,
  Clock
} from 'lucide-react';
import { useCart } from '@/store/use-cart';

export function SiteHeader() {
  const itemCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="z-50 w-full flex flex-col">
      {/* Desktop Utility Bar */}
      <div className="hidden lg:block bg-[#1A2B4C] text-[#E5C37A] text-[11px] py-1.5 border-b border-[#E5C37A]/10">
        <div className="mx-auto max-w-7xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> Hotline: 1900 xxxx</span>
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Hệ thống cửa hàng</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Mở cửa: 08:00 - 21:30</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/news" className="hover:text-white transition-colors uppercase font-bold">Tin tức</Link>
            <Link href="/policy" className="hover:text-white transition-colors uppercase font-bold">Chính sách</Link>
            <Link href="/account" className="hover:text-white transition-colors uppercase font-bold flex items-center gap-1">
              <User className="h-3 w-3" /> Đăng nhập / Đăng ký
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="bg-[#1A2B4C] lg:bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 flex h-16 lg:h-20 items-center gap-4 lg:gap-8">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0" aria-label="Hùng Hiền Điện Máy">
            <Image
              src="/logo.png"
              alt="Hùng Hiền Điện Máy"
              width={160}
              height={54}
              className="h-10 lg:h-12 w-auto object-contain brightness-0 invert lg:brightness-100 lg:invert-0"
              priority
            />
          </Link>

          {/* Search Bar */}
          <form action="/" className="flex-1 min-w-0">
            <div className="relative group">
              <input
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Bạn muốn tìm gì hôm nay?"
                className="w-full h-10 lg:h-12 rounded-full lg:rounded-md border-0 lg:border border-slate-200 bg-white/10 lg:bg-slate-50 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-[#1A2B4C] transition-all text-white lg:text-slate-900 placeholder:text-slate-300 lg:placeholder:text-slate-400 outline-none"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 lg:text-slate-400 group-focus-within:text-[#1A2B4C]" />
              <button type="submit" className="hidden lg:block absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 bg-[#1A2B4C] text-[#E5C37A] text-xs font-bold rounded uppercase hover:bg-[#253A66] transition-colors">
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Cart & Actions (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/orders/tracking" className="flex items-center gap-2 text-slate-600 hover:text-[#1A2B4C] transition-colors">
              <div className="p-2.5 bg-slate-100 rounded-full"><FileText className="h-5 w-5" /></div>
              <div className="text-[10px] leading-tight font-bold uppercase whitespace-nowrap">Tra cứu<br />đơn hàng</div>
            </Link>
            <Link href="/cart" className="flex items-center gap-2 text-slate-600 hover:text-[#1A2B4C] transition-colors relative">
              <div className="p-2.5 bg-slate-100 rounded-full relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#D10024] text-[10px] font-bold text-white ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <div className="text-[10px] leading-tight font-bold uppercase whitespace-nowrap">Giỏ hàng<br />của bạn</div>
            </Link>
          </div>

          {/* Mobile Cart Button */}
          <Link href="/cart" className="lg:hidden relative p-2 text-white">
            <ShoppingCart className="h-6 w-6" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-1 ring-[#1A2B4C]">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Product Navigation Row (Desktop) */}
      <nav className="hidden lg:block bg-white border-b border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
        <div className="mx-auto max-w-7xl px-4 flex items-center h-12">
          <button className="flex items-center gap-2 px-4 h-full bg-[#1A2B4C] text-[#E5C37A] font-bold text-sm uppercase">
            <LayoutGrid className="h-4 w-4" /> Danh mục
          </button>
          <div className="flex items-center gap-1 ml-4 whitespace-nowrap">
            {['Tivi', 'Tủ lạnh', 'Máy giặt', 'Điều hòa', 'Gia dụng', 'Điện thoại', 'Laptop', 'Phụ kiện'].map(cat => (
              <Link key={cat} href={`/categories/${cat}`} className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#1A2B4C] hover:bg-slate-50 transition-colors uppercase tracking-tight">
                {cat}
              </Link>
            ))}
            <Link href="/deals" className="px-4 py-2 text-xs font-bold text-[#D10024] hover:bg-red-50 transition-colors uppercase tracking-tight flex items-center gap-1">
              🔥 Khuyến mãi hot
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
