import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import DashboardPage from './page';

// Mock next/link
vi.mock('next/link', () => ({
  __esModule: true,
  default: (props: any) => {
    const { children, href } = props;
    return React.createElement('a', { href }, children);
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock admin-api
vi.mock('@/lib/admin-api', () => ({
  adminFetch: vi.fn(),
}));

// Mock format
vi.mock('@/lib/format', () => ({
  formatVnd: (n: number) => `${(n / 1000).toFixed(0)}K`,
}));

// Mock dashboard - data must be inline due to vi.mock hoisting
vi.mock('@/lib/dashboard', () => ({
  getDashboard: vi.fn().mockResolvedValue({
    totalProducts: 12,
    activeProducts: 8,
    outOfStockProducts: 2,
    lowStockProducts: 3,
    paidRevenue: 15_000_000,
    pendingOrders: 4,
    unpaidBankTransfers: 1,
    shippingOrders: 2,
    recentOrders: [
      { id: 'o1', publicCode: 'HH-1', customerName: 'Nguyen', phone: '090', totalAmount: 500000, status: 'PENDING', paymentStatus: 'UNPAID', createdAt: '' },
      { id: 'o2', publicCode: 'HH-2', customerName: 'Tran', phone: '091', totalAmount: 300000, status: 'CONFIRMED', paymentStatus: 'PAID', createdAt: '' },
    ],
    lowStockItems: [
      { id: 'p1', name: 'Item Low', stock: 2, price: 100000 },
    ],
  }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard heading', async () => {
    render(React.createElement(DashboardPage));
    await waitFor(() => {
      expect(screen.getByText('Tổng quan vận hành')).toBeTruthy();
    });
  });

  it('renders server-calculated revenue', async () => {
    render(React.createElement(DashboardPage));
    await waitFor(() => {
      expect(screen.getByText('15000K')).toBeTruthy();
    });
  });

  it('renders pending orders count from API', async () => {
    render(React.createElement(DashboardPage));
    await waitFor(() => {
      expect(screen.getByText('4')).toBeTruthy();
    });
  });

  it('renders recent order list', async () => {
    render(React.createElement(DashboardPage));
    await waitFor(() => {
      expect(screen.getByText('Nguyen')).toBeTruthy();
      expect(screen.getByText('Tran')).toBeTruthy();
    });
  });

  it('renders low stock items', async () => {
    render(React.createElement(DashboardPage));
    await waitFor(() => {
      expect(screen.getByText('Item Low')).toBeTruthy();
    });
  });
});
