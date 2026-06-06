'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';
import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { BannerForm } from '@/components/cms/banner-form';
import { Loader2 } from 'lucide-react';

export default function EditBannerPage() {
  const params = useParams();
  const id = params.id as string;
  const [banner, setBanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const data = await adminFetch(`/admin/homepage/banners`);
        const found = data.find((b: any) => b.id === id);
        if (!found) throw new Error('Không tìm thấy banner');
        setBanner(found);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, [id]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-slate-400" /></div>;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded border border-red-200">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <CmsPageHeader
        title="Chỉnh sửa Banner"
        description={`Đang chỉnh sửa: ${banner.name}`}
      />
      <BannerForm initialData={banner} isEdit />
    </div>
  );
}
