import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedCategory {
  name: string;
  slug: string;
}

interface SeedProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  brand: string;
  stock: number;
  categorySlug: string;
  specs: Record<string, string>;
}

const categories: SeedCategory[] = [
  { name: 'Tivi', slug: 'tivi' },
  { name: 'Tủ lạnh', slug: 'tu-lanh' },
  { name: 'Máy giặt', slug: 'may-giat' },
  { name: 'Điều hòa', slug: 'dieu-hoa' },
  { name: 'Gia dụng', slug: 'gia-dung' },
];

const products: SeedProduct[] = [
  // --- TIVI ---
  {
    name: 'Smart Tivi Samsung QLED 4K 55 inch QA55Q60D',
    slug: 'tivi-samsung-qled-4k-55inch',
    description: 'Công nghệ Quantum Dot hiển thị 100% dải màu. Bộ xử lý Quantum Lite 4K nâng cấp hình ảnh sắc nét. Hệ điều hành Tizen thông minh, tích hợp Samsung TV Plus, Netflix, YouTube.',
    price: 12900000,
    originalPrice: 17900000,
    brand: 'Samsung',
    stock: 15,
    categorySlug: 'tivi',
    specs: { 'Kích thước': '55 inch', 'Độ phân giải': '4K (3840 x 2160)', 'Công nghệ': 'QLED', 'HĐH': 'Tizen', 'Cổng kết nối': '3 HDMI, 2 USB' },
  },
  {
    name: 'Smart Tivi OLED LG 65 inch 65C4PSA',
    slug: 'tivi-lg-oled-65inch',
    description: 'Công nghệ OLED tự phát sáng cho màu đen tuyệt đối. Chip xử lý α9 AI 4K Gen7 tối ưu hình ảnh và âm thanh theo nội dung. Dolby Vision & Dolby Atmos.',
    price: 32900000,
    originalPrice: 45900000,
    brand: 'LG',
    stock: 8,
    categorySlug: 'tivi',
    specs: { 'Kích thước': '65 inch', 'Độ phân giải': '4K (3840 x 2160)', 'Công nghệ': 'OLED', 'HĐH': 'webOS', 'Cổng kết nối': '4 HDMI 2.1, 3 USB' },
  },
  {
    name: 'Android Tivi Sony Bravia 4K 50 inch KD-50X75K',
    slug: 'tivi-sony-bravia-50inch',
    description: 'Công nghệ 4K HDR Processor X1 tái tạo hình ảnh chân thực. Google TV với kho ứng dụng phong phú. Công nghệ âm thanh X-Balanced Speaker.',
    price: 10900000,
    originalPrice: 14900000,
    brand: 'Sony',
    stock: 12,
    categorySlug: 'tivi',
    specs: { 'Kích thước': '50 inch', 'Độ phân giải': '4K (3840 x 2160)', 'Công nghệ': 'LED', 'HĐH': 'Google TV', 'Cổng kết nối': '3 HDMI, 2 USB' },
  },
  {
    name: 'Smart Tivi TCL 4K 43 inch 43P635',
    slug: 'tivi-tcl-43inch',
    description: 'Màn hình 4K HDR sắc nét. Công nghệ Dolby Audio cho âm thanh sống động. Google TV tích hợp trợ lý giọng nói. Giá tốt cho gia đình.',
    price: 5490000,
    originalPrice: 7490000,
    brand: 'TCL',
    stock: 20,
    categorySlug: 'tivi',
    specs: { 'Kích thước': '43 inch', 'Độ phân giải': '4K (3840 x 2160)', 'Công nghệ': 'LED', 'HĐH': 'Google TV', 'Cổng kết nối': '2 HDMI, 1 USB' },
  },

  // --- TỦ LẠNH ---
  {
    name: 'Tủ lạnh LG Inverter 2 cửa 507 lít GR-B257JDS',
    slug: 'tu-lanh-lg-inverter-507lit',
    description: 'Công nghệ Inverter tiết kiệm điện 40%. Ngăn đông lớn 152 lít. Công nghệ DoorCooling+ làm lạnh toàn diện. Kháng khuẩn Hygiene Fresh+.',
    price: 8900000,
    originalPrice: 12400000,
    brand: 'LG',
    stock: 10,
    categorySlug: 'tu-lanh',
    specs: { 'Dung tích': '507 lít', 'Số cửa': '2 cửa', 'Công nghệ': 'Inverter', 'Ngăn đông': '152 lít', 'Kích thước': '780 x 1800 x 730 mm' },
  },
  {
    name: 'Tủ lạnh Samsung Side-by-Side 647 lít RS64R5101B4',
    slug: 'tu-lanh-samsung-sidebyside-647lit',
    description: 'Thiết kế Side-by-Side sang trọng. Công nghệ làm lạnh vòm All-Around Cooling. Ngăn đông lớn, làm đá tự động. Tiết kiệm điện với Digital Inverter.',
    price: 14900000,
    originalPrice: 21900000,
    brand: 'Samsung',
    stock: 6,
    categorySlug: 'tu-lanh',
    specs: { 'Dung tích': '647 lít', 'Số cửa': 'Side-by-Side', 'Công nghệ': 'Digital Inverter', 'Ngăn đông': '228 lít', 'Kích thước': '912 x 1780 x 716 mm' },
  },
  {
    name: 'Tủ lạnh Panasonic Inverter 3 cửa 365 lít NR-BV361WGKV',
    slug: 'tu-lanh-panasonic-inverter-365lit',
    description: 'Công nghệ PrimeFresh giữ thực phẩm tươi lâu. Ngăn đông mềm -3°C không cần rã đông. Inverter tiết kiệm điện.',
    price: 10900000,
    originalPrice: 13900000,
    brand: 'Panasonic',
    stock: 9,
    categorySlug: 'tu-lanh',
    specs: { 'Dung tích': '365 lít', 'Số cửa': '3 cửa', 'Công nghệ': 'Inverter', 'Ngăn đông': '89 lít', 'Kích thước': '600 x 1830 x 675 mm' },
  },
  {
    name: 'Tủ lạnh Hitachi 4 cửa 540 lít R-FG570PGV7',
    slug: 'tu-lanh-hitachi-4cua-540lit',
    description: 'Công nghệ chân không bảo quản thực phẩm. Ngăn đông mềm tiện lợi. Cảm biến Eco tự động điều chỉnh nhiệt độ.',
    price: 17900000,
    originalPrice: 24900000,
    brand: 'Hitachi',
    stock: 5,
    categorySlug: 'tu-lanh',
    specs: { 'Dung tích': '540 lít', 'Số cửa': '4 cửa', 'Công nghệ': 'Inverter', 'Ngăn đông': '115 lít', 'Kích thước': '685 x 1833 x 738 mm' },
  },

  // --- MÁY GIẶT ---
  {
    name: 'Máy giặt LG Inverter 10kg cửa trước FC1409S4W',
    slug: 'may-giat-lg-inverter-10kg',
    description: 'Công nghệ AI DD phát hiện chất liệu vải và điều chỉnh chuyển động giặt tối ưu. Giặt hơi nước Steam+ diệt khuẩn 99.9%. Động cơ truyền động trực tiếp bền bỉ.',
    price: 7990000,
    originalPrice: 10900000,
    brand: 'LG',
    stock: 14,
    categorySlug: 'may-giat',
    specs: { 'Khối lượng': '10 kg', 'Loại máy': 'Cửa trước', 'Công nghệ': 'Inverter AI DD', 'Tốc độ vắt': '1400 vòng/phút', 'Kích thước': '600 x 850 x 610 mm' },
  },
  {
    name: 'Máy giặt Samsung AddWash 9kg cửa trước WW90T3020WW',
    slug: 'may-giat-samsung-addwash-9kg',
    description: 'Cửa phụ AddWash thêm đồ trong khi đang giặt. Công nghệ EcoBubble tạo bọt siêu mịn giặt sạch ở nhiệt độ thấp. Digital Inverter tiết kiệm điện.',
    price: 6190000,
    originalPrice: 8490000,
    brand: 'Samsung',
    stock: 11,
    categorySlug: 'may-giat',
    specs: { 'Khối lượng': '9 kg', 'Loại máy': 'Cửa trước', 'Công nghệ': 'Digital Inverter', 'Tốc độ vắt': '1200 vòng/phút', 'Kích thước': '600 x 850 x 550 mm' },
  },
  {
    name: 'Máy giặt Electrolux Inverter 10kg cửa trước EWF1024P5WB',
    slug: 'may-giat-electrolux-10kg',
    description: 'Công nghệ Vapour Care giặt hơi nước diệt khuẩn. Cảm biến SensorWash tối ưu thời gian giặt. Động cơ EcoInverter tiết kiệm điện.',
    price: 8490000,
    originalPrice: 11900000,
    brand: 'Electrolux',
    stock: 8,
    categorySlug: 'may-giat',
    specs: { 'Khối lượng': '10 kg', 'Loại máy': 'Cửa trước', 'Công nghệ': 'EcoInverter', 'Tốc độ vắt': '1200 vòng/phút', 'Kích thước': '600 x 850 x 605 mm' },
  },
  {
    name: 'Máy giặt Toshiba 9kg cửa trên AW-DUM0900KV',
    slug: 'may-giat-toshiba-9kg',
    description: 'Công nghệ giặt bong bóng Nano cho hiệu quả làm sạch cao. Mâm giặt Stellaria chống bám cặn. Nắp kính cường lực chịu lực tốt.',
    price: 4490000,
    originalPrice: 5990000,
    brand: 'Toshiba',
    stock: 16,
    categorySlug: 'may-giat',
    specs: { 'Khối lượng': '9 kg', 'Loại máy': 'Cửa trên', 'Công nghệ': 'Inverter', 'Tốc độ vắt': '750 vòng/phút', 'Kích thước': '590 x 990 x 610 mm' },
  },

  // --- ĐIỀU HÒA ---
  {
    name: 'Điều hòa Daikin Inverter 12000BTU FTKC35UAVMV',
    slug: 'dieu-hoa-daikin-inverter-12000btu',
    description: 'Công nghệ Inverter tiết kiệm 60% điện năng. Phin lọc Enzyme Blue kháng khuẩn, khử mùi. Dàn tản nhiệt chống ăn mòn. Vận hành êm ái.',
    price: 10690000,
    originalPrice: 13900000,
    brand: 'Daikin',
    stock: 12,
    categorySlug: 'dieu-hoa',
    specs: { 'Công suất': '12000 BTU', 'Loại': '1 chiều lạnh', 'Công nghệ': 'Inverter', 'Phạm vi': '15-20 m²', 'Gas': 'R-32' },
  },
  {
    name: 'Điều hòa Panasonic Inverter 9000BTU XPU9XKH-8',
    slug: 'dieu-hoa-panasonic-inverter-9000btu',
    description: 'Công nghệ nanoe X lọc không khí, diệt khuẩn 99%. Eco AI tự động điều chỉnh nhiệt độ tiết kiệm điện. Làm lạnh nhanh Powerful.',
    price: 8690000,
    originalPrice: 11900000,
    brand: 'Panasonic',
    stock: 10,
    categorySlug: 'dieu-hoa',
    specs: { 'Công suất': '9000 BTU', 'Loại': '1 chiều lạnh', 'Công nghệ': 'Inverter', 'Phạm vi': '12-15 m²', 'Gas': 'R-32' },
  },
  {
    name: 'Điều hòa Mitsubishi Heavy 18000BTU SRK18YL-S5',
    slug: 'dieu-hoa-mitsubishi-18000btu',
    description: 'Công nghệ Jet Flow luồng gió xa 12m. Dàn trao đổi nhiệt phủ Blue Fin chống ăn mòn. Chip 32-bit điều khiển thông minh.',
    price: 14900000,
    originalPrice: 19900000,
    brand: 'Mitsubishi',
    stock: 7,
    categorySlug: 'dieu-hoa',
    specs: { 'Công suất': '18000 BTU', 'Loại': '1 chiều lạnh', 'Công nghệ': 'Inverter', 'Phạm vi': '20-30 m²', 'Gas': 'R-410A' },
  },
  {
    name: 'Điều hòa LG Dual Inverter 12000BTU V13ENF',
    slug: 'dieu-hoa-lg-dual-inverter-12000btu',
    description: 'Máy nén Dual Inverter tiết kiệm điện 70%. Công nghệ lọc khí Plasmaster Ionizer++. Làm lạnh tức thì Jet Cool. Hoạt động êm 19dB.',
    price: 9490000,
    originalPrice: 12900000,
    brand: 'LG',
    stock: 13,
    categorySlug: 'dieu-hoa',
    specs: { 'Công suất': '12000 BTU', 'Loại': '1 chiều lạnh', 'Công nghệ': 'Dual Inverter', 'Phạm vi': '15-20 m²', 'Gas': 'R-32' },
  },

  // --- GIA DỤNG ---
  {
    name: 'Nồi cơm điện cao tần Cuckoo CR-0632F',
    slug: 'noi-com-cuckoo-cao-tan',
    description: 'Công nghệ cao tần IH nấu cơm ngon như nồi gang. Lòng nồi X-Wall Diamond phủ kim cương chống dính tuyệt đối. Chế độ nấu đa dạng.',
    price: 3490000,
    originalPrice: 4990000,
    brand: 'Cuckoo',
    stock: 20,
    categorySlug: 'gia-dung',
    specs: { 'Dung tích': '0.63 lít', 'Công suất': '890W', 'Loại': 'Cao tần IH', 'Lòng nồi': 'X-Wall Diamond', 'Chế độ': 'Gạo lứt, cháo, giữ ấm, hẹn giờ' },
  },
  {
    name: 'Lò vi sóng Sharp Inverter 25 lít R-25ATG',
    slug: 'lo-vi-song-sharp-inverter-25lit',
    description: 'Công nghệ Inverter hâm nóng đều, rã đông chính xác. 8 chế độ nấu tự động. Điều khiển nút vặn dễ sử dụng. Khoang rộng 25 lít.',
    price: 2190000,
    originalPrice: 2990000,
    brand: 'Sharp',
    stock: 18,
    categorySlug: 'gia-dung',
    specs: { 'Dung tích': '25 lít', 'Công suất': '900W', 'Công nghệ': 'Inverter', 'Điều khiển': 'Nút vặn', 'Chế độ': '8 chế độ tự động' },
  },
  {
    name: 'Máy lọc không khí Xiaomi Mi Air Purifier 4 Pro',
    slug: 'may-loc-khong-khi-xiaomi-4pro',
    description: 'Cảm biến laser độ chính xác cao. Màng lọc HEPA H13 lọc 99.97% bụi PM0.3. Phủ sóng diện tích đến 60m². Kết nối app Xiaomi Home.',
    price: 4490000,
    originalPrice: 5990000,
    brand: 'Xiaomi',
    stock: 15,
    categorySlug: 'gia-dung',
    specs: { 'Diện tích': '35-60 m²', 'Công suất': '50W', 'Màng lọc': 'HEPA H13', 'Độ ồn': '32-64 dB', 'Kết nối': 'WiFi, Xiaomi Home' },
  },
  {
    name: 'Quạt điều hòa Sunhouse SHD7788',
    slug: 'quat-dieu-hoa-sunhouse-shd7788',
    description: 'Làm mát nhanh với đệm làm mát Cooling Pad. 3 chế độ gió, điều khiển từ xa. Bình chứa nước 40 lít dùng cả ngày. Tiết kiệm điện hơn điều hòa.',
    price: 2790000,
    originalPrice: 3890000,
    brand: 'Sunhouse',
    stock: 22,
    categorySlug: 'gia-dung',
    specs: { 'Công suất': '200W', 'Dung tích nước': '40 lít', 'Chế độ gió': '3 chế độ', 'Điều khiển': 'Remote, cảm ứng', 'Kích thước': '380 x 390 x 890 mm' },
  },
];

async function main() {
  console.log('Seeding categories...');
  const catMap = new Map<string, string>();

  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
    catMap.set(cat.slug, created.id);
    console.log(`  ${created.name} (${created.slug})`);
  }

  console.log(`\nSeeding ${products.length} products...`);
  for (const p of products) {
    const catId = catMap.get(p.categorySlug);
    if (!catId) {
      console.log(`  SKIP ${p.name}: category ${p.categorySlug} not found`);
      continue;
    }

    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        brand: p.brand,
        stock: p.stock,
        specs: p.specs,
        categoryId: catId,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice,
        brand: p.brand,
        stock: p.stock,
        specs: p.specs,
        categoryId: catId,
      },
    });
    console.log(`  ${p.name}`);
  }

  // Update seed categoriesCount
  const totalCats = await prisma.category.count();
  const totalProds = await prisma.product.count();
  console.log(`\nDone. ${totalCats} categories, ${totalProds} products.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
