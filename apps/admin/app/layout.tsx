import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AdminShell } from '@/components/layout/admin-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hung Hien Admin',
  description: 'Bảng điều khiển quản trị HUNG HIEN',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
