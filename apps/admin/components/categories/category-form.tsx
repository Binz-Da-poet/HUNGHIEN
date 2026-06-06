'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id?: string;
  name: string;
  slug: string;
}

interface CategoryFormProps {
  initialData?: Category | null;
  onSubmit: (data: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

export function CategoryForm({ initialData, onSubmit, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
    } else {
      setName('');
      setSlug('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, slug });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-slate-700">Tên danh mục</label>
        <input
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!initialData) {
              setSlug(e.target.value.toLowerCase()
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, ''));
            }
          }}
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700">Đường dẫn</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-2 block h-11 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          required
        />
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Hủy
        </button>
        <button
          type="submit"
          className="h-10 rounded-md bg-orange-600 px-4 text-sm font-bold text-white hover:bg-orange-700"
        >
          {initialData ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </div>
    </form>
  );
}
