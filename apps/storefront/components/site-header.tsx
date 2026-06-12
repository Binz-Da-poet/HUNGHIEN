'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/store/use-cart';
import { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export function SiteHeader() {
  const itemCount = useCart((state) => state.items.reduce((total, item) => total + item.quantity, 0));
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/60'
          : 'bg-white border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-7xl px-4 flex h-16 items-center gap-4 lg:gap-8">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Hùng Hiền Điện Máy">
          <Image
            src="/logo.png"
            alt="Hùng Hiền Điện Máy"
            width={160}
            height={54}
            className={cn(
              'h-9 lg:h-11 w-auto object-contain transition-all duration-300',
              scrolled ? 'lg:h-9' : 'lg:h-11'
            )}
            priority
          />
        </Link>

        {/* Danh mục dropdown (Desktop) */}
        <div className="hidden lg:block relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 px-4 h-10 rounded-button bg-brand-primary text-brand-accent font-semibold text-sm hover:bg-brand-primary/90 transition-colors"
          >
            <Menu className="h-4 w-4" /> Danh mục
            <ChevronDown className={cn('h-3 w-3 transition-transform', menuOpen && 'rotate-180')} />
          </button>
          {menuOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-surface rounded-card shadow-elevated border border-border py-2 z-50">
              {categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-text-primary hover:bg-slate-50 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <div className="border-t border-border mt-1 pt-1">
                <Link
                  href="/deals"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-semibold text-brand-danger hover:bg-red-50 transition-colors"
                >
                  Khuyến mãi hot
                </Link>
              </div>
            </div>
          )}
          {/* Overlay to close menu */}
          {menuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          )}
        </div>

        {/* Search Bar */}
        <form action="/" className="flex-1 min-w-0">
          <div className="relative">
            <input
              name="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-10 rounded-input border border-border bg-slate-50 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-text-primary placeholder:text-text-tertiary outline-none"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
            <button
              type="submit"
              className="hidden lg:block absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-4 bg-brand-primary text-brand-accent text-xs font-semibold rounded-input hover:bg-brand-primary/90 transition-colors"
            >
              Tìm
            </button>
          </div>
        </form>

        {/* Cart (Desktop) */}
        <Link
          href="/cart"
          className="hidden lg:flex items-center gap-2 text-text-secondary hover:text-brand-primary transition-colors relative"
        >
          <div className="p-2 rounded-full relative">
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-2 ring-white">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium hidden xl:inline">Giỏ hàng</span>
        </Link>

        {/* Mobile Cart */}
        <Link href="/cart" className="lg:hidden relative p-2">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-danger text-[10px] font-bold text-white ring-1 ring-white">
              {itemCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
