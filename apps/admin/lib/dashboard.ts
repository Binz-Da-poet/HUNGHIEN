import { adminFetch } from '@/lib/admin-api';

export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  lowStockProducts: number;
  paidRevenue: number;
  pendingOrders: number;
  unpaidBankTransfers: number;
  shippingOrders: number;
  recentOrders: DashboardOrder[];
  lowStockItems: DashboardProduct[];
}

export interface DashboardOrder {
  id: string;
  publicCode: string;
  customerName: string;
  phone: string;
  totalAmount: number | string;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export interface DashboardProduct {
  id: string;
  name: string;
  stock: number;
  price: number | string;
}

export function getDashboard(): Promise<DashboardSummary> {
  return adminFetch('/admin/dashboard');
}
