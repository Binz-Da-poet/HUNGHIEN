'use client';

import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Gift, Star } from 'lucide-react';
import { StoreBenefit } from '@/lib/homepage';

const ICON_MAP: Record<string, any> = {
  Truck, ShieldCheck, RotateCcw, Headphones, CreditCard, Gift, Star
};

export function BenefitStrip({ benefits }: { benefits: StoreBenefit[] }) {
  if (!benefits.length) return null;

  return (
    <section className="bg-[#1A2B4C] py-6 overflow-x-auto no-scrollbar">
      <div className="mx-auto max-w-7xl px-4 flex items-center justify-between gap-8 min-w-max lg:min-w-0">
        {benefits.map((benefit) => {
          const Icon = ICON_MAP[benefit.icon] || ShieldCheck;
          return (
            <div key={benefit.id} className="flex items-center gap-4 group">
              <div className="p-3 bg-[#E5C37A]/10 rounded-full group-hover:bg-[#E5C37A]/20 transition-colors border border-[#E5C37A]/20">
                <Icon className="h-6 w-6 text-[#E5C37A]" />
              </div>
              <div className="text-white">
                <div className="text-sm font-black uppercase tracking-tight leading-none mb-1.5">{benefit.title}</div>
                <div className="text-[10px] text-[#E5C37A]/80 font-bold uppercase tracking-wider">{benefit.description}</div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
