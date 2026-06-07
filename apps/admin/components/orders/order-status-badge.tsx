import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'order' | 'payment';
}

const orderConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONFIRMED: { label: 'Đã xác nhận', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  SHIPPING: { label: 'Đang giao hàng', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  COMPLETED: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', className: 'bg-red-50 text-red-700 border-red-200' },
};

const paymentConfig: Record<string, { label: string; className: string }> = {
  UNPAID: { label: 'Chưa TT', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  PAID: { label: 'Đã TT', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REFUNDED: { label: 'Hoàn tiền', className: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export function OrderStatusBadge({ status, type = 'order' }: StatusBadgeProps) {
  const config =
    type === 'payment'
      ? paymentConfig[status]
      : orderConfig[status];

  if (!config) {
    return <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-700 border-slate-200">{status}</span>;
  }

  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold', config.className)}>
      {config.label}
    </span>
  );
}
