'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryTableProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 md:hidden">
        {categories.map((category) => (
          <article key={category.id} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-slate-950">{category.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{category.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(category)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-blue-600"
                  aria-label="Sửa danh mục"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(category.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-red-600"
                  aria-label="Xóa danh mục"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 md:block">
        <table className="min-w-full divide-y divide-slate-200 bg-white">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Tên</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Slug</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">{category.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{category.slug}</td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => onEdit(category)} className="mr-3 text-blue-600 hover:text-blue-900">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => onDelete(category.id)} className="text-red-600 hover:text-red-900">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {categories.length === 0 && (
        <div className="py-10 text-center text-slate-500">Không tìm thấy danh mục nào</div>
      )}
    </div>
  );
}
