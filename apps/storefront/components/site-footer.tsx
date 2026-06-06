'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StoreSettings } from '@/lib/homepage';
import { Facebook, Youtube, Send, Mail, MapPin, Phone } from 'lucide-react';

export function SiteFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="bg-[#1A2B4C] text-white pt-16 pb-24 lg:pb-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div className="space-y-6">
            <Link href="/" className="block">
              <Image 
                src="/logo.png" 
                alt="Hùng Hiền Điện Máy" 
                width={160} 
                height={54} 
                className="brightness-0 invert h-12 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed">
              {settings.companySummary || 'Hùng Hiền Điện Máy - Hệ thống mua sắm điện tử, nội thất và gia dụng chính hãng uy tín hàng đầu.'}
            </p>
            <div className="flex gap-4">
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-[#E5C37A] hover:text-[#1A2B4C] transition-all border border-white/10"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-[#E5C37A] hover:text-[#1A2B4C] transition-all border border-white/10"><Youtube className="h-5 w-5" /></Link>
              <Link href="#" className="p-2.5 bg-white/5 rounded-full hover:bg-[#E5C37A] hover:text-[#1A2B4C] transition-all border border-white/10"><Send className="h-5 w-5" /></Link>
            </div>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-[#E5C37A] font-black uppercase tracking-wider mb-8 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#E5C37A]"></span>
              Hỗ trợ khách hàng
            </h4>
            <ul className="space-y-4 text-[11px] font-black uppercase tracking-tighter text-slate-200">
              <li><Link href="/news" className="hover:text-[#E5C37A] transition-colors">Tin tức công nghệ</Link></li>
              <li><Link href="/policy/warranty" className="hover:text-[#E5C37A] transition-colors">Chính sách bảo hành</Link></li>
              <li><Link href="/policy/delivery" className="hover:text-[#E5C37A] transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="/policy/payment" className="hover:text-[#E5C37A] transition-colors">Phương thức thanh toán</Link></li>
              <li><Link href="/contact" className="hover:text-[#E5C37A] transition-colors">Liên hệ góp ý</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[#E5C37A] font-black uppercase tracking-wider mb-8 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#E5C37A]"></span>
              Thông tin liên hệ
            </h4>
            <ul className="space-y-6 text-sm font-medium">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#E5C37A] flex-shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-snug">{settings.address || 'Đang cập nhật địa chỉ...'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-[#E5C37A] flex-shrink-0" />
                <span className="text-[#E5C37A] font-black text-xl tracking-tighter">{settings.hotline || '1900 xxxx'}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-[#E5C37A] flex-shrink-0" />
                <span className="text-slate-300">{settings.email || 'contact@hunghien.vn'}</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#E5C37A] font-black uppercase tracking-wider mb-8 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#E5C37A]"></span>
              Đăng ký nhận tin
            </h4>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              {settings.newsletterCopy || 'Nhận ngay thông tin khuyến mãi mới nhất và ưu đãi đặc quyền từ Hùng Hiền.'}
            </p>
            <form className="relative group">
              <input 
                type="email" 
                placeholder="Email của bạn..." 
                className="w-full bg-white/5 border border-white/10 rounded-md py-3.5 pl-4 pr-12 text-sm focus:bg-white focus:text-[#1A2B4C] focus:outline-none transition-all placeholder:text-slate-500"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-[#1A2B4C] bg-[#E5C37A] rounded hover:bg-white transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          <p>© 2026 HÙNG HIỀN ĐIỆN MÁY. POWERED BY SMART ECOMMERCE.</p>
          <div className="flex items-center gap-8">
             <Link href="#" className="hover:text-white transition-colors">Quyền riêng tư</Link>
             <Link href="#" className="hover:text-white transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
