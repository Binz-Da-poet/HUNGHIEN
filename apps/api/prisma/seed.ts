import { PrismaClient, BannerMode, HomepageSectionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    console.error('Missing ADMIN_SEED_EMAIL or ADMIN_SEED_PASSWORD environment variables.');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Seed Admin
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: 'Super Admin',
      isActive: true,
    },
  });

  console.log('Admin user seeded.');

  // Default Sections
  const defaultSections = [
    { type: HomepageSectionType.BANNERS, title: 'Banners', sortOrder: 0 },
    { type: HomepageSectionType.SERVICE_BENEFITS, title: 'Dịch vụ & Tiện ích', sortOrder: 1 },
    { type: HomepageSectionType.FEATURED_CATEGORIES, title: 'Danh mục nổi bật', sortOrder: 2 },
    { type: HomepageSectionType.PRODUCT_GROUP, title: 'Sản phẩm mới nhất', sortOrder: 3, config: { slug: 'new-arrivals' } },
    { type: HomepageSectionType.TRUST_STRIP, title: 'Cam kết chất lượng', sortOrder: 4 },
  ];

  for (const section of defaultSections) {
    await prisma.homepageSection.upsert({
      where: { id: `section-${section.type.toLowerCase()}` },
      update: section,
      create: {
        id: `section-${section.type.toLowerCase()}`,
        ...section,
      },
    });
  }

  console.log('Homepage sections seeded.');

  // Store Benefits
  const benefits = [
    { icon: 'Truck', title: 'Giao hàng hỏa tốc', description: 'Trong vòng 2h tại TP.HCM' },
    { icon: 'ShieldCheck', title: 'Bảo hành chính hãng', description: 'Lên đến 24 tháng' },
    { icon: 'RotateCcw', title: 'Đổi trả dễ dàng', description: 'Trong vòng 7 ngày' },
    { icon: 'Headphones', title: 'Hỗ trợ 24/7', description: 'Tận tâm & chuyên nghiệp' },
  ];

  for (let i = 0; i < benefits.length; i++) {
    await prisma.storeBenefit.upsert({
      where: { id: `benefit-${i}` },
      update: { ...benefits[i], sortOrder: i },
      create: {
        id: `benefit-${i}`,
        ...benefits[i],
        sortOrder: i,
      },
    });
  }

  console.log('Store benefits seeded.');

  // Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      hotline: '1900 1234',
      email: 'contact@hunghien.vn',
      address: '123 Đường ABC, Quận 1, TP.HCM',
    },
  });

  console.log('Store settings seeded.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
