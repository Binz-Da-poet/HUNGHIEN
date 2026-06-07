import { PrismaClient, BannerMode, HomepageSectionType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@hunghien.vn';
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || (process.env.NODE_ENV === 'production' ? undefined : 'Admin123!');
  if (!seedPassword) {
    throw new Error('ADMIN_SEED_PASSWORD must be set in production');
  }

  const passwordHash = await bcrypt.hash(seedPassword, 10);

  // 1. Seed Admin
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      name: 'Hùng Hiền Admin',
      isActive: true,
    },
  });
  console.log('Admin user seeded.');

  // Get some products and categories to link
  const allCategories = await prisma.category.findMany();
  const allProducts = await prisma.product.findMany({
    include: { images: true }
  });

  if (allCategories.length === 0 || allProducts.length === 0) {
    console.log('Warning: No categories or products found in DB. Skipping content linking.');
  }

  // 2. Default Sections (Layout)
  const defaultSections = [
    { type: HomepageSectionType.BANNERS, title: 'Banners Chính', sortOrder: 0 },
    { type: HomepageSectionType.SERVICE_BENEFITS, title: 'Dịch vụ Hùng Hiền', sortOrder: 1 },
    { type: HomepageSectionType.FEATURED_CATEGORIES, title: 'Sắm theo danh mục', sortOrder: 2 },
    { type: HomepageSectionType.PRODUCT_GROUP, title: 'Ưu đãi cực sốc', sortOrder: 3, config: { slug: 'hot-deals' } },
    { type: HomepageSectionType.PRODUCT_GROUP, title: 'Hàng mới về', sortOrder: 4, config: { slug: 'new-arrivals' } },
    { type: HomepageSectionType.TRUST_STRIP, title: 'Cam kết chất lượng', sortOrder: 5 },
    { type: HomepageSectionType.FEATURED_BRANDS, title: 'Thương hiệu đối tác', sortOrder: 6 },
  ];

  for (const section of defaultSections) {
    await prisma.homepageSection.upsert({
      where: { id: `section-${section.type.toLowerCase()}-${section.config?.slug || 'main'}` },
      update: section,
      create: {
        id: `section-${section.type.toLowerCase()}-${section.config?.slug || 'main'}`,
        ...section,
      },
    });
  }
  console.log('Homepage sections seeded.');

  // 3. Banners
  const banners = [
    {
      name: 'Summer Sale 2026',
      mode: BannerMode.ARTWORK,
      desktopImageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=1920',
      mobileImageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&q=80&w=640',
      altText: 'Summer Sale up to 50%',
      ctaUrl: '/collections/deals',
      isActive: true,
      sortOrder: 0,
    },
    {
      name: 'New iPhone 17',
      mode: BannerMode.DYNAMIC,
      heading: 'iPhone 17 Pro Max',
      description: 'Sức mạnh khủng khiếp. Camera nâng tầm tuyệt đỉnh.',
      ctaLabel: 'Mua ngay',
      ctaUrl: '/products/iphone-17-pro-max',
      backgroundColor: '#1A2B4C',
      isActive: true,
      sortOrder: 1,
    }
  ];

  for (let i = 0; i < banners.length; i++) {
    await prisma.homepageBanner.upsert({
      where: { id: `banner-${i}` },
      update: banners[i],
      create: { id: `banner-${i}`, ...banners[i] },
    });
  }
  console.log('Banners seeded.');

  // 4. Featured Categories
  if (allCategories.length > 0) {
    const featuredCats = allCategories.slice(0, 6).map((cat, i) => ({
      categoryId: cat.id,
      displayName: cat.name,
      sortOrder: i,
      isActive: true,
    }));

    for (const f of featuredCats) {
      await prisma.featuredCategory.upsert({
        where: { categoryId: f.categoryId },
        update: f,
        create: f,
      });
    }
    console.log('Featured categories seeded.');
  }

  // 5. Product Groups
  if (allProducts.length > 0) {
    const groups = [
      { name: 'Hot Deals', slug: 'hot-deals', title: 'Ưu đãi cực sốc', accent: '#D10024' },
      { name: 'New Arrivals', slug: 'new-arrivals', title: 'Hàng mới về', accent: '#1A2B4C' },
    ];

    for (const g of groups) {
      const group = await prisma.featuredProductGroup.upsert({
        where: { slug: g.slug },
        update: g,
        create: g,
      });

      // Link random 6 products
      const productsToLink = allProducts.sort(() => 0.5 - Math.random()).slice(0, 6);
      await prisma.featuredProductGroupItem.deleteMany({ where: { groupId: group.id } });
      for (let i = 0; i < productsToLink.length; i++) {
        await prisma.featuredProductGroupItem.create({
          data: {
            groupId: group.id,
            productId: productsToLink[i].id,
            sortOrder: i,
          }
        });
      }
    }
    console.log('Product groups seeded.');
  }

  // 6. Benefits
  const benefits = [
    { icon: 'Truck', title: 'Giao hàng 2h', description: 'Nội thành TP.HCM & Hà Nội' },
    { icon: 'ShieldCheck', title: 'Chính hãng 100%', description: 'Hoàn tiền gấp đôi nếu phát hiện giả' },
    { icon: 'RotateCcw', title: '1 đổi 1 tận nơi', description: 'Trong vòng 30 ngày nếu lỗi NSX' },
    { icon: 'Headphones', title: 'Hỗ trợ 24/7', description: 'Giải đáp mọi thắc mắc ngay lập tức' },
  ];

  for (let i = 0; i < benefits.length; i++) {
    await prisma.storeBenefit.upsert({
      where: { id: `benefit-${i}` },
      update: { ...benefits[i], sortOrder: i },
      create: { id: `benefit-${i}`, ...benefits[i], sortOrder: i },
    });
  }
  console.log('Benefits seeded.');

  // 7. Brands
  const brands = [
    { name: 'Sony', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg' },
    { name: 'Samsung', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg' },
    { name: 'Apple', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'LG', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg' },
  ];

  for (let i = 0; i < brands.length; i++) {
    await prisma.featuredBrand.upsert({
      where: { id: `brand-${i}` },
      update: { ...brands[i], sortOrder: i },
      create: { id: `brand-${i}`, ...brands[i], sortOrder: i },
    });
  }
  console.log('Brands seeded.');

  // 8. Store Settings
  await prisma.storeSettings.upsert({
    where: { id: 'main' },
    update: {
      hotline: '1900 1234',
      email: 'contact@hunghien.vn',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      companySummary: 'Hùng Hiền Điện Máy - Hệ thống bán lẻ điện tử, gia dụng và nội thất uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang đến sản phẩm chính hãng và dịch vụ hậu mãi tuyệt vời.',
      newsletterCopy: 'Đăng ký nhận tin để không bỏ lỡ các chương trình khuyến mãi hấp dẫn từ Hùng Hiền.',
    },
    create: {
      id: 'main',
      hotline: '1900 1234',
      email: 'contact@hunghien.vn',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      companySummary: 'Hùng Hiền Điện Máy - Hệ thống bán lẻ điện tử, gia dụng và nội thất uy tín hàng đầu Việt Nam. Chúng tôi cam kết mang đến sản phẩm chính hãng và dịch vụ hậu mãi tuyệt vời.',
      newsletterCopy: 'Đăng ký nhận tin để không bỏ lỡ các chương trình khuyến mãi hấp dẫn từ Hùng Hiền.',
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
