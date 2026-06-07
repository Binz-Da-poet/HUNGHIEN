import { API_BASE_URL } from './api';

export interface HomepageBanner {
  id: string;
  name: string;
  mode: 'ARTWORK' | 'DYNAMIC';
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  altText?: string;
  heading?: string;
  description?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  backgroundColor?: string;
  products?: { product: any }[];
}

export interface HomepageSection {
  id: string;
  type: 'BANNERS' | 'FEATURED_CATEGORIES' | 'PRODUCT_GROUP' | 'SERVICE_BENEFITS' | 'FEATURED_BRANDS' | 'TRUST_STRIP';
  title: string;
  sortOrder: number;
  config?: any;
}

export interface FeaturedCategory {
  id: string;
  displayName: string;
  imageUrl?: string;
  category: { id: string; name: string; slug: string };
}

export interface ProductGroup {
  id: string;
  name: string;
  slug: string;
  title: string;
  accent?: string;
  items: { product: any }[];
}

export interface StoreBenefit {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturedBrand {
  id: string;
  name: string;
  logoUrl: string;
  targetUrl?: string;
}

export interface StoreSettings {
  id: string;
  hotline?: string;
  storeSystemUrl?: string;
  address?: string;
  email?: string;
  socialLinks?: any;
  companySummary?: string;
  supportLinks?: any;
  policyLinks?: any;
  newsletterCopy?: string;
  paymentMethods?: any;
}

export interface HomepagePayload {
  banners: HomepageBanner[];
  sections: HomepageSection[];
  featuredCategories: FeaturedCategory[];
  productGroups: ProductGroup[];
  featuredBrands: FeaturedBrand[];
  benefits: StoreBenefit[];
  settings: StoreSettings;
}

export async function getHomepage(): Promise<HomepagePayload> {
  try {
    const res = await fetch(`${API_BASE_URL}/storefront/homepage`, {
      next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 3600 },
      cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch homepage data: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Homepage fetch error:', error);
    // Return safe fallback payload
    return {
      banners: [],
      sections: [],
      featuredCategories: [],
      productGroups: [],
      featuredBrands: [],
      benefits: [],
      settings: {} as StoreSettings,
    };
  }
}

export function getVisibleSections(payload: HomepagePayload) {
  if (!payload || !payload.sections) return [];
  
  return payload.sections
    .filter(section => {
      // Check if section has data to display
      switch (section.type) {
        case 'BANNERS':
          return payload.banners.length > 0;
        case 'FEATURED_CATEGORIES':
          return payload.featuredCategories.length > 0;
        case 'PRODUCT_GROUP':
          // If section config has slug, check if that group exists and has items
          if (section.config?.slug) {
            return payload.productGroups.some(g => g.slug === section.config.slug && g.items.length > 0);
          }
          return payload.productGroups.length > 0;
        case 'FEATURED_BRANDS':
          return payload.featuredBrands.length > 0;
        case 'SERVICE_BENEFITS':
          return payload.benefits.length > 0;
        case 'TRUST_STRIP':
          return true; // Usually static content or from settings
        default:
          return false;
      }
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
