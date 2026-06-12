'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, FileText, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/use-cart';

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemsCount = useCart((state) => state.items.length);

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Danh mục', href: '/categories', icon: LayoutGrid },
    { name: 'Giỏ hàng', href: '/cart', icon: ShoppingBag, badge: cartItemsCount },
    { name: 'Đơn hàng', href: '/orders/tracking', icon: FileText },
    { name: 'Thêm', href: '/contact', icon: Menu },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white px-2 lg:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'relative flex flex-col items-center gap-1 p-2 transition-colors rounded-lg focus-visible:ring-2 focus-visible:ring-brand-primary/20 focus-visible:outline-none',
              isActive ? 'text-brand-primary' : 'text-slate-500 hover:text-brand-primary'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'fill-current opacity-90')} />
            <span className="text-[10px] font-medium tracking-tight">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute right-3 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-danger text-[9px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
