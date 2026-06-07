import { API_BASE_URL } from '@/lib/api';

interface ContentPostSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  sortOrder: number;
}

interface ContentPostDetail extends ContentPostSummary {
  type: string;
  content: Record<string, unknown>;
  status: string;
}

export async function getContentList(type: 'news' | 'policy'): Promise<ContentPostSummary[]> {
  const res = await fetch(`${API_BASE_URL}/storefront/content/${type}`, {
    next: type === 'news' ? { revalidate: 300 } : { revalidate: 3600 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getContentBySlug(type: 'news' | 'policy', slug: string): Promise<ContentPostDetail | null> {
  const res = await fetch(`${API_BASE_URL}/storefront/content/${type}/${slug}`, {
    next: type === 'news' ? { revalidate: 300 } : { revalidate: 3600 },
  });
  if (!res.ok) return null;
  return res.json();
}
