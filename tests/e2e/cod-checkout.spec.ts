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
  // Try to get existing categories first
  const listRes = await request.get(`${API_URL}/categories`);
  if (listRes.ok()) {
    const categories = await listRes.json();
    if (categories && categories.length > 0) {
      return categories[0].id;
    }
  }
  
  // Create a test category
  const res = await request.post(`${API_URL}/categories`, {
    data: {
      name: `E2E Test ${Date.now()}`,
      slug: `e2e-test-${Date.now()}`,
    },
  });
  expect(res.ok(), `Create category: ${await res.text()}`).toBeTruthy();
  const category = await res.json();
  return category.id;
}

test.describe('COD Checkout E2E', () => {
  test('full COD flow', async ({ page, request }) => {
    await loginAndSetCookies(request, page);
    const categoryId = await ensureCategory(request);

    // Create product
    const sku = `E2ECOD-${Date.now()}`;
    const productRes = await request.post(`${API_URL}/products`, {
      data: {
        name: `E2E COD ${Date.now()}`,
        slug: sku.toLowerCase(),
        price: 500000,
        brand: 'E2E Brand',
        stock: 10,
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
    await page.fill('input[name="customerName"]', 'E2E Tester');
    await page.fill('input[name="phone"]', '0912345678');
    await page.fill('textarea[name="address"]', '123 Test Street');
    await page.locator('button[type="submit"]').filter({ hasText: /đặt hàng/i }).click();

    await expect(page).toHaveURL(/success/, { timeout: 10000 });
    
    const publicCodeEl = page.locator('text=/HH[A-F0-9]{10}/').first();
    const publicCodeText = await publicCodeEl.textContent().catch(() => '');
    console.log('Public code:', publicCodeText);
    expect(publicCodeText).toBeTruthy();
    const publicCode = publicCodeText!.trim();

    // Track order
    await page.goto('/orders/tracking');
    await page.fill('#code', publicCode);
    await page.fill('#phone', '0912345678');
    await page.getByRole('button', { name: /tra cứu/i }).click();
    await expect(page.locator(`text=${publicCode}`).first()).toBeVisible({ timeout: 10000 });

    // Admin: search order, confirm, cancel
    const searchRes = await request.get(`${API_URL}/admin/orders?search=${publicCode}`);
    const searchData = await searchRes.json();
    const orders = searchData?.items || searchData?.data || searchData || [];
    const orderId = orders[0]?.id;

    if (orderId) {
      await request.patch(`${API_URL}/admin/orders/${orderId}/status`, {
        data: { status: 'CONFIRMED' },
      });
      await request.patch(`${API_URL}/admin/orders/${orderId}/status`, {
        data: { status: 'CANCELLED' },
      });
      console.log('Order confirmed & cancelled:', orderId);
    }

    console.log('COD flow completed:', publicCode);
  });
});
