import { CreateOrderInput } from '@repo/shared';
import { API_BASE_URL } from '@/lib/api';

export async function createOrder(data: CreateOrderInput): Promise<{
  publicCode: string;
  paymentMethod: string;
  status: string;
  totalAmount: number;
}> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.message || 'Đặt hàng thất bại.');
  }

  return res.json();
}
