import { test, expect } from '@playwright/test';
import { loginAdmin } from './helpers/api';

test.describe('Admin Content E2E', () => {
  test('admin creates draft → storefront unavailable → publish → storefront renders', async ({ page }) => {
    // 1. Login admin via browser
    await page.goto('http://localhost:3002/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.getByText('Đăng nhập').click();
    await expect(page).toHaveURL('http://localhost:3002/', { timeout: 5000 });

    // 2. Navigate to create policy
    await page.goto('http://localhost:3002/content/policy/new');

    // 3. Create a draft policy
    const slug = `e2e-draft-${Date.now()}`;
    await page.fill('input[name="title"]', 'E2E Draft Policy');
    await page.fill('input[name="slug"]', slug);
    await page.fill('textarea[name="excerpt"]', 'This is an E2E draft policy excerpt.');
    // Rich text editor content - find the editor and type
    const editor = page.locator('.tiptap, [contenteditable="true"]').first();
    if (await editor.isVisible()) {
      await editor.click();
      await editor.fill('E2E draft policy content.');
    }

    // Submit as draft
    await page.getByText('Lưu bản nháp').click();
    await expect(page).not.toHaveURL(/new$/, { timeout: 5000 });

    // 4. Storefront should NOT show draft
    await page.goto(`http://localhost:3000/policy/${slug}`);
    await expect(page.locator('text=/không tìm thấy|404|Không có/i').first()).toBeVisible({ timeout: 3000 });

    // 5. Go back to admin, publish
    await page.goto('http://localhost:3002/content/policy');
    const editLink = page.locator(`a[href*="${slug}"]`).first();
    if (await editLink.isVisible()) {
      await editLink.click();
    } else {
      // Find and click edit button for the item
      await page.getByText('E2E Draft Policy').click();
    }

    // Toggle status to PUBLISHED
    const statusSelect = page.locator('select[name="status"]');
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('PUBLISHED');
      await page.getByText('Cập nhật').click();
    }

    await page.waitForTimeout(1000);

    // 6. Storefront should NOW show policy
    await page.goto(`http://localhost:3000/policy/${slug}`);
    await page.waitForTimeout(2000);
    await expect(page.locator('text=/E2E Draft Policy/i').first()).toBeVisible({ timeout: 5000 });

    // 7. Policy list should include it
    await page.goto('http://localhost:3000/policy');
    await expect(page.locator('text=/E2E Draft Policy/i').first()).toBeVisible({ timeout: 5000 });

    console.log('✅ Admin content flow completed:', slug);
  });
});
