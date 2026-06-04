import Link from 'next/link';
import {
  AlertTriangle,
  ListTree,
  PackagePlus,
  ShoppingCart,
} from 'lucide-react';

const shortcuts = [
  { label: 'Thêm sản phẩm', href: '/products/new', icon: PackagePlus },
  { label: 'Xem đơn hàng', href: '/orders', icon: ShoppingCart },
  { label: 'Quản lý danh mục', href: '/categories', icon: ListTree },
  { label: 'Kiểm tra tồn kho', href: '/products?stock=low', icon: AlertTriangle },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Tổng quan
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Truy cập nhanh các thao tác quản trị thường dùng trên điện thoại và máy tính.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50/40"
          >
            <span className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-md bg-slate-950 text-orange-400">
              <item.icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-slate-950">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
