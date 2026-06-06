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
    <div>
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
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-blue-700 hover:bg-blue-50"
                  aria-label="Sửa danh mục"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(category.id)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-red-200 text-red-700 hover:bg-red-50"
                  aria-label="Xóa danh mục"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Tên danh mục</th>
              <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Đường dẫn</th>
              <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {categories.map((category) => (
              <tr key={category.id} className="transition hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 text-sm font-bold text-slate-950">{category.name}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">/{category.slug}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onEdit(category)}
                    className="mr-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-blue-700 hover:bg-blue-50"
                    aria-label="Sửa danh mục"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(category.id)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-red-700 hover:bg-red-50"
                    aria-label="Xóa danh mục"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {categories.length === 0 && (
        <div className="rounded-md border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          Không tìm thấy danh mục phù hợp.
        </div>
      )}
    </div>
  );
}
