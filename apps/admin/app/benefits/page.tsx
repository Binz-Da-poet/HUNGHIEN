import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { BenefitManager } from '@/components/cms/benefit-manager';

export default function BenefitsPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <CmsPageHeader
        title="Cam kết dịch vụ"
        description="Quản lý các thông tin cam kết dịch vụ (Service Benefits) ở chân trang chủ."
      />
      <BenefitManager />
    </div>
  );
}
