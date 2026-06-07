import React from 'react';
import Link from 'next/link';
import { CalendarDays } from 'lucide-react';

interface ContentCardProps {
  title: string;
  excerpt: string;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  href: string;
}

export function ContentCard({ title, excerpt, coverImageUrl, publishedAt, createdAt, href }: ContentCardProps) {
  const date = publishedAt || createdAt;
  return (
    <Link href={href} className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
      {coverImageUrl && (
        <div className="aspect-[16/9] overflow-hidden bg-slate-100">
          <img src={coverImageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <CalendarDays className="h-3.5 w-3.5" />
          {new Date(date).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <h3 className="font-bold text-slate-900 group-hover:text-[#1A2B4C] transition-colors line-clamp-2 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed">{excerpt}</p>
      </div>
    </Link>
  );
}
