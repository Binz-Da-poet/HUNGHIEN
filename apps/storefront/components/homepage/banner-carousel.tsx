'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { HomepageBanner } from '@/lib/homepage';

interface BannerCarouselProps {
  banners: HomepageBanner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [current, setCurrent] = useState(0);
  const reduce = useReducedMotion();

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!banners.length) return null;

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[3/1] overflow-hidden group bg-slate-200"
    >
      <motion.div
        className="flex h-full"
        animate={{ x: `-${current * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
            {banner.mode === 'ARTWORK' ? (
              <Link href={banner.ctaUrl || '#'} className="block w-full h-full">
                <picture>
                  <source media="(max-width: 640px)" srcSet={banner.mobileImageUrl || banner.desktopImageUrl} />
                  <img
                    src={banner.desktopImageUrl}
                    alt={banner.altText || banner.name}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </picture>
              </Link>
            ) : (
              <div
                className="w-full h-full flex items-center px-6 md:px-12 lg:px-24 bg-brand-primary"
                style={banner.backgroundColor ? { backgroundColor: banner.backgroundColor } : undefined}
              >
                <div className="max-w-2xl text-white space-y-3 md:space-y-6">
                  <h2 className="text-xl md:text-4xl lg:text-6xl font-bold leading-tight tracking-tight">
                    {banner.heading}
                  </h2>
                  <p className="text-xs md:text-lg text-brand-accent font-medium tracking-wide">
                    {banner.description}
                  </p>
                  {banner.ctaLabel && (
                    <Link
                      href={banner.ctaUrl || '#'}
                      className="inline-block px-6 py-2 md:px-10 md:py-4 bg-brand-accent text-brand-primary font-semibold rounded-button text-xs md:text-sm hover:bg-white transition-all"
                    >
                      {banner.ctaLabel}
                    </Link>
                  )}
                </div>
                {banner.products && banner.products.length > 0 && (
                  <div className="hidden md:block ml-auto max-w-sm">
                    <img
                      src={banner.products[0].product.images?.[0]?.url}
                      alt=""
                      className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </motion.div>

      {banners.length > 1 && (
        <>
          <button
            onClick={(e) => { e.preventDefault(); prev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-brand-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); next(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-brand-primary text-white rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  current === i ? "w-8 bg-brand-accent" : "w-2 bg-white/60 hover:bg-white/80"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}
