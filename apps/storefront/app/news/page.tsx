import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getContentList } from '@/lib/content';
import { ContentCard } from '@/components/content/content-card';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tin tức - Hùng Hiền Điện Máy',
  description: 'Cập nhật tin tức mới nhất từ Hùng Hiền Điện Máy.',
};

export default async function NewsPage() {
  const articles = await getContentList('news');

  if (!articles || articles.length === 0) {
    return (
      <main className="bg-white min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-black text-[#1A2B4C] mb-4">Tin tức</h1>
          <p className="text-slate-500">Chưa có bài viết nào. Vui lòng quay lại sau.</p>
          <Link href="/" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#1A2B4C] hover:text-orange-600 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Về trang chủ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-[#1A2B4C] mb-8">Tin tức</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ContentCard
              key={article.id}
              title={article.title}
              excerpt={article.excerpt}
              coverImageUrl={article.coverImageUrl}
              publishedAt={article.publishedAt}
              createdAt={article.createdAt}
              href={`/news/${article.slug}`}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
