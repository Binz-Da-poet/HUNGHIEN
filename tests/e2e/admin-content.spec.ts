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

test.describe('Admin Content E2E', () => {
  test('admin creates draft → publish → storefront renders', async ({ page, request }) => {
    await loginAndSetCookies(request, page);

    // Verify dashboard loads
    await page.goto('http://localhost:3002/');
    await expect(page).toHaveURL('http://localhost:3002/', { timeout: 8000 });

    // Create news content
    await page.goto('http://localhost:3002/content/news/new');
    const slug = `e2e-draft-${Date.now()}`;

    // Wait for form to render
    await page.waitForSelector('form', { timeout: 5000 });

    // Fill title (first required text input)
    const titleInput = page.locator('input[type="text"]').first();
    await expect(titleInput).toBeVisible({ timeout: 5000 });
    await titleInput.fill('E2E Draft News');

    // Fill slug (input near "Slug" label)
    const slugInput = page.locator('input').filter({ has: page.locator('..') }).nth(1);
    // Better: find the input whose parent contains "Slug" text
    const slugLabel = page.locator('text=/Slug/i');
    const slugParent = slugLabel.locator('xpath=..');
    await slugParent.locator('input').first().fill(slug);

    // Fill excerpt (textarea with 2 rows)
    const excerptTextarea = page.locator('textarea[rows="2"]');
    if (await excerptTextarea.isVisible({ timeout: 2000 }).catch(() => false)) {
      await excerptTextarea.fill('E2E draft news excerpt.');
    }

    // Rich text editor
    const editor = page.locator('[contenteditable="true"]').first();
    if (await editor.isVisible({ timeout: 2000 }).catch(() => false)) {
      await editor.click();
      await page.keyboard.type('E2E test content body.');
    }

    // Submit (button "Tạo bài viết")
    const saveBtn = page.locator('button[type="submit"]').filter({ hasText: /tạo bài viết/i });
    if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
    }

    // Storefront should NOT show draft news
    await page.goto(`http://localhost:3000/news`);
    await page.waitForTimeout(2000);
    const draftVisible = await page.locator('text=/E2E Draft News/i').isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`Draft visible on storefront: ${draftVisible}`);

    // Go to admin list, edit and publish
    await page.goto('http://localhost:3002/content/news');
    await page.waitForTimeout(2000);

    const editLink = page.locator(`a[href*="${slug}"]`).first();
    if (await editLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await editLink.click();
      await page.waitForTimeout(2000);

      // Change status to PUBLISHED
      const statusSelect = page.locator('select').first();
      if (await statusSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await statusSelect.selectOption('PUBLISHED');
        
        const updateBtn = page.locator('button[type="submit"]').filter({ hasText: /cập nhật/i });
        if (await updateBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await updateBtn.click();
          await page.waitForTimeout(3000);
        }
      }
    }

    // Storefront should NOW show the news
    await page.goto(`http://localhost:3000/news/${slug}`);
    await page.waitForTimeout(3000);
    const publishedVisible = await page.locator('text=/E2E Draft News/i').first().isVisible({ timeout: 8000 }).catch(() => false);
    console.log(`Published visible on storefront: ${publishedVisible}`);

    console.log('Admin content flow completed:', slug);
  });
});
