'use client';

import React, { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import { ContentList } from '@/components/content/content-list';
import { getContentConfig } from '@/components/content/content-type';
import { adminFetch } from '@/lib/admin-api';

export default function ContentTypePage() {
  const params = useParams();
  const route = params.type as string;
  const config = getContentConfig(route);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await adminFetch(`/admin/content?type=${config.apiType}&take=50`);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [route]);

  if (!config) notFound();
  if (loading) return <p className="text-sm text-slate-500">Đang tải...</p>;

  return <ContentList route={route} items={items} total={total} onRefresh={fetchData} />;
}
