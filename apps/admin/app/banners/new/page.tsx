import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { BannerForm } from '@/components/cms/banner-form';

export default function NewBannerPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CmsPageHeader
        title="Thêm Banner mới"
        description="Tạo banner quảng bá mới cho trang chủ."
      />
      <BannerForm />
    </div>
  );
}
