import { TrackOrderInput, PublicOrderSummary } from '@repo/shared';
import { API_BASE_URL } from '@/lib/api';

export async function trackOrder(
  input: TrackOrderInput,
): Promise<PublicOrderSummary> {
  const res = await fetch(`${API_BASE_URL}/orders/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || 'Không tìm thấy đơn hàng.');
  }
  return res.json();
}
