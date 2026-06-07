'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { FolderTree, Plus, Search } from 'lucide-react';
import { CategoryTable } from '@/components/categories/category-table';
import { CategoryForm } from '@/components/categories/category-form';
import { Dialog } from '@/components/ui/dialog';
import { adminFetch } from '@/lib/admin-api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminFetch('/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err instanceof Error ? err.message : 'Lỗi tải danh mục.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) return;
    try {
      await adminFetch(`/categories/${id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert(err instanceof Error ? err.message : 'Xóa danh mục thất bại.');
    }
  };

  const handleSubmit = async (data: Omit<Category, 'id'>) => {
    try {
      if (editingCategory) {
        await adminFetch(`/categories/${editingCategory.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        await adminFetch('/categories', {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
      setIsFormOpen(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert(err instanceof Error ? err.message : 'Lưu danh mục thất bại.');
    }
  };

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return categories.filter(
      (category) => !query || category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query)
    );
  }, [categories, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">Danh mục</h1>
          <p className="mt-2 text-sm text-slate-500">Sắp xếp sản phẩm thành các nhóm dễ tìm trên storefront.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex h-11 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Thêm danh mục
        </button>
      </div>

      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </Dialog>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-[240px_1fr]">
        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase text-slate-500">Tổng danh mục</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-950">{categories.length}</p>
          </div>
          <div className="rounded-md bg-orange-50 p-2.5 text-orange-700">
            <FolderTree className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center rounded-md border border-slate-200 bg-white p-3 shadow-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tên hoặc đường dẫn"
              className="h-11 w-full rounded-md border border-slate-300 pl-10 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white py-14 text-center text-sm text-slate-500">Đang tải danh mục...</div>
      ) : (
        <CategoryTable
          categories={filteredCategories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
