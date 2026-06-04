import React from 'react';
import { cn } from '@/lib/utils';

type OrderStatus = 'PENDING' | 'SHIPPING' | 'SUCCESS' | 'CANCELLED';

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
    SHIPPING: { label: 'Shipping', className: 'bg-blue-100 text-blue-800' },
    SUCCESS: { label: 'Success', className: 'bg-green-100 text-green-800' },
    CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  };

  const config = statusConfig[status.toUpperCase()] || {
    label: status,
    className: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
