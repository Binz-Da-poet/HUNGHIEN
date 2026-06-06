import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { ProductGroupForm } from '@/components/cms/product-group-form';

export default function NewProductGroupPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CmsPageHeader
        title="Thêm Nhóm sản phẩm mới"
        description="Tạo bộ sưu tập sản phẩm mới để hiển thị trên trang chủ."
      />
      <ProductGroupForm />
    </div>
  );
}
