'use client';

import React from 'react';
import { ShieldCheck, Truck, Headphones, BadgeCheck } from 'lucide-react';

export function TrustStrip() {
  const items = [
    { icon: ShieldCheck, title: 'Hàng chính hãng', desc: 'Cam kết 100% chất lượng' },
    { icon: Truck, title: 'Giao hàng hỏa tốc', desc: 'Nhận hàng trong 2h tại TP.HCM' },
    { icon: Headphones, title: 'Hỗ trợ 24/7', desc: 'Tư vấn tận tâm chu đáo' },
    { icon: BadgeCheck, title: 'Bảo hành uy tín', desc: 'Dễ dàng tại 100 cửa hàng' },
  ];

  return (
    <section className="bg-white py-12 border-t border-slate-100">
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-5 lg:justify-center">
            <div className="flex-shrink-0 w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-[#1A2B4C] border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
              <item.icon className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-black uppercase tracking-tighter text-slate-900 leading-tight mb-1">{item.title}</div>
              <div className="text-[11px] text-slate-500 font-bold uppercase tracking-tight">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
