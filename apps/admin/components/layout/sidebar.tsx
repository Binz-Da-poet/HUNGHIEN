'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BarChart3, 
  LayoutDashboard, 
  ListTree, 
  Menu, 
  Package, 
  ShoppingCart, 
  X, 
  Image as ImageIcon, 
  Layout, 
  Star, 
  Award, 
  ShieldCheck, 
  Store,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-api';
import { useRouter } from 'next/navigation';

const mainItems = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Danh mục', href: '/categories', icon: ListTree },
  { name: 'Sản phẩm', href: '/products', icon: Package },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
];

const cmsItems = [
  { name: 'Banner', href: '/banners', icon: ImageIcon },
  { name: 'Bố cục trang chủ', href: '/homepage-layout', icon: Layout },
  { name: 'Nhóm sản phẩm nổi bật', href: '/product-groups', icon: Star },
  { name: 'Thương hiệu', href: '/brands', icon: Award },
  { name: 'Cam kết dịch vụ', href: '/benefits', icon: ShieldCheck },
  { name: 'Thông tin cửa hàng', href: '/store-settings', icon: Store },
];

function LogoBlock() {
  return (
    <Link href="/" className="inline-flex rounded-md bg-white px-3 py-2 shadow-sm" aria-label="Hùng Hiền Admin">
      <Image
        src="/logo.png"
        alt="Hùng Hiền Điện Máy"
        width={166}
        height={58}
        className="h-12 w-auto object-contain"
        priority
      />
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await adminFetch('/auth/admin/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const renderItems = (items: typeof mainItems, title?: string) => (
    <div className="space-y-1 px-3 py-2">
      {title && <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</p>}
      {items.map((item) => {
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center rounded-md px-3 py-2 text-sm font-bold transition',
              isActive
                ? 'bg-orange-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </div>
  );

  return (
    <nav className="flex-1 overflow-y-auto">
      {renderItems(mainItems, 'Quản lý bán hàng')}
      <div className="my-2 border-t border-slate-800" />
      {renderItems(cmsItems, 'Quản lý trang chủ')}
      <div className="mt-auto px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="group flex w-full items-center rounded-md px-3 py-2 text-sm font-bold text-slate-300 hover:bg-red-900/20 hover:text-red-400 transition"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-red-400" />
          Đăng xuất
        </button>
      </div>
    </nav>
  );
}

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Image src="/logo.png" alt="Hùng Hiền Điện Máy" width={132} height={44} className="h-10 w-auto object-contain" />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-700"
          aria-label="Mở menu quản trị"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <aside className="hidden h-screen w-72 flex-shrink-0 flex-col bg-slate-950 text-white lg:sticky lg:top-0 lg:flex">
        <div className="border-b border-slate-800 px-5 py-5">
          <LogoBlock />
          <div className="mt-4 flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300">
            <BarChart3 className="h-4 w-4 text-orange-400" />
            Bảng điều khiển bán hàng
          </div>
        </div>
        <NavLinks />
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Đóng menu"
            onClick={() => setIsOpen(false)}
          />
          <aside className="relative flex h-full w-80 max-w-[86vw] flex-col bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <LogoBlock />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 text-slate-200"
                aria-label="Đóng menu quản trị"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setIsOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
