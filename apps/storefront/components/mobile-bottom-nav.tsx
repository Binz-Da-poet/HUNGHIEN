'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/store/use-cart';

export function MobileBottomNav() {
  const pathname = usePathname();
  const cartItemsCount = useCart((state) => state.items.length);

  const navItems = [
    { name: 'Trang chủ', href: '/', icon: Home },
    { name: 'Danh mục', href: '/categories', icon: LayoutGrid },
    { name: 'Giỏ hàng', href: '/cart', icon: ShoppingBag, badge: cartItemsCount },
    { name: 'Thông báo', href: '/notifications', icon: Bell },
    { name: 'Tài khoản', href: '/account', icon: User },
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
              'relative flex flex-col items-center gap-1 p-2 transition-colors',
              isActive ? 'text-[#1A2B4C]' : 'text-slate-500 hover:text-[#1A2B4C]'
            )}
          >
            <Icon className={cn('h-5 w-5', isActive && 'fill-current opacity-90')} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="absolute right-3 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white animate-in zoom-in">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
