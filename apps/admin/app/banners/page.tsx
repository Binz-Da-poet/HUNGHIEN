import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { BannerList } from '@/components/cms/banner-list';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function BannersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <CmsPageHeader
        title="Quản lý Banner"
        description="Quản lý các banner khuyến mãi, giới thiệu trên trang chủ."
      >
        <Link
          href="/banners/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1A2B4C] text-[#E5C37A] rounded-md font-medium hover:bg-[#253A66] transition-colors"
        >
          <Plus className="h-4 w-4" />
          Thêm Banner
        </Link>
      </CmsPageHeader>
      <BannerList />
    </div>
  );
}
