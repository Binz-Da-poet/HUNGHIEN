import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShoppingCart, Store } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cửa hàng HUNG HIEN',
  description: 'Nền tảng thương mại điện tử cho Điện tử, Nội thất và Gia dụng',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center space-x-2">
              <Store className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">HUNG HIEN</span>
            </Link>
            
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-primary">Trang chủ</Link>
              <Link href="/products" className="transition-colors hover:text-primary">Sản phẩm</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/cart" className="relative flex items-center p-2 text-gray-600 transition-colors hover:text-primary">
                <ShoppingCart className="h-6 w-6" />
                {/* Cart badge will be injected here by a client component later */}
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-gray-50">
          {children}
        </main>

        <footer className="border-t bg-white py-6 md:py-0">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row px-4">
            <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
              Được xây dựng bởi HUNG HIEN. Mã nguồn có sẵn trên GitHub.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
