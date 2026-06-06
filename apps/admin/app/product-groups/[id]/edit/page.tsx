'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminFetch } from '@/lib/admin-api';
import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { ProductGroupForm } from '@/components/cms/product-group-form';
import { Loader2 } from 'lucide-react';

export default function EditProductGroupPage() {
  const params = useParams();
  const id = params.id as string;
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await adminFetch(`/admin/homepage/product-groups`);
        const found = data.find((g: any) => g.id === id);
        if (!found) throw new Error('Không tìm thấy nhóm sản phẩm');
        setGroup(found);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="bg-red-50 text-red-800 p-6 rounded-lg border border-red-100">
          <p className="font-bold text-lg mb-2">Đã có lỗi xảy ra</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <CmsPageHeader
        title="Chỉnh sửa Nhóm sản phẩm"
        description={`Đang cập nhật nhóm: ${group.name}`}
      />
      <ProductGroupForm initialData={group} isEdit />
    </div>
  );
}
