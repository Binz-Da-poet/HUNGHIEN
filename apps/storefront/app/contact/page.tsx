import React from 'react';
import { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ - Hùng Hiền Điện Máy',
  description: 'Thông tin liên hệ Hùng Hiền Điện Máy.',
};

export const dynamic = 'force-dynamic';

async function getStoreSettings() {
  try {
    const res = await fetch(`${API_BASE_URL}/store-settings`, { cache: 'no-store' });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-8">Liên hệ</h1>

        <div className="space-y-6">
          {settings.hotline && (
            <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Hotline</p>
                <p className="text-lg font-bold text-slate-900">{settings.hotline}</p>
              </div>
            </div>
          )}

          {settings.email && (
            <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                <p className="text-lg font-bold text-slate-900">{settings.email}</p>
              </div>
            </div>
          )}

          {settings.address && (
            <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Địa chỉ</p>
                <p className="text-lg font-bold text-slate-900">{settings.address}</p>
              </div>
            </div>
          )}

          {settings.storeSystemUrl && (
            <div className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase">Hệ thống cửa hàng</p>
                <a href={settings.storeSystemUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-[#1A2B4C] hover:text-orange-600 transition-colors underline">
                  Xem danh sách cửa hàng
                </a>
              </div>
            </div>
          )}

          {!settings.hotline && !settings.email && !settings.address && !settings.storeSystemUrl && (
            <div className="text-center py-12">
              <p className="text-slate-500">Thông tin liên hệ đang được cập nhật.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
