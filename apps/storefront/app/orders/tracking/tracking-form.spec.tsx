import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TrackingForm } from './tracking-form';

vi.mock('@/lib/orders', () => ({
  trackOrder: vi.fn(),
}));

import { trackOrder } from '@/lib/orders';

describe('TrackingForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders code and phone inputs', () => {
    render(<TrackingForm />);
    expect(screen.getByLabelText('Mã đơn hàng')).toBeInTheDocument();
    expect(screen.getByLabelText('Số điện thoại')).toBeInTheDocument();
  });

  it('requires code and phone before submitting', () => {
    render(<TrackingForm />);
    const codeInput = screen.getByLabelText('Mã đơn hàng') as HTMLInputElement;
    const phoneInput = screen.getByLabelText('Số điện thoại') as HTMLInputElement;
    expect(codeInput.required).toBe(true);
    expect(phoneInput.required).toBe(true);
  });

  it('shows error message on failure', async () => {
    (trackOrder as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Không tìm thấy đơn hàng'));

    render(<TrackingForm />);

    fireEvent.change(screen.getByLabelText('Mã đơn hàng'), { target: { value: 'BADCODE' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0900000000' } });
    fireEvent.click(screen.getByText('Tra cứu đơn hàng'));

    await waitFor(() => {
      expect(screen.getByText('Không tìm thấy đơn hàng')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('renders tracking code after successful lookup', async () => {
    const mockOrder = {
      id: 'order-1',
      publicCode: 'HH1234567890',
      customerName: 'Tester',
      phone: '0912345678',
      totalAmount: 500000,
      status: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      paymentMethod: 'COD',
      items: [{ productName: 'Item 1', quantity: 1, price: 500000, priceAtPurchase: 500000 }],
      events: [],
      updatedAt: new Date().toISOString(),
    };

    (trackOrder as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockOrder);

    render(<TrackingForm />);

    fireEvent.change(screen.getByLabelText('Mã đơn hàng'), { target: { value: 'HH1234567890' } });
    fireEvent.change(screen.getByLabelText('Số điện thoại'), { target: { value: '0912345678' } });
    fireEvent.click(screen.getByText('Tra cứu đơn hàng'));

    await waitFor(() => {
      expect(trackOrder).toHaveBeenCalledWith({ publicCode: 'HH1234567890', phone: '0912345678' });
    });

    await waitFor(() => {
      expect(screen.getByText('HH1234567890')).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
