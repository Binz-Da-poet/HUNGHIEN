import { formatVnd } from '@/lib/format';

export interface StorefrontCategory {
  id: string;
  name: string;
  slug: string;
}

export interface StorefrontProduct {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  price: number | string;
  originalPrice?: number | string | null;
  brand: string;
  stock: number;
  categoryId?: string;
  category?: StorefrontCategory | null;
  images?: { url: string; isPrimary?: boolean; altText?: string | null }[];
}

export type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'discount' | 'stock';

export function getPrice(product: Pick<StorefrontProduct, 'price'>) {
  return Number(product.price);
}

export function getOriginalPrice(product: Pick<StorefrontProduct, 'originalPrice'>) {
  return product.originalPrice ? Number(product.originalPrice) : null;
}

export function getDiscountPercent(product: Pick<StorefrontProduct, 'price' | 'originalPrice'>) {
  const price = getPrice(product);
  const originalPrice = getOriginalPrice(product);
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

export function getStockLabel(stock: number) {
  if (stock <= 0) return 'Hết hàng';
  if (stock <= 3) return `Chỉ còn ${stock}`;
  if (stock <= 8) return 'Sắp hết hàng';
  return 'Còn hàng';
}

export function getStockTone(stock: number) {
  if (stock <= 0) return 'bg-slate-200 text-slate-600';
  if (stock <= 3) return 'bg-red-50 text-red-700';
  if (stock <= 8) return 'bg-amber-50 text-amber-700';
  return 'bg-emerald-50 text-emerald-700';
}

export function sortProducts(products: StorefrontProduct[], sort: SortKey) {
  const sorted = [...products];

  if (sort === 'price-asc') {
    return sorted.sort((a, b) => getPrice(a) - getPrice(b));
  }

  if (sort === 'price-desc') {
    return sorted.sort((a, b) => getPrice(b) - getPrice(a));
  }

  if (sort === 'discount') {
    return sorted.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
  }

  if (sort === 'stock') {
    return sorted.sort((a, b) => a.stock - b.stock);
  }

  // featured: keep original order
  return sorted;
}

export function buildHomeHref(params: {
  search?: string;
  category?: string;
  brand?: string;
  sort?: string;
}) {
  const urlParams = new URLSearchParams();
  if (params.search) urlParams.set('search', params.search);
  if (params.category) urlParams.set('category', params.category);
  if (params.brand) urlParams.set('brand', params.brand);
  if (params.sort && params.sort !== 'featured') urlParams.set('sort', params.sort);
  const query = urlParams.toString();
  return query ? `/?${query}` : '/';
}

export function formatDealLabel(product: StorefrontProduct) {
  const discount = getDiscountPercent(product);
  return discount > 0 ? `Giảm ${discount}%` : 'Giá tốt';
}

export function formatCompactPrice(product: StorefrontProduct) {
  return formatVnd(getPrice(product));
}
