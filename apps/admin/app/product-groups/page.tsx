'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { StatusToggle } from '@/components/cms/status-toggle';
import { CmsFeedback } from '@/components/cms/cms-feedback';
import { Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductGroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });

  const fetchGroups = async () => {
    try {
      const data = await adminFetch('/admin/homepage/product-groups');
      setGroups(data);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await adminFetch(`/admin/homepage/product-groups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      setGroups(groups.map(g => g.id === id ? { ...g, isActive } : g));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhóm sản phẩm này?')) return;
    try {
      await adminFetch(`/admin/homepage/product-groups/${id}`, { method: 'DELETE' });
      setGroups(groups.filter(g => g.id !== id));
      setFeedback({ message: 'Đã xóa nhóm sản phẩm', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <CmsPageHeader
        title="Nhóm sản phẩm nổi bật"
        description="Quản lý các bộ sưu tập sản phẩm hiển thị trên trang chủ."
      >
        <Link
          href="/product-groups/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2B4C] text-[#E5C37A] rounded-md font-medium hover:bg-[#253A66] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Tạo nhóm mới
        </Link>
      </CmsPageHeader>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
            <tr>
              <th className="px-6 py-3">Tên nhóm</th>
              <th className="px-6 py-3">Tiêu đề hiển thị</th>
              <th className="px-6 py-3 w-32 text-center">Số lượng</th>
              <th className="px-6 py-3 w-24 text-center">Trạng thái</th>
              <th className="px-6 py-3 w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {groups.map((group) => (
              <tr key={group.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{group.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">{group.slug}</div>
                </td>
                <td className="px-6 py-4 text-slate-700">{group.title}</td>
                <td className="px-6 py-4 text-center text-slate-500 font-medium">
                  {group.items?.length || 0} SP
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusToggle
                    isActive={group.isActive}
                    onToggle={(active) => handleToggle(group.id, active)}
                  />
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Link
                    href={`/product-groups/${group.id}/edit`}
                    className="inline-flex p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(group.id)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">Chưa có nhóm sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <CmsFeedback
        message={feedback.message}
        type={feedback.type}
        onClear={() => setFeedback({ ...feedback, message: '' })}
      />
    </div>
  );
}
