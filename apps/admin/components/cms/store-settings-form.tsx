'use client';

import React, { useEffect, useState } from 'react';
import { adminFetch } from '@/lib/admin-api';
import { CmsFeedback } from './cms-feedback';
import { Loader2, Save } from 'lucide-react';

export function StoreSettingsForm() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' }>({
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await adminFetch('/admin/homepage/settings');
        setSettings(data);
      } catch (err: any) {
        setFeedback({ message: err.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminFetch('/admin/homepage/settings', {
        method: 'PATCH',
        body: JSON.stringify(settings),
      });
      setFeedback({ message: 'Đã lưu cài đặt cửa hàng', type: 'success' });
    } catch (err: any) {
      setFeedback({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase text-xs tracking-wider">Thông tin liên hệ</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Hotline</label>
            <input
              type="text"
              value={settings.hotline || ''}
              onChange={(e) => setSettings({ ...settings, hotline: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="1900 xxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={settings.email || ''}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
              placeholder="contact@company.com"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Địa chỉ cửa hàng</label>
          <input
            type="text"
            value={settings.address || ''}
            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 uppercase text-xs tracking-wider">Giới thiệu cửa hàng</h3>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tóm tắt ngắn</label>
          <textarea
            rows={4}
            value={settings.companySummary || ''}
            onChange={(e) => setSettings({ ...settings, companySummary: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            placeholder="Giới thiệu ngắn về Hùng Hiền Điện Máy hiển thị ở chân trang..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Thông báo Newsletter</label>
          <input
            type="text"
            value={settings.newsletterCopy || ''}
            onChange={(e) => setSettings({ ...settings, newsletterCopy: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
            placeholder="Đăng ký để nhận tin khuyến mãi mới nhất"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-2.5 bg-[#1A2B4C] text-[#E5C37A] rounded-md font-bold hover:bg-[#253A66] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Lưu tất cả cài đặt
        </button>
      </div>

      <CmsFeedback
        message={feedback.message}
        type={feedback.type}
        onClear={() => setFeedback({ ...feedback, message: '' })}
      />
    </form>
  );
}
