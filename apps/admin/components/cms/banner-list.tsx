'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { StatusToggle } from './status-toggle';
import { OrderControls } from './order-controls';
import { CmsFeedback } from './cms-feedback';
import { Loader2, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function BannerList() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });

  const fetchBanners = async () => {
    try {
      const data = await adminFetch('/admin/homepage/banners');
      setBanners(data);
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await adminFetch(`/admin/homepage/banners/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      });
      setBanners(banners.map(b => b.id === id ? { ...b, isActive } : b));
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newBanners = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBanners[index], newBanners[targetIndex]] = [newBanners[targetIndex], newBanners[index]];
    
    // Update local state
    setBanners(newBanners);

    try {
      // Assuming we can reorder via some mechanism or individual patches
      // For now, let's just update the sortOrder of the two swapped items if we had a reorder endpoint
      // Given the API doesn't have a banner reorder endpoint yet, let's just update them
      await Promise.all([
        adminFetch(`/admin/homepage/banners/${newBanners[index].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: index }),
        }),
        adminFetch(`/admin/homepage/banners/${newBanners[targetIndex].id}`, {
          method: 'PATCH',
          body: JSON.stringify({ sortOrder: targetIndex }),
        }),
      ]);
      setFeedback({ message: 'Đã cập nhật thứ tự', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
      fetchBanners(); // Rollback
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    try {
      await adminFetch(`/admin/homepage/banners/${id}`, { method: 'DELETE' });
      setBanners(banners.filter(b => b.id !== id));
      setFeedback({ message: 'Đã xóa banner', type: 'success' });
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
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
            <tr>
              <th className="px-6 py-3 w-20 text-center">Thứ tự</th>
              <th className="px-6 py-3 w-32">Ảnh</th>
              <th className="px-6 py-3">Tên / Chế độ</th>
              <th className="px-6 py-3">Lịch hiển thị</th>
              <th className="px-6 py-3 w-24 text-center">Trạng thái</th>
              <th className="px-6 py-3 w-24 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {banners.map((banner, index) => (
              <tr key={banner.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <OrderControls
                    isFirst={index === 0}
                    isLast={index === banners.length - 1}
                    onMoveUp={() => handleMove(index, 'up')}
                    onMoveDown={() => handleMove(index, 'down')}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="h-12 w-20 bg-slate-100 rounded border border-slate-200 overflow-hidden relative">
                    {banner.desktopImageUrl ? (
                      <img src={banner.desktopImageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-[10px]">No image</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{banner.name}</div>
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-1">{banner.mode}</div>
                </td>
                <td className="px-6 py-4 text-xs text-slate-600">
                  {banner.startsAt || banner.endsAt ? (
                    <div className="space-y-0.5">
                      {banner.startsAt && <div>Từ: {new Date(banner.startsAt).toLocaleDateString('vi-VN')}</div>}
                      {banner.endsAt && <div>Đến: {new Date(banner.endsAt).toLocaleDateString('vi-VN')}</div>}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Luôn hiển thị</span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusToggle
                    isActive={banner.isActive}
                    onToggle={(active) => handleToggle(banner.id, active)}
                  />
                </td>
                <td className="px-6 py-4 text-right space-x-1">
                  <Link href={`/banners/${banner.id}/edit`} className="inline-flex p-2 text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit className="h-4 w-4" />
                  </Link>
                  <button onClick={() => handleDelete(banner.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {banners.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">Chưa có banner nào.</td>
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
