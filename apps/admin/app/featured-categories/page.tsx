import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { FeaturedCategoryManager } from '@/components/cms/featured-category-manager';

export default function FeaturedCategoriesPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <CmsPageHeader
        title="Danh mục nổi bật"
        description="Quản lý các danh mục hàng hóa xuất hiện trên trang chủ."
      />
      <FeaturedCategoryManager />
    </div>
  );
}
