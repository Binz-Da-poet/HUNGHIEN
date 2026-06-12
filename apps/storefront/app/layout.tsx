import './globals.css';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { ToastProvider } from '@/components/toast-provider';
import { SiteHeader } from '@/components/site-header';
import { MobileBottomNav } from '@/components/mobile-bottom-nav';
import { SiteFooter } from '@/components/site-footer';
import { getHomepage } from '@/lib/homepage';

const beVietnamPro = Be_Vietnam_Pro({ subsets: ['latin', 'vietnamese'], weight: ['300', '400', '500', '600', '700', '800'] });

export const metadata: Metadata = {
  title: 'Hùng Hiền Điện Máy | Mua sắm điện tử, gia dụng chính hãng',
  description: 'Hùng Hiền Điện Máy - Hệ thống bán lẻ điện tử, nội thất và gia dụng uy tín. Giao nhanh, giá rõ, bảo hành chính hãng.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const payload = await getHomepage();

  return (
    <html lang="vi">
      <body className={`${beVietnamPro.className} flex min-h-screen flex-col bg-[#f8f9fa] text-slate-950`}>
        <ToastProvider>
          <SiteHeader />
          <main className="flex-1 pb-20 lg:pb-0">{children}</main>
          <MobileBottomNav />
          <SiteFooter settings={payload.settings} />
        </ToastProvider>
      </body>
    </html>
  );
}
