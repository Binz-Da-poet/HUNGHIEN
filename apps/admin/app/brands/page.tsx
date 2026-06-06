import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { BrandManager } from '@/components/cms/brand-manager';

export default function BrandsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <CmsPageHeader
        title="Thương hiệu"
        description="Quản lý danh sách các thương hiệu đối tác hiển thị trên trang chủ."
      />
      <BrandManager />
    </div>
  );
}
