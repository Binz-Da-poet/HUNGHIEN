import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  ListTree, 
  ShoppingCart, 
  Settings,
  Menu
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Categories', href: '/categories', icon: ListTree },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <span className="text-xl font-bold text-orange-500">HUNG HIEN ADMIN</span>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors hover:bg-gray-800 hover:text-white"
            )}
          >
            <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-white" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
