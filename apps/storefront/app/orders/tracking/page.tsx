import React from 'react';
import { Metadata } from 'next';
import { TrackingForm } from './tracking-form';

export const metadata: Metadata = {
  title: 'Tra cứu đơn hàng - Hùng Hiền Điện Máy',
  description: 'Tra cứu tình trạng đơn hàng bằng mã đơn và số điện thoại.',
};

export default function TrackingPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">Tra cứu đơn hàng</h1>
        <TrackingForm />
      </div>
    </div>
  );
}
