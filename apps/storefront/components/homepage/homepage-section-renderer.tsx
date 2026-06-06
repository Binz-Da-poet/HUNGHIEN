'use client';

import React from 'react';
import { HomepagePayload, HomepageSection } from '@/lib/homepage';
import { BannerCarousel } from './banner-carousel';
import { FeaturedCategories } from './featured-categories';
import { ProductGroupSection } from './product-group-section';
import { BenefitStrip } from './benefit-strip';
import { BrandStrip } from './brand-strip';
import { TrustStrip } from './trust-strip';

interface HomepageSectionRendererProps {
  payload: HomepagePayload;
  sections: HomepageSection[];
}

export function HomepageSectionRenderer({ payload, sections }: HomepageSectionRendererProps) {
  return (
    <div className="flex flex-col">
      {sections.map((section) => {
        switch (section.type) {
          case 'BANNERS':
            return <BannerCarousel key={section.id} banners={payload.banners} />;
          case 'FEATURED_CATEGORIES':
            return <FeaturedCategories key={section.id} categories={payload.featuredCategories} />;
          case 'PRODUCT_GROUP':
            // Find the specific group by slug if configured
            const group = section.config?.slug 
              ? payload.productGroups.find(g => g.slug === section.config.slug)
              : payload.productGroups[0];
              
            if (!group || !group.items.length) return null;
            return <ProductGroupSection key={section.id} group={group} />;
          case 'SERVICE_BENEFITS':
            return <BenefitStrip key={section.id} benefits={payload.benefits} />;
          case 'FEATURED_BRANDS':
            return <BrandStrip key={section.id} brands={payload.featuredBrands} />;
          case 'TRUST_STRIP':
            return <TrustStrip key={section.id} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
