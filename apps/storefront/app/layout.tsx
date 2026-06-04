import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/toast-provider';
import { SiteHeader } from '@/components/site-header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cửa hàng HUNG HIEN',
  description: 'Mua sắm điện tử, nội thất và gia dụng tại HUNG HIEN.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${inter.className} flex min-h-screen flex-col bg-slate-50 text-slate-950`}>
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
            <div className="mx-auto max-w-7xl">
              HUNG HIEN - Mua sắm điện tử, nội thất và gia dụng.
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
