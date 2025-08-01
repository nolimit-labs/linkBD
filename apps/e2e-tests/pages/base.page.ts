import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  protected readonly page: Page;

  // Common toast locators
  protected readonly toastSuccess: Locator;
  protected readonly toastError: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize common toast locators
    this.toastSuccess = this.page.locator('[data-sonner-toast][data-type="success"]');
    this.toastError = this.page.locator('[data-sonner-toast][data-type="error"]');
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string = ''): Promise<void> {
    console.log(`Navigating to: ${path}`);
    await this.page.goto(path);
    await this.waitForLoadState();
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for a specific timeout (use sparingly)
   */
  async waitForTimeout(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Find element with fallback strategies
   */
  async findElementWithFallbacks(selectors: string[], timeout: number = 5000): Promise<Locator> {
    for (let i = 0; i < selectors.length; i++) {
      try {
        const element = this.page.locator(selectors[i]);
        await element.waitFor({ state: 'visible', timeout: i === selectors.length - 1 ? timeout : 2000 });
        return element;
      } catch (error) {
        if (i === selectors.length - 1) {
          throw new Error(`Element not found with any of the provided selectors: ${selectors.join(', ')}`);
        }
        console.log(`Selector "${selectors[i]}" failed, trying next fallback...`);
      }
    }
    throw new Error('No fallback selectors worked');
  }

  /**
   * Fill input with fallback strategies
   */
  async fillInputWithFallbacks(selectors: string[], value: string, fieldName: string = 'field'): Promise<void> {
    console.log(`Filling ${fieldName}: ${value}`);
    
    for (let i = 0; i < selectors.length; i++) {
      try {
        const element = this.page.locator(selectors[i]);
        await element.fill(value);
        console.log(`${fieldName} filled with selector: ${selectors[i]}`);
        return;
      } catch (error) {
        if (i === selectors.length - 1) {
          throw new Error(`Failed to fill ${fieldName} with any selector: ${selectors.join(', ')}`);
        }
        console.log(`Selector "${selectors[i]}" failed for ${fieldName}, trying next...`);
      }
    }
  }

  /**
   * Click element with fallback strategies
   */
  async clickWithFallbacks(selectors: string[], elementName: string = 'element'): Promise<void> {
    console.log(`Clicking ${elementName}...`);
    
    for (let i = 0; i < selectors.length; i++) {
      try {
        const element = this.page.locator(selectors[i]);
        await element.waitFor({ state: 'visible', timeout: 3000 });
        await element.click();
        console.log(`${elementName} clicked with selector: ${selectors[i]}`);
        return;
      } catch (error) {
        if (i === selectors.length - 1) {
          throw new Error(`Failed to click ${elementName} with any selector: ${selectors.join(', ')}`);
        }
        console.log(`Selector "${selectors[i]}" failed for ${elementName}, trying next...`);
      }
    }
  }

  /**
   * Check if element exists with any of the provided selectors
   */
  async existsWithFallbacks(selectors: string[], timeout: number = 2000): Promise<boolean> {
    for (const selector of selectors) {
      try {
        await this.page.locator(selector).waitFor({ state: 'visible', timeout });
        return true;
      } catch (error) {
        continue;
      }
    }
    return false;
  }

  /**
   * Wait for and verify success toast
   */
  async expectSuccessToast(message?: string): Promise<void> {
    await expect(this.toastSuccess).toBeVisible({ timeout: 5000 });
    
    if (message) {
      await expect(this.toastSuccess).toContainText(message);
    }
    
    console.log('✅ Success toast displayed');
  }

  /**
   * Wait for and verify error toast
   */
  async expectErrorToast(message?: string): Promise<void> {
    await expect(this.toastError).toBeVisible({ timeout: 5000 });
    
    if (message) {
      await expect(this.toastError).toContainText(message);
    }
    
    console.log('✅ Error toast displayed');
  }
} 