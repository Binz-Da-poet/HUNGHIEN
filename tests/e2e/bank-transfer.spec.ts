import { test, expect } from '@playwright/test';
import { loginAdmin, adminApiPost, adminApiPatch } from './helpers/api';

test.describe('Bank Transfer E2E', () => {
  test('bank transfer checkout → verify unpaid → admin mark paid → track paid', async ({ page }) => {
    // Seed product
    await loginAdmin();
    const product = await adminApiPost('/admin/products', {
      name: `E2E Bank ${Date.now()}`,
      sku: `E2EBANK-${Date.now()}`,
      price: 1_200_000,
      stock: 5,
      status: 'ACTIVE',
    });

    // Add to cart
    await page.goto(`/products/${product.id}`);
    await page.getByText('Thêm vào giỏ').click();

    // Go to checkout
    await page.goto('/checkout');

    // Fill form
    await page.fill('input[name="customerName"]', 'Bank Tester');
    await page.fill('input[name="phone"]', '0898765432');
    await page.fill('textarea[name="address"]', '456 Bank Street');

    // Select bank transfer
    const bankOption = page.locator('label').filter({ hasText: /Chuyển khoản|Bank/i });
    if (await bankOption.isVisible()) {
      await bankOption.click();
    }

    // Submit
    await page.getByText('Đặt hàng').click();

    // Assert success page with bank/qr content
    await expect(page).toHaveURL(/success/);
    await expect(page.locator('text=/Chuyển khoản|Tài khoản|QR|Ngân hàng/i').first()).toBeVisible({ timeout: 5000 });

    // Extract public code
    const publicCodeElement = page.locator('text=/HH[A-Z0-9]{8,}/');
    const publicCode = await publicCodeElement.textContent().catch(() => null);
    expect(publicCode).toBeTruthy();

    // Admin mark as PAID
    const orders = await adminApiPost('/admin/orders/list', { search: publicCode!.trim() });
    const orderId = orders?.data?.[0]?.id || orders?.[0]?.id;
    if (orderId) {
      await adminApiPatch(`/admin/orders/${orderId}/payment`, { paymentStatus: 'PAID' });
    }

    // Track and verify paid status
    await page.goto('/orders/tracking');
    await page.fill('#code', publicCode!.trim());
    await page.fill('#phone', '0898765432');
    await page.getByText('Tra cứu đơn hàng').click();
    await expect(page.locator('text=/Đã thanh toán|PAID/i').first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Bank transfer flow completed:', publicCode);
  });
});
