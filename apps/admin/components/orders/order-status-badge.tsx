import React from 'react';
import { cn } from '@/lib/utils';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Chờ xử lý', className: 'bg-amber-50 text-amber-700' },
    SHIPPING: { label: 'Đang giao', className: 'bg-sky-50 text-sky-700' },
    SUCCESS: { label: 'Thành công', className: 'bg-emerald-50 text-emerald-700' },
    CANCELLED: { label: 'Đã hủy', className: 'bg-red-50 text-red-700' },
  };

  const config = statusConfig[status.toUpperCase()] || {
    label: status,
    className: 'bg-slate-100 text-slate-700',
  };

  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold', config.className)}>{config.label}</span>;
}
