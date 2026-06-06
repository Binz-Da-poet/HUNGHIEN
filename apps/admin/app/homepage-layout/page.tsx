import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { HomepageSectionList } from '@/components/cms/homepage-section-list';

export default function HomepageLayoutPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <CmsPageHeader
        title="Bố cục trang chủ"
        description="Quản lý thứ tự và trạng thái hiển thị của các thành phần trên trang chủ storefront."
      />
      <HomepageSectionList />
    </div>
  );
}
