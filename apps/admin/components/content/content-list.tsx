'use client';

import React from 'react';
import Link from 'next/link';
import { Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';
import { getContentConfig } from './content-type';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string;
}

interface ContentListProps {
  route: string;
  items: ContentItem[];
  total: number;
  onRefresh: () => void;
}

export function ContentList({ route, items, total, onRefresh }: ContentListProps) {
  const config = getContentConfig(route);

  if (!config) return null;

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Xóa "${title}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await adminFetch(`/admin/content/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi xóa bài viết.');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await adminFetch(`/admin/content/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">{config.label}</h1>
          <p className="mt-1 text-sm text-slate-500">{total} bài viết</p>
        </div>
        <Link
          href={`/content/${route}/new`}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-orange-500 px-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Tạo mới
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white py-14 text-center">
          <p className="font-bold text-slate-500">Chưa có bài viết nào</p>
          <p className="mt-1 text-sm text-slate-400">Nhấn &quot;Tạo mới&quot; để bắt đầu.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Tiêu đề</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Slug</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Trạng thái</th>
                <th className="px-5 py-3 text-left text-xs font-bold uppercase text-slate-500">Thứ tự</th>
                <th className="px-5 py-3 text-right text-xs font-bold uppercase text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-3 text-sm">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.excerpt}</p>
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-slate-500">{item.slug}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${item.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {item.status === 'PUBLISHED' ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{item.sortOrder}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleStatus(item.id, item.status)}
                        title={item.status === 'PUBLISHED' ? 'Bỏ xuất bản' : 'Xuất bản'}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                      >
                        {item.status === 'PUBLISHED' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <Link
                        href={`/content/${route}/${item.id}/edit`}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
