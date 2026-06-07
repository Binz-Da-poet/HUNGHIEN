import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/lib/content';
import { RichTextRenderer } from '@/components/content/rich-text-renderer';
import { ArrowLeft, CalendarDays, Tag } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getContentBySlug('news', params.slug);
  if (!article) return { title: 'Không tìm thấy - Hùng Hiền Điện Máy' };
  return {
    title: `${article.title} - Hùng Hiền Điện Máy`,
    description: article.excerpt,
  };
}

export default async function NewsDetailPage({ params }: Props) {
  const article = await getContentBySlug('news', params.slug);

  if (!article) notFound();

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2B4C] hover:text-orange-600 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Tất cả tin tức
        </Link>

        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-black text-[#1A2B4C] mb-4 leading-tight">{article.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(article.publishedAt || article.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" />
                Tin tức
              </span>
            </div>
          </header>

          {article.coverImageUrl && (
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 mb-8">
              <img src={article.coverImageUrl} alt={article.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose max-w-none">
            <RichTextRenderer content={article.content as any} />
          </div>
        </article>
      </div>
    </main>
  );
}
