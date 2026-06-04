import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  onNavigate?: () => void;
}

const navItems = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Danh mục', href: '/categories', icon: ListTree },
  { name: 'Sản phẩm', href: '/products', icon: Package },
  { name: 'Đơn hàng', href: '/orders', icon: ShoppingCart },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <span className="text-base font-bold text-orange-400">HUNG HIEN ADMIN</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
            className="group flex items-center rounded-md px-3 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-white" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
