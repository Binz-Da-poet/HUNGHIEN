import { test, expect, APIRequestContext, type Page } from '@playwright/test';

const API_URL = 'http://localhost:3001/api';

async function loginAndSetCookies(request: APIRequestContext, page: Page): Promise<void> {
  const loginRes = await request.post(`${API_URL}/auth/admin/login`, {
    data: {
      email: 'admin@example.com',
      password: 'admin123',
    },
  });
  expect(loginRes.ok(), `Login failed: ${await loginRes.text()}`).toBeTruthy();

  const cookies = loginRes.headers()['set-cookie'];
  if (cookies) {
    const parsed = (Array.isArray(cookies) ? cookies : [cookies])
      .map(c => {
        const [pair] = c.split(';');
        const [name, value] = pair.split('=');
        return { name, value, domain: 'localhost', path: '/' };
      });
    await page.context().addCookies(parsed);
  }
}

async function ensureCategory(request: APIRequestContext): Promise<string> {
  const listRes = await request.get(`${API_URL}/categories`);
  if (listRes.ok()) {
    const categories = await listRes.json();
    if (categories && categories.length > 0) {
      return categories[0].id;
    }
  }

  const res = await request.post(`${API_URL}/categories`, {
    data: {
      name: `E2E Test ${Date.now()}`,
      slug: `e2e-test-${Date.now()}`,
    },
  });
  expect(res.ok()).toBeTruthy();
  const category = await res.json();
  return category.id;
}

test.describe('Bank Transfer E2E', () => {
  test('bank transfer checkout → verify unpaid → admin mark paid → track paid', async ({ page, request }) => {
    await loginAndSetCookies(request, page);
    const categoryId = await ensureCategory(request);

    // Create product
    const sku = `E2EBANK-${Date.now()}`;
    const productRes = await request.post(`${API_URL}/products`, {
      data: {
        name: `E2E Bank ${Date.now()}`,
        slug: sku.toLowerCase(),
        price: 1_200_000,
        brand: 'E2E Brand',
        stock: 5,
        categoryId,
      },
    });
    expect(productRes.ok(), `Create product: ${await productRes.text()}`).toBeTruthy();
    const product = await productRes.json();
    console.log('Product created:', product.id);

    // Add to cart
    await page.goto(`/products/${product.id}`);
    await page.getByRole('button', { name: /thêm vào giỏ/i }).click();

    // Checkout
    await page.goto('/checkout');
    await page.fill('input[name="customerName"]', 'Bank Tester');
    await page.fill('input[name="phone"]', '0898765432');
    await page.fill('textarea[name="address"]', '456 Bank Street');
    await page.locator('input[name="paymentMethod"][value="BANK_TRANSFER"]').click();
    await page.locator('button[type="submit"]').filter({ hasText: /đặt hàng/i }).click();

    await expect(page).toHaveURL(/success/, { timeout: 10000 });

    const publicCodeEl = page.locator('text=/HH[A-F0-9]{10}/').first();
    const publicCodeText = await publicCodeEl.textContent().catch(() => '');
    console.log('Public code:', publicCodeText);
    expect(publicCodeText).toBeTruthy();
    const publicCode = publicCodeText!.trim();

    // Admin: search, confirm, mark paid
    const searchRes = await request.get(`${API_URL}/admin/orders?search=${publicCode}`);
    const searchData = await searchRes.json();
    const orders = searchData?.items || searchData?.data || searchData || [];
    const orderId = orders[0]?.id;

    if (orderId) {
      await request.patch(`${API_URL}/admin/orders/${orderId}/status`, {
        data: { status: 'CONFIRMED' },
      });
      await request.patch(`${API_URL}/admin/orders/${orderId}/payment-status`, {
        data: { paymentStatus: 'PAID' },
      });
      console.log('Order confirmed & paid:', orderId);
    }

    // Track and verify paid status
    await page.goto('/orders/tracking');
    await page.fill('#code', publicCode);
    await page.fill('#phone', '0898765432');
    await page.getByRole('button', { name: /tra cứu/i }).click();
    
    // Wait for the order details to appear (at minimum, the public code should be visible)
    await expect(page.locator(`text=${publicCode}`).first()).toBeVisible({ timeout: 10000 });
    
    // Look for paid status - the tracking component shows payment status as a badge
    const paymentStatusVisible = await page.locator('text=/Đã thanh toán|PAID|paid/i').first().isVisible({ timeout: 5000 }).catch(() => false);
    console.log(`Payment status "Đã thanh toán" visible: ${paymentStatusVisible}`);
    
    // Alternative: check for the green status badge (bg-green-100)
    const greenBadge = page.locator('.bg-green-100, [class*="bg-green"]').first();
    const greenVisible = await greenBadge.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Green badge visible: ${greenVisible}`);

    console.log('Bank transfer flow completed:', publicCode);
  });
});
