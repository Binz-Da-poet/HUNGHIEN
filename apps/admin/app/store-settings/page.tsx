import { CmsPageHeader } from '@/components/cms/cms-page-header';
import { StoreSettingsForm } from '@/components/cms/store-settings-form';

export default function StoreSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <CmsPageHeader
        title="Thông tin cửa hàng"
        description="Cấu hình thông tin liên hệ, địa chỉ và các liên kết mạng xã hội."
      />
      <StoreSettingsForm />
    </div>
  );
}
