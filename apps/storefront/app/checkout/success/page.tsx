import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:py-32">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <CheckCircle className="h-10 w-10" />
      </div>
      <h1 className="mb-4 text-3xl font-bold text-slate-950">Cảm ơn bạn đã đặt hàng!</h1>
      <p className="mx-auto mb-8 max-w-lg text-base text-slate-600">
        HUNG HIEN đã nhận đơn hàng và sẽ liên hệ xác nhận thông tin giao hàng trong thời gian sớm nhất.
      </p>
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center rounded-md bg-emerald-700 px-10 font-bold text-white transition-colors hover:bg-emerald-800"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
