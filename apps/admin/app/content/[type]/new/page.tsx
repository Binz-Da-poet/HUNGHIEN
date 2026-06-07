'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import { ContentForm } from '@/components/content/content-form';
import { getContentConfig } from '@/components/content/content-type';

export default function NewContentPage() {
  const params = useParams();
  const route = params.type as string;
  const config = getContentConfig(route);

  if (!config) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-950">Tạo {config.label}</h1>
      <ContentForm route={route} />
    </div>
  );
}
