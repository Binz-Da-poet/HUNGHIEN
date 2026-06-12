'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreSettings } from '@/lib/homepage';
import { Facebook, Youtube, Send, Mail, Phone, ArrowRight } from 'lucide-react';

export function SiteFooter({ settings }: { settings: StoreSettings | null }) {
  const s = settings ?? {} as StoreSettings;
  return (
    <footer className="bg-brand-primary text-white pt-20 pb-28 lg:pb-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-16">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="block">
              <Image
                src="/logo.png"
                alt="Hùng Hiền Điện Máy"
                width={160}
                height={54}
                className="brightness-0 invert h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed max-w-xs">
              {s.companySummary || 'Hùng Hiền Điện Máy - Hệ thống mua sắm điện tử, nội thất và gia dụng chính hãng uy tín hàng đầu.'}
            </p>
            <div className="flex gap-3">
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Facebook className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Youtube className="h-4 w-4" />
              </Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-brand-accent hover:text-brand-primary transition-all border border-white/10">
                <Send className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-brand-accent font-semibold text-sm mb-4">
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-3">
              <li><Link href="/news" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Tin tức công nghệ</Link></li>
              <li><Link href="/policy/warranty" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="/policy/delivery" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="/policy/payment" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Phương thức thanh toán</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-300 hover:text-brand-accent transition-colors">Liên hệ góp ý</Link></li>
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div className="space-y-6">
            <h4 className="text-brand-accent font-semibold text-sm mb-4">
              Đăng ký nhận tin
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              Nhận thông tin khuyến mãi và sản phẩm mới.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex-1 h-10 rounded-input border border-white/20 bg-white/5 px-4 text-sm text-white placeholder:text-slate-400 outline-none focus:border-brand-accent/50 focus:bg-white/10 transition-all"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-brand-accent text-brand-primary rounded-input font-semibold text-sm hover:bg-white transition-colors flex items-center gap-1"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <div className="pt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Phone className="h-4 w-4 text-brand-accent flex-shrink-0" />
                <span>{s.hotline || '1900 xxxx'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-brand-accent flex-shrink-0" />
                <span>{s.email || 'contact@hunghien.vn'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Hùng Hiền Điện Máy. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-slate-300 transition-colors">Quyền riêng tư</Link>
            <Link href="#" className="hover:text-slate-300 transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
