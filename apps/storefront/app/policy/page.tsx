import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getContentList } from '@/lib/content';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Chính sách - Hùng Hiền Điện Máy',
  description: 'Các chính sách bảo hành, đổi trả, vận chuyển từ Hùng Hiền Điện Máy.',
};

export default async function PolicyPage() {
  const policies = await getContentList('policy');

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-8">Chính sách</h1>

        {!policies || policies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">Chưa có chính sách nào được công bố.</p>
            <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1A2B4C] hover:text-orange-600 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Về trang chủ
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {policies.map((policy) => (
              <Link
                key={policy.id}
                href={`/policy/${policy.slug}`}
                className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group"
              >
                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 group-hover:text-[#1A2B4C] transition-colors">{policy.title}</h3>
                  <p className="text-sm text-slate-500 truncate">{policy.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
