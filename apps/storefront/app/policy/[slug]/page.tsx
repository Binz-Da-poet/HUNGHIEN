import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getContentBySlug } from '@/lib/content';
import { RichTextRenderer } from '@/components/content/rich-text-renderer';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const policy = await getContentBySlug('policy', params.slug);
  if (!policy) return { title: 'Không tìm thấy - Hùng Hiền Điện Máy' };
  return {
    title: `${policy.title} - Hùng Hiền Điện Máy`,
    description: policy.excerpt,
  };
}

export default async function PolicyDetailPage({ params }: Props) {
  const policy = await getContentBySlug('policy', params.slug);

  if (!policy) notFound();

  return (
    <main className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/policy" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1A2B4C] hover:text-orange-600 transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Tất cả chính sách
        </Link>

        <article>
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A2B4C] text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-3xl font-black text-[#1A2B4C]">{policy.title}</h1>
            </div>
          </header>

          <div>
            <RichTextRenderer content={policy.content as any} />
          </div>
        </article>
      </div>
    </main>
  );
}
