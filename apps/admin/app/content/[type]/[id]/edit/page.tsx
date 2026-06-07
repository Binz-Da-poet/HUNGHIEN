'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ContentForm } from '@/components/content/content-form';
import { getContentConfig } from '@/components/content/content-type';
import { adminFetch } from '@/lib/admin-api';

export default function EditContentPage() {
  const params = useParams();
  const route = params.type as string;
  const id = params.id as string;
  const config = getContentConfig(route);

  const [defaultValues, setDefaultValues] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!config) return;
    adminFetch(`/admin/content/${id}`)
      .then((data) => setDefaultValues(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!config) notFound();
  if (loading) return <p className="text-sm text-slate-500">Đang tải...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-950">Sửa {config.label}</h1>
      <ContentForm route={route} defaultValues={defaultValues} />
    </div>
  );
}
