'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';
import { ImageUploadField } from './image-upload-field';
import { Loader2 } from 'lucide-react';

interface BannerFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function BannerForm({ initialData, isEdit }: BannerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    mode: initialData?.mode || 'ARTWORK',
    desktopImageUrl: initialData?.desktopImageUrl || '',
    mobileImageUrl: initialData?.mobileImageUrl || '',
    altText: initialData?.altText || '',
    heading: initialData?.heading || '',
    description: initialData?.description || '',
    ctaLabel: initialData?.ctaLabel || '',
    ctaUrl: initialData?.ctaUrl || '',
    backgroundColor: initialData?.backgroundColor || '',
    isActive: initialData?.isActive ?? true,
    startsAt: initialData?.startsAt ? new Date(initialData.startsAt).toISOString().split('T')[0] : '',
    endsAt: initialData?.endsAt ? new Date(initialData.endsAt).toISOString().split('T')[0] : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.mode === 'ARTWORK' && !formData.desktopImageUrl) {
      setError('Chế độ Artwork yêu cầu ảnh desktop.');
      return;
    }
    if (formData.mode === 'DYNAMIC' && !formData.heading) {
      setError('Chế độ Dynamic yêu cầu tiêu đề.');
      return;
    }
    if (formData.startsAt && formData.endsAt && formData.startsAt > formData.endsAt) {
      setError('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        startsAt: formData.startsAt ? new Date(formData.startsAt).toISOString() : null,
        endsAt: formData.endsAt ? new Date(formData.endsAt).toISOString() : null,
      };

      if (isEdit) {
        await adminFetch(`/admin/homepage/banners/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch('/admin/homepage/banners', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push('/banners');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Lưu banner thất bại');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên Banner</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="Ví dụ: Khuyến mãi mùa hè"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chế độ hiển thị</label>
            <select
              value={formData.mode}
              onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            >
              <option value="ARTWORK">Ảnh thiết kế (Artwork)</option>
              <option value="DYNAMIC">Nội dung động (Dynamic)</option>
            </select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày bắt đầu</label>
              <input
                type="date"
                value={formData.startsAt}
                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ngày kết thúc</label>
              <input
                type="date"
                value={formData.endsAt}
                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Kích hoạt ngay</label>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-6">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase text-xs tracking-wider">Nội dung hiển thị</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ImageUploadField
            label="Ảnh Desktop"
            namespace="banners"
            value={formData.desktopImageUrl}
            onChange={(url) => setFormData({ ...formData, desktopImageUrl: url })}
          />
          <ImageUploadField
            label="Ảnh Mobile (Tùy chọn)"
            namespace="banners"
            value={formData.mobileImageUrl}
            onChange={(url) => setFormData({ ...formData, mobileImageUrl: url })}
          />
        </div>

        {formData.mode === 'ARTWORK' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={formData.altText}
                onChange={(e) => setFormData({ ...formData, altText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link khi click (CTA URL)</label>
              <input
                type="text"
                value={formData.ctaUrl}
                onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                placeholder="/products/category-slug"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề (Heading)</label>
                  <input
                    type="text"
                    value={formData.heading}
                    onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả (Description)</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nhãn nút (CTA Label)</label>
                  <input
                    type="text"
                    value={formData.ctaLabel}
                    onChange={(e) => setFormData({ ...formData, ctaLabel: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                    placeholder="Mua ngay"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Link nút (CTA URL)</label>
                  <input
                    type="text"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({ ...formData, ctaUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Màu nền (Background Color)</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.backgroundColor || '#ffffff'}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="h-10 w-10 border border-slate-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
                      placeholder="#HEX"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-[#1A2B4C] text-[#E5C37A] rounded-md font-medium hover:bg-[#253A66] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? 'Cập nhật Banner' : 'Tạo Banner'}
        </button>
      </div>
    </form>
  );
}
