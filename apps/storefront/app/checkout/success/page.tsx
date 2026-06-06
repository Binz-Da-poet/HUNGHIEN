import React from 'react';
import Link from 'next/link';
import { BadgeCheck, ShoppingBag } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-32 text-center">
      <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-full bg-green-50 text-green-600 border border-green-100 shadow-sm animate-in zoom-in duration-500">
        <BadgeCheck className="h-12 w-12" />
      </div>
      <h1 className="mb-6 text-4xl font-black text-[#1A2B4C] uppercase tracking-tight">Đặt hàng thành công!</h1>
      <p className="mx-auto mb-12 max-w-lg text-lg text-slate-500 font-medium leading-relaxed">
        Hùng Hiền Điện Máy đã nhận đơn hàng của bạn. Chúng tôi sẽ liên hệ xác nhận và giao hàng trong thời gian sớm nhất.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#1A2B4C] px-10 text-sm font-black text-[#E5C37A] uppercase tracking-widest transition-all hover:bg-[#253A66] shadow-xl shadow-[#1A2B4C]/20 w-full sm:w-auto"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          Tiếp tục mua sắm
        </Link>
        <Link
          href="/orders/tracking"
          className="inline-flex h-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-200 px-10 text-sm font-black text-slate-600 uppercase tracking-widest transition-all hover:bg-slate-50 w-full sm:w-auto"
        >
          Theo dõi đơn hàng
        </Link>
      </div>
    </div>
  );
}
