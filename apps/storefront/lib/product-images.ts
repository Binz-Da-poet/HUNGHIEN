export interface ProductImage {
  id?: string;
  url: string;
  altText?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
}

export function getPrimaryImage(images?: ProductImage[] | null): ProductImage | null {
  if (!images?.length) return null;
  return images.find((image) => image.isPrimary) ?? images[0];
}

export function resolveApiImageUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api').replace(/\/api$/, '');
  return `${apiOrigin}${url}`;
}
