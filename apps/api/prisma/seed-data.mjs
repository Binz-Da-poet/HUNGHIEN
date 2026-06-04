import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const imageMap = [
  { slug: 'iphone-15-128gb', urls: ['https://picsum.photos/seed/iphone15/800/800', 'https://picsum.photos/seed/iphone15b/800/800'] },
  { slug: 'samsung-galaxy-s24', urls: ['https://picsum.photos/seed/galaxys24/800/800'] },
  { slug: 'xiaomi-redmi-note-13', urls: ['https://picsum.photos/seed/redmi13/800/800'] },
  { slug: 'macbook-air-m2-13', urls: ['https://picsum.photos/seed/macbookair/800/800'] },
  { slug: 'asus-vivobook-15', urls: ['https://picsum.photos/seed/vivobook/800/800'] },
  { slug: 'airpods-pro-2', urls: ['https://picsum.photos/seed/airpods/800/800'] },
];

async function seedImages() {
  let count = 0;
  for (const item of imageMap) {
    const product = await prisma.product.findUnique({
      where: { slug: item.slug },
      include: { images: true },
    });
    if (!product || product.images.length) continue;

    for (const [index, url] of item.urls.entries()) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          altText: product.name,
          sortOrder: index,
          isPrimary: index === 0,
        },
      });
    }
    count += 1;
  }
  return count;
}

async function seedOrders() {
  const existing = await prisma.order.count();
  if (existing > 0) return 0;

  const iphone = await prisma.product.findUnique({ where: { slug: 'iphone-15-128gb' } });
  const airpods = await prisma.product.findUnique({ where: { slug: 'airpods-pro-2' } });
  const opLung = await prisma.product.findUnique({ where: { slug: 'op-lung-iphone-15' } });

  if (!iphone || !airpods || !opLung) return 0;

  await prisma.$transaction(async (tx) => {
    const order1Items = [{ productId: iphone.id, quantity: 1, priceAtPurchase: iphone.price }];
    await tx.product.update({ where: { id: iphone.id }, data: { stock: { decrement: 1 } } });
    await tx.order.create({
      data: {
        customerName: 'Nguyễn Văn An',
        phone: '0901234567',
        address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
        note: 'Giao giờ hành chính',
        paymentMethod: 'COD',
        status: 'PENDING',
        totalAmount: iphone.price,
        items: { create: order1Items },
      },
    });

    const order2QtyAirpods = 1;
    const order2QtyOpLung = 2;
    const total2 =
      Number(airpods.price) * order2QtyAirpods + Number(opLung.price) * order2QtyOpLung;

    await tx.product.update({ where: { id: airpods.id }, data: { stock: { decrement: order2QtyAirpods } } });
    await tx.product.update({ where: { id: opLung.id }, data: { stock: { decrement: order2QtyOpLung } } });
    await tx.order.create({
      data: {
        customerName: 'Trần Thị Bình',
        phone: '0918765432',
        address: '45 Lê Lợi, Đà Nẵng',
        paymentMethod: 'BANK_TRANSFER',
        status: 'SHIPPING',
        totalAmount: total2,
        items: {
          create: [
            { productId: airpods.id, quantity: order2QtyAirpods, priceAtPurchase: airpods.price },
            { productId: opLung.id, quantity: order2QtyOpLung, priceAtPurchase: opLung.price },
          ],
        },
      },
    });
  });

  return 2;
}

async function fixVietnameseLabels() {
  await prisma.category.updateMany({ where: { slug: 'dien-thoai' }, data: { name: 'Điện thoại' } });
  await prisma.category.updateMany({ where: { slug: 'phu-kien' }, data: { name: 'Phụ kiện' } });
  await prisma.product.updateMany({ where: { slug: 'sac-nhanh-20w-usb-c' }, data: { name: 'Sạc nhanh 20W USB-C' } });
  await prisma.product.updateMany({ where: { slug: 'op-lung-iphone-15' }, data: { name: 'Ốp lưng iPhone 15' } });

  const orders = await prisma.order.findMany();
  for (const order of orders) {
    if (order.phone === '0901234567') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          customerName: 'Nguyễn Văn An',
          address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
          note: 'Giao giờ hành chính',
        },
      });
    }
    if (order.phone === '0918765432') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          customerName: 'Trần Thị Bình',
          address: '45 Lê Lợi, Đà Nẵng',
        },
      });
    }
  }
}

const imageProducts = await seedImages();
const orderCount = await seedOrders();
await fixVietnameseLabels();
const [categories, products, orders] = await Promise.all([
  prisma.category.count(),
  prisma.product.count(),
  prisma.order.count(),
]);

console.log(JSON.stringify({ categories, products, orders, imageProductsSeeded: imageProducts, ordersCreated: orderCount }, null, 2));

await prisma.$disconnect();
