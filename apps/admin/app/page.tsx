import React from 'react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Sales</div>
          <div className="mt-2 text-2xl font-bold">$12,345</div>
          <div className="mt-1 text-xs text-green-600">+12% from last month</div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Active Orders</div>
          <div className="mt-2 text-2xl font-bold">45</div>
          <div className="mt-1 text-xs text-blue-600">5 pending shipping</div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Total Products</div>
          <div className="mt-2 text-2xl font-bold">156</div>
          <div className="mt-1 text-xs text-gray-500">Across 12 categories</div>
        </div>
        
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-500">Out of Stock</div>
          <div className="mt-2 text-2xl font-bold text-red-600">3</div>
          <div className="mt-1 text-xs text-red-500">Action required</div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 italic">No recent activity to display.</p>
        </div>
      </div>
    </div>
  );
}
