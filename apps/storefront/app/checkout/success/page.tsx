import React from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function CheckoutSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckCircle className="h-12 w-12" />
      </div>
      <h1 className="mb-4 text-4xl font-bold text-gray-900">Cảm ơn bạn đã đặt hàng!</h1>
      <p className="mx-auto mb-8 max-w-lg text-lg text-gray-600">
        Chúng tôi đã nhận được đơn hàng của bạn và sẽ liên hệ trong thời gian sớm nhất để xác nhận chi tiết giao hàng.
      </p>
      <Link 
        href="/" 
        className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-base font-bold text-white transition-colors hover:bg-primary/90"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
