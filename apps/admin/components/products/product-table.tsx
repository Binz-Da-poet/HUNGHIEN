'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  categoryId: string;
}

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{product.name}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">${Number(product.price).toFixed(2)}</td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{product.stock}</td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <button 
                  onClick={() => onEdit(product)}
                  className="mr-3 text-blue-600 hover:text-blue-900"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => onDelete(product.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
