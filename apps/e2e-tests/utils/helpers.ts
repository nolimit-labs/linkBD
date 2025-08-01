import { Page } from '@playwright/test';

export async function clearBrowserData(page: Page) {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore security errors when accessing storage before navigation
    }
  });
}

