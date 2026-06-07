'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RichTextEditor } from './rich-text-editor';
import { adminFetch } from '@/lib/admin-api';
import { getContentConfig } from './content-type';
import { Save, Loader2 } from 'lucide-react';

interface ContentFormProps {
  route: string;
  defaultValues?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    coverImageUrl?: string | null;
    content?: Record<string, unknown>;
    status?: string;
    sortOrder?: number;
    publishedAt?: string;
  };
}

export function ContentForm({ route, defaultValues }: ContentFormProps) {
  const router = useRouter();
  const config = getContentConfig(route);
  const isEdit = !!defaultValues?.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: defaultValues?.title || '',
    slug: defaultValues?.slug || '',
    excerpt: defaultValues?.excerpt || '',
    coverImageUrl: defaultValues?.coverImageUrl || '',
    status: defaultValues?.status || 'DRAFT',
    sortOrder: defaultValues?.sortOrder ?? 0,
    content: defaultValues?.content || { type: 'doc', content: [] },
  });
  const [slugManual, setSlugManual] = useState(!!defaultValues?.slug);

  if (!config) {
    return <p className="text-red-600">Loại nội dung không hợp lệ: {route}</p>;
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 200);
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: slugManual ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      type: config.apiType,
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      coverImageUrl: form.coverImageUrl || null,
      content: form.content,
      status: form.status,
      sortOrder: Number(form.sortOrder),
    };

    try {
      if (isEdit) {
        await adminFetch(`/admin/content/${defaultValues!.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await adminFetch('/admin/content', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      router.push(`/content/${route}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu bài viết.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm font-medium text-red-700">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tiêu đề</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm font-medium focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          >
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Slug
            <button type="button" onClick={() => { setSlugManual(!slugManual); if (!slugManual) setForm({ ...form, slug: generateSlug(form.title) }); }} className="ml-2 text-orange-600 hover:underline">
              {slugManual ? '(tự động)' : '(sửa tay)'}
            </button>
          </label>
          <input
            type="text"
            required
            value={form.slug}
            onChange={(e) => { setForm({ ...form, slug: e.target.value }); if (!slugManual) setSlugManual(true); }}
            className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm font-mono focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Thứ tự</label>
          <input
            type="number"
            min={0}
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })}
            className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ảnh bìa (URL)</label>
          <input
            type="text"
            value={form.coverImageUrl}
            onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })}
            placeholder="https://..."
            className="w-full h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mô tả ngắn</label>
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nội dung</label>
        <RichTextEditor
          content={form.content}
          onChange={(json) => setForm({ ...form, content: json })}
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-orange-500 px-6 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bài viết'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/content/${route}`)}
          className="h-11 rounded-md border border-slate-300 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
