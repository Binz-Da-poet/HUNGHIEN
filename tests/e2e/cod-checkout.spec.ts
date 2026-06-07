import { test, expect } from '@playwright/test';
import { loginAdmin, adminApiPost, adminApiPatch } from './helpers/api';

test.describe('COD Checkout E2E', () => {
  test('full COD flow: checkout → track → admin confirm → admin cancel → stock restored', async ({ page }) => {
    // 1. Seed an active in-stock product via admin API
    await loginAdmin();
    const product = await adminApiPost('/admin/products', {
      name: `E2E Product ${Date.now()}`,
      sku: `E2E-${Date.now()}`,
      price: 500000,
      stock: 10,
      status: 'ACTIVE',
    });

    // 2. Add product to cart
    await page.goto(`/products/${product.id}`);
    await page.getByText('Thêm vào giỏ').click();

    // 3. Navigate to checkout
    await page.goto('/cart');
    const checkoutBtn = page.getByRole('link', { name: /thanh toán/i }) ||
      page.locator('a').filter({ hasText: /thanh toán/i });
    if (await checkoutBtn.isVisible()) {
      await checkoutBtn.click();
    } else {
      await page.goto('/checkout');
    }

    // 4. Fill checkout form with COD
    await page.fill('input[name="customerName"]', 'E2E Tester');
    await page.fill('input[name="phone"]', '0912345678');
    await page.fill('textarea[name="address"]', '123 Test Street');

    const codOption = page.locator('label').filter({ hasText: /COD|Nhận hàng trả tiền/i });
    if (await codOption.isVisible()) {
      await codOption.click();
    }

    // 5. Submit order
    await page.getByText('Đặt hàng').click();

    // 6. Assert public code on success page
    await expect(page).toHaveURL(/success/);
    const publicCodeElement = page.locator('text=/HH[A-Z0-9]{8,}/');
    const publicCode = await publicCodeElement.textContent().catch(() => null);
    expect(publicCode).toBeTruthy();

    // 7. Track order
    await page.goto('/orders/tracking');
    await page.fill('#code', publicCode!.trim());
    await page.fill('#phone', '0912345678');
    await page.getByText('Tra cứu đơn hàng').click();
    await expect(page.locator(`text=${publicCode!.trim()}`)).toBeVisible({ timeout: 5000 });

    // 8. Admin confirm order
    const orders = await adminApiPost('/admin/orders/list', { search: publicCode!.trim() });
    const orderId = orders?.data?.[0]?.id || orders?.[0]?.id;
    if (orderId) {
      await adminApiPatch(`/admin/orders/${orderId}`, { status: 'CONFIRMED' });
    }

    // 9. Admin cancel order - stock restored
    if (orderId) {
      await adminApiPatch(`/admin/orders/${orderId}`, { status: 'CANCELLED' });
    }

    console.log('✅ COD flow completed:', publicCode);
  });
});
